import { MeshReflectorMaterial } from '@react-three/drei'

import { ENTRANCE_PALETTE, GROUND } from '@/data/entranceScene'

/**
 * Polished stone floor.
 *
 * The blurred reflection is what makes the space read as architecture
 * rather than objects on a plane — it doubles the portal light and the
 * silhouette without any post-processing.
 */
export function Ground() {
  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[GROUND.size, GROUND.size]} />
      <MeshReflectorMaterial
        // 512 keeps the extra render pass cheap; the heavy blur hides it.
        resolution={512}
        blur={[220, 70]}
        mixBlur={1.1}
        mixStrength={2.4}
        depthScale={1.1}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.35}
        mirror={0}
        color={ENTRANCE_PALETTE.floor}
        metalness={0.5}
        roughness={0.75}
      />
    </mesh>
  )
}
