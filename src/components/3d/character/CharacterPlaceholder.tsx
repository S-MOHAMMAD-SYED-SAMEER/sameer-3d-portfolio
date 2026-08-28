import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'

import { CHARACTER, ENTRANCE_PALETTE } from '@/data/entranceScene'

/*
 * Proportions of a ~1.85m figure, in metres. Kept as plain data so the
 * final rigged model can be dropped in behind the same component boundary
 * without anything else in the scene changing.
 */
const BODY = {
  legRadius: 0.115,
  legLength: 0.78,
  legSpread: 0.15,
  torsoRadius: 0.23,
  torsoLength: 0.46,
  armRadius: 0.082,
  armLength: 0.56,
  armSpread: 0.31,
  headRadius: 0.135,
} as const

const HIP_Y = BODY.legLength / 2 + BODY.legRadius
const TORSO_Y = HIP_Y + BODY.legLength / 2 + BODY.torsoRadius * 0.55
const HEAD_Y = TORSO_Y + BODY.torsoLength / 2 + BODY.torsoRadius + BODY.headRadius * 0.75
const ARM_Y = TORSO_Y + 0.04

const BREATH_AMPLITUDE = 0.011
const BREATH_SPEED = 0.75

/**
 * Placeholder for the final character model.
 *
 * It exists to establish presence and scale, not to be admired up close —
 * it is lit from behind and reads as a silhouette, which is why simple
 * capsules hold up. Replace the meshes here and nothing else changes.
 */
export function CharacterPlaceholder() {
  const groupRef = useRef<Group>(null)

  // Written straight to the transform. Never setState in a frame loop.
  useFrame((state) => {
    const group = groupRef.current
    if (group === null) return

    group.position.y =
      CHARACTER.position[1] +
      Math.sin(state.clock.elapsedTime * BREATH_SPEED) * BREATH_AMPLITUDE
  })

  return (
    <group ref={groupRef} position={CHARACTER.position} rotation-y={CHARACTER.rotationY}>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * BODY.legSpread, HIP_Y, 0]} castShadow>
          <capsuleGeometry args={[BODY.legRadius, BODY.legLength, 4, 12]} />
          <meshStandardMaterial color={ENTRANCE_PALETTE.figure} roughness={0.72} />
        </mesh>
      ))}

      <mesh position={[0, TORSO_Y, 0]} castShadow>
        <capsuleGeometry args={[BODY.torsoRadius, BODY.torsoLength, 6, 16]} />
        <meshStandardMaterial color={ENTRANCE_PALETTE.figure} roughness={0.72} />
      </mesh>

      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * BODY.armSpread, ARM_Y, 0]}
          rotation-z={side * 0.07}
          castShadow
        >
          <capsuleGeometry args={[BODY.armRadius, BODY.armLength, 4, 12]} />
          <meshStandardMaterial color={ENTRANCE_PALETTE.figure} roughness={0.72} />
        </mesh>
      ))}

      <mesh position={[0, HEAD_Y, 0]} castShadow>
        <sphereGeometry args={[BODY.headRadius, 24, 20]} />
        <meshStandardMaterial color={ENTRANCE_PALETTE.figure} roughness={0.72} />
      </mesh>
    </group>
  )
}
