import { ENTRANCE_PALETTE, HALL, WALL_BASE } from '@/data/entranceScene'

const DEPTH = HALL.front - HALL.back
const CENTRE_Z = (HALL.front + HALL.back) / 2
const CENTRE_X = HALL.halfWidth + HALL.thickness / 2
const BASE_X = HALL.halfWidth - WALL_BASE.depth / 2

/**
 * The two long walls that enclose the hall, each with a skirting at its
 * base.
 *
 * They receive almost no key light by design — their job is to frame every
 * camera pose with geometry instead of empty background. The skirting
 * catches just enough grazing light to stop them reading as flat voids.
 */
export function HallWalls() {
  return (
    <group position-z={CENTRE_Z}>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * CENTRE_X, HALL.height / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[HALL.thickness, HALL.height, DEPTH]} />
            <meshStandardMaterial color={ENTRANCE_PALETTE.stone} roughness={0.95} />
          </mesh>

          <mesh position={[side * BASE_X, WALL_BASE.height / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[WALL_BASE.depth, WALL_BASE.height, DEPTH]} />
            <meshStandardMaterial color={ENTRANCE_PALETTE.stoneLight} roughness={0.85} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
