import { HALL } from '@/data/entranceScene'
import type { Vec3 } from '@/lib/vec3'
import type { ExperienceStage } from '@/systems/experienceStage'

/**
 * Camera behaviour, kept apart from scene geometry and from experience
 * state. Each stage of the journey names one pose; the rig eases toward
 * whichever pose the current stage names, so adding an area later means
 * adding a stage and a pose, not new camera code.
 */
export interface CameraPose {
  position: Vec3
  lookAt: Vec3
  /** How far the camera drifts with the pointer, in metres. */
  parallax: number
}

/**
 * Narrow viewports lose horizontal field of view, which crops the hall
 * away until only the doorway is left. The rig widens the lens and eases
 * the camera back to hold the composition — blended, because doing either
 * alone gives a fisheye or puts the camera through the wall.
 */
export const FRAMING = {
  referenceAspect: 1.6,
  baseFov: 42,
  maxFov: 60,
  maxPullback: 1.2,
  /** The camera may never reach the open end of the hall. */
  maxZ: HALL.front - 4,
  /**
   * Metres the aim point drops on a fully portrait viewport. Tilting beats
   * moving here: it trades ceiling for light path without changing the
   * camera's distance, so the character keeps its size.
   */
  portraitTilt: 1.35,
} as const

/** Where the camera begins before the cinematic move settles it. */
export const CAMERA_START: CameraPose = {
  position: [0, 1.2, 26],
  lookAt: [0, 4.2, -20],
  parallax: 0,
}

export const CAMERA_POSES: Record<ExperienceStage, CameraPose> = {
  /** Establishing wide. The hall, the closed door, the board beside it. */
  intro: {
    position: [0, 2.9, 10],
    lookAt: [0, 3.1, -16],
    parallax: 0.3,
  },
  /** Inside, holding the door and the board in one frame. */
  entrance: {
    position: [1.1, 2.2, -6],
    lookAt: [1.6, 2.5, -18.9],
    parallax: 0.45,
  },
  /** Tracking in behind the walk, the door filling the end of the hall. */
  approachDoor: {
    position: [1.9, 2, -10.5],
    lookAt: [0.6, 2.1, -18],
    parallax: 0.35,
  },
  /** Close on the host at the door, board still in frame. Held for the raps. */
  knock: {
    position: [2, 2.05, -11],
    lookAt: [0.6, 1.9, -17.6],
    parallax: 0.22,
  },
  knocking: {
    position: [2, 2.05, -11],
    lookAt: [0.6, 1.9, -17.6],
    parallax: 0.22,
  },
  /** Easing back as the leaves swing and the daylight arrives. */
  doorOpen: {
    position: [1.5, 2.2, -12],
    lookAt: [0.1, 2.7, -19.4],
    parallax: 0.25,
  },
  /** In front of the host as they turn and open a hand to the visitor. */
  welcome: {
    position: [0.4, 2, -10.6],
    lookAt: [0.3, 1.6, -17.6],
    parallax: 0.3,
  },
  /** Through the door and standing in the studio. The resting place. */
  workshop: {
    position: [3.4, 2.5, -21.5],
    lookAt: [-3.2, 1.7, -29.5],
    parallax: 0.5,
  },
}
