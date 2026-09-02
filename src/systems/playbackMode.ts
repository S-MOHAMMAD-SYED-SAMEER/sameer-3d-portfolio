/**
 * How the arrival is paced.
 *
 * Distinct from the Normal/3D switch in `@/systems/experienceMode` — this
 * one only decides whether the visitor advances the story or it advances
 * itself. Controlled is the default: nothing moves until they ask it to.
 */
export type PlaybackMode = 'controlled' | 'auto'

export const PLAYBACK_MODES: readonly PlaybackMode[] = ['controlled', 'auto']

export const PLAYBACK_LABEL: Record<PlaybackMode, string> = {
  controlled: 'Controlled',
  auto: 'Auto',
}

export const DEFAULT_PLAYBACK_MODE: PlaybackMode = 'controlled'
