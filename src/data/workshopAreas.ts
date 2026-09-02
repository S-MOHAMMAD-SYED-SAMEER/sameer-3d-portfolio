import type { CameraPose } from '@/data/cameraPoses'
import { BUILD_STATION, RACK, SYSTEMS_PANEL, WORKSTATION } from '@/data/workshop'
import { CHARACTER_MARKS } from '@/data/journey'
import type { Vec3 } from '@/lib/vec3'
import type { WorkshopArea } from '@/systems/workshopArea'

/**
 * Where each destination lives in the room, and how the camera looks at it.
 *
 * The anchors sit on objects that are already there — the displays, the
 * bench, the drawing on the wall, the rack, the window — so nothing has been
 * added to the workshop to carry navigation.
 */
export interface AreaAnchor {
  /** Where the marker sits, in world space. */
  position: Vec3
  /** Radius of the marker ring on the floor beneath it. */
  radius: number
}

export const AREA_ANCHORS: Record<WorkshopArea, AreaAnchor> = {
  /** The three displays. */
  projects: { position: [WORKSTATION.position[0] - 0.2, 1.36, -29.55], radius: 0.34 },
  /** The systems drawing on the left wall. */
  skills: { position: [SYSTEMS_PANEL.position[0] + 0.35, SYSTEMS_PANEL.position[1], -30], radius: 0.3 },
  /** The build station against the right wall. Its own place, not the bench. */
  services: { position: [BUILD_STATION.position[0] - 0.6, 1.3, BUILD_STATION.position[2]], radius: 0.32 },
  /** Beside the host himself, who is the subject of About. */
  about: {
    position: [CHARACTER_MARKS.studio.position[0] + 0.95, 1.2, CHARACTER_MARKS.studio.position[2] + 0.2],
    radius: 0.3,
  },
  /** The equipment rack. */
  contact: { position: [RACK.position[0] + 0.55, 1.3, RACK.position[2]], radius: 0.32 },
}

/**
 * One pose per destination. Each keeps the room in frame rather than filling
 * it with the object, so the visitor never loses their bearings.
 */
export const AREA_POSES: Record<WorkshopArea, CameraPose> = {
  projects: {
    position: [0.6, 1.95, -25.6],
    lookAt: [-2.6, 1.3, -29.4],
    parallax: 0.25,
  },
  skills: {
    position: [-2.4, 2.5, -26.6],
    lookAt: [-6.6, 2.9, -30],
    parallax: 0.25,
  },
  /**
   * Across the room to the build station. Nothing of the workstation is in
   * this frame, which is the point — the two destinations were previously
   * looking at the same object from almost the same place.
   */
  services: {
    position: [2.2, 1.9, -29],
    lookAt: [6.4, 1.1, -31.7],
    parallax: 0.25,
  },
  /**
   * On the host. About is about a person, so the composition is a person —
   * with the room behind him rather than an empty wall.
   */
  about: {
    position: [4.3, 1.85, -22.6],
    lookAt: [2.4, 1.4, -28],
    parallax: 0.25,
  },
  /** Closer on the rack, so it reads as a station rather than a dark corner. */
  contact: {
    position: [-2.9, 1.95, -30],
    lookAt: [-6, 1.35, -33.4],
    parallax: 0.25,
  },
}
