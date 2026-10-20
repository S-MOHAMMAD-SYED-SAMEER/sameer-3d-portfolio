import { SceneSurface } from '@/components/experience/surfaces/SceneSurface'
import { CONTACT_INTRO, CONTACT_PROMPT, contactActions } from '@/data/contact'
import { cn } from '@/lib/cn'

/**
 * The console in the rack: the channels as labelled buttons. A channel with nowhere to go is not
 * shown at all, so there is no "not linked" row to read.
 */
export function ContactConsole() {
  const actions = contactActions()

  return (
    <SceneSurface id="contact" label="Contact" className="bg-[#0b0e13]">
      <div className="flex h-full flex-col p-6">
        <p className="m-0 text-[24px] leading-[28px] font-semibold">{CONTACT_INTRO}</p>
        <p className="text-mist m-0 mt-1.5 text-[17px] leading-[22px]">{CONTACT_PROMPT}</p>

        <div className="mt-auto flex flex-col gap-2.5">
          {actions.map((action) => (
            <a
              key={action.id}
              href={action.href}
              target={action.external ? '_blank' : undefined}
              rel={action.external ? 'noopener noreferrer' : undefined}
              aria-label={action.accessibleName}
              className={cn(
                'focus-ring rounded-lg px-4 py-2.5 text-[19px] leading-[24px] font-medium',
                action.emphasis === 'primary'
                  ? 'bg-accent text-void hover:bg-accent/85'
                  : 'border-line text-chalk hover:border-accent/70 border',
              )}
            >
              {action.label} →
            </a>
          ))}
        </div>
      </div>
    </SceneSurface>
  )
}
