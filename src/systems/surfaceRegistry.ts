import type { SurfaceId } from '@/data/surfaces'

/**
 * Where the DOM for each surface lives.
 *
 * The page for a surface is ordinary React, rendered in the normal tree so it
 * keeps the Router context its links need. The tracker inside the Canvas has
 * no access to that tree, so the two meet here: each surface registers its
 * element, and the tracker writes the element's transform every frame by direct
 * style mutation, never through React state.
 */
const elements = new Map<SurfaceId, HTMLElement>()

export function registerSurface(id: SurfaceId, element: HTMLElement | null): void {
  if (element === null) {
    elements.delete(id)
    return
  }
  elements.set(id, element)
}

export function surfaceElement(id: SurfaceId): HTMLElement | undefined {
  return elements.get(id)
}
