import { useEffect, useMemo } from 'react'

import { WORKSHOP_PALETTE, WORKSTATION } from '@/data/workshop'
import { createCanvasTexture } from '@/lib/canvasTexture'

const S = WORKSTATION
const TOP_Y = S.height - S.topThickness / 2
const LEG_X = S.width / 2 - 0.18
const SCREEN_Y = S.height + 0.12 + S.monitor.height / 2
const COLUMNS = [-1, 0, 1] as const

/**
 * Abstract systems telemetry: run logs on the left, a small throughput plot,
 * a pipeline of stages. Deliberately unreadable at any distance the camera
 * ever gets to — it is texture that says "something is being built here",
 * not a screenshot pretending to be a product.
 */
function paintDisplay(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.fillStyle = '#0c0f15'
  ctx.fillRect(0, 0, w, h)

  // Log lines.
  ctx.fillStyle = '#3f4a5a'
  for (let row = 0; row < 16; row += 1) {
    const y = 26 + row * 21
    const indent = row % 4 === 0 ? 24 : row % 3 === 0 ? 52 : 38
    const width = 90 + ((row * 71) % 210)
    ctx.fillRect(indent, y, width, 4)
    if (row % 5 === 2) {
      ctx.fillStyle = '#6d6350'
      ctx.fillRect(indent + width + 12, y, 34, 4)
      ctx.fillStyle = '#3f4a5a'
    }
  }

  // A throughput trace across the lower third.
  ctx.strokeStyle = '#59667a'
  ctx.lineWidth = 3
  ctx.beginPath()
  for (let i = 0; i <= 40; i += 1) {
    const x = 26 + (i / 40) * (w - 52)
    const y = h - 96 - Math.sin(i * 0.55) * 22 - Math.sin(i * 0.17) * 14
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()

  // A short pipeline of stages along the bottom.
  ctx.strokeStyle = '#454f5e'
  ctx.lineWidth = 2
  for (let i = 0; i < 4; i += 1) {
    const x = 34 + i * 78
    ctx.strokeRect(x, h - 46, 54, 24)
    if (i < 3) {
      ctx.beginPath()
      ctx.moveTo(x + 54, h - 34)
      ctx.lineTo(x + 78, h - 34)
      ctx.stroke()
    }
  }
}

/**
 * The bench: a long top on two panels, three displays, a chair.
 *
 * The centre of the room and the only thing in it that is lit from close
 * range. Everything else in the workshop is read by silhouette.
 */
export function Workstation() {
  const screen = useMemo(() => createCanvasTexture(512, 300, paintDisplay), [])
  useEffect(() => () => screen.dispose(), [screen])

  return (
    <group position={S.position} rotation-y={S.rotationY}>
      <mesh position-y={TOP_Y} castShadow receiveShadow>
        <boxGeometry args={[S.width, S.topThickness, S.depth]} />
        <meshStandardMaterial
          color={WORKSHOP_PALETTE.benchTop}
          roughness={0.42}
          metalness={0.25}
        />
      </mesh>

      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * LEG_X, S.height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.06, S.height - S.topThickness, S.depth * 0.86]} />
          <meshStandardMaterial color={WORKSHOP_PALETTE.bench} roughness={0.6} metalness={0.3} />
        </mesh>
      ))}

      {COLUMNS.map((column) => {
        const x = column * (S.monitor.width + S.monitor.gap)
        return (
          <group key={column} position={[x, 0, -0.16]} rotation-y={-column * 0.24}>
            <mesh position-y={S.height + 0.06} castShadow>
              <boxGeometry args={[0.22, 0.12, 0.16]} />
              <meshStandardMaterial color={WORKSHOP_PALETTE.metal} roughness={0.5} metalness={0.5} />
            </mesh>

            <group position-y={SCREEN_Y} rotation-x={-S.monitor.tilt}>
              <mesh castShadow>
                <boxGeometry args={[S.monitor.width, S.monitor.height, 0.04]} />
                <meshStandardMaterial color={WORKSHOP_PALETTE.screenFrame} roughness={0.55} />
              </mesh>
              <mesh position-z={0.023}>
                <planeGeometry args={[S.monitor.width - 0.05, S.monitor.height - 0.05]} />
                <meshStandardMaterial
                  map={screen}
                  emissiveMap={screen}
                  emissive="#ffffff"
                  // Low on purpose: a lit desk in a dark room, never a glow.
                  emissiveIntensity={0.55}
                  roughness={0.4}
                />
              </mesh>
            </group>
          </group>
        )
      })}

      <group position={[0.35, 0, S.chair.offsetZ]} rotation-y={Math.PI}>
        <mesh position-y={S.chair.seatHeight} castShadow receiveShadow>
          <boxGeometry args={[0.48, 0.07, 0.46]} />
          <meshStandardMaterial color={WORKSHOP_PALETTE.seat} roughness={0.8} />
        </mesh>
        <mesh position={[0, S.chair.seatHeight + 0.3, -0.21]} rotation-x={-0.12} castShadow>
          <boxGeometry args={[0.46, 0.52, 0.06]} />
          <meshStandardMaterial color={WORKSHOP_PALETTE.seat} roughness={0.8} />
        </mesh>
        <mesh position-y={S.chair.seatHeight / 2} castShadow>
          <cylinderGeometry args={[0.045, 0.045, S.chair.seatHeight, 10]} />
          <meshStandardMaterial color={WORKSHOP_PALETTE.metal} roughness={0.5} metalness={0.5} />
        </mesh>
        <mesh position-y={0.02} castShadow>
          <cylinderGeometry args={[0.28, 0.3, 0.04, 16]} />
          <meshStandardMaterial color={WORKSHOP_PALETTE.metal} roughness={0.55} metalness={0.5} />
        </mesh>
      </group>
    </group>
  )
}
