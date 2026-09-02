import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { BufferGeometry, Float32BufferAttribute, LineBasicMaterial, MathUtils, type Group } from 'three'

import { ENTRANCE_PALETTE } from '@/data/entranceScene'
import { DISPLAY_MARKER, PROJECT_DISPLAYS } from '@/data/projectDisplays'
import type { ProjectId } from '@/data/projects'
import { MAX_FRAME_DELTA } from '@/lib/motion'

interface ProjectHotspotsProps {
  /** Only while the Projects panel is open. */
  active: boolean
  highlighted: ProjectId | null
  selected: ProjectId | null
  onHighlight: (id: ProjectId | null) => void
  onSelect: (id: ProjectId) => void
}

/** Barely there; a little more for the one being read. */
const RESTING = 0.08
const HOVERED = 0.8
const SELECTED = 0.42

/** A rectangle on the bezel, drawn as four lines. */
function outlineGeometry(): BufferGeometry {
  const x = DISPLAY_MARKER.width / 2
  const y = DISPLAY_MARKER.height / 2
  const corners = [
    [-x, -y],
    [x, -y],
    [x, y],
    [-x, y],
  ]

  const points: number[] = []
  for (let i = 0; i < corners.length; i += 1) {
    const from = corners[i]
    const to = corners[(i + 1) % corners.length]
    points.push(from[0], from[1], 0, to[0], to[1], 0)
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(points, 3))
  return geometry
}

/**
 * The three displays, as things you can pick up.
 *
 * They appear only while Projects is open — the room has one Projects marker
 * until then, and three screens to choose between afterwards. The emphasis is
 * a hairline on the bezel, oriented with the screen it belongs to: enough to
 * say a monitor is selectable, and nothing like a glow.
 *
 * The list in the panel drives the same highlight and selection, so this is
 * never the only way to reach a project.
 */
export function ProjectHotspots({
  active,
  highlighted,
  selected,
  onHighlight,
  onSelect,
}: ProjectHotspotsProps) {
  const groups = useRef<(Group | null)[]>([])

  const parts = useMemo(() => {
    const geometry = outlineGeometry()
    const materials = PROJECT_DISPLAYS.map(
      () =>
        new LineBasicMaterial({
          color: ENTRANCE_PALETTE.daylightTop,
          transparent: true,
          opacity: 0,
          depthWrite: false,
        }),
    )
    return { geometry, materials }
  }, [])

  useEffect(
    () => () => {
      parts.geometry.dispose()
      for (const material of parts.materials) material.dispose()
    },
    [parts],
  )

  useFrame((_state, delta) => {
    const step = Math.min(delta, MAX_FRAME_DELTA)

    for (let index = 0; index < PROJECT_DISPLAYS.length; index += 1) {
      const display = PROJECT_DISPLAYS[index]
      const group = groups.current[index]
      if (group === null || group === undefined) continue

      group.visible = active

      const target = !active
        ? 0
        : display.id === highlighted
          ? HOVERED
          : display.id === selected
            ? SELECTED
            : RESTING

      const material = parts.materials[index]
      material.opacity = MathUtils.damp(material.opacity, target, 9, step)
    }
  })

  return (
    <group>
      {PROJECT_DISPLAYS.map((display, index) => (
        <group
          key={display.id}
          ref={(node) => {
            groups.current[index] = node
          }}
          position={display.position}
          rotation-y={display.yaw}
          visible={false}
        >
          {/* Pitch nested inside yaw, mirroring how the monitor is built. */}
          <group rotation-x={display.pitch}>
            <lineSegments geometry={parts.geometry} material={parts.materials[index]} />

            {/* The volume that catches the pointer. Invisible, and generous. */}
            <mesh
              onPointerOver={(event) => {
                event.stopPropagation()
                onHighlight(display.id)
              }}
              onPointerOut={() => onHighlight(null)}
              onClick={(event) => {
                event.stopPropagation()
                onSelect(display.id)
              }}
            >
              <boxGeometry args={[DISPLAY_MARKER.width, DISPLAY_MARKER.height, 0.28]} />
              <meshBasicMaterial visible={false} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  )
}
