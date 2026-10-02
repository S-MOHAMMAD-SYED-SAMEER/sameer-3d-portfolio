import type { CameraPose } from '@/data/cameraPoses'
import { PROJECTS, type ProjectId } from '@/data/projects'
import { WORKSTATION } from '@/data/workshop'
import { addVec3, rotateY, type Vec3 } from '@/lib/vec3'

/**
 * Where each project's display sits in the room.
 *
 * Derived from the workstation's own constants rather than written out, so
 * the anchors follow the bench if it ever moves. The three projects map onto
 * the three screens left to right, in `order`.
 */
const SCREEN_Y = WORKSTATION.height + 0.12 + WORKSTATION.monitor.height / 2
const SPACING = WORKSTATION.monitor.width + WORKSTATION.monitor.gap
const COLUMNS = [-1, 0, 1] as const

function displayAnchor(column: number): Vec3 {
  const local: Vec3 = [column * SPACING, SCREEN_Y, -0.16]
  return addVec3(WORKSTATION.position, rotateY(local, WORKSTATION.rotationY))
}

export const PROJECT_DISPLAYS: { id: ProjectId; position: Vec3; yaw: number; pitch: number }[] =
  PROJECTS.slice(0, 3).map((project, index) => {
    const column = COLUMNS[index] ?? 0

    return {
      id: project.id,
      position: displayAnchor(column),
      /**
       * Kept as two angles, not one Euler: the workstation nests yaw outside
       * pitch, and collapsing them into a single XYZ rotation applies the
       * tilt about the world axis instead — which skews the marker off its
       * screen.
       */
      yaw: WORKSTATION.rotationY - column * 0.24,
      pitch: -WORKSTATION.monitor.tilt,
    }
  })

/** The outline sits just outside the bezel. */
export const DISPLAY_MARKER = {
  width: WORKSTATION.monitor.width + 0.08,
  height: WORKSTATION.monitor.height + 0.08,
} as const

/**
 * A step closer for inspection.
 *
 * Deliberately a small move off the Projects pose — the visitor is leaning in
 * to read a screen, not being flown somewhere.
 */
export const PROJECT_DETAIL_POSE: CameraPose = {
  position: [-0.3, 1.75, -26.6],
  lookAt: [-2.7, 1.2, -29.2],
  parallax: 0.2,
}

/**
 * Facing the projector screen on the right wall (see `PROJECTOR_SCREEN` in
 * `@/data/workshop`, centred at [6.95, 3, -25]).
 *
 * Positioned well back into the room — not near the wall's own x — so the
 * screen is seen face-on rather than from its edge: the view direction from
 * this camera to the screen runs almost entirely along +X, with only a
 * small Z/Y tilt for a less sterile angle, the same restraint every other
 * destination pose uses. At this distance (~6.4m) the screen's 6×4 face
 * sits comfortably inside the frame with margin on every side, at the
 * camera's standard 42° vertical FOV (`SceneCanvas`) and ~1.6 reference
 * aspect (`FRAMING`) — verified by hand, not just eyeballed, before this
 * pose was written. The eye height (1.95) matches the one `projects` and
 * `contact` already use, rather than introducing a new height.
 */
export const PROJECTOR_POSE: CameraPose = {
  position: [0.8, 1.95, -23.5],
  lookAt: [6.95, 2.9, -25],
  parallax: 0.3,
}
