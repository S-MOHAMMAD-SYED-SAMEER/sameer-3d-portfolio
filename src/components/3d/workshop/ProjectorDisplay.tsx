import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'

import { PROJECTOR_SCREEN } from '@/data/workshop'

interface ProjectorDisplayProps {
  /** Only while Projects is the open destination. */
  active: boolean
  /** DOM element `ExperienceOverlay` renders its Projects panel into — owned
      and mounted there, in the normal DOM React tree, so everything inside
      it (including `ProjectActions`'s `useLocation()`) keeps the Router
      context it has always had. This component never renders any content
      of its own; it only keeps that element lined up with the projector. */
  anchorRef: React.RefObject<HTMLDivElement | null>
}

const SCREEN_POINT = new Vector3(...PROJECTOR_SCREEN.position)
// Reused every frame instead of allocated fresh.
const projected = new Vector3()

/**
 * Projects `PROJECTOR_SCREEN`'s world position to a 2D screen point every
 * frame and writes it straight onto `anchorRef`'s style — the same
 * direct-mutation approach every other per-frame visual update in this 3D
 * layer uses, and never through React state, so this never calls `setState`
 * from inside a frame loop.
 */
export function ProjectorDisplay({ active, anchorRef }: ProjectorDisplayProps) {
  const { camera, size } = useThree()
  const wasActive = useRef(false)

  useFrame(() => {
    const el = anchorRef.current
    if (el === null) return

    if (!active) {
      if (wasActive.current) {
        el.style.display = 'none'
        wasActive.current = false
      }
      return
    }

    projected.copy(SCREEN_POINT).project(camera)

    // Behind the camera: nothing sensible to draw at. Doesn't happen with
    // the fixed PROJECTOR_POSE, but guarded rather than assumed.
    if (projected.z > 1) {
      el.style.display = 'none'
      wasActive.current = false
      return
    }

    el.style.display = ''
    el.style.left = `${(projected.x * 0.5 + 0.5) * size.width}px`
    el.style.top = `${(1 - (projected.y * 0.5 + 0.5)) * size.height}px`
    wasActive.current = true
  })

  return null
}
