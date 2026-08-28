import {
  COLONNADE_SLOTS,
  ENTRANCE_PALETTE,
  FLOOR_INLAY,
  HALL,
} from '@/data/entranceScene'

const HALL_WIDTH = HALL.halfWidth * 2
const HALL_DEPTH = HALL.front - HALL.back
const CENTRE_Z = (HALL.front + HALL.back) / 2

/**
 * Joints set into the floor: one on each colonnade bay, and a pair running
 * the length of the hall that frame the light path.
 *
 * Cheap geometry doing real work — it gives the floor a sense of scale and
 * strengthens the perspective without adding anything to look at.
 */
export function FloorInlay() {
  return (
    <group position-y={FLOOR_INLAY.y}>
      {COLONNADE_SLOTS.map((z) => (
        <mesh key={z} position-z={z}>
          <boxGeometry args={[HALL_WIDTH, FLOOR_INLAY.thickness, FLOOR_INLAY.jointWidth]} />
          <meshStandardMaterial color={ENTRANCE_PALETTE.inlay} roughness={0.95} />
        </mesh>
      ))}

      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * FLOOR_INLAY.pathHalfWidth, 0, CENTRE_Z]}>
          <boxGeometry args={[FLOOR_INLAY.jointWidth, FLOOR_INLAY.thickness, HALL_DEPTH]} />
          <meshStandardMaterial color={ENTRANCE_PALETTE.inlay} roughness={0.95} />
        </mesh>
      ))}
    </group>
  )
}
