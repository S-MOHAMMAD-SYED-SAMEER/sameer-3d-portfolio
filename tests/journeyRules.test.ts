import assert from 'node:assert/strict'
import { test } from 'node:test'

import { dialogueFor } from '../src/data/dialogue.ts'
import { AUTO_STAGE_HOLD, INTRINSIC_HOLD, REDUCED_MOTION_BEAT } from '../src/data/pacing.ts'
import { CHECKPOINTS, INTRINSIC_STAGES, STAGE_ORDER, previousCheckpoint } from '../src/systems/experienceStage.ts'
import { CLICK_STAGES, holdFor } from '../src/systems/journeyRules.ts'

/**
 * The arrival used to take eight presses (Step inside, Approach the door, Knock, Continue four times,
 * Come in). It is now three, and the greeting plays itself. These hold it there.
 */

const TABLES = { intrinsic: INTRINSIC_HOLD, reducedMotionBeat: REDUCED_MOTION_BEAT, autoStage: AUTO_STAGE_HOLD }

test('the arrival takes at most three presses: Step inside, Knock, Come in', () => {
  assert.deepEqual([...CLICK_STAGES], ['intro', 'knock', 'welcome'])
  assert.ok(CLICK_STAGES.length <= 3)
})

test('being led to the door is a beat that runs itself, not a press', () => {
  assert.ok(INTRINSIC_STAGES.includes('entrance'))
  assert.ok(!CHECKPOINTS.includes('entrance'), 'Back must not land on a beat that has already moved on')
  assert.equal(holdFor({ stage: 'entrance', auto: false, isFinal: false, reducedMotion: false, line: null, hasMoreLines: false }, TABLES), INTRINSIC_HOLD.entrance)
})

test('the greeting plays itself line by line in Controlled, and the last line waits for the visitor', () => {
  const lines = dialogueFor('welcome')
  assert.ok(lines.length >= 3)

  lines.forEach((line, index) => {
    const last = index === lines.length - 1
    const hold = holdFor({ stage: 'welcome', auto: false, isFinal: false, reducedMotion: false, line, hasMoreLines: !last }, TABLES)
    if (last) assert.equal(hold, null, 'the last line should wait for Come in')
    else assert.ok(hold !== null && hold > line.hold, 'a line should move on by itself, after its hold')
  })
})

test('in Auto the last line moves on too', () => {
  const lines = dialogueFor('welcome')
  const line = lines[lines.length - 1]!
  assert.ok(holdFor({ stage: 'welcome', auto: true, isFinal: false, reducedMotion: false, line, hasMoreLines: false }, TABLES) !== null)
})

test('the walk to the door waits for the host to arrive, whatever the mode', () => {
  for (const auto of [false, true]) {
    assert.equal(holdFor({ stage: 'approachDoor', auto, isFinal: false, reducedMotion: false, line: null, hasMoreLines: false }, TABLES), null)
  }
})

test('the beats that wait on a press hold forever in Controlled and move on in Auto', () => {
  for (const stage of ['intro', 'knock'] as const) {
    assert.equal(holdFor({ stage, auto: false, isFinal: false, reducedMotion: false, line: null, hasMoreLines: false }, TABLES), null)
    assert.ok(holdFor({ stage, auto: true, isFinal: false, reducedMotion: false, line: null, hasMoreLines: false }, TABLES) !== null)
  }
})

test('the end of the arrival never times out', () => {
  assert.equal(holdFor({ stage: 'workshop', auto: true, isFinal: true, reducedMotion: false, line: null, hasMoreLines: false }, TABLES), null)
})

test('reduced motion shortens the wordless beats and leaves the lines alone', () => {
  assert.equal(holdFor({ stage: 'knocking', auto: false, isFinal: false, reducedMotion: true, line: null, hasMoreLines: false }, TABLES), REDUCED_MOTION_BEAT)
  const line = dialogueFor('welcome')[0]!
  const hold = holdFor({ stage: 'welcome', auto: false, isFinal: false, reducedMotion: true, line, hasMoreLines: true }, TABLES)
  assert.ok(hold !== null && hold >= line.hold)
})

test('going back from the door lands on the start, not on a beat that is already over', () => {
  assert.equal(previousCheckpoint('knock'), 'intro')
  for (const stage of STAGE_ORDER) {
    const back = previousCheckpoint(stage)
    if (back !== null) assert.ok(CHECKPOINTS.includes(back))
  }
})
