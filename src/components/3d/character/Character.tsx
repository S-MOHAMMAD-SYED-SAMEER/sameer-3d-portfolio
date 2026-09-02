import { useFrame } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { MathUtils, type Group, type PointLight } from 'three'

import { CharacterBody } from '@/components/3d/character/CharacterBody'
import { CHARACTER_PALETTE, GESTURE_BEAT } from '@/data/characterDesign'
import { CHARACTER_MOTION, type CharacterMark } from '@/data/journey'
import { dampAngle, MAX_FRAME_DELTA } from '@/lib/motion'
import { createCharacterMotionState, type CharacterGesture } from '@/systems/character'

interface CharacterProps {
  /** Where the character should be standing. Changing it starts a walk. */
  mark: CharacterMark
  /** 0 silhouette, 1 readable. Damped, never switched. */
  reveal: number
  /** Fired once each time the character reaches a new mark. */
  onArrive?: () => void
  /** The cinematic gesture the host is performing, if any. */
  gesture?: CharacterGesture
  reducedMotion?: boolean
}

interface Walk {
  from: [number, number, number]
  /** Clock time the walk began; -1 until the first frame after planning. */
  startedAt: number
  seconds: number
  metres: number
  heading: number
}

/** Peak of the smoothstep derivative, used to normalise gait speed to 0..1. */
const EASE_PEAK = 1.5

/**
 * The knock, in seconds from the moment it is asked for: the arm comes up,
 * raps twice, and comes back down. Timed rather than keyframed so it reads
 * the same on any hardware, and so a rigged model can drive a real clip from
 * the same envelope.
 */
const KNOCK = {
  raise: 0.5,
  hold: 2.05,
  release: 0.55,
  raps: [0.9, 1.42],
  rapWidth: 0.085,
} as const

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t)
}

/**
 * The protagonist: position, facing, movement toward a target, and the
 * proximity signal the experience uses to advance itself.
 *
 * A walk between marks is driven by elapsed clock time rather than by
 * accumulating per-frame distance. Distance-per-frame is the obvious way to
 * write it and it is wrong here: frame deltas have to be clamped or a
 * backgrounded tab teleports the character, and that clamp then makes the
 * walk take longer in wall-clock terms the slower the device is — on weak
 * hardware the journey stalls waiting for an arrival that crawls. Timing the
 * traversal instead makes it identical everywhere and arrival deterministic.
 *
 * Everything here is transform mutation inside the frame loop, so a walk
 * costs nothing in renders. The only thing crossing back into React is
 * `onArrive`, once per mark.
 */
export function Character({
  mark,
  reveal,
  onArrive,
  gesture = 'none',
  reducedMotion = false,
}: CharacterProps) {
  const groupRef = useRef<Group>(null)
  const lightRef = useRef<PointLight>(null)
  const motion = useRef(createCharacterMotionState())

  const walk = useRef<Walk | null>(null)
  const gestureStart = useRef(-1)
  const placed = useRef(false)
  const arrived = useRef(false)

  // Held in a ref so a fresh inline callback each render cannot restart a walk.
  const onArriveRef = useRef(onArrive)
  onArriveRef.current = onArrive

  // Each gesture is timed from when it was asked for.
  useEffect(() => {
    gestureStart.current = -1
  }, [gesture])

  useLayoutEffect(() => {
    const group = groupRef.current
    if (group === null) return

    // The first mark is where the character already is, not somewhere to
    // walk in from.
    if (!placed.current) {
      placed.current = true
      group.position.set(...mark.position)
      group.rotation.y = mark.facing
      walk.current = null
      arrived.current = false
      return
    }

    const metres = Math.hypot(
      mark.position[0] - group.position.x,
      mark.position[2] - group.position.z,
    )

    walk.current = {
      from: [group.position.x, group.position.y, group.position.z],
      startedAt: -1,
      seconds: Math.max(metres / CHARACTER_MOTION.walkSpeed, 0.001),
      metres,
      heading: Math.atan2(
        mark.position[0] - group.position.x,
        mark.position[2] - group.position.z,
      ),
    }
    arrived.current = false
  }, [mark])

  useFrame((state, delta) => {
    const group = groupRef.current
    if (group === null) return

    const step = Math.min(delta, MAX_FRAME_DELTA)
    const now = state.clock.elapsedTime
    const current = walk.current

    let progress = 1
    let gaitSpeed = 0
    let heading = mark.facing

    // With no walk planned the character is simply standing on their mark;
    // the layout effect owns placement, so nothing here touches position.
    if (current !== null) {
      if (current.startedAt < 0) current.startedAt = now

      const linear = reducedMotion
        ? 1
        : MathUtils.clamp((now - current.startedAt) / current.seconds, 0, 1)

      progress = smoothstep(linear)

      group.position.x = MathUtils.lerp(current.from[0], mark.position[0], progress)
      group.position.y = MathUtils.lerp(current.from[1], mark.position[1], progress)
      group.position.z = MathUtils.lerp(current.from[2], mark.position[2], progress)

      motion.current.gait = current.metres * progress * CHARACTER_MOTION.gaitPerMetre

      if (linear < 1) {
        // Derivative of the ease, so the gait starts and ends softly.
        gaitSpeed = (6 * linear * (1 - linear)) / EASE_PEAK
        heading = current.heading
      } else if (!arrived.current) {
        arrived.current = true
        onArriveRef.current?.()
      }
    }

    group.rotation.y = dampAngle(group.rotation.y, heading, CHARACTER_MOTION.turnLambda, step)

    motion.current.gesture = gesture

    if (gesture === 'knock') {
      // A one-shot: the arm comes up, raps twice and comes back down.
      if (gestureStart.current < 0) gestureStart.current = now
      const since = now - gestureStart.current

      const raised = smoothstep(MathUtils.clamp(since / KNOCK.raise, 0, 1))
      const lowered = 1 - smoothstep(MathUtils.clamp((since - KNOCK.hold) / KNOCK.release, 0, 1))

      motion.current.gesturePhase = reducedMotion ? raised : raised * lowered
      motion.current.knockTap = reducedMotion
        ? 0
        : KNOCK.raps.reduce(
            (peak, at) => Math.max(peak, Math.exp(-(((since - at) / KNOCK.rapWidth) ** 2))),
            0,
          )
    } else {
      /*
       * The rest are held poses, and they are beats rather than states: the
       * arm rises, holds, and comes back to rest on its own. The caption may
       * still be on screen — how long a line is readable is the journey's
       * business, and it stays there. This only governs the body.
       *
       * Timed from the same ref the knock uses, and damped rather than
       * switched, so the next gesture arriving mid-release eases across.
       */
      if (gestureStart.current < 0) gestureStart.current = now

      const holding = gesture !== 'none' && now - gestureStart.current < GESTURE_BEAT.seconds
      // Reduced motion keeps the pose rather than animating it away again.
      const settled = gesture !== 'none' && (holding || reducedMotion)

      motion.current.gesturePhase = MathUtils.damp(
        motion.current.gesturePhase,
        settled ? 1 : 0,
        reducedMotion ? 60 : holding ? GESTURE_BEAT.riseLambda : GESTURE_BEAT.releaseLambda,
        step,
      )
      motion.current.knockTap = 0
    }

    motion.current.speed = MathUtils.damp(motion.current.speed, gaitSpeed, 8, step)
    motion.current.reveal = MathUtils.damp(
      motion.current.reveal,
      reveal,
      reducedMotion ? 60 : 1.6,
      step,
    )

    if (lightRef.current !== null) {
      lightRef.current.intensity = motion.current.reveal * CHARACTER_PALETTE.revealIntensity
    }
  })

  return (
    <group ref={groupRef}>
      <CharacterBody motion={motion} />

      {/* Travels with the character, so the reveal works wherever they are.
          Dim and warm on purpose: it finds the form without ever reading as
          a spotlight following someone around. */}
      <pointLight
        ref={lightRef}
        position={CHARACTER_PALETTE.revealOffset}
        intensity={0}
        distance={CHARACTER_PALETTE.revealDistance}
        decay={2}
        color={CHARACTER_PALETTE.revealLight}
      />
    </group>
  )
}
