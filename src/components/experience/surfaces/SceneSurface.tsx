import type { ReactNode } from 'react'

import { SURFACES, type SurfaceId } from '@/data/surfaces'
import { cn } from '@/lib/cn'
import { registerSurface } from '@/systems/surfaceRegistry'

interface SceneSurfaceProps {
  id: SurfaceId
  /** What the screen reader announces for this region. */
  label: string
  className?: string
  children: ReactNode
}

/**
 * The page for one object in the room.
 *
 * An ordinary element, laid out at the CSS size in `data/surfaces.ts`. It starts hidden; the tracker
 * inside the Canvas shows it and writes its transform every frame, so it sits on the object it
 * belongs to. Real DOM throughout: links are links, buttons are buttons, text is text.
 */
export function SceneSurface({ id, label, className, children }: SceneSurfaceProps) {
  const { width, height } = SURFACES[id].css

  return (
    <section
      ref={(element) => {
        registerSurface(id, element)
        return () => registerSurface(id, null)
      }}
      aria-label={label}
      data-surface={id}
      className={cn('text-chalk absolute top-0 left-0 origin-top-left overflow-hidden', className)}
      style={{ width, height, display: 'none' }}
    >
      {children}
    </section>
  )
}
