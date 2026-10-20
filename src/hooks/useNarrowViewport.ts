import { useSyncExternalStore } from 'react'

import { IN_SCENE_MIN_WIDTH } from '@/systems/contentPlacement'

const QUERY = `(max-width: ${IN_SCENE_MIN_WIDTH - 1}px)`

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia(QUERY)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches
}

/** True on a phone-sized viewport: the same line below which content moves from the room to the panel. */
export function useNarrowViewport(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
