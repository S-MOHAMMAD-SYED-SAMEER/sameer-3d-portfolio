import { ENTRANCE_PALETTE, PLINTH } from '@/data/entranceScene'

/** The low step the figure stands on — it marks where the journey starts. */
export function Plinth() {
  return (
    <mesh position={[0, PLINTH.height / 2, PLINTH.z]} castShadow receiveShadow>
      <cylinderGeometry args={[PLINTH.radius, PLINTH.radius, PLINTH.height, 64]} />
      <meshStandardMaterial color={ENTRANCE_PALETTE.stone} roughness={0.75} metalness={0.1} />
    </mesh>
  )
}
