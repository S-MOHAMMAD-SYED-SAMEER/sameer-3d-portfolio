import { useExperienceMode } from '@/hooks/useExperienceMode'
import { cn } from '@/lib/cn'
import { MODE_LABEL, type ExperienceMode } from '@/systems/experienceMode'

const MODES: readonly ExperienceMode[] = ['normal', '3d']

/**
 * Lets the visitor move between the Normal portfolio and the 3D experience
 * from anywhere inside either mode.
 */
export function ModeSwitch() {
  const { mode, setMode } = useExperienceMode()

  return (
    <div
      role="group"
      aria-label="Experience mode"
      className="border-line bg-ink/70 inline-flex rounded-full border p-1 backdrop-blur-sm"
    >
      {MODES.map((option) => {
        const isActive = option === mode

        return (
          <button
            key={option}
            type="button"
            onClick={() => setMode(option)}
            aria-pressed={isActive}
            className={cn(
              'focus-ring rounded-full px-4 py-1.5 text-xs font-medium tracking-wider uppercase transition-colors duration-200',
              isActive ? 'bg-chalk text-void' : 'text-mist hover:text-chalk',
            )}
          >
            {MODE_LABEL[option]}
          </button>
        )
      })}
    </div>
  )
}
