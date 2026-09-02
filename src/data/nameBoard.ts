import { PORTAL_WALL } from '@/data/entranceScene'
import type { Vec3 } from '@/lib/vec3'

/**
 * The house board beside the door.
 *
 * This is where the portfolio's identity lives. It is a real object bolted
 * to the wall, not an overlay — so it holds its place as the camera moves,
 * catches the light like everything else, and is simply noticed on the way
 * to the door rather than announced.
 */
export const NAME_BOARD = {
  lines: {
    name: 'S MOHAMMAD SYED SAMEER',
    role: 'AI AUTOMATION ENGINEER',
  },
  /** Metres. Large, because the hall is monumental and it must read at range. */
  width: 2.1,
  height: 1.05,
  depth: 0.08,
  /** The face sits slightly proud of the backing plate, giving a real edge. */
  faceInset: 0.065,
  /**
   * On the wall panel right of the opening, in the clear span between the
   * door surround and the last column — either of which will otherwise clip
   * an edge of it from an off-axis camera.
   */
  position: [3.7, 2.45, PORTAL_WALL.z + PORTAL_WALL.thickness / 2] as Vec3,
  palette: {
    plate: '#33353d',
    face: '#17191e',
    text: '#f6f0e4',
    rule: '#9a917f',
  },
  /** A discreet downlight, the way a real plaque would be lit. */
  light: {
    offset: [0, 0.66, 0.55] as Vec3,
    colour: '#ffe7c8',
    intensity: 3.4,
    distance: 2.8,
    angle: 0.5,
    penumbra: 0.5,
  },
} as const

/** Texture resolution for the engraved face. Matches the board's aspect. */
export const NAME_BOARD_TEXTURE = { width: 1024, height: 489 } as const
