import { memo } from 'react'

import { CinematicRig } from '@/components/3d/camera/CinematicRig'
import { Character } from '@/components/3d/character/Character'
import { EntranceHall } from '@/components/3d/entrance/EntranceHall'
import { BuildStation } from '@/components/3d/workshop/BuildStation'
import { WorkshopFittings } from '@/components/3d/workshop/WorkshopFittings'
import { ProjectHotspots } from '@/components/3d/workshop/ProjectHotspots'
import { WorkshopHotspots } from '@/components/3d/workshop/WorkshopHotspots'
import { WorkshopShell } from '@/components/3d/workshop/WorkshopShell'
import { Workstation } from '@/components/3d/workshop/Workstation'
import { ENTRANCE_PALETTE, FOG } from '@/data/entranceScene'
import { CHARACTER_MARKS, STAGE_MARK, STAGE_REVEAL } from '@/data/journey'
import type { CameraPose } from '@/data/cameraPoses'
import type { CharacterGesture } from '@/systems/character'
import type { ProjectId } from '@/data/projects'
import type { WorkshopArea } from '@/systems/workshopArea'
import type { ExperienceStage } from '@/systems/experienceStage'

interface ExperienceSceneProps {
  stage: ExperienceStage
  /** Resolved by the dialogue layer, which knows what is being said. */
  gesture: CharacterGesture
  onCharacterArrive: () => void
  reducedMotion: boolean
  /** Workshop exploration. Inert until the journey reaches the room. */
  workshopActive: boolean
  highlightedArea: WorkshopArea | null
  openArea: WorkshopArea | null
  openProject: ProjectId | null
  highlightedProject: ProjectId | null
  onHighlightProject: (id: ProjectId | null) => void
  onSelectProject: (id: ProjectId) => void
  onHighlightArea: (area: WorkshopArea | null) => void
  onSelectArea: (area: WorkshopArea) => void
  /** Overrides the stage pose while a destination is open. */
  cameraOverride: CameraPose | null
}

/**
 * Everything inside the WebGL boundary.
 *
 * Composition only. The stage decides which mark the host walks to, which
 * gesture they perform, whether the door is open and how far each reveal has
 * ramped; the two rooms, the host and the camera each read what they need
 * and none of them reads another.
 *
 * The workshop is always in the scene rather than mounted on arrival — it is
 * visible through the doorway the moment the doors swing, so it cannot be
 * something that appears later.
 */
export function ExperienceScene({
  stage,
  gesture,
  onCharacterArrive,
  reducedMotion,
  workshopActive,
  highlightedArea,
  openArea,
  openProject,
  highlightedProject,
  onHighlightProject,
  onSelectProject,
  onHighlightArea,
  onSelectArea,
  cameraOverride,
}: ExperienceSceneProps) {
  const reveal = STAGE_REVEAL[stage]

  // About is a composition of the host, so he is lit for it rather than left
  // at the room's ambient level — and he drops whatever the arrival dialogue
  // left him holding, because a swept arm and a turned head are not how you
  // face someone who has come to read about you.
  const isAbout = openArea === 'about'
  const characterReveal = isAbout ? 1 : reveal.character
  const hostGesture = isAbout ? 'none' : gesture

  return (
    <>
      <color attach="background" args={[ENTRANCE_PALETTE.background]} />
      {/* Linear fog does the depth work that post-processing would
          otherwise be asked for, at no cost. */}
      <fog attach="fog" args={[ENTRANCE_PALETTE.fog, FOG.near, FOG.far]} />

      <EntranceHall doorOpen={reveal.door} reducedMotion={reducedMotion} />

      <StaticWorkshop />

      <Character
        mark={CHARACTER_MARKS[STAGE_MARK[stage]]}
        reveal={characterReveal}
        gesture={hostGesture}
        onArrive={onCharacterArrive}
        reducedMotion={reducedMotion}
      />

      <WorkshopHotspots
        active={workshopActive}
        highlighted={highlightedArea}
        hidden={openArea !== null}
        onHighlight={onHighlightArea}
        onSelect={onSelectArea}
      />

      <ProjectHotspots
        active={openArea === 'projects'}
        highlighted={highlightedProject}
        selected={openProject}
        onHighlight={onHighlightProject}
        onSelect={onSelectProject}
      />

      <CinematicRig stage={stage} override={cameraOverride} />
    </>
  )
}

/**
 * The room's fixed furniture: shell, workstation, build station, fittings.
 *
 * None of it takes a prop and none of it moves, but this scene re-renders on
 * every dialogue line and every hover. Memoised so sixty-odd static meshes
 * are reconciled once rather than on each of those.
 */
const StaticWorkshop = memo(function StaticWorkshop() {
  return (
    <>
      <WorkshopShell />
      <Workstation />
      <BuildStation />
      <WorkshopFittings />
    </>
  )
})
