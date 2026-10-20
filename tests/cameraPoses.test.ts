import assert from 'node:assert/strict'
import { test } from 'node:test'

import { frameFill } from '../src/lib/surface.ts'
import {
  AREA_ANCHORS,
  AREA_FRAMES,
  AREA_PARALLAX,
  AREA_POSES,
  MONITOR_FOCUS_POSES,
} from '../src/data/workshopAreas.ts'
import { WORKSHOP } from '../src/data/workshop.ts'
import { WORKSHOP_AREAS } from '../src/systems/workshopArea.ts'

const TAN_V = Math.tan((42 * Math.PI) / 360)
const TAN_H = TAN_V * 1.6
const unit = (v: number[]) => v.map((n) => n / Math.hypot(...v))
const cross = (a: number[], b: number[]) => [a[1]! * b[2]! - a[2]! * b[1]!, a[2]! * b[0]! - a[0]! * b[2]!, a[0]! * b[1]! - a[1]! * b[0]!]

/**
 * How much of the frame the far glazing takes up, outside the thing being framed (which stands in front of
 * it where they overlap). Rays are cast through a grid of the frame and tested against the glazing's opening.
 */
function glazingShare(area: (typeof WORKSHOP_AREAS)[number]): number {
  const pose = AREA_POSES[area]
  const frame = AREA_FRAMES[area]
  const to = [pose.lookAt[0] - pose.position[0], pose.lookAt[1] - pose.position[1], pose.lookAt[2] - pose.position[2]]
  const forward = unit(to)
  const right = unit(cross(forward, [0, 1, 0]))
  const up = cross(right, forward)
  const d = Math.hypot(...to)
  const halfWidth = frame.width / (2 * d * TAN_H)
  const halfHeight = frame.height / (2 * d * TAN_V)

  let glazing = 0
  const columns = 80
  const rows = 50
  for (let i = 0; i < columns; i += 1) {
    for (let j = 0; j < rows; j += 1) {
      const u = -1 + (2 * (i + 0.5)) / columns
      const v = -1 + (2 * (j + 0.5)) / rows
      if (Math.abs(u) < halfWidth && Math.abs(v) < halfHeight) continue
      const dir = [0, 1, 2].map((k) => forward[k]! + right[k]! * u * TAN_H + up[k]! * v * TAN_V)
      if (dir[2]! >= 0) continue
      const t = (WORKSHOP.back - pose.position[2]) / dir[2]!
      const x = pose.position[0] + dir[0]! * t
      const y = pose.position[1] + dir[1]! * t
      if (Math.abs(x) <= WORKSHOP.window.halfWidth && y >= WORKSHOP.window.sill && y <= WORKSHOP.window.head) glazing += 1
    }
  }
  return glazing / (columns * rows)
}

/**
 * Each destination has one camera pose and it is not an eyeballed coordinate: it looks at the
 * destination's anchor and stands where the framed thing fills most of the frame.
 */

const distance = (a: readonly number[], b: readonly number[]) =>
  Math.hypot(a[0]! - b[0]!, a[1]! - b[1]!, a[2]! - b[2]!)

test("every pose looks at its area's anchor", () => {
  for (const area of WORKSHOP_AREAS) {
    assert.deepEqual([...AREA_POSES[area].lookAt], [...AREA_ANCHORS[area].position], `${area} does not look at its anchor`)
  }
})

test('each framed thing fills between 60% and 75% of a 1440x900 frame', () => {
  for (const area of WORKSHOP_AREAS) {
    const frame = AREA_FRAMES[area]
    const pose = AREA_POSES[area]
    const fill = frameFill(frame.width, frame.height, distance(pose.position, pose.lookAt))
    // The camera is at eye height, a little off the centre's own, so the true distance is a touch more than the framing
    // distance. Allow for that; the tolerance is the width of the 60-75% band, not an excuse.
    assert.ok(fill >= 0.6 && fill <= 0.75, `${area} fills ${(fill * 100).toFixed(0)}% of the frame`)
  }
})

test('the anchor is the centre of what is framed, so it is centred in the frame', () => {
  for (const area of WORKSHOP_AREAS) {
    assert.deepEqual([...AREA_FRAMES[area].centre], [...AREA_ANCHORS[area].position])
  }
})

test('the camera stays inside the room, at a believable height', () => {
  for (const area of WORKSHOP_AREAS) {
    const [x, y, z] = AREA_POSES[area].position
    assert.ok(Math.abs(x) < WORKSHOP.halfWidth - 0.3, `${area}: camera x ${x.toFixed(2)} is at the wall`)
    assert.ok(z < WORKSHOP.front - 1 && z > WORKSHOP.back + 1, `${area}: camera z ${z.toFixed(2)} is outside the room`)
    assert.ok(y > 1.2 && y < 2.6, `${area}: camera height ${y.toFixed(2)}`)
  }
})

test('parallax is small', () => {
  assert.ok(AREA_PARALLAX <= 0.15)
  for (const area of WORKSHOP_AREAS) assert.equal(AREA_POSES[area].parallax, AREA_PARALLAX)
})

test('a monitor focus pose fills most of the frame with that monitor', () => {
  assert.equal(MONITOR_FOCUS_POSES.length, 3)
  for (const pose of MONITOR_FOCUS_POSES) {
    const fill = frameFill(0.97, 0.55, distance(pose.position, pose.lookAt))
    assert.ok(fill >= 0.6 && fill <= 0.75, `monitor fills ${(fill * 100).toFixed(0)}%`)
    assert.ok(Math.abs(pose.position[0]) < WORKSHOP.halfWidth)
  }
})

test('the far glazing is out of shot, or behind the thing being framed', () => {
  for (const area of WORKSHOP_AREAS) {
    const share = glazingShare(area)
    assert.ok(share <= 0.05, `${area}: the glazing takes ${(share * 100).toFixed(0)}% of the frame beside the object`)
  }
})
