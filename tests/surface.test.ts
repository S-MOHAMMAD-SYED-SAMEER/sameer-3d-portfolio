import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  applyHomography,
  frameFill,
  framingDistance,
  homography,
  matrix3dFor,
  signedArea,
  surfaceCorners,
  surfaceNormal,
  type Point2,
} from '../src/lib/surface.ts'
import { MONITOR_SURFACES, SURFACES, type SurfaceId } from '../src/data/surfaces.ts'

/**
 * Content is laid out as a rectangle of CSS pixels and warped onto the four projected corners of an
 * object's face. The arithmetic is exact, so it is tested exactly, without a browser.
 */

const close = (a: number, b: number, tolerance = 1e-6) =>
  assert.ok(Math.abs(a - b) <= tolerance, `${a} is not within ${tolerance} of ${b}`)

test('the homography maps each corner of the box onto the matching corner of the quad', () => {
  const quad: Point2[] = [
    [120, 80],
    [760, 130],
    [700, 610],
    [90, 540],
  ]
  const h = homography(
    [
      [0, 0],
      [400, 0],
      [400, 227],
      [0, 227],
    ],
    quad,
  )
  const corners: Point2[] = [
    [0, 0],
    [400, 0],
    [400, 227],
    [0, 227],
  ]
  corners.forEach((corner, index) => {
    const [x, y] = applyHomography(h, corner)
    close(x, quad[index]![0], 1e-6)
    close(y, quad[index]![1], 1e-6)
  })
})

test('an axis-aligned quad gives a plain scale and translate', () => {
  const h = homography(
    [
      [0, 0],
      [100, 0],
      [100, 50],
      [0, 50],
    ],
    [
      [10, 20],
      [210, 20],
      [210, 120],
      [10, 120],
    ],
  )
  const [x, y] = applyHomography(h, [50, 25])
  close(x, 110)
  close(y, 70)
})

test('matrix3d is column-major with the homography in the x, y and w rows', () => {
  const css = matrix3dFor(100, 50, [
    [10, 20],
    [210, 20],
    [210, 120],
    [10, 120],
  ])
  const numbers = css.replace('matrix3d(', '').replace(')', '').split(',').map(Number)
  assert.equal(numbers.length, 16)
  // x scale 2, y scale 2, translate (10, 20): m[0], m[5], m[12], m[13]; z row is the identity.
  close(numbers[0]!, 2)
  close(numbers[5]!, 2)
  close(numbers[10]!, 1)
  close(numbers[12]!, 10)
  close(numbers[13]!, 20)
  close(numbers[15]!, 1)
})

test('a degenerate quad is refused rather than producing NaN', () => {
  assert.throws(() =>
    homography(
      [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
      ],
      [
        [5, 5],
        [5, 5],
        [5, 5],
        [5, 5],
      ],
    ),
  )
})

test('a face turned away has negative screen area, so it can be hidden', () => {
  const facing: Point2[] = [
    [0, 0],
    [10, 0],
    [10, 10],
    [0, 10],
  ]
  assert.ok(signedArea(facing) > 0)
  assert.ok(signedArea([...facing].reverse()) < 0)
})

test('corners are the right size and lie in the face plane, normal to the surface normal', () => {
  for (const id of Object.keys(SURFACES) as SurfaceId[]) {
    const { spec } = SURFACES[id]
    const [tl, tr, br, bl] = surfaceCorners(spec)
    const normal = surfaceNormal(spec)

    close(Math.hypot(tr[0] - tl[0], tr[1] - tl[1], tr[2] - tl[2]), spec.width, 1e-9)
    close(Math.hypot(tl[0] - bl[0], tl[1] - bl[1], tl[2] - bl[2]), spec.height, 1e-9)

    for (const [a, b] of [
      [tl, tr],
      [tr, br],
      [br, bl],
    ] as const) {
      const edge = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
      close(edge[0]! * normal[0] + edge[1]! * normal[1] + edge[2]! * normal[2], 0, 1e-9)
    }
  }
})

test('each face looks into the room, not into its wall', () => {
  // Facing directions the geometry is built with: the drawing faces +x from the left wall, the board over the
  // build station faces -x from the right wall, the rack console faces the door (+z).
  const skills = surfaceNormal(SURFACES.skills.spec)
  const services = surfaceNormal(SURFACES.services.spec)
  const contact = surfaceNormal(SURFACES.contact.spec)
  close(skills[0], 1, 1e-9)
  close(services[0], -1, 1e-9)
  close(contact[2], 1, 1e-9)
})

test('the three monitors are three distinct faces on the bench, left to right', () => {
  const positions = MONITOR_SURFACES.map((id) => SURFACES[id].spec.position)
  assert.equal(new Set(positions.map((p) => p.join(','))).size, 3)
  for (const id of MONITOR_SURFACES) {
    const { spec, css } = SURFACES[id]
    // The page is laid out at the face's own proportions, so nothing is squashed when it is warped on.
    close(css.width / css.height, spec.width / spec.height, 0.02)
  }
})

test('every face is laid out at its own proportions', () => {
  for (const id of Object.keys(SURFACES) as SurfaceId[]) {
    const { spec, css } = SURFACES[id]
    const faceAspect = spec.width / spec.height
    const pageAspect = css.width / css.height
    assert.ok(Math.abs(faceAspect - pageAspect) / faceAspect < 0.03, `${id}: face ${faceAspect.toFixed(2)} vs page ${pageAspect.toFixed(2)}`)
  }
})

test('framing distance and fill are inverses', () => {
  for (const fill of [0.6, 0.68, 0.75]) {
    const d = framingDistance(2.9, 1.6, fill)
    close(frameFill(2.9, 1.6, d), fill, 1e-9)
  }
})

test('a wider thing needs the camera further back', () => {
  assert.ok(framingDistance(5.26, 2.86, 0.68) > framingDistance(1.3, 0.95, 0.68))
})
