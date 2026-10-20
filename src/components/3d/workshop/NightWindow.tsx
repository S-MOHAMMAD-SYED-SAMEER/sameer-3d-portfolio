import { useEffect, useMemo } from 'react'

import { WORKSHOP, WORKSHOP_PALETTE } from '@/data/workshop'
import { createCanvasTexture } from '@/lib/canvasTexture'

const W = WORKSHOP
const OPENING_WIDTH = W.window.halfWidth * 2
const OPENING_HEIGHT = W.window.head - W.window.sill
const OPENING_CENTRE_Y = (W.window.head + W.window.sill) / 2

/** A small deterministic generator, so the skyline is the same on every visit. */
function seeded(seed: number): () => number {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

/**
 * A night sky over a city a long way off: a deep blue gradient with a low warm glow at the horizon,
 * a few stars, and a skyline of dark blocks with sparse lit windows. Painted, so there is nothing to
 * fetch, and dim.
 */
function paintNight(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const sky = ctx.createLinearGradient(0, 0, 0, h)
  sky.addColorStop(0, '#05070f')
  sky.addColorStop(0.45, '#0b1424')
  sky.addColorStop(0.72, '#1a2540')
  sky.addColorStop(0.86, '#33304a')
  sky.addColorStop(1, '#4a3a45')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, w, h)

  const random = seeded(7)

  // Stars: few, small, and only in the upper sky.
  for (let i = 0; i < 70; i += 1) {
    const x = random() * w
    const y = random() * h * 0.5
    ctx.fillStyle = `rgba(210, 220, 255, ${(0.25 + random() * 0.45).toFixed(2)})`
    ctx.fillRect(x, y, 1.5, 1.5)
  }

  // Skyline: two layers of blocks, the far one lighter and lower.
  const layers = [
    { top: 0.8, spread: 0.1, colour: '#141a2b', windows: 0 },
    { top: 0.86, spread: 0.09, colour: '#0a0e18', windows: 0.04 },
  ]
  for (const layer of layers) {
    let x = 0
    while (x < w) {
      const width = 26 + random() * 46
      const height = (layer.top + random() * layer.spread - 0.8) * h + h * 0.12
      const top = h - Math.max(height, h * 0.08)
      ctx.fillStyle = layer.colour
      ctx.fillRect(x, top, width, h - top)

      if (layer.windows > 0) {
        for (let wx = x + 5; wx < x + width - 5; wx += 9) {
          for (let wy = top + 8; wy < h - 6; wy += 11) {
            if (random() > layer.windows * 4) continue
            ctx.fillStyle = `rgba(255, 214, 150, ${(0.35 + random() * 0.4).toFixed(2)})`
            ctx.fillRect(wx, wy, 3, 4)
          }
        }
      }
      x += width + 2
    }
  }
}

/**
 * The glazing of the far wall, as a window: a frame, mullions and transoms over a dim night.
 *
 * The sky sits a couple of metres behind the wall so the bars read in front of it, and its colour is
 * multiplied down (`WORKSHOP.night.brightness`) so it is never the brightest thing in a view.
 */
export function NightWindow() {
  const sky = useMemo(() => createCanvasTexture(1024, 1152, paintNight), [])
  useEffect(() => () => sky.dispose(), [sky])

  const bar = W.glazing.bar
  const frame = W.glazing.frame
  const shade = W.night.brightness

  return (
    <group>
      <mesh position={[0, W.night.y, -W.night.distance]}>
        <planeGeometry args={[W.night.width, W.night.height]} />
        {/* The painted canvas covers the opening only, so it is stretched over the plane that fills it. */}
        <meshBasicMaterial map={sky} color={[shade, shade, shade]} />
      </mesh>

      {/* Frame, mullions and transoms, in the wall's own thickness. */}
      <group position-z={0.05}>
        {[-1, 1].map((side) => (
          <mesh key={`jamb-${side}`} position={[side * (W.window.halfWidth - frame / 2), OPENING_CENTRE_Y, 0]} castShadow>
            <boxGeometry args={[frame, OPENING_HEIGHT, 0.34]} />
            <meshStandardMaterial color={WORKSHOP_PALETTE.metal} roughness={0.55} metalness={0.5} />
          </mesh>
        ))}

        <mesh position={[0, W.window.sill + frame / 2, 0]} castShadow>
          <boxGeometry args={[OPENING_WIDTH, frame, 0.34]} />
          <meshStandardMaterial color={WORKSHOP_PALETTE.metal} roughness={0.55} metalness={0.5} />
        </mesh>

        {W.glazing.mullions.map((x) => (
          <mesh key={`mullion-${x}`} position={[x, OPENING_CENTRE_Y, 0]}>
            <boxGeometry args={[bar, OPENING_HEIGHT, 0.14]} />
            <meshStandardMaterial color={WORKSHOP_PALETTE.metal} roughness={0.5} metalness={0.55} />
          </mesh>
        ))}

        {W.glazing.transoms.map((y) => (
          <mesh key={`transom-${y}`} position={[0, y, 0]}>
            <boxGeometry args={[OPENING_WIDTH, bar, 0.14]} />
            <meshStandardMaterial color={WORKSHOP_PALETTE.metal} roughness={0.5} metalness={0.55} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
