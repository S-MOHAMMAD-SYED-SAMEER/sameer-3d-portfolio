import type { ExperienceStage } from '@/systems/experienceStage'

/**
 * What the overlay says at each beat — which is as little as possible.
 *
 * The identity is on the wall now, so nothing here needs to introduce
 * anyone. Area labels caption where the visitor is, the way a building
 * does; actions read as continuing a visit, never as operating a game.
 * Most beats say nothing at all while the scene plays.
 */
export interface StageCopy {
  /** Small tracked label naming the place. */
  label?: string
  heading?: string
  /** Advances to the next beat. Absent while the scene is moving. */
  action?: string
}

export const STAGE_COPY: Record<ExperienceStage, StageCopy> = {
  intro: {
    action: 'Step inside',
  },
  entrance: {
    label: 'Entrance',
    action: 'Approach the door',
  },
  approachDoor: {
    label: 'Entrance',
  },
  knock: {
    label: 'Entrance',
    action: 'Knock',
  },
  knocking: {
    label: 'Entrance',
  },
  doorOpen: {
    label: 'Entrance',
  },
  welcome: {
    heading: 'Welcome.',
    action: 'Come in',
  },
  workshop: {
    label: 'The workshop',
  },
}
