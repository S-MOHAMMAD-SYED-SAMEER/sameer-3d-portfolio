import { COLONNADE, COLONNADE_SLOTS, ENTRANCE_PALETTE } from '@/data/entranceScene'

const { column, beam, offsetX } = COLONNADE
const BEAM_WIDTH = offsetX * 2 + column.width
const BEAM_Y = column.height + beam.height / 2

/**
 * Flanking columns and their lintels, generated from the spacing rule in
 * the scene data. Adding depth to the space is a data change, not a code
 * change.
 */
export function Colonnade() {
  return (
    <group>
      {COLONNADE_SLOTS.map((z) => (
        <group key={z} position-z={z}>
          {[-1, 1].map((side) => (
            <mesh
              key={side}
              position={[side * offsetX, column.height / 2, 0]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[column.width, column.height, column.depth]} />
              <meshStandardMaterial color={ENTRANCE_PALETTE.stone} roughness={0.9} />
            </mesh>
          ))}

          <mesh position={[0, BEAM_Y, 0]} castShadow receiveShadow>
            <boxGeometry args={[BEAM_WIDTH, beam.height, beam.depth]} />
            <meshStandardMaterial color={ENTRANCE_PALETTE.stoneShadow} roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
