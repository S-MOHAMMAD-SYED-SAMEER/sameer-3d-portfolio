import type { DialogueLine } from '@/data/dialogue'
import { SPEAKER_LABEL } from '@/data/dialogue'

interface DialoguePanelProps {
  line: DialogueLine | null
  /** Names the speaker once per beat rather than on every line. */
  showSpeaker: boolean
}

/**
 * What the host is saying.
 *
 * A caption, not a chat bubble: one line at a time on its own quiet ground,
 * sized to be read at a glance and gone again. Keyed on the text so each new
 * line fades in rather than swapping under the reader.
 *
 * `aria-live` is polite and sits on the wrapper, so a screen reader hears
 * each line once as it arrives without interrupting anything.
 */
export function DialoguePanel({ line, showSpeaker }: DialoguePanelProps) {
  return (
    <div aria-live="polite" className="min-h-[4.5rem] sm:min-h-[4rem]">
      {line !== null && (
        <div key={line.text} className="dialogue-line max-w-lg">
          {showSpeaker && (
            <p className="text-mist/70 mb-2 text-[10px] tracking-[0.32em] uppercase">
              {SPEAKER_LABEL}
            </p>
          )}
          <p className="text-chalk border-accent/40 border-l-2 pl-4 text-lg leading-snug font-medium sm:text-xl">
            {line.text}
          </p>
        </div>
      )}
    </div>
  )
}
