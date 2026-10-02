import assert from 'node:assert/strict'
import { test } from 'node:test'

import { clampProjectStep } from '../src/systems/projectNavigation.ts'

/**
 * The projector presents the six projects in a fixed order, not a loop:
 * there is a first project and a last one, and the visitor should be able
 * to tell. Every case here is a specific pair from the task's own required
 * list, not a loop over the whole array, so a future reordering of
 * `PROJECTS` cannot silently change what this is actually asserting.
 */

test('previous from the first project stays on the first project', () => {
  assert.equal(clampProjectStep('p1', -1), 'p1')
})

test('next from the first project moves to the second', () => {
  assert.equal(clampProjectStep('p1', 1), 'p2')
})

test('previous from the second project returns to the first', () => {
  assert.equal(clampProjectStep('p2', -1), 'p1')
})

test('next from the second project moves to the third', () => {
  assert.equal(clampProjectStep('p2', 1), 'p3')
})

test('next from the fifth project moves to the sixth', () => {
  assert.equal(clampProjectStep('p5', 1), 'p6')
})

test('next from the last project stays on the last project', () => {
  assert.equal(clampProjectStep('p6', 1), 'p6')
})

test('previous from the last project returns to the fifth', () => {
  assert.equal(clampProjectStep('p6', -1), 'p5')
})

test('stepping from no selection lands on the first project either direction', () => {
  assert.equal(clampProjectStep(null, 1), 'p1')
  assert.equal(clampProjectStep(null, -1), 'p1')
})
