import { useFrame, useThree } from '@react-three/fiber'
import { useLayoutEffect, useRef } from 'react'
import { MathUtils, Vector3 } from 'three'

import { CAMERA_POSES, CAMERA_START, FRAMING, type CameraPose } from '@/data/cameraPoses'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import type { ExperienceStage } from '@/systems/experienceStage'

/*
 * Smoothing is exponential damping rather than a keyframed timeline: the
 * camera always eases toward whichever pose the current stage names, so
 * the opening move and the move into `explore` use the same code path and
 * a stage change mid-flight can never leave the camera stranded.
 */
const SETTLE_LAMBDA = 0.85
const REDUCED_MOTION_LAMBDA = 60

/** Guards against a huge catch-up step after the tab has been backgrounded. */
const MAX_DELTA = 0.1

/** 0 on a wide viewport, 1 on a very narrow one. */
function narrowness(aspect: number): number {
  const ratio = MathUtils.clamp(FRAMING.referenceAspect / aspect, 1, 3)
  return (ratio - 1) / 2
}

interface CinematicRigProps {
  stage: ExperienceStage
  /**
   * Takes precedence over the stage's own pose. Used inside the workshop,
   * where the visitor moves between destinations without the journey
   * advancing — so the rig still has exactly one thing to ease toward.
   */
  override?: CameraPose | null
}

export function CinematicRig({ stage, override = null }: CinematicRigProps) {
  const initialCamera = useThree((state) => state.camera)
  const prefersReducedMotion = usePrefersReducedMotion()

  // Mutable scratch vectors: allocated once, written every frame, never
  // read by React. Refs rather than memos, because that is what they are.
  const lookAtRef = useRef(new Vector3())

  useLayoutEffect(() => {
    // With reduced motion the cinematic move is skipped entirely: the
    // camera simply starts where it would have arrived.
    const start: CameraPose = prefersReducedMotion ? CAMERA_POSES.intro : CAMERA_START

    initialCamera.position.set(...start.position)
    lookAtRef.current.set(...start.lookAt)
    initialCamera.lookAt(lookAtRef.current)
  }, [initialCamera, prefersReducedMotion])

  useFrame((state, delta) => {
    const { camera, pointer } = state
    const lookAt = lookAtRef.current
    const pose = override ?? CAMERA_POSES[stage]
    const lambda = prefersReducedMotion ? REDUCED_MOTION_LAMBDA : SETTLE_LAMBDA
    const step = Math.min(delta, MAX_DELTA)

    const amount = narrowness(state.viewport.aspect)

    if ('isPerspectiveCamera' in camera && camera.isPerspectiveCamera) {
      const fov = MathUtils.lerp(FRAMING.baseFov, FRAMING.maxFov, amount)
      // Only rebuild the projection matrix when the lens actually changes.
      if (Math.abs(camera.fov - fov) > 0.01) {
        camera.fov = fov
        camera.updateProjectionMatrix()
      }
    }

    // Ease back along the view axis rather than in raw Z, so the framing
    // stays centred on whatever the pose is looking at.
    const pullback = MathUtils.lerp(1, FRAMING.maxPullback, amount)
    // Clamped so no aspect ratio can ever push the camera out of the hall
    // and leave it looking at the architecture from outside.
    const targetZ = Math.min(
      pose.lookAt[2] + (pose.position[2] - pose.lookAt[2]) * pullback,
      FRAMING.maxZ,
    )

    const targetX = pose.position[0] + pointer.x * pose.parallax
    const targetY = pose.position[1] + pointer.y * pose.parallax * 0.4
    const targetLookAtY = pose.lookAt[1] - FRAMING.portraitTilt * amount

    camera.position.set(
      MathUtils.damp(camera.position.x, targetX, lambda, step),
      MathUtils.damp(camera.position.y, targetY, lambda, step),
      MathUtils.damp(camera.position.z, targetZ, lambda, step),
    )

    lookAt.set(
      MathUtils.damp(lookAt.x, pose.lookAt[0], lambda, step),
      MathUtils.damp(lookAt.y, targetLookAtY, lambda, step),
      MathUtils.damp(lookAt.z, pose.lookAt[2], lambda, step),
    )

    camera.lookAt(lookAt)
  })

  return null
}
