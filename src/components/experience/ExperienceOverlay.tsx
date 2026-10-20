import { Link } from 'react-router-dom'

import { ActionButton } from '@/components/ActionButton'
import { ModeSwitch } from '@/components/navigation/ModeSwitch'
import { DialoguePanel } from '@/components/experience/DialoguePanel'
import { PlaybackSwitch } from '@/components/experience/PlaybackSwitch'
import { WorkshopNav } from '@/components/experience/WorkshopNav'
import { WorkshopPanel } from '@/components/experience/WorkshopPanel'
import { SceneSurfaces } from '@/components/experience/surfaces/SceneSurfaces'
import { MOBILE_HINT, MOBILE_POSTER, STAGE_COPY } from '@/data/experienceCopy'
import { useNarrowViewport } from '@/hooks/useNarrowViewport'
import { cn } from '@/lib/cn'
import { ROUTES } from '@/lib/routes'
import type { Journey } from '@/hooks/useJourney'
import type { Workshop } from '@/hooks/useWorkshop'
import { PAGE_COUNT } from '@/systems/projectNavigation'
import type { ContentPlacement } from '@/systems/contentPlacement'

interface ExperienceOverlayProps {
  journey: Journey
  workshop: Workshop
  inWorkshop: boolean
  /** Closes an open destination first, and only then steps back a beat. */
  onBack: () => void
  /**
   * Where an open destination's content goes: on the object in the room, or in the flat panel.
   * The panel is the phone view, the reduced-motion view, and the fallback; on a desktop the content
   * is on the object and the panel is not shown alongside it.
   */
  placement: ContentPlacement
}

/**
 * DOM UI layered over the canvas.
 *
 * Chrome, not a hero. Through the arrival it is a pair of switches, a caption,
 * whatever the host is saying and at most two buttons. In the workshop it
 * gains the destination row and, when one is chosen, a panel that sits beside
 * the room rather than over it. Everything is a real button, outside the
 * Canvas tree.
 */
export function ExperienceOverlay({
  journey,
  workshop,
  inWorkshop,
  onBack,
  placement,
}: ExperienceOverlayProps) {
  const copy = STAGE_COPY[journey.stage]
  const narrow = useNarrowViewport()
  const atStart = journey.stage === 'intro'
  const isAuto = journey.mode === 'auto'

  // The host's lines play themselves, so there is no Continue: the action is the stage's own wording,
  // and pressing it in the middle of the greeting skips the rest of what he is saying.
  const actionLabel = copy.action

  const showAction = !isAuto && !journey.isTransition && actionLabel !== undefined
  const showPause = isAuto && !journey.isFinal
  // With a destination open the panel carries its own Close, so the bottom
  // row stands down rather than offering a second button that does the same
  // thing. Escape and Backspace still close it.
  const inScene = placement === 'in-scene'
  const showBack = journey.canGoBack && !workshop.isOpen
  // In the room there is no panel with a Close of its own, so the bottom row carries it.
  const showCloseArea = inScene && workshop.isOpen

  return (
    <div
      data-stage={journey.stage}
      data-mode={journey.mode}
      data-paused={journey.paused ? 'true' : 'false'}
      data-area={workshop.open ?? ''}
      className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6 sm:p-10"
    >
      {/* A still of the corridor, for a phone. It is there before the scene has drawn a frame, and it is what
          stands behind "Step inside" if the scene is slow or dark on the device; it fades out as the
          visitor steps in, over the live scene. */}
      {narrow && (
        <div
          aria-hidden
          data-start-poster
          className={cn(
            'pointer-events-none absolute inset-0 bg-cover bg-center transition-opacity duration-700',
            atStart ? 'opacity-100' : 'opacity-0',
          )}
          style={{ backgroundImage: `url(${MOBILE_POSTER})` }}
        />
      )}

      {/* Scrims. The scene is high contrast and the daylight moves through
          the frame, so DOM text needs its own ground to stay readable. */}
      <div
        aria-hidden
        className="from-void/80 absolute inset-x-0 top-0 h-32 bg-gradient-to-b to-transparent"
      />
      <div
        aria-hidden
        className="from-void/95 via-void/65 absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t to-transparent"
      />

      {/* Content that sits on the objects in the room. Placed by `SurfaceTracker`, in the Canvas. */}
      {inScene && (
        <SceneSurfaces
          open={workshop.open}
          project={workshop.project}
          page={workshop.page}
          onSelectProject={workshop.selectProject}
          onOpenArea={workshop.select}
        />
      )}

      <header className="relative flex items-start justify-between gap-4">
        <h1 className="text-mist text-[10px] tracking-[0.35em] uppercase">3D Experience</h1>
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          <ModeSwitch />
          <PlaybackSwitch mode={journey.mode} onChange={journey.setMode} />
        </div>
      </header>

      {/* The flat panel: a column beside the room on a wide screen and a sheet above the controls on a
          phone. It is what a phone, a reduced-motion visitor and anyone without the in-room pages
          sees, and it is never shown alongside them. Out of the flow so a tall panel can never push
          the controls off the bottom of the viewport. */}
      {!inScene && (
        <div className="pointer-events-none absolute inset-x-6 bottom-44 flex justify-end sm:inset-x-auto sm:top-1/2 sm:right-10 sm:bottom-auto sm:-translate-y-1/2">
          {workshop.open !== null && (
            <WorkshopPanel
              area={workshop.open}
              onClose={workshop.close}
              onOpen={workshop.select}
              project={workshop.project}
              highlightedProject={workshop.highlightedProject}
              onSelectProject={workshop.selectProject}
              onHighlightProject={workshop.highlightProject}
              onClearProject={workshop.clearProject}
              onStepProject={workshop.stepProject}
            />
          )}
        </div>
      )}

      <div className="relative">
        {copy.label !== undefined && !inWorkshop && (
          <p className="text-mist/80 text-[11px] tracking-[0.35em] uppercase">{copy.label}</p>
        )}

        {copy.heading !== undefined && journey.dialogue === null && (
          <p className="mt-2 text-3xl leading-snug font-medium sm:text-4xl">{copy.heading}</p>
        )}

        {narrow && atStart && (
          <p data-mobile-hint className="text-mist/90 mt-3 text-[13px] leading-snug">
            {MOBILE_HINT.before}
            <Link to={ROUTES.normal} className="focus-ring text-accent pointer-events-auto underline underline-offset-4">
              {MOBILE_HINT.link}
            </Link>
          </p>
        )}

        {!inWorkshop && (
          <div className="mt-3">
            <DialoguePanel
              line={journey.dialogue}
              showSpeaker={journey.dialogue?.gesture === 'present'}
            />
          </div>
        )}

        {/* The greeting steps aside once a destination is open — on a
            narrow screen the sheet reaches down into this line. */}
        {inWorkshop && journey.dialogue !== null && !workshop.isOpen && (
          <div className="mb-3">
            <DialoguePanel line={journey.dialogue} showSpeaker={false} />
          </div>
        )}

        {inWorkshop && (
          <WorkshopNav
            highlighted={workshop.highlighted}
            open={workshop.open}
            onHighlight={workshop.highlight}
            onSelect={workshop.select}
          />
        )}

        {/* Back sits left of the action so the pair reads as one control
            group and never stacks on top of itself on a narrow screen. */}
        <div className="pointer-events-auto mt-4 flex flex-wrap items-center gap-3">
          {showBack && (
            <ActionButton onClick={onBack} variant="secondary">
              Back
            </ActionButton>
          )}

          {showCloseArea && (
            <ActionButton onClick={onBack} variant="secondary">
              {workshop.project !== null ? 'All projects' : 'Back to the room'}
            </ActionButton>
          )}

          {inScene && workshop.open === 'projects' && workshop.project === null && (
            <ActionButton onClick={() => workshop.turnPage(1)} variant="secondary">
              {`More projects (${workshop.page + 1} of ${PAGE_COUNT})`}
            </ActionButton>
          )}

          {inScene && workshop.open === 'projects' && workshop.project !== null && (
            <>
              <ActionButton onClick={() => workshop.stepProject(-1)} variant="secondary">
                Previous
              </ActionButton>
              <ActionButton onClick={() => workshop.stepProject(1)} variant="secondary">
                Next
              </ActionButton>
            </>
          )}

          {showAction && <ActionButton onClick={journey.advance}>{actionLabel}</ActionButton>}

          {/* Available at every beat of the arrival, in either mode. */}
          {!inWorkshop && (
            <ActionButton onClick={journey.skip} variant="secondary">
              Skip intro
            </ActionButton>
          )}

          {showPause && (
            <ActionButton onClick={journey.togglePause} variant="secondary">
              {journey.paused ? 'Resume' : 'Pause'}
            </ActionButton>
          )}

          {isAuto && (
            <p className="text-mist/60 text-[10px] tracking-[0.3em] uppercase">
              {journey.paused ? 'Paused' : 'Auto'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
