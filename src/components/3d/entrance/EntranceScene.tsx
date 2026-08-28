import { CinematicRig } from '@/components/3d/camera/CinematicRig'
import { CharacterPlaceholder } from '@/components/3d/character/CharacterPlaceholder'
import { Ceiling } from '@/components/3d/entrance/Ceiling'
import { Colonnade } from '@/components/3d/entrance/Colonnade'
import { EntranceLighting } from '@/components/3d/entrance/EntranceLighting'
import { FloorInlay } from '@/components/3d/entrance/FloorInlay'
import { Ground } from '@/components/3d/entrance/Ground'
import { HallWalls } from '@/components/3d/entrance/HallWalls'
import { Plinth } from '@/components/3d/entrance/Plinth'
import { PortalWall } from '@/components/3d/entrance/PortalWall'
import { ENTRANCE_PALETTE, FOG } from '@/data/entranceScene'
import type { ExperienceStage } from '@/systems/experienceStage'

/**
 * The entrance: the first and only built area of the 3D experience.
 *
 * Composition only — each part owns its own geometry and reads its
 * dimensions from `@/data/entranceScene`.
 */
export function EntranceScene({ stage }: { stage: ExperienceStage }) {
  return (
    <>
      <color attach="background" args={[ENTRANCE_PALETTE.background]} />
      {/* Linear fog does the depth work that post-processing would
          otherwise be asked for, at no cost. */}
      <fog attach="fog" args={[ENTRANCE_PALETTE.fog, FOG.near, FOG.far]} />

      <EntranceLighting />

      <Ground />
      <FloorInlay />
      <HallWalls />
      <Ceiling />
      <Colonnade />
      <PortalWall />
      <Plinth />
      <CharacterPlaceholder />

      <CinematicRig stage={stage} />
    </>
  )
}
