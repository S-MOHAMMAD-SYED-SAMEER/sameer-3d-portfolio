/**
 * Single source of truth for identity and landing copy.
 * Components read from here rather than hardcoding strings.
 */
export const PROFILE = {
  /** The full name. This is the identity — never abbreviate it in the UI. */
  name: 'S MOHAMMAD SYED SAMEER',
  /** Sentence case, for when the host says it aloud. */
  spokenName: 'S Mohammad Syed Sameer',
  title: 'AI Automation Engineer',
  intro:
    'I build AI automation systems and hold them to engineering standards — real test suites, measurable evaluations, and behaviour you can inspect.',
} as const
