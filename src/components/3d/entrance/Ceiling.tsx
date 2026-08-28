import { CEILING, COLONNADE_SLOTS, ENTRANCE_PALETTE, HALL } from '@/data/entranceScene'

const DEPTH = HALL.front - HALL.back
const CENTRE_Z = (HALL.front + HALL.back) / 2
const PANEL_WIDTH = HALL.halfWidth - CEILING.slotHalfWidth
const PANEL_CENTRE_X = CEILING.slotHalfWidth + PANEL_WIDTH / 2

const REVEAL_X = CEILING.slotHalfWidth + CEILING.reveal.width / 2
const REVEAL_Y = CEILING.y - CEILING.reveal.drop / 2
const RIB_WIDTH = CEILING.slotHalfWidth * 2
const RIB_Y = CEILING.y - CEILING.rib.height / 2

/**
 * Caps the hall, leaving a lightwell along the centre line.
 *
 * The panels cast shadows, so the slot does the shaping: the key light
 * arrives as a ribbon and the lintels below break it into bars.
 *
 * The downstand reveals and the ribs across the bays exist so that at a
 * glancing angle — which is most of the time on a tall viewport — the
 * lightwell reads as a designed element rather than a bright hairline.
 */
export function Ceiling() {
  return (
    <group position-z={CENTRE_Z}>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh
            position={[side * PANEL_CENTRE_X, CEILING.y + CEILING.thickness / 2, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[PANEL_WIDTH, CEILING.thickness, DEPTH]} />
            <meshStandardMaterial color={ENTRANCE_PALETTE.stoneShadow} roughness={0.95} />
          </mesh>

          <mesh position={[side * REVEAL_X, REVEAL_Y, 0]} castShadow receiveShadow>
            <boxGeometry args={[CEILING.reveal.width, CEILING.reveal.drop, DEPTH]} />
            <meshStandardMaterial color={ENTRANCE_PALETTE.ceilingDetail} roughness={0.95} />
          </mesh>
        </group>
      ))}

      {COLONNADE_SLOTS.map((z) => (
        <mesh key={z} position={[0, RIB_Y, z - CENTRE_Z]} castShadow receiveShadow>
          <boxGeometry args={[RIB_WIDTH, CEILING.rib.height, CEILING.rib.depth]} />
          <meshStandardMaterial color={ENTRANCE_PALETTE.ceilingDetail} roughness={0.95} />
        </mesh>
      ))}
    </group>
  )
}
