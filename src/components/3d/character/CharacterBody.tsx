import { useFrame } from '@react-three/fiber'
import type { RefObject } from 'react'
import { useEffect, useMemo, useRef } from 'react'
import {
  BoxGeometry,
  MathUtils,
  MeshStandardMaterial,
  SphereGeometry,
  type BufferGeometry,
  type Group,
} from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

import {
  FIGURE,
  FIGURE_FINISH,
  FIGURE_JOINTS,
  FIGURE_MOTION,
  FIGURE_PALETTE,
  GESTURE_BLEND_LAMBDA,
  GESTURE_POSE,
} from '@/data/characterDesign'
import { MAX_FRAME_DELTA } from '@/lib/motion'
import type { CharacterMotionState } from '@/systems/character'

const F = FIGURE
const J = FIGURE_JOINTS
const M = FIGURE_MOTION

/*
 * Sign conventions, worked out once so that no limb bends backwards: the
 * figure's forward is local +Z, and rotating a downward-hanging limb about
 * +X swings its tip toward -Z. A forward swing is therefore a NEGATIVE
 * rotation.x, a knee — which folds only one way — is POSITIVE, and a
 * positive rotation.z on the right arm carries it away from the body.
 */
const SIDES = [-1, 1] as const
const NEUTRAL = { shoulderX: 0, shoulderZ: 0, elbowX: 0, torsoY: 0, headY: 0 } as const

type Vec = [number, number, number]

/** The five channels a gesture drives. Mutable: the body eases through them. */
interface Pose {
  shoulderX: number
  shoulderZ: number
  elbowX: number
  torsoY: number
  headY: number
}

/** Scale, then place, a piece before it is merged into its group. */
function piece(geometry: BufferGeometry, scale: Vec, at: Vec): BufferGeometry {
  geometry.scale(...scale)
  geometry.translate(...at)
  return geometry
}

/**
 * The head, hair, hands and shoes, each merged into a single buffer.
 *
 * The face is nine small masses and the hair is six; drawn separately that is
 * a call apiece for shapes that never move relative to one another. Merging
 * them once at mount buys the detail back — the whole figure draws in fewer
 * calls than the plainer version it replaces — and the materials are shared
 * rather than one built per mesh.
 */
function buildParts() {
  const skull = F.headRadius
  const sphere = (r: number, w = 10, h = 8) => new SphereGeometry(r, w, h)

  const head = mergeGeometries([
    // Cranium.
    piece(sphere(skull, 20, 14), [...F.headScale] as Vec, [0, skull * 0.9, 0]),
    // Jaw: narrower and set forward, which is most of what makes a sphere
    // read as a head.
    piece(sphere(F.jawRadius, 14, 10), [0.86, 0.74, 0.94], [0, skull * 0.5, 0.012]),
    // Chin, proud of the jaw.
    piece(sphere(F.chinRadius, 10, 8), [0.95, 0.72, 0.85], [0, skull * 0.16, 0.062]),
    // Brows: two masses with a gap at the bridge. A single bar across the
    // eyes reads as a visor, which is the one thing this head must not do.
    ...SIDES.map((side) =>
      piece(sphere(F.browRadius, 10, 8), [1.15, 0.34, 0.5], [side * 0.032, skull * 1.16, 0.074]),
    ),
    // Nose: a bridge and a tip, and nothing else.
    piece(sphere(F.noseRadius, 8, 8), [0.36, 1.35, 0.8], [0, skull * 0.94, 0.09]),
    piece(sphere(F.noseTipRadius, 8, 6), [1.05, 0.85, 1.1], [0, skull * 0.66, 0.096]),
    ...SIDES.map((side) =>
      piece(sphere(F.earRadius, 8, 8), [0.4, 0.9, 0.72], [side * skull * 0.89, skull * 0.86, -0.008]),
    ),
  ])

  /*
   * Hair. Tipping the crown back is what stops it reading as a helmet: the
   * rim rises above the brow at the front and drops toward the nape at the
   * back, which is a hairline rather than a circle drawn round the head.
   */
  const crown = new SphereGeometry(F.hairRadius, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.55)
  crown.scale(1, 1.13, 1.06)
  crown.rotateX(-0.52)
  crown.translate(0, skull * 0.94, -0.008)

  const hair = mergeGeometries([
    crown,
    // Volume behind the temple and at the back of the skull. Set back, so it
    // does not pile onto the ear and turn the pair into one knob.
    ...SIDES.map((side) =>
      piece(sphere(0.045, 10, 8), [0.45, 1.05, 1.15], [side * 0.094, skull * 1.14, -0.03]),
    ),
    piece(sphere(0.096, 14, 10), [0.92, 0.62, 0.55], [0, skull * 1.05, -0.058]),
    piece(sphere(0.062, 10, 8), [0.86, 0.5, 0.5], [0, skull * 0.5, -0.062]),
  ])

  /*
   * Hands, built from the wrist down: a wrist, a palm, the fingers as one
   * rounded mass, and a thumb. Four separately modelled fingers would not
   * survive the closest camera in this experience, and the thumb is the only
   * one whose absence the eye notices.
   */
  const hands = SIDES.map((side) =>
    mergeGeometries([
      piece(sphere(F.wristRadius, 8, 6), [1, 0.9, 0.9], [0, 0, 0]),
      piece(sphere(0.05, 10, 8), [0.8, 1.05, 0.46], [0, -F.handLength * 0.31, 0]),
      piece(sphere(0.045, 10, 8), [0.86, 0.95, 0.45], [0, -F.handLength * 0.7, 0.004]),
      piece(sphere(0.03, 8, 6), [0.6, 1, 0.65], [side * 0.031, -F.handLength * 0.27, 0.014]),
    ]),
  )

  // A shoe with a rounded toe and a rounded heel, rather than a brick.
  const shoe = mergeGeometries([
    piece(
      new BoxGeometry(F.footWidth, F.footHeight, F.footLength * 0.82),
      [1, 1, 1],
      [0, 0, F.footLength * 0.14],
    ),
    piece(
      sphere(F.footWidth * 0.5, 10, 8),
      [1, 0.78, 1],
      [0, -F.footHeight * 0.08, F.footLength * 0.52],
    ),
    piece(sphere(F.footWidth * 0.46, 8, 6), [1, 0.8, 0.9], [0, -0.005, -F.footLength * 0.3]),
  ])

  const cloth = (color: string, roughness: number) => new MeshStandardMaterial({ color, roughness })

  return {
    head,
    hair,
    hands,
    shoe,
    material: {
      jacket: cloth(FIGURE_PALETTE.jacket, FIGURE_FINISH.jacket),
      shirt: cloth(FIGURE_PALETTE.shirt, FIGURE_FINISH.shirt),
      trousers: cloth(FIGURE_PALETTE.trousers, FIGURE_FINISH.trousers),
      shoes: cloth(FIGURE_PALETTE.shoes, FIGURE_FINISH.shoes),
      hair: cloth(FIGURE_PALETTE.hair, FIGURE_FINISH.hair),
      skin: cloth(FIGURE_PALETTE.skin, FIGURE_FINISH.skin),
      mouth: cloth(FIGURE_PALETTE.mouth, FIGURE_FINISH.skin),
    },
  }
}

interface CharacterBodyProps {
  motion: RefObject<CharacterMotionState>
}

/**
 * The host.
 *
 * A skeleton with caps: pelvis, chest, neck and a head with jaw, brow, nose
 * and hair; shoulders through elbows to hands; hips through knees to shoes.
 * The spheres at shoulder, elbow, knee and wrist are what stop the tapered
 * segments reading as detached rods, and they cost almost nothing.
 *
 * Detail stays low on purpose — the figure is backlit for most of the
 * sequence and is read by outline — but the proportions are a real adult's,
 * every joint the eye expects to bend does, and the cloth is separated by
 * value so the figure is not one flat mass.
 *
 * This is the seam. Replacing it with a CharacterModel that loads a GLB and
 * drives an AnimationMixer from the same motion ref leaves the controller,
 * the marks, the stages and the camera untouched.
 */
export function CharacterBody({ motion }: CharacterBodyProps) {
  const hips = useRef<Group>(null)
  const chest = useRef<Group>(null)
  const head = useRef<Group>(null)
  const legs = useRef<(Group | null)[]>([])
  const knees = useRef<(Group | null)[]>([])
  const shoulders = useRef<(Group | null)[]>([])
  const elbows = useRef<(Group | null)[]>([])

  const parts = useMemo(() => buildParts(), [])

  // None of this is created by R3F, so none of it is disposed by R3F.
  useEffect(
    () => () => {
      parts.head.dispose()
      parts.hair.dispose()
      parts.shoe.dispose()
      for (const hand of parts.hands) hand.dispose()
      for (const material of Object.values(parts.material)) material.dispose()
    },
    [parts],
  )

  /*
   * The gesture pose the body is actually holding, eased toward the one the
   * journey is asking for. Two held gestures back to back leave
   * `gesturePhase` pinned at 1, so reading GESTURE_POSE straight would change
   * the arm's pose within a single frame. The contract is untouched — this
   * only smooths what the body does with it.
   */
  const held = useRef<Pose>({ ...NEUTRAL })

  useFrame((state, delta) => {
    const { speed, gait, gesture, gesturePhase, knockTap } = motion.current
    const time = state.clock.elapsedTime
    const step = Math.min(delta, MAX_FRAME_DELTA)
    const still = 1 - speed

    const target = gesture === 'none' ? NEUTRAL : GESTURE_POSE[gesture]
    const pose = held.current
    pose.shoulderX = MathUtils.damp(pose.shoulderX, target.shoulderX, GESTURE_BLEND_LAMBDA, step)
    pose.shoulderZ = MathUtils.damp(pose.shoulderZ, target.shoulderZ, GESTURE_BLEND_LAMBDA, step)
    pose.elbowX = MathUtils.damp(pose.elbowX, target.elbowX, GESTURE_BLEND_LAMBDA, step)
    pose.torsoY = MathUtils.damp(pose.torsoY, target.torsoY, GESTURE_BLEND_LAMBDA, step)
    pose.headY = MathUtils.damp(pose.headY, target.headY, GESTURE_BLEND_LAMBDA, step)

    if (hips.current !== null) {
      // Breathing gives way to the gait; the weight shift only happens still.
      hips.current.position.y =
        F.hipY + Math.sin(time * M.breathSpeed) * M.breathAmplitude * still
      hips.current.rotation.z = Math.sin(time * M.swaySpeed) * M.swayAmplitude * still
    }

    if (chest.current !== null) {
      chest.current.rotation.y = pose.torsoY * gesturePhase
    }

    if (head.current !== null) {
      // A slow drift, so he is never quite frozen, plus whatever the
      // current gesture is looking at.
      head.current.rotation.y =
        Math.sin(time * M.headDriftSpeed) * M.headDrift * still + pose.headY * gesturePhase
      head.current.rotation.x =
        Math.sin(time * M.headDriftSpeed * 0.7 + 1.4) * M.headDrift * 0.4 * still
    }

    const sway = Math.sin(time * M.idleArmSwaySpeed) * M.idleArmSway

    for (let index = 0; index < 2; index += 1) {
      const side = SIDES[index]
      const phase = gait + (index === 0 ? 0 : Math.PI)

      const leg = legs.current[index]
      const knee = knees.current[index]
      const shoulder = shoulders.current[index]
      const elbow = elbows.current[index]

      if (leg !== null && leg !== undefined) {
        leg.rotation.x = -Math.sin(phase) * M.hipSwing * speed
      }
      if (knee !== null && knee !== undefined) {
        knee.rotation.x = Math.max(0, Math.sin(phase - 1.1)) * M.kneeBend * speed
      }

      /*
       * The right arm carries the gestures; the left keeps walking regardless.
       * The blend follows `gesturePhase` rather than switching on whether a
       * gesture is currently named, so an ending gesture releases the arm over
       * the same envelope it arrived on instead of dropping it in one frame.
       */
      const blend = side === 1 ? gesturePhase : 0
      const rap = gesture === 'knock' ? knockTap * M.knockRap * blend : 0
      // Idle posture belongs to an arm that is neither walking nor gesturing.
      const idle = still * (1 - blend)

      if (shoulder !== null && shoulder !== undefined) {
        const walking = Math.sin(phase) * M.shoulderSwing * speed

        shoulder.rotation.x =
          walking * (1 - blend) + (pose.shoulderX * blend - rap) + (M.idleShoulderX + sway) * idle
        shoulder.rotation.z = side * (M.armRest + pose.shoulderZ * blend + sway * 0.5 * idle)
      }

      if (elbow !== null && elbow !== undefined) {
        const walking = -Math.max(0, Math.sin(phase + 0.5)) * M.elbowBend * speed

        elbow.rotation.x = walking * (1 - blend) + pose.elbowX * blend + M.idleElbowX * idle
      }
    }
  })

  return (
    <group ref={hips} position-y={F.hipY}>
      <mesh
        position-y={-F.pelvisHeight * 0.1}
        scale={[1, 1, F.torsoDepth]}
        material={parts.material.trousers}
        castShadow
      >
        <cylinderGeometry args={[F.pelvisRadius * 0.88, F.pelvisRadius, F.pelvisHeight, 12]} />
      </mesh>

      <group ref={chest} position-y={J.chestY}>
        <mesh
          position-y={F.torsoLength / 2 - 0.0465}
          scale={[1, 1, F.torsoDepth]}
          material={parts.material.jacket}
          castShadow
        >
          <cylinderGeometry
            args={[F.torsoShoulder, F.torsoWaist, F.torsoLength + 0.003, 14]}
          />
        </mesh>

        {/* Shoulder line, so the jacket has a top rather than a rim. */}
        <mesh
          position-y={F.torsoLength - 0.05}
          scale={[1, 0.34, F.torsoDepth]}
          material={parts.material.jacket}
          castShadow
        >
          <sphereGeometry args={[F.torsoShoulder * 1.03, 16, 12]} />
        </mesh>

        {/* The shirt, showing down the open front of the jacket. An arc of a
            cylinder carrying the jacket's own taper, so it follows the body
            instead of floating off it at the chest. */}
        <mesh
          position-y={F.torsoLength / 2 - 0.0465}
          scale={[1, 1, F.torsoDepth]}
          material={parts.material.shirt}
        >
          <cylinderGeometry
            args={[
              F.torsoShoulder * 1.025,
              F.torsoWaist * 1.025,
              F.torsoLength + 0.003,
              8,
              1,
              true,
              -0.09,
              0.18,
            ]}
          />
        </mesh>

        {/* Collar, standing around the neck and clear of the yoke. */}
        <mesh position-y={F.torsoLength + 0.014} material={parts.material.shirt} castShadow>
          <cylinderGeometry args={[F.neckRadius * 1.24, F.neckRadius * 1.5, 0.034, 12]} />
        </mesh>

        {/* Trapezius: the neck runs into the shoulders rather than standing
            on them like a post in a hole. */}
        <mesh
          position-y={F.torsoLength - 0.012}
          scale={[1.25, 0.5, 0.9]}
          material={parts.material.jacket}
          castShadow
        >
          <sphereGeometry args={[F.neckRadius * 1.35, 14, 10]} />
        </mesh>

        <mesh
          position-y={F.torsoLength + F.neckLength / 2 - 0.02}
          material={parts.material.skin}
          castShadow
        >
          <cylinderGeometry args={[F.neckRadius, F.neckRadius * 1.1, F.neckLength, 12]} />
        </mesh>

        <group ref={head} position-y={F.torsoLength + F.neckLength - 0.01}>
          <mesh geometry={parts.head} material={parts.material.skin} castShadow />

          {/* Mouth: a value change, not a drawn line. */}
          <mesh position={[0, F.headRadius * 0.34, 0.089]} material={parts.material.mouth}>
            <boxGeometry args={[F.mouthWidth, 0.0055, 0.006]} />
          </mesh>

          <mesh geometry={parts.hair} material={parts.material.hair} castShadow />
        </group>

        {SIDES.map((side, index) => (
          <group
            key={side}
            ref={(node) => {
              shoulders.current[index] = node
            }}
            position={[side * F.shoulderHalfWidth, J.shoulderY - J.chestY, 0]}
          >
            <mesh material={parts.material.jacket} castShadow>
              <sphereGeometry args={[F.deltoidRadius, 12, 10]} />
            </mesh>

            <mesh position-y={-F.upperArmLength / 2} material={parts.material.jacket} castShadow>
              <cylinderGeometry args={[F.upperArmTop, F.upperArmBottom, F.upperArmLength, 10]} />
            </mesh>

            <group
              ref={(node) => {
                elbows.current[index] = node
              }}
              position-y={J.elbowY}
            >
              <mesh material={parts.material.jacket} castShadow>
                <sphereGeometry args={[F.elbowRadius, 10, 8]} />
              </mesh>

              <mesh position-y={-F.forearmLength / 2} material={parts.material.jacket} castShadow>
                <cylinderGeometry args={[F.forearmTop, F.forearmBottom, F.forearmLength, 10]} />
              </mesh>

              {/* Cuff, where the jacket ends and the hand begins. */}
              <mesh position-y={J.wristY + 0.012} material={parts.material.jacket} castShadow>
                <cylinderGeometry args={[F.forearmBottom * 1.06, F.wristRadius * 1.02, 0.04, 10]} />
              </mesh>

              <mesh
                position-y={J.wristY}
                geometry={parts.hands[index]}
                material={parts.material.skin}
                castShadow
              />
            </group>
          </group>
        ))}
      </group>

      {SIDES.map((side, index) => (
        <group
          key={side}
          ref={(node) => {
            legs.current[index] = node
          }}
          position={[side * F.legSpread, 0, 0]}
        >
          <mesh position-y={-F.thighLength / 2} material={parts.material.trousers} castShadow>
            <cylinderGeometry args={[F.thighTop, F.thighBottom, F.thighLength, 10]} />
          </mesh>

          <group
            ref={(node) => {
              knees.current[index] = node
            }}
            position-y={J.kneeY}
          >
            <mesh material={parts.material.trousers} castShadow>
              <sphereGeometry args={[F.kneeRadius, 10, 8]} />
            </mesh>

            <mesh position-y={-F.shinLength / 2} material={parts.material.trousers} castShadow>
              <cylinderGeometry args={[F.shinTop, F.shinBottom, F.shinLength, 10]} />
            </mesh>

            {/* Feet turn out a few degrees. Parallel feet read as a dummy. */}
            <mesh
              position-y={-F.shinLength - F.footHeight / 2 - 0.005}
              rotation-y={side * M.footToeOut}
              geometry={parts.shoe}
              material={parts.material.shoes}
              castShadow
            />
          </group>
        </group>
      ))}
    </group>
  )
}
