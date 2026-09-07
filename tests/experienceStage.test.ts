import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  CHECKPOINTS,
  FIRST_STAGE,
  INTRINSIC_STAGES,
  STAGE_ORDER,
  isIntrinsic,
  isStageAtOrAfter,
  nextStage,
  previousCheckpoint,
} from '../src/systems/experienceStage.ts'

/**
 * The arrival is a state machine, and every rule it relies on is a property
 * rather than a specific value: the order has no repeats, Back always lands
 * somewhere the visitor can act, and walking forward from the first beat
 * reaches the last. These assert the properties, so reordering or extending
 * the journey stays free while breaking it does not.
 */

test('the order is a sequence, not a set with duplicates', () => {
  assert.equal(new Set(STAGE_ORDER).size, STAGE_ORDER.length)
})

test('the journey starts at the first stage in the order', () => {
  assert.equal(FIRST_STAGE, STAGE_ORDER[0])
})

test('stepping forward visits every stage and then stops', () => {
  const walked = [FIRST_STAGE]
  let stage = nextStage(FIRST_STAGE)

  while (stage !== null) {
    walked.push(stage)
    stage = nextStage(stage)
  }

  assert.deepEqual(walked, [...STAGE_ORDER])
  assert.equal(nextStage(STAGE_ORDER[STAGE_ORDER.length - 1]!), null)
})

test('every checkpoint is a real stage, and they keep the journey order', () => {
  const indices = CHECKPOINTS.map((checkpoint) => STAGE_ORDER.indexOf(checkpoint))

  assert.ok(indices.every((index) => index !== -1), 'a checkpoint is not in STAGE_ORDER')
  assert.deepEqual(indices, [...indices].sort((a, b) => a - b))
})

test('no transition is offered as a checkpoint', () => {
  // The whole point of CHECKPOINTS: Back must never land mid-walk or
  // mid-knock, where there is nothing for the visitor to do.
  for (const stage of INTRINSIC_STAGES) {
    assert.ok(!CHECKPOINTS.includes(stage), `${stage} is a transition and cannot be a checkpoint`)
    assert.ok(isIntrinsic(stage))
  }
})

test('stepping back always lands strictly earlier, or nowhere at all', () => {
  assert.equal(previousCheckpoint(FIRST_STAGE), null)

  for (const stage of STAGE_ORDER) {
    const back = previousCheckpoint(stage)
    if (back === null) continue

    assert.ok(
      STAGE_ORDER.indexOf(back) < STAGE_ORDER.indexOf(stage),
      `${stage} steps back to ${back}, which is not earlier`,
    )
    assert.ok(CHECKPOINTS.includes(back))
  }
})

test('isStageAtOrAfter agrees with the order, and every stage is at itself', () => {
  for (const [index, stage] of STAGE_ORDER.entries()) {
    assert.ok(isStageAtOrAfter(stage, stage), 'a stage should be at or after itself')

    for (const [otherIndex, other] of STAGE_ORDER.entries()) {
      assert.equal(isStageAtOrAfter(stage, other), index >= otherIndex)
    }
  }
})
