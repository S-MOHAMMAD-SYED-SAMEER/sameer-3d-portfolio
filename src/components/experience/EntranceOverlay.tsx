import { ActionButton } from '@/components/ActionButton'
import { ModeSwitch } from '@/components/navigation/ModeSwitch'
import { PROFILE } from '@/data/profile'
import { cn } from '@/lib/cn'
import type { ExperienceStage } from '@/systems/experienceStage'

interface EntranceOverlayProps {
  stage: ExperienceStage
  onEnter: () => void
}

/**
 * DOM UI layered over the canvas.
 *
 * Deliberately not a game HUD: a wordmark, the mode switch, and one
 * title card that steps out of the way once the visitor enters. Kept
 * entirely outside the Canvas tree so it stays selectable, accessible
 * and cheap to re-render.
 */
export function EntranceOverlay({ stage, onEnter }: EntranceOverlayProps) {
  const isIntro = stage === 'intro'

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6 sm:p-10">
      {/* Scrims. The scene is high contrast and the bright shaft moves
          through the lower frame, so DOM text needs its own ground to stay
          readable at every viewport. */}
      <div
        aria-hidden
        className="from-void/85 absolute inset-x-0 top-0 h-36 bg-gradient-to-b to-transparent"
      />
      <div
        aria-hidden
        className="from-void/95 via-void/60 absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t to-transparent"
      />

      <header className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-[0.2em]">{PROFILE.name}</p>
          <p className="text-mist mt-1 text-[10px] tracking-[0.35em] uppercase">3D Experience</p>
        </div>
        <div className="pointer-events-auto">
          <ModeSwitch />
        </div>
      </header>

      {/* Both states share one grid cell so they cross-fade in place. */}
      <div className="relative grid items-end">
        <div
          className={cn(
            'col-start-1 row-start-1 max-w-md transition-all duration-700 ease-out',
            isIntro ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
          )}
        >
          <p className="text-mist text-[11px] tracking-[0.35em] uppercase">{PROFILE.title}</p>
          <p className="mt-4 text-2xl leading-snug font-medium sm:text-3xl">
            An engineer&rsquo;s world you can walk into.
          </p>
          <p className="text-mist mt-4 text-sm leading-relaxed">
            Built in the browser with React, TypeScript and WebGL.
          </p>
          <div className="pointer-events-auto mt-8">
            <ActionButton onClick={onEnter}>Step inside</ActionButton>
          </div>
        </div>

        <div
          className={cn(
            'col-start-1 row-start-1 transition-all duration-700 ease-out',
            isIntro ? 'pointer-events-none translate-y-3 opacity-0' : 'translate-y-0 opacity-100',
          )}
        >
          {/* An area label, the way a gallery captions a room. It names
              where you are rather than reporting build progress, and each
              later area gets its own. */}
          <p className="text-mist/70 text-[11px] tracking-[0.35em] uppercase">Entrance</p>
        </div>
      </div>
    </div>
  )
}
