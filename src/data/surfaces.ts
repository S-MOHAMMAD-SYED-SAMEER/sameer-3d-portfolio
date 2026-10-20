import { surfaceToWorld, type SurfaceSpec } from '../lib/surface.ts'
import { rotateY, type Vec3 } from '../lib/vec3.ts'
import { ABOUT_BOARD, BUILD_STATION, RACK, RACK_CONSOLE, SYSTEMS_PANEL, WORKSTATION } from './workshop.ts'

/**
 * The faces in the room that carry content.
 *
 * Each one is a real object: a monitor on the bench, the systems drawing on the
 * left wall, the board over the build station, the console in the rack, the
 * board beside the host. The numbers are derived from the same constants the
 * geometry is built from, so a face cannot drift off its object.
 *
 * `css` is the size, in CSS pixels, the page is laid out at. It is chosen so
 * that at the framing each camera pose gives (see `workshopAreas.ts`) the page
 * is shown at about one screen pixel per CSS pixel on a 1440x900 viewport, which
 * is what keeps the smallest text legible.
 */
export type SurfaceId =
  | 'monitor-0'
  | 'monitor-1'
  | 'monitor-2'
  | 'skills'
  | 'services'
  | 'contact'
  | 'about'

export interface Surface {
  id: SurfaceId
  spec: SurfaceSpec
  css: { width: number; height: number }
}

/** The face sits this far proud of the object it is on, so it never z-fights. */
const PROUD = 0.004

const SCREEN_Y = WORKSTATION.height + 0.12 + WORKSTATION.monitor.height / 2
const SPACING = WORKSTATION.monitor.width + WORKSTATION.monitor.gap

/**
 * One of the three monitors. Built the way `Workstation` builds it: the bench
 * is yawed, each monitor is yawed a little further inward, and the tilt sits
 * inside both. The face is 0.023 in front of the monitor's own centre.
 */
function monitorSpec(column: -1 | 0 | 1): SurfaceSpec {
  const local: Vec3 = [column * SPACING, SCREEN_Y, -0.16]
  const centre: Vec3 = [
    WORKSTATION.position[0] + rotateY(local, WORKSTATION.rotationY)[0],
    WORKSTATION.position[1] + rotateY(local, WORKSTATION.rotationY)[1],
    WORKSTATION.position[2] + rotateY(local, WORKSTATION.rotationY)[2],
  ]
  const yaw = WORKSTATION.rotationY - column * 0.24
  const pitch = -WORKSTATION.monitor.tilt
  const width = WORKSTATION.monitor.width - 0.05
  const height = WORKSTATION.monitor.height - 0.05
  const position = surfaceToWorld({ position: centre, yaw, pitch, width, height }, [0, 0, 0.023 + PROUD])
  return { position, yaw, pitch, width, height }
}

const MONITOR_CSS = { width: 400, height: 227 } as const

/** The systems drawing, facing into the room from the left wall. */
const SKILLS_SPEC: SurfaceSpec = {
  position: [
    SYSTEMS_PANEL.position[0] + SYSTEMS_PANEL.depth / 2 + 0.008 + PROUD,
    SYSTEMS_PANEL.position[1],
    SYSTEMS_PANEL.position[2],
  ],
  yaw: Math.PI / 2,
  pitch: 0,
  width: SYSTEMS_PANEL.width - 0.14,
  height: SYSTEMS_PANEL.height - 0.14,
}

/** The board on the right wall over the build station: it faces -x, into the room. */
const SERVICES_SPEC: SurfaceSpec = {
  position: [
    BUILD_STATION.position[0] - (BUILD_STATION.wallOffset + 0.037 + PROUD),
    BUILD_STATION.patch.y,
    BUILD_STATION.position[2],
  ],
  yaw: BUILD_STATION.rotationY,
  pitch: 0,
  width: BUILD_STATION.patch.width - 0.12,
  height: BUILD_STATION.patch.height - 0.12,
}

/** The console set into the front of the rack, which faces the door (+z). */
const CONTACT_SPEC: SurfaceSpec = {
  position: [RACK.position[0], RACK_CONSOLE.y, RACK.position[2] + RACK.depth / 2 + 0.03 + PROUD],
  yaw: 0,
  pitch: 0,
  width: RACK_CONSOLE.width - RACK_CONSOLE.bezel,
  height: RACK_CONSOLE.height - RACK_CONSOLE.bezel,
}

/** The board standing beside the host. */
const ABOUT_SPEC: SurfaceSpec = (() => {
  const offset = rotateY([0, 0, ABOUT_BOARD.depth / 2 + PROUD], ABOUT_BOARD.yaw)
  return {
    position: [
      ABOUT_BOARD.position[0] + offset[0],
      ABOUT_BOARD.y,
      ABOUT_BOARD.position[2] + offset[2],
    ],
    yaw: ABOUT_BOARD.yaw,
    pitch: 0,
    width: ABOUT_BOARD.width - 0.1,
    height: ABOUT_BOARD.height - 0.1,
  }
})()

export const SURFACES: Record<SurfaceId, Surface> = {
  'monitor-0': { id: 'monitor-0', spec: monitorSpec(-1), css: MONITOR_CSS },
  'monitor-1': { id: 'monitor-1', spec: monitorSpec(0), css: MONITOR_CSS },
  'monitor-2': { id: 'monitor-2', spec: monitorSpec(1), css: MONITOR_CSS },
  skills: { id: 'skills', spec: SKILLS_SPEC, css: { width: 1052, height: 572 } },
  services: { id: 'services', spec: SERVICES_SPEC, css: { width: 870, height: 568 } },
  contact: { id: 'contact', spec: CONTACT_SPEC, css: { width: 520, height: 380 } },
  about: { id: 'about', spec: ABOUT_SPEC, css: { width: 640, height: 480 } },
}

export const MONITOR_SURFACES = ['monitor-0', 'monitor-1', 'monitor-2'] as const satisfies readonly SurfaceId[]
