import { PROFILE } from '@/data/profile'

/**
 * Ways to get in touch.
 *
 * Every destination is `null` until a real one is added. Nothing here is
 * fabricated to fill a row — the panel renders a channel as a live action
 * only when it has somewhere to go, and names it quietly when it does not.
 */
export type ContactChannelId = 'email' | 'linkedin' | 'github' | 'resume'

export interface ContactChannel {
  id: ContactChannelId
  label: string
  /**
   * `email` is an address and becomes a `mailto:`; everything else is a URL
   * opened in a new tab. Keeping the distinction here is what lets the
   * address be written plainly below rather than as a hand-built link.
   */
  kind: 'email' | 'external'
  /**
   * The real destination — an address for email, a URL for the rest.
   * `null` until one exists. Never a placeholder.
   */
  value: string | null
}

export const CONTACT_INTRO = "Let's build something useful."

/** The kind of problem worth writing about, said once and quietly. */
export const CONTACT_PROMPT = 'Have a system that should work better?'

export const CONTACT_CHANNELS: readonly ContactChannel[] = [
  // The address these repositories are authored under.
  {
    id: 'email',
    label: 'Email',
    kind: 'email',
    value: 'mohammadsyedsameer20@gmail.com',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    kind: 'external',
    value: 'https://www.linkedin.com/in/mohammad-syed-sameer-s-a879a235a',
  },
  // The same account the three projects are hosted under; see src/data/projects.ts.
  {
    id: 'github',
    label: 'GitHub',
    kind: 'external',
    value: 'https://github.com/S-MOHAMMAD-SYED-SAMEER',
  },
  // A hosted URL or a file served from public/ (e.g. '/resume.pdf') both work.
  { id: 'resume', label: 'Résumé', kind: 'external', value: null },
]

/**
 * Spoken names, because the visible labels are single words.
 *
 * The full name is used rather than a short form — it is the identity the
 * rest of the portfolio presents, and a screen reader should hear the same.
 */
const ACCESSIBLE_NAME: Record<ContactChannelId, string> = {
  email: `Email ${PROFILE.spokenName}`,
  linkedin: `Open ${PROFILE.spokenName}'s LinkedIn profile in a new tab`,
  github: `Open ${PROFILE.spokenName}'s GitHub profile in a new tab`,
  resume: `Open ${PROFILE.spokenName}'s résumé in a new tab`,
}

export type ContactEmphasis = 'primary' | 'secondary'

export interface ContactAction {
  id: ContactChannelId
  label: string
  href: string
  /** External links open a tab; a `mailto:` hands off to a mail client. */
  external: boolean
  emphasis: ContactEmphasis
  accessibleName: string
}

/**
 * The channels that actually go somewhere.
 *
 * Email leads when it exists, because a written message is the one channel
 * that asks nothing of the reader first. With no email the first channel
 * that does exist takes the lead, so the panel always has one clear action
 * rather than a row of equals — and with nothing filled in there is simply
 * no action, never an invented one.
 */
export function contactActions(): ContactAction[] {
  const actions = CONTACT_CHANNELS.filter(
    (channel): channel is ContactChannel & { value: string } => channel.value !== null,
  ).map<ContactAction>((channel) => ({
    id: channel.id,
    label: channel.label,
    href: channel.kind === 'email' ? `mailto:${channel.value}` : channel.value,
    external: channel.kind !== 'email',
    emphasis: 'secondary',
    accessibleName: ACCESSIBLE_NAME[channel.id],
  }))

  const lead = actions.find((action) => action.id === 'email') ?? actions[0]

  return actions.map((action) => (action === lead ? { ...action, emphasis: 'primary' } : action))
}

/** Channels with nowhere to point yet. Named, never linked. */
export function unlinkedChannels(): ContactChannel[] {
  return CONTACT_CHANNELS.filter((channel) => channel.value === null)
}
