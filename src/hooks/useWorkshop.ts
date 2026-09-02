import { useCallback, useMemo, useState } from 'react'

import { AREA_POSES } from '@/data/workshopAreas'
import type { CameraPose } from '@/data/cameraPoses'
import { PROJECT_DETAIL_POSE } from '@/data/projectDisplays'
import type { ProjectId } from '@/data/projects'
import { WORKSHOP_AREAS, type WorkshopArea } from '@/systems/workshopArea'

export interface Workshop {
  /** The destination whose panel is open, if any. */
  open: WorkshopArea | null
  /** The destination the pointer or keyboard is currently on. */
  highlighted: WorkshopArea | null
  /** The project being inspected, one layer inside Projects. */
  project: ProjectId | null
  /** The display the pointer or keyboard is currently on. */
  highlightedProject: ProjectId | null
  /** Camera pose to hand the rig, or `null` to leave the stage pose alone. */
  pose: CameraPose | null
  isOpen: boolean
  select: (area: WorkshopArea) => void
  highlight: (area: WorkshopArea | null) => void
  close: () => void
  selectProject: (id: ProjectId) => void
  highlightProject: (id: ProjectId | null) => void
  /** Leaves the case study and returns to the list. */
  clearProject: () => void
  /** Moves the highlight along the row; wraps at both ends. */
  step: (direction: 1 | -1) => void
}

/**
 * Exploration inside the workshop.
 *
 * Deliberately separate from `useJourney`: the arrival is a linear story with
 * timers, this is a hub the visitor pokes at in any order. Keeping them apart
 * is what stops the stage machine growing a second, unrelated job.
 *
 * Only meaningful once the journey has reached the workshop; the caller
 * passes `active` so the state resets if the visitor steps back out.
 */
export function useWorkshop(active: boolean): Workshop {
  const [open, setOpen] = useState<WorkshopArea | null>(null)
  const [highlighted, setHighlighted] = useState<WorkshopArea | null>(null)
  const [project, setProject] = useState<ProjectId | null>(null)
  const [highlightedProject, setHighlightedProject] = useState<ProjectId | null>(null)

  // Leaving the workshop closes whatever was open, so coming back in starts
  // from the room rather than mid-panel. Adjusted during render rather than
  // in an effect: an effect would commit the stale panel for one frame first.
  const [wasActive, setWasActive] = useState(active)
  if (wasActive !== active) {
    setWasActive(active)
    setOpen(null)
    setHighlighted(null)
    setProject(null)
    setHighlightedProject(null)
  }

  const select = useCallback((area: WorkshopArea) => {
    setOpen(area)
    setHighlighted(area)
    // Each visit to Projects starts at the list, never mid-case-study.
    setProject(null)
  }, [])

  const close = useCallback(() => {
    setOpen(null)
    setProject(null)
  }, [])

  const selectProject = useCallback((id: ProjectId) => {
    setProject(id)
    setHighlightedProject(id)
  }, [])

  const highlightProject = useCallback((id: ProjectId | null) => setHighlightedProject(id), [])

  const clearProject = useCallback(() => setProject(null), [])

  const highlight = useCallback((area: WorkshopArea | null) => setHighlighted(area), [])

  const step = useCallback((direction: 1 | -1) => {
    setHighlighted((current) => {
      const index = current === null ? -1 : WORKSHOP_AREAS.indexOf(current)
      const next = (index + direction + WORKSHOP_AREAS.length) % WORKSHOP_AREAS.length
      return WORKSHOP_AREAS[next]
    })
  }, [])

  const pose = useMemo<CameraPose | null>(() => {
    if (!active || open === null) return null
    // Inspecting a case study leans in a little; everything else keeps the
    // destination's own pose.
    if (open === 'projects' && project !== null) return PROJECT_DETAIL_POSE
    return AREA_POSES[open]
  }, [active, open, project])

  return {
    open,
    highlighted,
    project,
    highlightedProject,
    pose,
    isOpen: open !== null,
    select,
    highlight,
    close,
    selectProject,
    highlightProject,
    clearProject,
    step,
  }
}
