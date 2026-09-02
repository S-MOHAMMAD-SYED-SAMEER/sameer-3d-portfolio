import { cn } from '@/lib/cn'
import { AREA_LABEL, AREA_PROMPT, WORKSHOP_AREAS, type WorkshopArea } from '@/systems/workshopArea'

interface WorkshopNavProps {
  highlighted: WorkshopArea | null
  open: WorkshopArea | null
  onHighlight: (area: WorkshopArea | null) => void
  onSelect: (area: WorkshopArea) => void
}

/**
 * The five destinations, as real buttons.
 *
 * The room is the interface — these markers live on the objects themselves —
 * but a visitor who cannot point at a 3D scene still has to be able to get
 * everywhere, so this row is the same navigation in a form the keyboard and
 * a screen reader can use. Kept to a line of small labels rather than a menu.
 */
export function WorkshopNav({ highlighted, open, onHighlight, onSelect }: WorkshopNavProps) {
  const prompt = highlighted ?? open

  return (
    <div className="pointer-events-auto">
      <p className="text-mist/60 h-4 text-[10px] tracking-[0.3em] uppercase">
        {prompt === null ? 'Look around' : AREA_PROMPT[prompt]}
      </p>

      <div className="mt-2 flex flex-wrap gap-x-1 gap-y-2">
        {WORKSHOP_AREAS.map((area) => {
          const isActive = area === open
          const isHighlighted = area === highlighted

          return (
            <button
              key={area}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelect(area)}
              onMouseEnter={() => onHighlight(area)}
              onMouseLeave={() => onHighlight(null)}
              onFocus={() => onHighlight(area)}
              onBlur={() => onHighlight(null)}
              className={cn(
                'focus-ring rounded-full px-3 py-1.5 text-[11px] font-medium tracking-[0.22em] uppercase transition-colors duration-200',
                isActive
                  ? 'bg-chalk/90 text-void'
                  : isHighlighted
                    ? 'text-chalk bg-surface/70'
                    : 'text-mist hover:text-chalk',
              )}
            >
              {AREA_LABEL[area]}
            </button>
          )
        })}
      </div>
    </div>
  )
}
