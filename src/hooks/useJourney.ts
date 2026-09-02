import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { dialogueFor, type DialogueLine } from '@/data/dialogue'
import { STAGE_GESTURE } from '@/data/journey'
import { AUTO_STAGE_HOLD, INTRINSIC_HOLD, LINE_GAP, REDUCED_MOTION_BEAT } from '@/data/pacing'
import type { CharacterGesture } from '@/systems/character'
import {
  FIRST_STAGE,
  isIntrinsic,
  nextStage,
  previousCheckpoint,
  type ExperienceStage,
} from '@/systems/experienceStage'
import { DEFAULT_PLAYBACK_MODE, type PlaybackMode } from '@/systems/playbackMode'

export interface Journey {
  stage: ExperienceStage
  mode: PlaybackMode
  paused: boolean
  /** The line on screen, if the beat has one. */
  dialogue: DialogueLine | null
  /** True on the first line of a stage that has any — when to name the speaker. */
  isFirstLine: boolean
  /** The action advances dialogue rather than the stage. */
  hasMoreLines: boolean
  /** Nothing waits on the visitor here: a walk, two raps, a door swinging. */
  isTransition: boolean
  /** End of the built journey. */
  isFinal: boolean
  canGoBack: boolean
  gesture: CharacterGesture
  advance: () => void
  back: () => void
  setMode: (mode: PlaybackMode) => void
  togglePause: () => void
  onCharacterArrive: () => void
}

/**
 * The whole state machine for the arrival: which beat, which line, who is
 * pacing it, and whether they have paused.
 *
 * Every timer in the experience lives in the one effect below. That is the
 * point of collecting it here — a timeout per component would leak on stage
 * changes, mode changes and unmount, and there would be no single place to
 * reason about pacing.
 */
export function useJourney(reducedMotion: boolean): Journey {
  const [stage, setStage] = useState<ExperienceStage>(FIRST_STAGE)
  const [line, setLine] = useState(0)
  const [mode, setModeState] = useState<PlaybackMode>(DEFAULT_PLAYBACK_MODE)
  const [paused, setPaused] = useState(false)

  const lines = dialogueFor(stage)
  const dialogue = lines[line] ?? null
  const hasMoreLines = line < lines.length - 1
  const intrinsic = isIntrinsic(stage)
  const isTransition = intrinsic || stage === 'approachDoor'
  const isFinal = nextStage(stage) === null && !hasMoreLines

  const advance = useCallback(() => {
    if (hasMoreLines) {
      setLine((current) => current + 1)
      return
    }

    const next = nextStage(stage)
    if (next === null) return

    setStage(next)
    setLine(0)
  }, [hasMoreLines, stage])

  const back = useCallback(() => {
    const target = previousCheckpoint(stage)
    if (target === null) return

    setStage(target)
    setLine(0)
  }, [stage])

  const setMode = useCallback((next: PlaybackMode) => {
    // The stage is kept: switching pacing should never restart the story.
    setModeState(next)
    setPaused(false)
  }, [])

  const togglePause = useCallback(() => setPaused((current) => !current), [])

  // Reaching the door ends the walk, so the arrival advances itself — but
  // only from the beat that started the walk.
  const onCharacterArrive = useCallback(() => {
    setStage((current) => (current === 'approachDoor' ? 'knock' : current))
  }, [])

  /**
   * How long this beat holds before moving on, or `null` if it is waiting
   * for the visitor or for the host to arrive.
   */
  const hold = useMemo<number | null>(() => {
    if (isFinal) return null
    if (intrinsic) {
      return reducedMotion
        ? REDUCED_MOTION_BEAT
        : INTRINSIC_HOLD[stage as keyof typeof INTRINSIC_HOLD]
    }
    if (stage === 'approachDoor') return null
    if (mode === 'controlled') return null
    if (dialogue !== null) return dialogue.hold + LINE_GAP
    return AUTO_STAGE_HOLD[stage] ?? null
  }, [dialogue, intrinsic, isFinal, mode, reducedMotion, stage])

  // Held in a ref so the timer effect does not need to re-run every time a
  // new `advance` identity is produced.
  const advanceRef = useRef(advance)
  useEffect(() => {
    advanceRef.current = advance
  })

  useEffect(() => {
    if (paused || hold === null) return

    const timer = setTimeout(() => advanceRef.current(), hold * 1000)
    return () => clearTimeout(timer)
    // `line` is a dependency in spirit: each line restarts the clock.
  }, [hold, paused, stage, line])

  const gesture = dialogue?.gesture ?? STAGE_GESTURE[stage]

  return {
    stage,
    mode,
    paused,
    dialogue,
    isFirstLine: line === 0,
    hasMoreLines,
    isTransition,
    isFinal,
    canGoBack: previousCheckpoint(stage) !== null,
    gesture,
    advance,
    back,
    setMode,
    togglePause,
    onCharacterArrive,
  }
}
