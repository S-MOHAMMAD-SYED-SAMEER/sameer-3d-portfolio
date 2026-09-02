import type { Vec3 } from '@/lib/vec3'
import type { CharacterGesture } from '@/systems/character'
import type { ExperienceStage } from '@/systems/experienceStage'

/**
 * Where the host stands and what each beat of the arrival is doing.
 *
 * Placement and timing only — the host's own shape lives in
 * `@/data/characterDesign`, the architecture in `@/data/entranceScene` and
 * `@/data/workshop`.
 */

export type CharacterMarkId = 'plinth' | 'door' | 'host' | 'studio'

export interface CharacterMark {
  position: Vec3
  /** Heading held once standing still, in radians about Y. Forward is +Z. */
  facing: number
}

export const CHARACTER_MARKS: Record<CharacterMarkId, CharacterMark> = {
  /** On the plinth, where the entrance leaves them. */
  plinth: { position: [0, 0.18, -10], facing: 0.28 },
  /** At the door, facing it. Clear of the leaves' swing. */
  door: { position: [0, 0, -17.2], facing: Math.PI },
  /** Same spot, turned back to the visitor. */
  host: { position: [0, 0, -17.2], facing: 0 },
  /** Inside the workshop, beside the bench, half turned to the visitor. */
  studio: { position: [1.4, 0, -27.5], facing: 0.35 },
}

/** The mark the host occupies, or walks to, at each beat. */
export const STAGE_MARK: Record<ExperienceStage, CharacterMarkId> = {
  intro: 'plinth',
  entrance: 'plinth',
  approachDoor: 'door',
  knock: 'door',
  knocking: 'door',
  doorOpen: 'door',
  welcome: 'host',
  workshop: 'studio',
}

/** The gesture the host performs at each beat. */
export const STAGE_GESTURE: Record<ExperienceStage, CharacterGesture> = {
  intro: 'none',
  entrance: 'none',
  approachDoor: 'none',
  knock: 'none',
  knocking: 'knock',
  doorOpen: 'none',
  welcome: 'welcome',
  workshop: 'none',
}

export const CHARACTER_MOTION = {
  /** A purposeful walk, not a jog. */
  walkSpeed: 1.6,
  /** How quickly the body swings round to face where it is going. */
  turnLambda: 3.4,
  /** Stepping off the plinth should settle faster than the walk itself. */
  heightLambda: 6,
  /** Close enough to count as arrived. */
  arriveRadius: 0.12,
  /**
   * Radians of gait per metre travelled, derived from the stride the legs
   * actually take: a full cycle covers 2 * thighLength * sin(hipSwing) twice,
   * about 1.2m. Guessing this number is what makes feet skate.
   */
  gaitPerMetre: 5.24,
} as const

/**
 * Beats that run themselves, in seconds. The rest wait either for the
 * visitor or — in the case of the walks — for the host to arrive.
 */
export const STAGE_AUTO_ADVANCE: Partial<Record<ExperienceStage, number>> = {
  /** Two raps, then a beat of nothing before anything answers. */
  knocking: 3.4,
  /** The leaves swinging, and a moment of daylight before the turn. */
  doorOpen: 3.2,
}

/**
 * Ramps, 0 to 1. Damped rather than switched, so lighting and hinges do
 * the work and nothing ever snaps.
 */
export const STAGE_REVEAL: Record<ExperienceStage, { character: number; door: number }> = {
  intro: { character: 0, door: 0 },
  entrance: { character: 0.15, door: 0 },
  approachDoor: { character: 0.5, door: 0 },
  knock: { character: 0.75, door: 0 },
  knocking: { character: 0.8, door: 0 },
  doorOpen: { character: 0.85, door: 1 },
  welcome: { character: 1, door: 1 },
  workshop: { character: 0.75, door: 1 },
}
