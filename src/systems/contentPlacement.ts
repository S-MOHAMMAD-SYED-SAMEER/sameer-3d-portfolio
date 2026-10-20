/**
 * Where an area's content is shown.
 *
 * In the room, on the object it belongs to, when there is room for it and the visitor is happy with
 * the camera moving. Otherwise in the flat panel beside the room: on a phone a page on a monitor is
 * a few pixels tall, and a visitor who has asked for less motion should not be flown at a wall.
 */
export type ContentPlacement = 'in-scene' | 'panel'

/** Below this width a page on an object is too small to read, so the panel takes over. */
export const IN_SCENE_MIN_WIDTH = 768

export function contentPlacement(viewportWidth: number, reducedMotion: boolean): ContentPlacement {
  if (reducedMotion) return 'panel'
  return viewportWidth >= IN_SCENE_MIN_WIDTH ? 'in-scene' : 'panel'
}
