import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { MathUtils, type Group, type Mesh, type MeshStandardMaterial } from 'three'

import { AREA_ANCHORS } from '@/data/workshopAreas'
import { ENTRANCE_PALETTE } from '@/data/entranceScene'
import { MAX_FRAME_DELTA } from '@/lib/motion'
import { WORKSHOP_AREAS, type WorkshopArea } from '@/systems/workshopArea'

interface WorkshopHotspotsProps {
  /** Only present once the visitor is actually in the room. */
  active: boolean
  highlighted: WorkshopArea | null
  /** Hidden while a panel is open, so the room reads cleanly behind it. */
  hidden: boolean
  onHighlight: (area: WorkshopArea | null) => void
  onSelect: (area: WorkshopArea) => void
}

/** Barely there until you look at one. */
const RESTING = 0.16
const ACTIVE = 1

/**
 * The five places in the room you can go.
 *
 * A thin ring on the object rather than a label floating over it: the room
 * is the interface, so these mark a destination the way a survey pin does,
 * and stay almost invisible until one is hovered or focused. The matching
 * DOM row drives the same highlight, so nothing here is the only way in.
 */
export function WorkshopHotspots({
  active,
  highlighted,
  hidden,
  onHighlight,
  onSelect,
}: WorkshopHotspotsProps) {
  const groups = useRef<(Group | null)[]>([])
  const rings = useRef<(Mesh | null)[]>([])

  useFrame((_state, delta) => {
    const step = Math.min(delta, MAX_FRAME_DELTA)

    for (let index = 0; index < WORKSHOP_AREAS.length; index += 1) {
      const group = groups.current[index]
      const ring = rings.current[index]
      if (group === null || group === undefined) continue

      const visible = active && !hidden
      group.visible = visible

      if (ring === null || ring === undefined) continue

      const target = !visible ? 0 : WORKSHOP_AREAS[index] === highlighted ? ACTIVE : RESTING
      const material = ring.material as MeshStandardMaterial
      material.opacity = MathUtils.damp(material.opacity, target, 9, step)

      // A touch of lift when it is the one being looked at.
      const scale = MathUtils.damp(group.scale.x, target === ACTIVE ? 1.12 : 1, 9, step)
      group.scale.setScalar(scale)
    }
  })

  return (
    <group>
      {WORKSHOP_AREAS.map((area, index) => {
        const anchor = AREA_ANCHORS[area]

        return (
          <group
            key={area}
            ref={(node) => {
              groups.current[index] = node
            }}
            position={anchor.position}
            visible={false}
          >
            <mesh
              ref={(node) => {
                rings.current[index] = node
              }}
            >
              <torusGeometry args={[anchor.radius, 0.012, 8, 40]} />
              <meshStandardMaterial
                color={ENTRANCE_PALETTE.daylightTop}
                emissive={ENTRANCE_PALETTE.daylightTop}
                emissiveIntensity={0.5}
                transparent
                opacity={0}
                depthWrite={false}
              />
            </mesh>

            {/* The volume that actually catches the pointer. Invisible, and
                a good deal larger than the ring so it is easy to hit. */}
            <mesh
              onPointerOver={(event) => {
                event.stopPropagation()
                onHighlight(area)
              }}
              onPointerOut={() => onHighlight(null)}
              onClick={(event) => {
                event.stopPropagation()
                onSelect(area)
              }}
            >
              <sphereGeometry args={[anchor.radius * 1.5, 12, 10]} />
              <meshBasicMaterial visible={false} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
