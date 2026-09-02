import { PORTAL_WALL } from '@/data/entranceScene'
import type { Vec3 } from '@/lib/vec3'

/**
 * The workshop: Sameer's studio, on the far side of the entrance door.
 *
 * Same language as the hall — dark stone, one warm daylight source, nothing
 * decorative. It is wider and lower than the corridor, so crossing the
 * threshold reads as arriving somewhere rather than continuing along.
 */
export const WORKSHOP = {
  halfWidth: 7.5,
  /** Meets the back of the portal wall. */
  front: PORTAL_WALL.z,
  back: -38,
  height: 12,
  thickness: 1,
  /**
   * A slot in the roof. It is what admits the hall's key light: with the
   * roof solid, the shaft through the entrance door would be cut off at
   * source, so the opening is sized around the path that light actually
   * takes on its way to the doorway.
   */
  roofSlot: { halfWidth: 2.5, from: PORTAL_WALL.z, to: -36 },
  /** The far glazed wall. The room's daylight. */
  /** Glazed to the roof: the entrance transom sights straight through the
   *  hall and into this wall, so anything solid up here darkens the door. */
  window: { halfWidth: 4.5, sill: 1.3, head: 12 },
  /** The lit plane behind the glazing. */
  daylight: {
    width: 20,
    height: 18,
    y: 6.6,
    distance: 2.4,
    /** Softer than the sky over the hall. Glazing, not an open roof. */
    top: '#d9d0bf',
    bottom: '#b5aa96',
  },
  /**
   * Open sky over the roof slot. Not decoration: the entrance transom looks
   * up through the slot from the corridor, and without something bright above
   * it the daylight line over the closed door goes out.
   */
  sky: { y: 20, halfWidth: 14, from: -16, to: -60 },
} as const

export const WORKSHOP_PALETTE = {
  wall: '#2f3037',
  wallShadow: '#212228',
  floorInlay: '#191b21',
  bench: '#26272e',
  benchTop: '#33343c',
  metal: '#3d404a',
  screenFrame: '#15161b',
  seat: '#1d1f25',
} as const

/** One long bench on the axis, set back so the doorway stays clear. */
export const WORKSTATION = {
  position: [-2.6, 0, -29] as Vec3,
  /** Angled off the axis so the displays face the way the visitor enters. */
  rotationY: 0.7,
  width: 3.8,
  depth: 1.05,
  topThickness: 0.07,
  height: 0.74,
  /** Three displays, angled slightly inward. */
  monitor: { width: 1.02, height: 0.6, tilt: 0.1, gap: 0.06 },
  chair: { offsetZ: 1.15, seatHeight: 0.46 },
} as const

/** A slim rack against the left wall. Engineering, not decoration. */
export const RACK = {
  position: [-6.1, 0, -33.4] as Vec3,
  width: 0.9,
  depth: 1,
  height: 2.1,
  units: 7,
} as const

/**
 * The build station, against the right wall.
 *
 * The one piece of geometry this phase adds. Services previously shared the
 * workstation with Projects, which left two destinations pointing at the same
 * object — and left the whole right half of the room empty. This fills it
 * with the place where systems are wired together rather than written.
 */
export const BUILD_STATION = {
  position: [6.4, 0, -31.6] as Vec3,
  /** Length runs along Z against the wall; the front faces into the room. */
  rotationY: -Math.PI / 2,
  bench: { width: 2.4, depth: 0.72, height: 0.9, top: 0.06 },
  /** Distance from the bench centre back to the wall, in local Z. */
  wallOffset: -1.02,
  patch: { width: 1.8, height: 0.8, y: 1.62, strips: 5 },
  terminal: { width: 0.62, height: 0.38, x: -0.6, y: 1.17, tilt: 0.22 },
  tray: { length: 2.7, y: 2.25 },
} as const

/** An etched systems drawing on the right wall, in place of any signage. */
export const SYSTEMS_PANEL = {
  position: [-6.95, 3, -30] as Vec3,
  width: 5.4,
  height: 3,
  depth: 0.06,
} as const

/** Low and warm, so the bench reads without becoming the brightest thing. */
export const WORKSHOP_LIGHT = {
  bench: { position: [-1.5, 3.2, -27.8] as Vec3, intensity: 26, distance: 12 },
  /** Over the build station, so the right side is not a dark half. */
  station: { position: [5.5, 2.5, -31.4] as Vec3, intensity: 44, distance: 7 },
  /** A low wash on the rack, so Contact reads as a place rather than a corner. */
  rack: { position: [-4.9, 2.4, -32.8] as Vec3, intensity: 30, distance: 6.5 },
  colour: '#ffdfb8',
} as const
