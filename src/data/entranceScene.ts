/**
 * Layout, palette and lighting for the entrance hall.
 *
 * Scene data only. The components that draw it are pure geometry, and
 * camera behaviour lives in `@/data/cameraPoses` — every dimension and
 * colour can be re-tuned here without touching either.
 *
 * Units are metres. The space is an enclosed hall running down -Z: the
 * camera looks from inside it toward a portal in the far wall.
 */

import type { Vec3 } from '@/lib/vec3'

/*
 * Warm daylight against cool shadow. Deliberately no saturated accent —
 * the teal in the DOM design tokens stays in the DOM, so the 3D space
 * reads architectural rather than neon.
 */
export const ENTRANCE_PALETTE = {
  background: '#05070b',
  fog: '#070910',
  floor: '#15171d',
  stone: '#3d3d46',
  stoneShadow: '#24252c',
  stoneLight: '#4a4a54',
  inlay: '#191b21',
  ceilingDetail: '#2c2d34',
  figure: '#080a0e',
  daylightTop: '#f7ecdc',
  daylightBottom: '#e9d0ad',
  daylight: '#fdf1e2',
  keyLight: '#ffe0b8',
  fillLight: '#8e97a6',
  bounceLight: '#16181e',
} as const

export const FOG = { near: 26, far: 96 } as const

/**
 * The hall itself. Enclosing the space is what stops the architecture
 * reading as loose objects floating in a void, and it means every camera
 * pose is framed by geometry rather than by empty background.
 */
export const HALL = {
  halfWidth: 7.5,
  height: 14,
  /** Extent along Z: the far wall caps `back`, the hall runs out to `front`. */
  back: -20,
  front: 30,
  thickness: 1,
} as const

/**
 * Ceiling with a narrow slot down the centre line.
 *
 * Capping the hall stops the key light spilling over the top of the walls
 * and turns it into a second, deliberate source: a ribbon of daylight that
 * the lintels break into bars across the floor.
 */
export const CEILING = {
  y: HALL.height,
  thickness: 0.8,
  slotHalfWidth: 1.15,
  /** Downstand framing the slot, so it reads as a designed lightwell
   *  rather than a gap where two ceiling panels failed to meet. */
  reveal: { width: 0.4, drop: 0.45 },
  /** Ribs crossing the slot on the colonnade bays. */
  rib: { height: 0.45, depth: 0.5 },
} as const

export const GROUND = { size: 200 } as const

/** Far wall, built from solid panels around a tall rectangular opening. */
export const PORTAL_WALL = {
  z: HALL.back,
  thickness: HALL.thickness,
  height: HALL.height,
  halfWidth: HALL.halfWidth,
  opening: { halfWidth: 2.2, height: 9 },
} as const

/** Flanking colonnade, generated from a single spacing rule. */
export const COLONNADE = {
  count: 5,
  spacing: 4,
  startZ: -2,
  offsetX: 5,
  column: { width: 1.2, height: 8, depth: 1.2 },
  beam: { height: 0.7, depth: 1 },
} as const

/** Z positions of each column pair, derived from the spacing rule. */
export const COLONNADE_SLOTS: readonly number[] = Array.from(
  { length: COLONNADE.count },
  (_, index) => COLONNADE.startZ - index * COLONNADE.spacing,
)

/**
 * Flush joints in the floor: transverse lines on the colonnade bays and a
 * pair running the length of the hall that frame the light path. They give
 * the eye a sense of scale and reinforce the perspective for almost nothing.
 */
export const FLOOR_INLAY = {
  y: 0.006,
  thickness: 0.012,
  jointWidth: 0.05,
  pathHalfWidth: 2.9,
} as const

/** Reveal standing proud of the wall around the opening. */
export const PORTAL_SURROUND = { width: 0.35, depth: 0.12 } as const

/** Skirting along the base of the long walls. */
export const WALL_BASE = { height: 0.5, depth: 0.15 } as const

/**
 * The entrance door: two leaves filling the opening below a fixed transom.
 *
 * The leaves cast shadows, so closing them genuinely closes the light — the
 * hall's shaft comes from the transom while they are shut and floods in when
 * they swing. Nothing about the daylight is faked for the transition.
 *
 * The reveal gaps are what let a thin line of daylight sit around a closed
 * door, which is the whole reason the closed state still reads as a way out.
 */
export const DOOR = {
  /** Fixed glazed light above the leaves. Never closes. */
  transomHeight: 1.2,
  /** Gap around each leaf, so daylight outlines the closed door. */
  reveal: 0.045,
  thickness: 0.16,
  /** Radians each leaf swings inward when open. */
  openAngle: 1.6,
  /** Inset from the wall face, so the leaves sit within the opening. */
  z: 0.1,
} as const

export const PLINTH = { radius: 2.4, height: 0.18, z: -10 } as const

export const CHARACTER = {
  position: [0, PLINTH.height, PLINTH.z] as Vec3,
  rotationY: 0.28,
} as const

/**
 * Key light sits behind the wall so the opening shapes the light itself.
 * The spill light sits just inside the doorway standing in for the bounce
 * a real room would get from that much daylight.
 */
export const LIGHTING = {
  key: { position: [3, 18, -38] as Vec3, intensity: 7.2 },
  fill: { position: [-9, 8, 16] as Vec3, intensity: 1.9 },
  spill: { position: [0, 4.5, -17] as Vec3, intensity: 55, distance: 30 },
  hemisphere: { intensity: 1.7 },
} as const
