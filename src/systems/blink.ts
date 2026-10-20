import { FIGURE_MOTION } from '../data/characterDesign.ts'

/**
 * How closed the host's eyes are at a moment in time: 0 open, 1 shut.
 *
 * Blinks come in a fixed repeating sequence of gaps rather than from a random number, so the figure
 * blinks the same way on every visit, and a test can say exactly when. Each is a smooth close and
 * open over `blinkSeconds`.
 */
export function blinkAmount(seconds: number): number {
  const { blinkGaps, blinkSeconds } = FIGURE_MOTION
  const cycle = blinkGaps.reduce((total, gap) => total + gap, 0)

  let start = 0
  for (const gap of blinkGaps) {
    start += gap
    // How long since this blink began, wrapped into one cycle so the sequence repeats.
    const since = (((seconds - start) % cycle) + cycle) % cycle
    if (since < blinkSeconds) return Math.sin((since / blinkSeconds) * Math.PI)
  }
  return 0
}
