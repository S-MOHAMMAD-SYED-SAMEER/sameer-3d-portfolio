import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  AREA_LABEL,
  AREA_PROMPT,
  WORKSHOP_AREAS,
  type WorkshopArea,
} from '../src/systems/workshopArea.ts'

/**
 * The workshop is the resting place, and its five destinations are the only
 * navigation it has. A destination with no label would render an empty button
 * — reachable, focusable and meaningless — so the copy is required, not
 * optional.
 */

test('the five destinations are distinct', () => {
  assert.equal(new Set(WORKSHOP_AREAS).size, WORKSHOP_AREAS.length)
})

test('every destination has a label and a prompt with something in it', () => {
  for (const area of WORKSHOP_AREAS) {
    assert.ok(AREA_LABEL[area]?.trim(), `${area} has no label`)
    assert.ok(AREA_PROMPT[area]?.trim(), `${area} has no prompt`)
  }
})

test('the copy tables describe exactly the destinations that exist', () => {
  const areas = [...WORKSHOP_AREAS].sort()

  assert.deepEqual((Object.keys(AREA_LABEL) as WorkshopArea[]).sort(), areas)
  assert.deepEqual((Object.keys(AREA_PROMPT) as WorkshopArea[]).sort(), areas)
})
