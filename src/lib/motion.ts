const TAU = Math.PI * 2

/**
 * Frame-time ceiling. Without it, a tab that has been backgrounded resumes
 * with a delta of several seconds and everything driven by damping jumps.
 */
export const MAX_FRAME_DELTA = 0.1

/**
 * Exponential damping for angles, taking the shortest way round.
 *
 * `MathUtils.damp` would spin the long way whenever a turn crosses the
 * -PI/PI seam, which is exactly where a character pivoting on the spot
 * tends to end up.
 */
export function dampAngle(
  current: number,
  target: number,
  lambda: number,
  delta: number,
): number {
  let difference = (target - current) % TAU

  if (difference > Math.PI) difference -= TAU
  if (difference < -Math.PI) difference += TAU

  return current + difference * (1 - Math.exp(-lambda * delta))
}
