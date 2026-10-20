import { useFrame, useThree } from '@react-three/fiber'
import { useLayoutEffect, useRef } from 'react'
import { Vector3 } from 'three'

import { SURFACES, type SurfaceId } from '@/data/surfaces'
import { matrix3dFor, signedArea, surfaceCorners, topEdgeLength, type Point2 } from '@/lib/surface'
import { surfaceElement } from '@/systems/surfaceRegistry'

interface SurfaceTrackerProps {
  /** The surfaces whose pages are showing right now. Every other one is hidden. */
  active: readonly SurfaceId[]
}

const IDS = Object.keys(SURFACES) as SurfaceId[]

/**
 * Below this many screen pixels per CSS pixel a page is unreadable, so it fades out; above `FULL`
 * it is shown outright. The page arrives with the camera rather than popping in.
 */
const FADE_FROM = 0.3
const FULL = 0.55

const scratch = new Vector3()

/**
 * Pins each active surface's page to its object, every frame.
 *
 * The four corners of the face are projected through the live camera and the page is warped onto
 * them (`matrix3d`), so it has the perspective, the position and the size of the object it is on.
 * A face turned away from the camera, or behind it, is hidden rather than drawn mirrored.
 *
 * Nothing here is React state. It must run after the camera rig has moved the camera this frame,
 * so it is mounted after the rig and reads the camera's own matrices.
 */
export function SurfaceTracker({ active }: SurfaceTrackerProps) {
  const camera = useThree((state) => state.camera)
  const size = useThree((state) => state.size)
  const latest = useRef(active)
  useLayoutEffect(() => {
    latest.current = active
  }, [active])

  useFrame(() => {
    const live = latest.current
    camera.updateMatrixWorld()

    for (const id of IDS) {
      const element = surfaceElement(id)
      if (element === undefined) continue

      if (!live.includes(id)) {
        if (element.style.display !== 'none') element.style.display = 'none'
        continue
      }

      const surface = SURFACES[id]
      const quad: Point2[] = []
      let behind = false

      for (const corner of surfaceCorners(surface.spec)) {
        scratch.set(corner[0], corner[1], corner[2]).project(camera)
        if (scratch.z > 1) behind = true
        quad.push([(scratch.x * 0.5 + 0.5) * size.width, (1 - (scratch.y * 0.5 + 0.5)) * size.height])
      }

      if (behind || signedArea(quad) <= 0) {
        if (element.style.display !== 'none') element.style.display = 'none'
        continue
      }

      const scale = topEdgeLength(quad) / surface.css.width
      const visibility = Math.min(1, Math.max(0, (scale - FADE_FROM) / (FULL - FADE_FROM)))

      element.style.display = 'block'
      element.style.opacity = visibility.toFixed(3)
      element.style.pointerEvents = visibility < 0.95 ? 'none' : 'auto'
      element.style.transform = matrix3dFor(surface.css.width, surface.css.height, quad)
    }
  })

  return null
}
