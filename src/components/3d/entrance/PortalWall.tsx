import { ENTRANCE_PALETTE, PORTAL_SURROUND, PORTAL_WALL } from '@/data/entranceScene'

const { z, thickness, height, halfWidth, opening } = PORTAL_WALL

/*
 * The wall is assembled from solid panels around the opening rather than
 * cut with CSG. Because the panels cast shadows, the opening shapes the
 * key light into a real shaft across the floor — no faked gobo texture.
 */
const SIDE_WIDTH = halfWidth - opening.halfWidth
const SIDE_CENTRE = opening.halfWidth + SIDE_WIDTH / 2
const HEADER_HEIGHT = height - opening.height

/* Reveal standing proud of the wall face, on the room side. */
const SURROUND_Z = thickness / 2 + PORTAL_SURROUND.depth / 2
const JAMB_X = opening.halfWidth + PORTAL_SURROUND.width / 2
const JAMB_HEIGHT = opening.height + PORTAL_SURROUND.width
const LINTEL_WIDTH = opening.halfWidth * 2 + PORTAL_SURROUND.width * 2

export function PortalWall() {
  return (
    <group position-z={z}>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * SIDE_CENTRE, height / 2, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[SIDE_WIDTH, height, thickness]} />
          <meshStandardMaterial color={ENTRANCE_PALETTE.stone} roughness={0.95} />
        </mesh>
      ))}

      <mesh position={[0, opening.height + HEADER_HEIGHT / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[opening.halfWidth * 2, HEADER_HEIGHT, thickness]} />
        <meshStandardMaterial color={ENTRANCE_PALETTE.stone} roughness={0.95} />
      </mesh>

      {/* Reveal around the opening. It catches the spill light and gives
          the aperture a crisp edge instead of a hole cut in a flat slab. */}
      {[-1, 1].map((side) => (
        <mesh key={`jamb-${side}`} position={[side * JAMB_X, JAMB_HEIGHT / 2, SURROUND_Z]} castShadow>
          <boxGeometry args={[PORTAL_SURROUND.width, JAMB_HEIGHT, PORTAL_SURROUND.depth]} />
          <meshStandardMaterial color={ENTRANCE_PALETTE.stoneLight} roughness={0.8} />
        </mesh>
      ))}

      <mesh
        position={[0, opening.height + PORTAL_SURROUND.width / 2, SURROUND_Z]}
        castShadow
      >
        <boxGeometry args={[LINTEL_WIDTH, PORTAL_SURROUND.width, PORTAL_SURROUND.depth]} />
        <meshStandardMaterial color={ENTRANCE_PALETTE.stoneLight} roughness={0.8} />
      </mesh>

      {/* No daylight plane here any more: the opening now looks through to
          the workshop, and that room's window is the light beyond. */}
    </group>
  )
}
