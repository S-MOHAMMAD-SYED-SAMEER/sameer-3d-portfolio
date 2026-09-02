import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { MathUtils, type PointLight } from 'three'

import { ENTRANCE_PALETTE, LIGHTING } from '@/data/entranceScene'
import { MAX_FRAME_DELTA } from '@/lib/motion'

/**
 * Three lights, no environment map.
 *
 * The key sits behind the portal wall and aims at the origin, so the wall
 * itself carves the light into a shaft and the figure reads as a
 * silhouette. The fill only stops the camera-facing surfaces going
 * completely black.
 */
export function EntranceLighting({ doorOpen = 1 }: { doorOpen?: number }) {
  const spillRef = useRef<PointLight>(null)
  const spill = useRef(0)

  // There is nothing to bounce in until the doors are open, so this rises
  // with them rather than sitting on the closed leaves as a hotspot.
  useFrame((_state, delta) => {
    spill.current = MathUtils.damp(spill.current, doorOpen, 1.1, Math.min(delta, MAX_FRAME_DELTA))
    if (spillRef.current !== null) {
      spillRef.current.intensity = spill.current * LIGHTING.spill.intensity
    }
  })

  return (
    <>
      <hemisphereLight
        args={[
          ENTRANCE_PALETTE.fillLight,
          ENTRANCE_PALETTE.bounceLight,
          LIGHTING.hemisphere.intensity,
        ]}
      />

      <directionalLight
        castShadow
        position={LIGHTING.key.position}
        intensity={LIGHTING.key.intensity}
        color={ENTRANCE_PALETTE.keyLight}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={130}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      />

      <directionalLight
        position={LIGHTING.fill.position}
        intensity={LIGHTING.fill.intensity}
        color={ENTRANCE_PALETTE.fillLight}
      />

      {/* Stands in for the bounce a doorway of daylight would throw back
          into the room. Without it the near faces of the stone go flat. */}
      <pointLight
        ref={spillRef}
        position={LIGHTING.spill.position}
        intensity={0}
        distance={LIGHTING.spill.distance}
        decay={2}
        color={ENTRANCE_PALETTE.daylight}
      />
    </>
  )
}
