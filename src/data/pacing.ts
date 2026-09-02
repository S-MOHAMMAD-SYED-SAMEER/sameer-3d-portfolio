import type { ExperienceStage } from '@/systems/experienceStage'

/**
 * Every duration in the experience, in seconds, in one place.
 *
 * Split by who is waiting: `INTRINSIC` beats run in both modes because two
 * raps and a swinging door are not decisions; `AUTO_STAGE_HOLD` only applies
 * when the visitor has handed pacing over to Auto.
 */

/** Beats that always time out, whichever mode is running. */
export const INTRINSIC_HOLD: Record<'knocking' | 'doorOpen', number> = {
  knocking: 3.4,
  doorOpen: 3.2,
}

/**
 * How long Auto rests on a beat once its dialogue has finished. Stages
 * absent from this map never advance on their own: `approachDoor` waits for
 * the host to arrive, and `workshop` is the end of the road.
 */
export const AUTO_STAGE_HOLD: Partial<Record<ExperienceStage, number>> = {
  intro: 3,
  entrance: 1.2,
  knock: 1.6,
  welcome: 1,
}

/**
 * Reduced motion collapses the camera beats but not the reading.
 *
 * Cutting dialogue short would honour the preference and lose the story with
 * it, so lines keep their full hold and only the wordless beats shorten.
 */
export const REDUCED_MOTION_BEAT = 0.9

/** Auto pauses this long between lines so text never swaps mid-read. */
export const LINE_GAP = 0.35
