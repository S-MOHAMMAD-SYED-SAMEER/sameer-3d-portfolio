/**
 * The five things there are to look at once the visitor is inside.
 *
 * A layer beside the journey rather than more stages in it: the cinematic
 * arrival ends at `workshop`, and everything here happens within that one
 * stage. `experienceStage` is untouched.
 */
export type WorkshopArea = 'projects' | 'skills' | 'services' | 'about' | 'contact'

export const WORKSHOP_AREAS: readonly WorkshopArea[] = [
  'projects',
  'skills',
  'services',
  'about',
  'contact',
]

export const AREA_LABEL: Record<WorkshopArea, string> = {
  projects: 'Projects',
  skills: 'Skills',
  services: 'Services',
  about: 'About',
  contact: 'Contact',
}

/** The one line shown when a destination is hovered or focused. */
export const AREA_PROMPT: Record<WorkshopArea, string> = {
  projects: 'Explore projects',
  skills: 'How I build',
  services: 'What I build for others',
  about: 'A little about me',
  contact: "Let's connect",
}
