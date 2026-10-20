import assert from 'node:assert/strict'
import { test } from 'node:test'

import { WORKSHOP } from '../src/data/workshop.ts'

/**
 * The far glazing is a window, not a lit rectangle: a dim night behind a frame with mullions and
 * transoms. The painted sky is canvas and cannot run here, so these pin the numbers that decide how
 * bright and how window-like it is; the brightest-pixel check on the screenshots covers the rest.
 */

test('the night behind the glazing is dimmed well below full brightness', () => {
  assert.ok(WORKSHOP.night.brightness > 0 && WORKSHOP.night.brightness <= 0.6)
})

test('the glazing has a frame, mullions and transoms', () => {
  assert.ok(WORKSHOP.glazing.frame >= 0.15)
  assert.ok(WORKSHOP.glazing.bar >= 0.05)
  assert.ok(WORKSHOP.glazing.mullions.length >= 3)
  assert.ok(WORKSHOP.glazing.transoms.length >= 2)
})

test('the mullions and transoms lie inside the opening', () => {
  for (const x of WORKSHOP.glazing.mullions) assert.ok(Math.abs(x) < WORKSHOP.window.halfWidth)
  for (const y of WORKSHOP.glazing.transoms) {
    assert.ok(y > WORKSHOP.window.sill && y < WORKSHOP.window.head)
  }
})

test('the sky plane is wider than the opening, so no angle sees its edge', () => {
  assert.ok(WORKSHOP.night.width > WORKSHOP.window.halfWidth * 2 * 1.4)
})
