import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { MathUtils, type Group } from 'three'

import { DOOR, ENTRANCE_PALETTE, PORTAL_WALL } from '@/data/entranceScene'
import { MAX_FRAME_DELTA } from '@/lib/motion'

const { opening } = PORTAL_WALL

const LEAF_HEIGHT = opening.height - DOOR.transomHeight - DOOR.reveal
const LEAF_WIDTH = opening.halfWidth - DOOR.reveal * 1.5
/** Hinged at the outer edge of the opening; the leaf reaches to the centre. */
const HINGE_X = opening.halfWidth - DOOR.reveal / 2

interface EntranceDoorProps {
  /** 0 closed, 1 fully swung. Damped by this component. */
  open: number
  reducedMotion?: boolean
}

/**
 * The entrance door: two leaves under a fixed transom.
 *
 * The leaves cast shadows, so this is not a lighting trick — while they are
 * shut the hall is lit only through the transom and the reveal gaps around
 * them, and swinging them open is what actually lets the daylight in. The
 * transition is done by the architecture, not by turning a light up.
 *
 * Replacing these two boxes with a modelled door means changing this file
 * only; the hinge geometry and the open ramp stay where they are.
 */
export function EntranceDoor({ open, reducedMotion = false }: EntranceDoorProps) {
  const leaves = useRef<(Group | null)[]>([])
  const current = useRef(0)

  useFrame((_state, delta) => {
    const step = Math.min(delta, MAX_FRAME_DELTA)
    current.current = MathUtils.damp(current.current, open, reducedMotion ? 60 : 1.1, step)

    for (let i = 0; i < 2; i += 1) {
      const leaf = leaves.current[i]
      if (leaf === null || leaf === undefined) continue
      // Left leaf swings one way, right the other; both inward, into the hall.
      const side = i === 0 ? -1 : 1
      leaf.rotation.y = side * current.current * DOOR.openAngle
    }
  })

  return (
    <group position={[0, 0, PORTAL_WALL.z + DOOR.z]}>
      {[0, 1].map((index) => {
        const side = index === 0 ? -1 : 1
        return (
          <group
            key={index}
            ref={(node) => {
              leaves.current[index] = node
            }}
            position={[side * HINGE_X, 0, 0]}
          >
            <mesh
              position={[(-side * LEAF_WIDTH) / 2, LEAF_HEIGHT / 2 + DOOR.reveal / 2, 0]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[LEAF_WIDTH, LEAF_HEIGHT, DOOR.thickness]} />
              <meshStandardMaterial
                color={ENTRANCE_PALETTE.stoneShadow}
                roughness={0.55}
                metalness={0.25}
              />
            </mesh>

            {/* A single recessed line down each leaf. The only detail they get. */}
            <mesh
              position={[
                (-side * LEAF_WIDTH) / 2,
                LEAF_HEIGHT / 2 + DOOR.reveal / 2,
                DOOR.thickness / 2 + 0.004,
              ]}
            >
              <planeGeometry args={[0.03, LEAF_HEIGHT * 0.82]} />
              <meshStandardMaterial color={ENTRANCE_PALETTE.stoneLight} roughness={0.4} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
