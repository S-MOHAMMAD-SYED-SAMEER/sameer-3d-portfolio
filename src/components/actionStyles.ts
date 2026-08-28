export type ActionVariant = 'primary' | 'secondary'

/** Shared button treatment, used by both the link and button elements. */
export const ACTION_BASE =
  'focus-ring inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-medium tracking-wide transition-colors duration-200'

export const ACTION_VARIANT: Record<ActionVariant, string> = {
  primary: 'bg-accent text-void hover:bg-accent/85',
  secondary: 'border border-line text-chalk hover:border-mist/60 hover:bg-surface',
}
