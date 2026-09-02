import { cn } from '@/lib/cn'
import { PLAYBACK_LABEL, PLAYBACK_MODES, type PlaybackMode } from '@/systems/playbackMode'

interface PlaybackSwitchProps {
  mode: PlaybackMode
  onChange: (mode: PlaybackMode) => void
}

/**
 * Who is pacing the arrival — the visitor, or the experience.
 *
 * Deliberately the same pill as the Normal/3D switch it sits under, one
 * size quieter: it is a preference, not a destination.
 */
export function PlaybackSwitch({ mode, onChange }: PlaybackSwitchProps) {
  return (
    <div
      role="group"
      aria-label="Playback"
      className="border-line bg-ink/70 inline-flex rounded-full border p-0.5 backdrop-blur-sm"
    >
      {PLAYBACK_MODES.map((option) => {
        const isActive = option === mode

        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={isActive}
            className={cn(
              'focus-ring rounded-full px-3 py-1 text-[10px] font-medium tracking-[0.18em] uppercase transition-colors duration-200',
              isActive ? 'bg-chalk/90 text-void' : 'text-mist hover:text-chalk',
            )}
          >
            {PLAYBACK_LABEL[option]}
          </button>
        )
      })}
    </div>
  )
}
