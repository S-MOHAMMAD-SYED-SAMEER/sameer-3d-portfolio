import { PROFILE } from '@/data/profile'

/**
 * The short version.
 *
 * Identity itself lives in `@/data/profile` — this only holds the few lines
 * that introduce the work, so the name is never written down twice.
 */
export const ABOUT = {
  name: PROFILE.name,
  title: PROFILE.title,
  paragraphs: [
    'I build AI-powered systems, automation workflows and software that businesses actually run on.',
    'Most of my work is the unglamorous middle: taking something a person does by hand every day and turning it into a system that can be tested, measured and trusted.',
    'I care about the engineering around the model as much as the model — test suites, evaluations, and behaviour you can inspect rather than hope for.',
  ],
} as const
