import { CanvasTexture, LinearFilter, SRGBColorSpace } from 'three'

export type CanvasPainter = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) => void

/**
 * Paints a texture in a 2D canvas.
 *
 * Used for the few surfaces that carry lettering or drawing — the name
 * board, the displays, the wall diagram. A canvas keeps them crisp at the
 * size they are actually seen, needs no font or image asset to fetch, and
 * adds no dependency. Callers own disposal.
 */
export function createCanvasTexture(
  width: number,
  height: number,
  paint: CanvasPainter,
): CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (ctx !== null) paint(ctx, width, height)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.minFilter = LinearFilter
  texture.anisotropy = 8
  return texture
}

/** Repaints an existing canvas texture in place. */
export function repaintCanvasTexture(texture: CanvasTexture, paint: CanvasPainter): void {
  const canvas = texture.image as HTMLCanvasElement | undefined
  if (canvas === undefined) return

  const ctx = canvas.getContext('2d')
  if (ctx === null) return

  paint(ctx, canvas.width, canvas.height)
  texture.needsUpdate = true
}
