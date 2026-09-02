import { memo } from 'react'

import { Ceiling } from '@/components/3d/entrance/Ceiling'
import { Colonnade } from '@/components/3d/entrance/Colonnade'
import { EntranceDoor } from '@/components/3d/entrance/EntranceDoor'
import { EntranceLighting } from '@/components/3d/entrance/EntranceLighting'
import { FloorInlay } from '@/components/3d/entrance/FloorInlay'
import { Ground } from '@/components/3d/entrance/Ground'
import { HallWalls } from '@/components/3d/entrance/HallWalls'
import { NameBoard } from '@/components/3d/entrance/NameBoard'
import { Plinth } from '@/components/3d/entrance/Plinth'
import { PortalWall } from '@/components/3d/entrance/PortalWall'

interface EntranceHallProps {
  /** 0 closed, 1 open. The one thing about the hall that changes. */
  doorOpen: number
  reducedMotion?: boolean
}

/**
 * The entrance hall: the first built area of the world.
 *
 * Architecture and its lighting. It knows nothing of stages — only whether
 * its door is open. Later areas are siblings of this component.
 */
export function EntranceHall({ doorOpen, reducedMotion }: EntranceHallProps) {
  return (
    <>
      <EntranceLighting doorOpen={doorOpen} />

      <StaticHall />
      <EntranceDoor open={doorOpen} reducedMotion={reducedMotion} />
    </>
  )
}

/**
 * The architecture itself, which has no state and no props.
 *
 * Behind a memo because everything above it re-renders whenever a line of
 * dialogue changes or a destination is hovered, and reconciling thirty-odd
 * static meshes to discover that none of them moved is pure waste.
 */
const StaticHall = memo(function StaticHall() {
  return (
    <>
      <Ground />
      <FloorInlay />
      <HallWalls />
      <Ceiling />
      <Colonnade />
      <PortalWall />
      <NameBoard />
      <Plinth />
    </>
  )
})
