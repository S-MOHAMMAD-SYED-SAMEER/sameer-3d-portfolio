import type { ExperienceStage } from '../systems/experienceStage.ts'

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

/**
 * Shown on a phone at the start, under the scene: the experience is built for a larger screen, and the
 * normal portfolio is one tap away. The link text is `link`; the line reads `before` + link.
 */
export const MOBILE_HINT = {
  before: 'Best on a larger screen — or use ',
  link: 'the normal portfolio',
} as const

/** The still shown on a phone while the scene loads and at the first beat. Served from `public/`. */
export const MOBILE_POSTER = '/images/start-poster-mobile.jpg'

export const STAGE_COPY: Record<ExperienceStage, StageCopy> = {
  intro: {
    action: 'Step inside',
  },
  entrance: {
    label: 'Entrance',
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
