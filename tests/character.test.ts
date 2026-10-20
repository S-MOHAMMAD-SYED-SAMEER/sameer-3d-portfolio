import assert from 'node:assert/strict'
import { test } from 'node:test'

import { FIGURE, FIGURE_JOINTS, FIGURE_MOTION, GESTURE_POSE } from '../src/data/characterDesign.ts'
import { blinkAmount } from '../src/systems/blink.ts'

/**
 * The host is a procedural figure. These pin the things that make it read as a person: human
 * proportions, eyes that blink on a fixed schedule, and a wave.
 */

/** Standing height: hips, the chest above them, the torso and neck, then the head. */
function height(): number {
  const head = FIGURE.headRadius * (0.9 + FIGURE.headScale[1] / 1)
  return FIGURE.hipY + FIGURE_JOINTS.chestY + FIGURE.torsoLength + FIGURE.neckLength - 0.01 + head
}

test('he stands about 1.8 m tall', () => {
  assert.ok(height() > 1.74 && height() < 1.86, `${height().toFixed(2)} m`)
})

test('his shoulders are a human width: about a quarter of his height, not a coat hanger', () => {
  const across = 2 * (FIGURE.shoulderHalfWidth + FIGURE.deltoidRadius)
  const ratio = across / height()
  assert.ok(ratio > 0.22 && ratio < 0.27, `shoulders are ${(ratio * 100).toFixed(0)}% of his height`)
})

test('his head is about a seventh of his height', () => {
  const headHeight = 2 * FIGURE.headRadius * FIGURE.headScale[1]
  const ratio = headHeight / height()
  assert.ok(ratio > 0.12 && ratio < 0.15, `head is ${(ratio * 100).toFixed(0)}% of his height`)
})

test('the eyes are a few millimetres across and set apart by the width of an eye or two', () => {
  assert.ok(FIGURE.eyeRadius > 0.01 && FIGURE.eyeRadius < 0.016)
  assert.ok(FIGURE.irisRadius < FIGURE.eyeRadius)
  assert.ok(FIGURE.eyeSpacing > FIGURE.eyeRadius * 2)
})

test('he blinks on a fixed schedule: open between blinks, shut mid-blink, the same every visit', () => {
  const { blinkGaps, blinkSeconds } = FIGURE_MOTION
  // Before the first blink and just after it, the eyes are open.
  assert.equal(blinkAmount(0.5), 0)
  assert.equal(blinkAmount(blinkGaps[0]! + blinkSeconds + 0.01), 0)
  // Midway through the first blink they are shut.
  assert.ok(Math.abs(blinkAmount(blinkGaps[0]! + blinkSeconds / 2) - 1) < 1e-9)
  // The sequence repeats after one cycle.
  const cycle = blinkGaps.reduce((a, b) => a + b, 0)
  assert.ok(Math.abs(blinkAmount(blinkGaps[0]! + blinkSeconds / 3 + cycle) - blinkAmount(blinkGaps[0]! + blinkSeconds / 3)) < 1e-9)
})

test('every blink is brief and none overlaps the next', () => {
  const { blinkGaps, blinkSeconds } = FIGURE_MOTION
  assert.ok(blinkSeconds > 0.08 && blinkSeconds < 0.3)
  for (const gap of blinkGaps) assert.ok(gap > blinkSeconds * 5, 'a blink follows another too closely')
})

test('he is shut for only a small part of the time', () => {
  let shut = 0
  const samples = 4000
  const cycle = FIGURE_MOTION.blinkGaps.reduce((a, b) => a + b, 0)
  for (let i = 0; i < samples; i += 1) if (blinkAmount((i / samples) * cycle) > 0.5) shut += 1
  assert.ok(shut / samples < 0.04, `eyes are mostly shut for ${((shut / samples) * 100).toFixed(1)}% of the time`)
})

test('the wave lifts the arm well above the shoulder and swings it side to side', () => {
  assert.ok(GESTURE_POSE.wave.shoulderX < -2.0)
  assert.ok(FIGURE_MOTION.waveWidth > 0.15)
  assert.ok(FIGURE_MOTION.waveSpeed > 4)
})

test('breathing is slight', () => {
  assert.ok(FIGURE_MOTION.chestBreath > 0 && FIGURE_MOTION.chestBreath < 0.03)
})
