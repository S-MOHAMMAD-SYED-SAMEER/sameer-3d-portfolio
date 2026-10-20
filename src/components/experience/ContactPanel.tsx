import {
  CONTACT_INTRO,
  CONTACT_PROMPT,
  contactActions,
  type ContactAction,
} from '@/data/contact'
import { cn } from '@/lib/cn'

/**
 * The last station in the workshop.
 *
 * One idea, then the ways to act on it. A channel becomes a link only when it
 * has a real destination; one without a destination (the résumé, until there is
 * a file to point at) is left out altogether rather than named as missing.
 * Same restraint as every other destination — no cards, one accent, nothing
 * that pulses.
 */
export function ContactPanel() {
  const actions = contactActions()

  return (
    <div>
      <p className="text-base leading-snug font-medium">{CONTACT_INTRO}</p>
      <p className="text-mist mt-2 text-sm leading-relaxed">{CONTACT_PROMPT}</p>

      {actions.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
          {actions.map((action) => (
            <ContactLink key={action.id} action={action} />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * One channel.
 *
 * The lead action is the accent pill the rest of the experience uses for a
 * primary move; the others stay quiet links. A `mailto:` gets no `target` or
 * `rel` — it hands off to a mail client rather than opening a page.
 */
function ContactLink({ action }: { action: ContactAction }) {
  return (
    <a
      href={action.href}
      target={action.external ? '_blank' : undefined}
      rel={action.external ? 'noopener noreferrer' : undefined}
      aria-label={action.accessibleName}
      className={cn(
        'focus-ring',
        action.emphasis === 'primary'
          ? cn(
              'bg-accent text-void inline-flex items-center gap-2 rounded-full',
              'px-5 py-2.5 text-sm font-medium tracking-wide transition-colors duration-200',
              'hover:bg-accent/85',
            )
          : 'text-accent rounded text-sm hover:underline',
      )}
    >
      {action.label} →
    </a>
  )
}
