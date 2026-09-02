import { useEffect, useMemo } from 'react'

import { RACK, SYSTEMS_PANEL, WORKSHOP_PALETTE } from '@/data/workshop'
import { createCanvasTexture } from '@/lib/canvasTexture'

/**
 * An etched systems diagram: sources on the left, a run of processing
 * stages, outputs on the right. It says automation without a single word,
 * which is why the workshop needs no signage on its walls.
 */
function paintSystemsDiagram(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.fillStyle = '#212329'
  ctx.fillRect(0, 0, w, h)

  const line = '#5a6070'
  const faint = '#3a3f4a'

  const columns = [0.12, 0.36, 0.6, 0.86].map((f) => f * w)
  const rows = [0.26, 0.5, 0.74].map((f) => f * h)

  ctx.strokeStyle = faint
  ctx.lineWidth = 2

  // Connectors first, so nodes sit on top of them.
  for (let c = 0; c < columns.length - 1; c += 1) {
    for (const from of rows) {
      for (const to of rows) {
        if (Math.abs(from - to) > h * 0.3) continue
        ctx.beginPath()
        ctx.moveTo(columns[c] + 46, from)
        ctx.bezierCurveTo(
          columns[c] + 100,
          from,
          columns[c + 1] - 100,
          to,
          columns[c + 1] - 46,
          to,
        )
        ctx.stroke()
      }
    }
  }

  ctx.strokeStyle = line
  ctx.lineWidth = 2.5
  columns.forEach((x, index) => {
    rows.forEach((y, row) => {
      if (index === 0 && row === 1) {
        ctx.beginPath()
        ctx.arc(x, y, 26, 0, Math.PI * 2)
        ctx.stroke()
        return
      }
      ctx.strokeRect(x - 44, y - 22, 88, 44)
      if ((index + row) % 3 === 0) {
        ctx.beginPath()
        ctx.moveTo(x - 28, y)
        ctx.lineTo(x + 28, y)
        ctx.stroke()
      }
    })
  })
}

/**
 * The two things in the room that are not the bench: a slim equipment rack
 * against one wall, and a systems drawing etched into the other.
 *
 * Both earn their place by saying what happens here. Nothing else is added.
 */
export function WorkshopFittings() {
  const diagram = useMemo(() => createCanvasTexture(1024, 570, paintSystemsDiagram), [])
  useEffect(() => () => diagram.dispose(), [diagram])

  const unitHeight = (RACK.height - 0.24) / RACK.units

  return (
    <group>
      <group position={RACK.position}>
        <mesh position-y={RACK.height / 2} castShadow receiveShadow>
          <boxGeometry args={[RACK.width, RACK.height, RACK.depth]} />
          <meshStandardMaterial
            color={WORKSHOP_PALETTE.screenFrame}
            roughness={0.6}
            metalness={0.35}
          />
        </mesh>

        {Array.from({ length: RACK.units }, (_, unit) => (
          <mesh
            key={unit}
            position={[0, 0.14 + unit * unitHeight + unitHeight / 2, RACK.depth / 2 + 0.006]}
          >
            <planeGeometry args={[RACK.width - 0.1, unitHeight * 0.62]} />
            <meshStandardMaterial
              color={WORKSHOP_PALETTE.metal}
              roughness={0.45}
              metalness={0.5}
            />
          </mesh>
        ))}
      </group>

      <group position={SYSTEMS_PANEL.position} rotation-y={Math.PI / 2}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[SYSTEMS_PANEL.width, SYSTEMS_PANEL.height, SYSTEMS_PANEL.depth]} />
          <meshStandardMaterial color={WORKSHOP_PALETTE.wallShadow} roughness={0.8} />
        </mesh>
        <mesh position-z={SYSTEMS_PANEL.depth / 2 + 0.008}>
          <planeGeometry args={[SYSTEMS_PANEL.width - 0.14, SYSTEMS_PANEL.height - 0.14]} />
          <meshStandardMaterial map={diagram} roughness={0.7} />
        </mesh>
      </group>
    </group>
  )
}
