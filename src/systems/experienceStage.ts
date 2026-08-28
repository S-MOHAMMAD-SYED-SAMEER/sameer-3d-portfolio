/**
 * How far the visitor has progressed into the 3D experience.
 *
 * `intro` is the cinematic title state; `explore` is the interactive state
 * the visitor opts into. Later phases extend this union rather than adding
 * parallel booleans.
 */
export type ExperienceStage = 'intro' | 'explore'
