import assert from 'node:assert/strict'
import { test } from 'node:test'

import { MAX_FRAME_DELTA, dampAngle } from '../src/lib/motion.ts'

/**
 * `dampAngle` exists for one reason — a turn that crosses the -PI/PI seam
 * must take the short way round, or the character spins almost all the way
 * about to reach an angle a few degrees away. That is the behaviour worth
 * pinning down, because it is invisible until it is wrong and then it is the
 * most obvious thing on screen.
 */

const TAU = Math.PI * 2

/** Smallest signed rotation from `a` to `b`. */
function shortestWay(a: number, b: number): number {
  let d = (b - a) % TAU
  if (d > Math.PI) d -= TAU
  if (d < -Math.PI) d += TAU
  return d
}

test('a zero-length frame moves nothing', () => {
  assert.equal(dampAngle(1.2, -2.7, 8, 0), 1.2)
})

test('the frame ceiling is a positive number of seconds', () => {
  assert.ok(MAX_FRAME_DELTA > 0 && MAX_FRAME_DELTA < 1)
})

test('it turns the short way across the seam, not the long way round', () => {
  // Just below PI turning to just above -PI: three degrees apart the short
  // way, and very nearly a full turn the wrong way.
  const current = Math.PI - 0.03
  const target = -Math.PI + 0.03

  const moved = shortestWay(current, dampAngle(current, target, 10, 1 / 60))

  assert.ok(moved > 0, 'should turn the short way, through PI')
  assert.ok(Math.abs(moved) < 0.1, `turned ${moved} radians, which is the long way`)
})

test('it closes on the target without overshooting it', () => {
  let angle = -2.9
  const target = 2.9

  for (let frame = 0; frame < 240; frame += 1) {
    const before = Math.abs(shortestWay(angle, target))
    angle = dampAngle(angle, target, 6, 1 / 60)
    const after = Math.abs(shortestWay(angle, target))

    assert.ok(after <= before + 1e-12, 'damping moved away from the target')
  }

  assert.ok(Math.abs(shortestWay(angle, target)) < 1e-3, 'never arrived')
})

test('a bigger lambda closes faster', () => {
  const slow = dampAngle(0, 1, 2, 1 / 60)
  const fast = dampAngle(0, 1, 20, 1 / 60)

  assert.ok(fast > slow)
})
