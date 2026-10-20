import type { Vec3 } from './vec3.ts'

/**
 * Content that sits ON an object in the room.
 *
 * A surface is a flat rectangle in the world: a monitor face, the systems
 * drawing, the front of the build station's board. Its DOM content is laid out
 * as an ordinary rectangle of CSS pixels, and every frame the four corners are
 * projected through the live camera and the rectangle is warped onto them with
 * a `matrix3d`. The text is real DOM (selectable, focusable, announced by a
 * screen reader, crisp) but it belongs to the object: it moves, foreshortens
 * and scales with it as the camera eases in.
 *
 * Everything in this file is plain arithmetic so it can be tested without a
 * browser or a renderer.
 */

export interface SurfaceSpec {
  /** Centre of the visible face, world space, metres. */
  position: Vec3
  /** Rotation about Y, radians. Applied after `pitch` (the object's yaw is the outer rotation). */
  yaw: number
  /** Rotation about X, radians, applied first. */
  pitch: number
  /** Visible face, metres. */
  width: number
  height: number
}

export type Point2 = readonly [number, number]

function rotateX(point: Vec3, radians: number): Vec3 {
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  return [point[0], point[1] * cos - point[2] * sin, point[1] * sin + point[2] * cos]
}

function rotateY(point: Vec3, radians: number): Vec3 {
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  return [point[0] * cos + point[2] * sin, point[1], -point[0] * sin + point[2] * cos]
}

/** A point in the surface's own frame (x right, y up, z out of the face) to world space. */
export function surfaceToWorld(spec: SurfaceSpec, local: Vec3): Vec3 {
  const turned = rotateY(rotateX(local, spec.pitch), spec.yaw)
  return [
    spec.position[0] + turned[0],
    spec.position[1] + turned[1],
    spec.position[2] + turned[2],
  ]
}

/** Top-left, top-right, bottom-right, bottom-left, as seen from in front of the face. */
export function surfaceCorners(spec: SurfaceSpec): [Vec3, Vec3, Vec3, Vec3] {
  const x = spec.width / 2
  const y = spec.height / 2
  return [
    surfaceToWorld(spec, [-x, y, 0]),
    surfaceToWorld(spec, [x, y, 0]),
    surfaceToWorld(spec, [x, -y, 0]),
    surfaceToWorld(spec, [-x, -y, 0]),
  ]
}

/** The direction the face points: out of the object, toward whoever reads it. */
export function surfaceNormal(spec: SurfaceSpec): Vec3 {
  const turned = rotateY(rotateX([0, 0, 1], spec.pitch), spec.yaw)
  return turned
}

/**
 * Solves the 3x3 projective transform taking the four `from` points to the four `to` points.
 * Returned row-major with the last entry normalised to 1.
 */
export function homography(from: readonly Point2[], to: readonly Point2[]): number[] {
  // Eight unknowns (h11..h32), two equations per point pair.
  const rows: number[][] = []
  for (let i = 0; i < 4; i += 1) {
    const [x, y] = from[i]!
    const [u, v] = to[i]!
    rows.push([x, y, 1, 0, 0, 0, -u * x, -u * y, u])
    rows.push([0, 0, 0, x, y, 1, -v * x, -v * y, v])
  }

  // Gauss-Jordan elimination with partial pivoting on the 8x9 augmented matrix.
  for (let col = 0; col < 8; col += 1) {
    let pivot = col
    for (let row = col + 1; row < 8; row += 1) {
      if (Math.abs(rows[row]![col]!) > Math.abs(rows[pivot]![col]!)) pivot = row
    }
    if (Math.abs(rows[pivot]![col]!) < 1e-12) throw new Error('degenerate quad')
    ;[rows[col], rows[pivot]] = [rows[pivot]!, rows[col]!]

    const lead = rows[col]![col]!
    for (let k = col; k < 9; k += 1) rows[col]![k] = rows[col]![k]! / lead

    for (let row = 0; row < 8; row += 1) {
      if (row === col) continue
      const factor = rows[row]![col]!
      if (factor === 0) continue
      for (let k = col; k < 9; k += 1) rows[row]![k] = rows[row]![k]! - factor * rows[col]![k]!
    }
  }

  const h = rows.map((row) => row[8]!)
  return [...h, 1]
}

/** Applies a row-major 3x3 homography to a point. */
export function applyHomography(h: readonly number[], point: Point2): Point2 {
  const [x, y] = point
  const w = h[6]! * x + h[7]! * y + h[8]!
  return [(h[0]! * x + h[1]! * y + h[2]!) / w, (h[3]! * x + h[4]! * y + h[5]!) / w]
}

/**
 * The CSS `matrix3d(...)` that maps a `width` x `height` box (origin at its top-left) onto the
 * quad `to`, given top-left, top-right, bottom-right, bottom-left in screen pixels.
 *
 * Column-major, as CSS wants: the 2D homography is embedded in the x, y and w rows and the z
 * row is left as the identity so nothing in the box is lifted out of the plane.
 */
export function matrix3dFor(width: number, height: number, to: readonly Point2[]): string {
  const h = homography(
    [
      [0, 0],
      [width, 0],
      [width, height],
      [0, height],
    ],
    to,
  )
  const m = [
    h[0], h[3], 0, h[6],
    h[1], h[4], 0, h[7],
    0, 0, 1, 0,
    h[2], h[5], 0, h[8],
  ]
  return `matrix3d(${m.map((n) => (Number.isFinite(n) ? +n!.toPrecision(9) : 0)).join(',')})`
}

/** Twice the signed area of a screen quad; negative means it is facing away from the viewer. */
export function signedArea(quad: readonly Point2[]): number {
  let sum = 0
  for (let i = 0; i < quad.length; i += 1) {
    const [x1, y1] = quad[i]!
    const [x2, y2] = quad[(i + 1) % quad.length]!
    sum += x1 * y2 - x2 * y1
  }
  return sum
}

/** Width in pixels of a screen quad's top edge, a stand-in for how large the surface reads. */
export function topEdgeLength(quad: readonly Point2[]): number {
  return Math.hypot(quad[1]![0] - quad[0]![0], quad[1]![1] - quad[0]![1])
}

/**
 * How far back a camera must be for a face of this size to fill `fill` of the frame.
 *
 * `fill` is the larger of the two fractions (width or height). `verticalFov` is in degrees and
 * `aspect` is width over height. Distance is along the view axis, to the face's centre.
 */
export function framingDistance(
  width: number,
  height: number,
  fill: number,
  verticalFov = 42,
  aspect = 1.6,
): number {
  const tanV = Math.tan((verticalFov * Math.PI) / 360)
  const byHeight = height / (2 * tanV)
  const byWidth = width / (2 * tanV * aspect)
  return Math.max(byHeight, byWidth) / fill
}

/**
 * The share of the frame a face fills when seen square-on from `distance`.
 * The inverse of `framingDistance`.
 */
export function frameFill(
  width: number,
  height: number,
  distance: number,
  verticalFov = 42,
  aspect = 1.6,
): number {
  const tanV = Math.tan((verticalFov * Math.PI) / 360)
  return Math.max(height / (2 * tanV * distance), width / (2 * tanV * aspect * distance))
}
