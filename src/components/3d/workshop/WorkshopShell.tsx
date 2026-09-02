import { DaylightPortal } from '@/components/3d/entrance/DaylightPortal'
import { ENTRANCE_PALETTE } from '@/data/entranceScene'
import { WORKSHOP, WORKSHOP_LIGHT, WORKSHOP_PALETTE } from '@/data/workshop'

const W = WORKSHOP
const DEPTH = W.front - W.back
const CENTRE_Z = (W.front + W.back) / 2
const WALL_X = W.halfWidth + W.thickness / 2

const SLOT_DEPTH = W.roofSlot.from - W.roofSlot.to
const SLOT_CENTRE_Z = (W.roofSlot.from + W.roofSlot.to) / 2
const ROOF_PANEL_WIDTH = W.halfWidth - W.roofSlot.halfWidth
const ROOF_PANEL_X = W.roofSlot.halfWidth + ROOF_PANEL_WIDTH / 2

const WINDOW_SIDE_WIDTH = W.halfWidth - W.window.halfWidth
const WINDOW_SIDE_X = W.window.halfWidth + WINDOW_SIDE_WIDTH / 2
const SILL_HEIGHT = W.window.sill

/**
 * The room itself: two long walls, a glazed back wall, and a roof with a
 * slot down the middle.
 *
 * The slot is structural to the whole sequence, not a flourish — the hall's
 * key light is a single directional source behind the entrance, and it has
 * to pass through this roof on its way to the doorway. Roof it solid and the
 * shaft in the corridor goes out.
 */
export function WorkshopShell() {
  return (
    <group>
      {/* Long walls */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * WALL_X, W.height / 2, CENTRE_Z]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[W.thickness, W.height, DEPTH]} />
          <meshStandardMaterial color={WORKSHOP_PALETTE.wall} roughness={0.95} />
        </mesh>
      ))}

      {/* Roof, split around the slot */}
      {[-1, 1].map((side) => (
        <mesh
          key={`roof-${side}`}
          position={[side * ROOF_PANEL_X, W.height + W.thickness / 2, CENTRE_Z]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[ROOF_PANEL_WIDTH, W.thickness, DEPTH]} />
          <meshStandardMaterial color={WORKSHOP_PALETTE.wallShadow} roughness={0.95} />
        </mesh>
      ))}

      {/* The stretch of roof beyond the slot is solid again. */}
      <mesh
        position={[0, W.height + W.thickness / 2, (W.roofSlot.to + W.back) / 2]}
        castShadow
        receiveShadow
      >
        <boxGeometry
          args={[W.roofSlot.halfWidth * 2, W.thickness, W.roofSlot.to - W.back]}
        />
        <meshStandardMaterial color={WORKSHOP_PALETTE.wallShadow} roughness={0.95} />
      </mesh>

      {/* Reveals framing the slot, matching the hall's lightwell. */}
      {[-1, 1].map((side) => (
        <mesh
          key={`reveal-${side}`}
          position={[side * (W.roofSlot.halfWidth + 0.2), W.height - 0.25, SLOT_CENTRE_Z]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.4, 0.5, SLOT_DEPTH]} />
          <meshStandardMaterial color={WORKSHOP_PALETTE.wall} roughness={0.92} />
        </mesh>
      ))}

      {/* Back wall, built around the glazing */}
      <group position-z={W.back}>
        {[-1, 1].map((side) => (
          <mesh
            key={`jamb-${side}`}
            position={[side * WINDOW_SIDE_X, W.height / 2, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[WINDOW_SIDE_WIDTH, W.height, W.thickness]} />
            <meshStandardMaterial color={WORKSHOP_PALETTE.wall} roughness={0.95} />
          </mesh>
        ))}

        <mesh position={[0, SILL_HEIGHT / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[W.window.halfWidth * 2, SILL_HEIGHT, W.thickness]} />
          <meshStandardMaterial color={WORKSHOP_PALETTE.wall} roughness={0.95} />
        </mesh>

        <group position={[0, W.daylight.y, -W.daylight.distance]}>
          <DaylightPortal
            width={W.daylight.width}
            height={W.daylight.height}
            top={W.daylight.top}
            bottom={W.daylight.bottom}
          />
        </group>
      </group>

      {/* Floor joints, carried through from the hall so the two rooms read
          as one building. */}
      {[-6, -2, 2, 6].map((offset) => (
        <mesh key={offset} position={[0, 0.006, W.front + offset - 6]}>
          <boxGeometry args={[W.halfWidth * 2, 0.012, 0.05]} />
          <meshStandardMaterial color={WORKSHOP_PALETTE.floorInlay} roughness={0.95} />
        </mesh>
      ))}

      {/* Sky over the slot. Seen from under the roof, and — through the
          transom — from the far end of the corridor. */}
      <mesh
        position={[0, W.sky.y, (W.sky.from + W.sky.to) / 2]}
        rotation-x={Math.PI / 2}
      >
        <planeGeometry args={[W.sky.halfWidth * 2, W.sky.from - W.sky.to]} />
        <meshBasicMaterial color={ENTRANCE_PALETTE.daylightTop} />
      </mesh>

      <pointLight
        position={WORKSHOP_LIGHT.bench.position}
        intensity={WORKSHOP_LIGHT.bench.intensity}
        distance={WORKSHOP_LIGHT.bench.distance}
        decay={2}
        color={WORKSHOP_LIGHT.colour}
      />

      {/* Keeps the near corners from going to pure black as the visitor
          steps through, without lifting the room off its dark ground. */}
      <hemisphereLight
        args={[ENTRANCE_PALETTE.fillLight, ENTRANCE_PALETTE.bounceLight, 0.5]}
        position={[0, 6, -30]}
      />
    </group>
  )
}
