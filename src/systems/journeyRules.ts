import { STAGE_COPY } from '../data/experienceCopy.ts'
import { LINE_GAP } from '../data/pacing.ts'
import { STAGE_ORDER, isIntrinsic, type ExperienceStage } from './experienceStage.ts'

/**
 * The stages at which the visitor has to press something to go on.
 *
 * Derived, not listed: a stage needs a click when it offers an action and is not one of the beats
 * that run themselves. The arrival is meant to be three presses — Step inside, Knock, Come in — and
 * a test holds it there.
 */
export const CLICK_STAGES: readonly ExperienceStage[] = STAGE_ORDER.filter(
  (stage) => STAGE_COPY[stage].action !== undefined && !isIntrinsic(stage),
)

/** What decides how long a beat holds before it moves on by itself. */
export interface HoldInput {
  stage: ExperienceStage
  /** Whether the visitor has handed pacing over to Auto. */
  auto: boolean
  /** The beat is the last one built. */
  isFinal: boolean
  reducedMotion: boolean
  /** The line on screen, if the beat has one. */
  line: { hold: number } | null
  /** A further line follows the one on screen. */
  hasMoreLines: boolean
}

/** Seconds a beat holds for a wordless self-running beat, by stage. */
export interface HoldTables {
  intrinsic: Partial<Record<ExperienceStage, number>>
  reducedMotionBeat: number
  autoStage: Partial<Record<ExperienceStage, number>>
}

/**
 * How long this beat holds before moving on, or `null` when it is waiting for the visitor or for the
 * host to arrive.
 *
 *  - Beats that run themselves (the walk in, the raps, the door) always time out, in either mode.
 *  - The host's lines play themselves, in either mode, up to the last: nobody should have to click
 *    through a greeting. The last line waits for the visitor in Controlled and runs on in Auto.
 *  - Everything else waits for a click in Controlled, and runs on in Auto.
 */
export function holdFor(input: HoldInput, tables: HoldTables): number | null {
  const { stage, auto, isFinal, reducedMotion, line, hasMoreLines } = input
  if (isFinal) return null

  if (isIntrinsic(stage)) {
    return reducedMotion ? tables.reducedMotionBeat : (tables.intrinsic[stage] ?? null)
  }

  // Waits for the host to arrive; the walk ends it.
  if (stage === 'approachDoor') return null

  if (line !== null && (auto || hasMoreLines)) return line.hold + LINE_GAP
  if (!auto) return null

  return tables.autoStage[stage] ?? null
}

