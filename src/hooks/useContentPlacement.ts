import { useSyncExternalStore } from 'react'

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { IN_SCENE_MIN_WIDTH, contentPlacement, type ContentPlacement } from '@/systems/contentPlacement'

const QUERY = `(min-width: ${IN_SCENE_MIN_WIDTH}px)`

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia(QUERY)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches
}

/** Whether content goes on the objects in the room or in the flat panel. Follows the viewport and the motion preference. */
export function useContentPlacement(): ContentPlacement {
  const reducedMotion = usePrefersReducedMotion()
  const wide = useSyncExternalStore(subscribe, getSnapshot, () => true)
  return contentPlacement(wide ? IN_SCENE_MIN_WIDTH : 0, reducedMotion)
}
