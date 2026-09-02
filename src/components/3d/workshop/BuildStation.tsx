import { useEffect, useMemo } from 'react'

import { BUILD_STATION, WORKSHOP_LIGHT, WORKSHOP_PALETTE } from '@/data/workshop'
import { createCanvasTexture } from '@/lib/canvasTexture'

const S = BUILD_STATION
const TOP_Y = S.bench.height - S.bench.top / 2
const LEG_X = S.bench.width / 2 - 0.16

/**
 * A short run queue. Rows with a state marker and a bar, nothing legible —
 * the same intent as the displays on the workstation, at a quieter scale.
 */
function paintTerminal(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.fillStyle = '#0b0e13'
  ctx.fillRect(0, 0, w, h)

  for (let row = 0; row < 7; row += 1) {
    const y = 22 + row * 26

    ctx.fillStyle = row % 3 === 0 ? '#6d6350' : '#3d4757'
    ctx.fillRect(20, y, 10, 10)

    ctx.fillStyle = '#39424f'
    ctx.fillRect(42, y + 3, 96 + ((row * 53) % 120), 5)
  }

  ctx.strokeStyle = '#4a5464'
  ctx.lineWidth = 2
  ctx.strokeRect(20, h - 40, w - 40, 22)
  ctx.fillStyle = '#5b6677'
  ctx.fillRect(22, h - 38, (w - 44) * 0.62, 18)
}

/**
 * The build station: a bench, a small terminal, a patch panel and the tray
 * that feeds it.
 *
 * This is where things are wired together rather than written — the physical
 * counterpart to Services, and the reason that destination no longer has to
 * borrow the workstation's camera. Deliberately low and quiet: no screens
 * large enough to compete with the displays, and no lit surface brighter than
 * the daylight.
 */
export function BuildStation() {
  const terminal = useMemo(() => createCanvasTexture(320, 200, paintTerminal), [])
  useEffect(() => () => terminal.dispose(), [terminal])

  const stripHeight = (S.patch.height - 0.16) / S.patch.strips

  return (
    <>
      <pointLight
        position={WORKSHOP_LIGHT.station.position}
        intensity={WORKSHOP_LIGHT.station.intensity}
        distance={WORKSHOP_LIGHT.station.distance}
        decay={2}
        color={WORKSHOP_LIGHT.colour}
      />

      <group position={S.position} rotation-y={S.rotationY}>
      <mesh position-y={TOP_Y} castShadow receiveShadow>
        <boxGeometry args={[S.bench.width, S.bench.top, S.bench.depth]} />
        <meshStandardMaterial
          color={WORKSHOP_PALETTE.benchTop}
          roughness={0.5}
          metalness={0.2}
        />
      </mesh>

      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * LEG_X, S.bench.height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.05, S.bench.height - S.bench.top, S.bench.depth * 0.82]} />
          <meshStandardMaterial color={WORKSHOP_PALETTE.bench} roughness={0.6} metalness={0.3} />
        </mesh>
      ))}

      {/* A low shelf, where the loose equipment lives. */}
      <mesh position-y={0.3} castShadow receiveShadow>
        <boxGeometry args={[S.bench.width - 0.3, 0.04, S.bench.depth * 0.7]} />
        <meshStandardMaterial color={WORKSHOP_PALETTE.bench} roughness={0.7} />
      </mesh>

      {[-0.6, 0.15].map((x) => (
        <mesh key={x} position={[x, 0.42, -0.05]} castShadow>
          <boxGeometry args={[0.42, 0.2, 0.32]} />
          <meshStandardMaterial color={WORKSHOP_PALETTE.screenFrame} roughness={0.65} />
        </mesh>
      ))}

      {/* Terminal: small, angled, and dim. */}
      <group position={[S.terminal.x, S.terminal.y, 0.06]} rotation-x={-S.terminal.tilt}>
        <mesh castShadow>
          <boxGeometry args={[S.terminal.width, S.terminal.height, 0.035]} />
          <meshStandardMaterial color={WORKSHOP_PALETTE.screenFrame} roughness={0.55} />
        </mesh>
        <mesh position-z={0.021}>
          <planeGeometry args={[S.terminal.width - 0.04, S.terminal.height - 0.04]} />
          <meshStandardMaterial
            map={terminal}
            emissiveMap={terminal}
            emissive="#ffffff"
            emissiveIntensity={0.4}
            roughness={0.45}
          />
        </mesh>
      </group>
      <mesh position={[S.terminal.x, S.bench.height + 0.05, 0.06]} castShadow>
        <boxGeometry args={[0.16, 0.1, 0.12]} />
        <meshStandardMaterial color={WORKSHOP_PALETTE.metal} roughness={0.5} metalness={0.5} />
      </mesh>

      {/* Patch panel on the wall behind, with its connector strips. */}
      <group position={[0, S.patch.y, S.wallOffset]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[S.patch.width, S.patch.height, 0.07]} />
          <meshStandardMaterial color={WORKSHOP_PALETTE.screenFrame} roughness={0.7} />
        </mesh>

        {Array.from({ length: S.patch.strips }, (_, index) => (
          <mesh
            key={index}
            position={[0, S.patch.height / 2 - 0.11 - index * stripHeight, 0.04]}
          >
            <planeGeometry args={[S.patch.width - 0.16, stripHeight * 0.5]} />
            <meshStandardMaterial
              color={WORKSHOP_PALETTE.metal}
              roughness={0.45}
              metalness={0.5}
            />
          </mesh>
        ))}

        {/* Four status ticks. Warm, low, and not a light source. */}
        {[0, 1, 2, 3].map((index) => (
          <mesh
            key={`tick-${index}`}
            position={[-S.patch.width / 2 + 0.14 + index * 0.1, -S.patch.height / 2 + 0.07, 0.04]}
          >
            <planeGeometry args={[0.035, 0.035]} />
            <meshStandardMaterial
              color="#8a7a60"
              emissive="#8a7a60"
              emissiveIntensity={index % 2 === 0 ? 0.55 : 0.2}
            />
          </mesh>
        ))}
      </group>

      {/* Cable tray, and the two drops that feed the bench. */}
      <mesh position={[0, S.tray.y, S.wallOffset + 0.12]} castShadow>
        <boxGeometry args={[S.tray.length, 0.07, 0.14]} />
        <meshStandardMaterial color={WORKSHOP_PALETTE.metal} roughness={0.55} metalness={0.45} />
      </mesh>
      {[-0.95, 0.85].map((x) => (
        <mesh key={x} position={[x, (S.tray.y + S.patch.y) / 2, S.wallOffset + 0.1]}>
          <boxGeometry args={[0.035, S.tray.y - S.patch.y, 0.035]} />
          <meshStandardMaterial color={WORKSHOP_PALETTE.screenFrame} roughness={0.8} />
        </mesh>
      ))}
    </group>
    </>
  )
}
