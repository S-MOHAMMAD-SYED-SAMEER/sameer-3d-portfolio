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

/**
 * The bench has three monitors and there are six projects, so the monitors show them in two sets of
 * three. These pin which project is on which monitor.
 */
import { MONITOR_COUNT, PAGE_COUNT, monitorOfProject, pageOfProject, projectsOnPage } from '../src/systems/projectNavigation.ts'

test('six projects make two sets of three monitors', () => {
  assert.equal(MONITOR_COUNT, 3)
  assert.equal(PAGE_COUNT, 2)
  assert.deepEqual(projectsOnPage(0).map((project) => project.id), ['p1', 'p2', 'p3'])
  assert.deepEqual(projectsOnPage(1).map((project) => project.id), ['p4', 'p5', 'p6'])
})

test('a project knows its set and its monitor', () => {
  assert.equal(pageOfProject('p3'), 0)
  assert.equal(pageOfProject('p4'), 1)
  assert.equal(monitorOfProject('p1'), 0)
  assert.equal(monitorOfProject('p5'), 1)
  assert.equal(monitorOfProject('p6'), 2)
})

test('a set that does not exist is clamped, not empty', () => {
  assert.equal(projectsOnPage(-4).length, 3)
  assert.equal(projectsOnPage(99).length, 3)
})
