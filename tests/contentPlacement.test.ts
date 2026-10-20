import assert from 'node:assert/strict'
import { test } from 'node:test'

import { IN_SCENE_MIN_WIDTH, contentPlacement } from '../src/systems/contentPlacement.ts'

/**
 * Content goes on the objects in the room on a desktop, and in the flat panel on a phone and for a
 * visitor who has asked for less motion. The two are never shown together.
 */

test('a desktop viewport puts content in the room', () => {
  assert.equal(contentPlacement(1440, false), 'in-scene')
  assert.equal(contentPlacement(IN_SCENE_MIN_WIDTH, false), 'in-scene')
})

test('a phone viewport uses the panel', () => {
  assert.equal(contentPlacement(390, false), 'panel')
  assert.equal(contentPlacement(IN_SCENE_MIN_WIDTH - 1, false), 'panel')
})

test('reduced motion uses the panel at any width', () => {
  assert.equal(contentPlacement(1920, true), 'panel')
  assert.equal(contentPlacement(390, true), 'panel')
})
