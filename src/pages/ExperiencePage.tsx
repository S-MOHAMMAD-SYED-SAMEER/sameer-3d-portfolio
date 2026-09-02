import { useCallback, useEffect } from 'react'

import { ExperienceScene } from '@/components/3d/ExperienceScene'
import { SceneCanvas } from '@/components/3d/SceneCanvas'
import { ExperienceOverlay } from '@/components/experience/ExperienceOverlay'
import { WebGLBoundary } from '@/components/experience/WebGLBoundary'
import { useJourney } from '@/hooks/useJourney'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useWorkshop } from '@/hooks/useWorkshop'

/**
 * Owns the 3D experience. The Canvas lives only here, so navigating away
 * unmounts it and releases the WebGL context.
 *
 * Two state machines, kept apart on purpose: the journey is the linear
 * arrival, the workshop is the hub the visitor explores once they are in.
 * This component wires both to the scene, the overlay and the keyboard.
 */
export function ExperiencePage() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const journey = useJourney(prefersReducedMotion)

  const inWorkshop = journey.stage === 'workshop'
  const workshop = useWorkshop(inWorkshop)

  const { advance, back, isTransition, mode } = journey
  const { isOpen, close, step, highlighted, select, project, clearProject } = workshop

  /**
   * Back is a hierarchy, not one action. Reading a case study, it returns to
   * the project list; inside a destination it closes the panel and leaves the
   * visitor in the room; only from the room itself does it step back through
   * the arrival.
   */
  const goBack = useCallback(() => {
    if (project !== null) {
      clearProject()
      return
    }
    if (isOpen) {
      close()
      return
    }
    back()
  }, [back, clearProject, close, isOpen, project])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return

      // Escape peels one layer at a time, same order as Back.
      if (event.key === 'Escape' && (isOpen || project !== null)) {
        event.preventDefault()
        goBack()
        return
      }

      // Backspace always steps back. Only the arrows are reinterpreted in
      // the room, so there is still a keyboard way out of it.
      if (event.key === 'Backspace') {
        event.preventDefault()
        goBack()
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        // In the room the arrows walk the destinations rather than the story.
        if (inWorkshop && !isOpen) step(-1)
        else goBack()
        return
      }

      if (event.key === 'ArrowRight') {
        if (inWorkshop && !isOpen) {
          event.preventDefault()
          step(1)
          return
        }
        if (mode === 'controlled' && !isTransition) {
          event.preventDefault()
          advance()
        }
        return
      }

      // Only when a destination is highlighted but not yet open, and only
      // if focus is not already on a button that handles these itself.
      if ((event.key === 'Enter' || event.key === ' ') && inWorkshop && !isOpen) {
        if (document.activeElement instanceof HTMLButtonElement) return
        if (highlighted === null) return
        event.preventDefault()
        select(highlighted)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [advance, goBack, highlighted, inWorkshop, isOpen, isTransition, mode, project, select, step])

  return (
    <WebGLBoundary>
      <main className="bg-void relative h-dvh w-full overflow-hidden">
        <SceneCanvas>
          <ExperienceScene
            stage={journey.stage}
            gesture={journey.gesture}
            onCharacterArrive={journey.onCharacterArrive}
            reducedMotion={prefersReducedMotion}
            workshopActive={inWorkshop}
            highlightedArea={workshop.highlighted}
            openArea={workshop.open}
            openProject={workshop.project}
            highlightedProject={workshop.highlightedProject}
            onHighlightProject={workshop.highlightProject}
            onSelectProject={workshop.selectProject}
            onHighlightArea={workshop.highlight}
            onSelectArea={workshop.select}
            cameraOverride={workshop.pose}
          />
        </SceneCanvas>

        {/* Fades the first frame in, so the scene never pops. */}
        <div aria-hidden className="experience-veil bg-void pointer-events-none absolute inset-0" />

        <ExperienceOverlay
          journey={journey}
          workshop={workshop}
          inWorkshop={inWorkshop}
          onBack={goBack}
        />
      </main>
    </WebGLBoundary>
  )
}
