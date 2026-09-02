/**
 * How far the visitor has progressed through the arrival.
 *
 * Four beats belong to the visitor — step inside, approach, knock, come in.
 * Everything between them plays on its own: the walk, the raps, the door
 * swinging, the turn. Later areas extend this union and the ordered list.
 */
export type ExperienceStage =
  /** Establishing wide. The hall introduces itself. */
  | 'intro'
  /** Inside, holding on the door and the board beside it. */
  | 'entrance'
  /** Walking the length of the hall to the door. */
  | 'approachDoor'
  /** Standing at the closed door, waiting to be knocked on. */
  | 'knock'
  /** The raps themselves. */
  | 'knocking'
  /** The leaves swing and the daylight comes in. */
  | 'doorOpen'
  /** Turned to the visitor, hand open. */
  | 'welcome'
  /** Through the threshold. The resting place. */
  | 'workshop'

export const STAGE_ORDER: readonly ExperienceStage[] = [
  'intro',
  'entrance',
  'approachDoor',
  'knock',
  'knocking',
  'doorOpen',
  'welcome',
  'workshop',
]

export const FIRST_STAGE: ExperienceStage = 'intro'

/** The next beat, or `null` at the end of what is built. */
export function nextStage(stage: ExperienceStage): ExperienceStage | null {
  const index = STAGE_ORDER.indexOf(stage)
  return STAGE_ORDER[index + 1] ?? null
}

export function isStageAtOrAfter(stage: ExperienceStage, other: ExperienceStage): boolean {
  return STAGE_ORDER.indexOf(stage) >= STAGE_ORDER.indexOf(other)
}

/**
 * The beats the visitor can stand at and step back to.
 *
 * The three left out — approachDoor, knocking, doorOpen — are transitions:
 * a walk, two raps and a door swinging. Stepping back into the middle of one
 * would land the visitor somewhere they cannot act, so Back skips to the
 * checkpoint before it.
 */
export const CHECKPOINTS: readonly ExperienceStage[] = [
  'intro',
  'entrance',
  'knock',
  'welcome',
  'workshop',
]

/**
 * Beats that always run themselves, in either mode. Two raps and a door
 * swinging are not decisions, so nothing waits on the visitor for them.
 */
export const INTRINSIC_STAGES: readonly ExperienceStage[] = ['knocking', 'doorOpen']

export function isIntrinsic(stage: ExperienceStage): boolean {
  return INTRINSIC_STAGES.includes(stage)
}

/** The checkpoint before this stage, or `null` at the start of the journey. */
export function previousCheckpoint(stage: ExperienceStage): ExperienceStage | null {
  const here = STAGE_ORDER.indexOf(stage)

  for (let index = CHECKPOINTS.length - 1; index >= 0; index -= 1) {
    const checkpoint = CHECKPOINTS[index]
    if (STAGE_ORDER.indexOf(checkpoint) < here) return checkpoint
  }

  return null
}
