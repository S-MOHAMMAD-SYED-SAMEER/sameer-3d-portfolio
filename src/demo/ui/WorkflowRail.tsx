import { useEffect, useRef } from 'react'

import { cn } from '@/lib/cn'

/**
 * The ten stages, and where the visitor is in them.
 *
 * A numbered list because this genuinely is a sequence: each stage consumes
 * what the one before it produced, and that dependency is most of what the
 * demo is trying to show. Numbering something that is not ordered would be
 * decoration; here it is the point.
 *
 * Every stage is reachable at any time. There is no progress to earn and no
 * timer to wait out — the whole pipeline has already run, in under a
 * millisecond, before this rendered. Gating stages behind one another would be
 * inventing a delay the system does not have.
 *
 * On a narrow screen the rail scrolls sideways inside its own container rather
 * than wrapping into a block that pushes the content off the first screen.
 */

export type WorkflowStage = {
  id: string
  label: string
  /** Said instead of the label when a stage has nothing to show. */
  unavailable?: string
}

export function WorkflowRail({
  stages,
  activeId,
  onSelect,
}: {
  stages: readonly WorkflowStage[]
  activeId: string
  onSelect: (id: string) => void
}) {
  const activeRef = useRef<HTMLButtonElement | null>(null)

  /*
   * Keep the active stage where the visitor can see it.
   *
   * The rail is wider than its container at every viewport, so stepping
   * forward with Next would otherwise leave the current stage scrolled off to
   * the right — the one place a person looks to work out where they are.
   *
   * `inline: 'nearest'` moves it the shortest distance that makes it visible
   * and does nothing when it already is; `block: 'nearest'` is what keeps this
   * from scrolling the page vertically to reach the rail. There is deliberately
   * no `behavior: 'smooth'` — an instant jump needs no motion preference to
   * respect, and the pipeline it is tracking has no animation either.
   */
  useEffect(() => {
    activeRef.current?.scrollIntoView({ inline: 'nearest', block: 'nearest' })
  }, [activeId])

  return (
    <nav aria-label="Pipeline stages" className="border-line border-y">
      {/* The list scrolls; the page does not. The scrollbar is left visible on
          purpose — it is the only cue that there is more rail off-screen. */}
      <ol className="flex gap-1 overflow-x-auto py-2" role="list">
        {stages.map((stage, index) => {
          const isActive = stage.id === activeId
          const disabled = stage.unavailable !== undefined

          return (
            <li key={stage.id} className="shrink-0">
              <button
                ref={isActive ? activeRef : undefined}
                type="button"
                onClick={() => onSelect(stage.id)}
                disabled={disabled}
                aria-current={isActive ? 'step' : undefined}
                title={stage.unavailable}
                className={cn(
                  'focus-ring flex min-w-[7.5rem] flex-col gap-1 rounded-md px-3 py-2 text-left',
                  'transition-colors duration-200',
                  disabled
                    ? 'cursor-not-allowed opacity-40'
                    : isActive
                      ? 'bg-surface text-chalk'
                      : 'text-mist hover:bg-surface/60 hover:text-chalk',
                )}
              >
                <span
                  className={cn(
                    'text-[10px] tracking-[0.2em] tabular-nums',
                    isActive ? 'text-accent' : 'text-mist/60',
                  )}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-xs leading-tight font-medium">{stage.label}</span>
                {/* The active stage is marked by more than colour: it carries a
                    rule beneath it and `aria-current` for a screen reader. */}
                <span
                  aria-hidden
                  className={cn('h-px w-full', isActive ? 'bg-accent' : 'bg-transparent')}
                />
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
