import { useEffect, useMemo } from 'react'
import { Color, Float32BufferAttribute, PlaneGeometry } from 'three'

import { ENTRANCE_PALETTE } from '@/data/entranceScene'

interface DaylightPortalProps {
  width: number
  height: number
  /** Overrides for rooms lit more softly than the open sky. */
  top?: string
  bottom?: string
}

/**
 * The daylight beyond the opening.
 *
 * A single flat value reads as a blown-out white rectangle, so the plane
 * is graded down its height with vertex colours — cooler ivory at the top,
 * warmer and a little deeper toward the floor, the way daylight actually
 * falls through an opening. Tone mapping is left on so it sits inside the
 * exposure of the rest of the scene rather than clipping above it.
 *
 * Vertex colours rather than a texture: no asset to load or decode, and
 * the gradient stays resolution-independent.
 */
export function DaylightPortal({
  width,
  height,
  top: topColour = ENTRANCE_PALETTE.daylightTop,
  bottom: bottomColour = ENTRANCE_PALETTE.daylightBottom,
}: DaylightPortalProps) {
  const geometry = useMemo(() => {
    const plane = new PlaneGeometry(width, height, 1, 24)
    const { position } = plane.attributes

    const top = new Color(topColour)
    const bottom = new Color(bottomColour)
    const shade = new Color()
    const colors = new Float32Array(position.count * 3)

    for (let i = 0; i < position.count; i += 1) {
      const height01 = (position.getY(i) + height / 2) / height
      // Eased so the warm floor end holds longer than a linear ramp.
      shade.copy(bottom).lerp(top, height01 ** 0.75)
      colors[i * 3] = shade.r
      colors[i * 3 + 1] = shade.g
      colors[i * 3 + 2] = shade.b
    }

    plane.setAttribute('color', new Float32BufferAttribute(colors, 3))
    return plane
  }, [width, height, topColour, bottomColour])

  // Built by hand, so it has to be released by hand.
  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial vertexColors />
    </mesh>
  )
}
