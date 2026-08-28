import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/cn'

export type ActionVariant = 'primary' | 'secondary'

const BASE =
  'focus-ring inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-medium tracking-wide transition-colors duration-200'

const VARIANT: Record<ActionVariant, string> = {
  primary: 'bg-accent text-void hover:bg-accent/85',
  secondary: 'border border-line text-chalk hover:border-mist/60 hover:bg-surface',
}

interface ActionLinkProps {
  to: string
  variant?: ActionVariant
  className?: string
  children: ReactNode
}

/** The one button treatment used across both modes. */
export function ActionLink({ to, variant = 'primary', className, children }: ActionLinkProps) {
  return (
    <Link to={to} className={cn(BASE, VARIANT[variant], className)}>
      {children}
    </Link>
  )
}
