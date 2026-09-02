import { useEffect, useMemo, useRef } from 'react'
import { CanvasTexture, LinearFilter, SRGBColorSpace, type Object3D, type SpotLight } from 'three'

import { NAME_BOARD, NAME_BOARD_TEXTURE } from '@/data/nameBoard'

const { width: TEX_W, height: TEX_H } = NAME_BOARD_TEXTURE

/**
 * Paints the board's face: the name, a hairline rule, and the role beneath.
 *
 * Drawn to a canvas rather than built from 3D letterforms — no font asset to
 * fetch, no extra dependency, and the lettering stays crisp because the
 * texture is authored at the size it is seen.
 */
/**
 * Draws one tracked, centred line, scaled down if it would overrun.
 *
 * Tracking is applied per glyph rather than through `letterSpacing`, because
 * `measureText` does not account for that property — which meant a line could
 * silently overflow the board and lose its first word while every width check
 * reported it as fitting.
 */
function drawTrackedLine(
  ctx: CanvasRenderingContext2D,
  text: string,
  centreX: number,
  y: number,
  tracking: number,
  maxWidth: number,
): void {
  const glyphs = [...text]
  const widths = glyphs.map((glyph) => ctx.measureText(glyph).width)
  const natural = widths.reduce((total, width) => total + width, 0) + tracking * (glyphs.length - 1)
  const scale = natural > maxWidth ? maxWidth / natural : 1

  let x = centreX - (natural * scale) / 2

  glyphs.forEach((glyph, index) => {
    const width = widths[index] * scale
    ctx.save()
    ctx.translate(x + width / 2, y)
    ctx.scale(scale, 1)
    ctx.fillText(glyph, 0, 0)
    ctx.restore()
    x += width + tracking * scale
  })
}

/**
 * Paints the board's face: the name, a hairline rule, and the role beneath.
 *
 * Drawn to a canvas rather than built from 3D letterforms — no font asset to
 * fetch, no extra dependency, and the lettering stays crisp because the
 * texture is authored at the size it is seen.
 */
function paint(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d')
  if (ctx === null) return

  ctx.clearRect(0, 0, TEX_W, TEX_H)
  ctx.fillStyle = NAME_BOARD.palette.face
  ctx.fillRect(0, 0, TEX_W, TEX_H)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const maxWidth = TEX_W * 0.84

  ctx.fillStyle = NAME_BOARD.palette.text
  ctx.font = '600 84px Inter, system-ui, -apple-system, "Segoe UI", sans-serif'
  drawTrackedLine(ctx, NAME_BOARD.lines.name, TEX_W / 2, TEX_H * 0.34, 7, maxWidth)

  ctx.fillStyle = NAME_BOARD.palette.rule
  ctx.fillRect(TEX_W * 0.5 - 150, TEX_H * 0.55, 300, 2)

  ctx.fillStyle = NAME_BOARD.palette.text
  ctx.font = '500 46px Inter, system-ui, -apple-system, "Segoe UI", sans-serif'
  drawTrackedLine(ctx, NAME_BOARD.lines.role, TEX_W / 2, TEX_H * 0.73, 11, maxWidth)
}

/**
 * The house board, fixed to the wall beside the door.
 *
 * A backing plate with the engraved face standing proud of it, so the board
 * has a real edge to catch light, plus its own small downlight — the way a
 * plaque is actually lit.
 */
export function NameBoard() {
  const lightRef = useRef<SpotLight>(null)
  const targetRef = useRef<Object3D>(null)

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = TEX_W
    canvas.height = TEX_H
    paint(canvas)

    const created = new CanvasTexture(canvas)
    created.colorSpace = SRGBColorSpace
    created.minFilter = LinearFilter
    created.anisotropy = 8
    return created
  }, [])

  // The face is painted before webfonts settle, so repaint once they have.
  useEffect(() => {
    let cancelled = false

    void document.fonts.ready.then(() => {
      if (cancelled) return
      const canvas = texture.image as HTMLCanvasElement
      paint(canvas)
      texture.needsUpdate = true
    })

    return () => {
      cancelled = true
    }
  }, [texture])

  useEffect(() => () => texture.dispose(), [texture])

  // A spot aims at its target object, which defaults to the world origin.
  useEffect(() => {
    if (lightRef.current !== null && targetRef.current !== null) {
      lightRef.current.target = targetRef.current
    }
  }, [])

  const faceWidth = NAME_BOARD.width - NAME_BOARD.faceInset * 2
  const faceHeight = NAME_BOARD.height - NAME_BOARD.faceInset * 2

  return (
    <group position={NAME_BOARD.position}>
      <mesh position-z={NAME_BOARD.depth / 2} castShadow receiveShadow>
        <boxGeometry args={[NAME_BOARD.width, NAME_BOARD.height, NAME_BOARD.depth]} />
        <meshStandardMaterial
          color={NAME_BOARD.palette.plate}
          roughness={0.42}
          metalness={0.35}
        />
      </mesh>

      <mesh position-z={NAME_BOARD.depth + 0.012}>
        <planeGeometry args={[faceWidth, faceHeight]} />
        <meshStandardMaterial
          map={texture}
          emissiveMap={texture}
          emissive="#ffffff"
          emissiveIntensity={0.22}
          roughness={0.5}
          metalness={0.1}
        />
      </mesh>

      <spotLight
        ref={lightRef}
        position={NAME_BOARD.light.offset}
        intensity={NAME_BOARD.light.intensity}
        distance={NAME_BOARD.light.distance}
        angle={NAME_BOARD.light.angle}
        penumbra={NAME_BOARD.light.penumbra}
        decay={2}
        color={NAME_BOARD.light.colour}
      />
      <object3D ref={targetRef} />
    </group>
  )
}
