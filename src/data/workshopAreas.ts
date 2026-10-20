import { framingDistance } from '../lib/surface.ts'
import { rotateY, type Vec3 } from '../lib/vec3.ts'
import type { CameraPose } from './cameraPoses.ts'
import { ABOUT_MARK } from './journey.ts'
import { SURFACES } from './surfaces.ts'
import { ABOUT_BOARD } from './workshop.ts'
import type { WorkshopArea } from '../systems/workshopArea.ts'

/**
 * Where each destination lives in the room, and how the camera looks at it.
 *
 * The anchor of a destination is the centre of what the camera frames: the
 * face the content is written on (or, for About, the point between the host
 * and his board). A pose always looks AT its anchor, and is placed so that the
 * thing fills most of the frame. Nothing here is written as a bare coordinate:
 * the numbers fall out of the objects' own constants.
 */
export interface AreaAnchor {
  /** Where the marker sits, and what the camera looks at, in world space. */
  position: Vec3
  /** Radius of the marker ring. */
  radius: number
}

/** What the camera is asked to frame for one destination. */
export interface AreaFrame {
  /** The centre of the framed thing. Also the anchor and the look-at point. */
  centre: Vec3
  /** Size of the framed thing, metres, as seen from the camera. */
  width: number
  height: number
  /** The direction the camera sits in: a yaw about Y, 0 being +Z of the room. */
  yaw: number
  /** The camera's own height, so it reads at eye level rather than at the object's. */
  eyeY: number
  /** How much of the frame the thing should fill. */
  fill: number
}

/**
 * The share of the frame each framed thing fills: always between 60% and 75%. Things that are wide
 * and low take more; things that are tall take less, because the destination row and the Back button
 * sit across the bottom of the screen and a tall board would run into them.
 */
export const AREA_FILL: Record<WorkshopArea, number> = {
  projects: 0.72,
  skills: 0.68,
  services: 0.62,
  about: 0.62,
  contact: 0.64,
}

const MONITOR = SURFACES['monitor-1'].spec
const SKILLS = SURFACES.skills.spec
const SERVICES = SURFACES.services.spec
const CONTACT = SURFACES.contact.spec

/** The host's chest and the middle of his board: About frames the two together. */
const ABOUT_CENTRE: Vec3 = [
  (ABOUT_MARK.position[0] + ABOUT_BOARD.position[0]) / 2,
  1.05,
  (ABOUT_MARK.position[2] + ABOUT_BOARD.position[2]) / 2,
]

export const AREA_FRAMES: Record<WorkshopArea, AreaFrame> = {
  /** The three monitors as one group, seen along the middle one's normal. */
  projects: {
    centre: MONITOR.position,
    width: 3.3,
    height: 0.62,
    // A little off square, so the view swings away from the far glazing.
    yaw: MONITOR.yaw + 0.18,
    eyeY: 1.5,
    fill: AREA_FILL.projects,
  },
  /** The systems drawing, square on from across the room. */
  skills: {
    centre: SKILLS.position,
    width: SKILLS.width,
    height: SKILLS.height,
    yaw: SKILLS.yaw,
    eyeY: 2.2,
    fill: AREA_FILL.skills,
  },
  /** The board over the build station. */
  services: {
    centre: SERVICES.position,
    width: SERVICES.width,
    height: SERVICES.height,
    yaw: SERVICES.yaw,
    eyeY: 1.8,
    fill: AREA_FILL.services,
  },
  /** The host and his board, together. */
  about: {
    centre: ABOUT_CENTRE,
    width: 3.4,
    height: 2.3,
    // Along the board's own normal, from the left of the host: the far glazing falls out of shot.
    yaw: ABOUT_BOARD.yaw,
    eyeY: 1.4,
    fill: AREA_FILL.about,
  },
  /** The console in the rack. */
  contact: {
    centre: CONTACT.position,
    width: CONTACT.width,
    height: CONTACT.height,
    // Seen a little from the right of the rack, which turns the view away from the far glazing.
    yaw: CONTACT.yaw + 0.33,
    eyeY: 1.45,
    fill: AREA_FILL.contact,
  },
}

export const AREA_ANCHORS: Record<WorkshopArea, AreaAnchor> = {
  projects: { position: AREA_FRAMES.projects.centre, radius: 0.34 },
  skills: { position: AREA_FRAMES.skills.centre, radius: 0.3 },
  services: { position: AREA_FRAMES.services.centre, radius: 0.32 },
  about: { position: AREA_FRAMES.about.centre, radius: 0.3 },
  contact: { position: AREA_FRAMES.contact.centre, radius: 0.32 },
}

/** Parallax is small: the drift is a hint of depth, not a way to lose the thing. */
export const AREA_PARALLAX = 0.12

/**
 * A camera that frames `frame`. Looks at its centre, from the distance at which the
 * thing fills `frame.fill` of a 42 degree, 1.6:1 frame, in the direction `frame.yaw`.
 */
export function poseFor(frame: AreaFrame): CameraPose {
  const distance = framingDistance(frame.width, frame.height, frame.fill)
  const offset = rotateY([0, 0, distance], frame.yaw)

  return {
    position: [frame.centre[0] + offset[0], frame.eyeY, frame.centre[2] + offset[2]],
    lookAt: frame.centre,
    parallax: AREA_PARALLAX,
  }
}

export const AREA_POSES: Record<WorkshopArea, CameraPose> = {
  projects: poseFor(AREA_FRAMES.projects),
  skills: poseFor(AREA_FRAMES.skills),
  services: poseFor(AREA_FRAMES.services),
  about: poseFor(AREA_FRAMES.about),
  contact: poseFor(AREA_FRAMES.contact),
}

/**
 * Close on one monitor, for reading a project. The monitors are yawed inward a
 * little each, so every one is seen square on from its own normal.
 */
export const MONITOR_FOCUS_POSES: readonly CameraPose[] = (['monitor-0', 'monitor-1', 'monitor-2'] as const).map(
  (id) => {
    const spec = SURFACES[id].spec
    return poseFor({
      centre: spec.position,
      width: spec.width,
      height: spec.height,
      yaw: spec.yaw,
      eyeY: spec.position[1] + 0.05,
      fill: 0.72,
    })
  },
)
