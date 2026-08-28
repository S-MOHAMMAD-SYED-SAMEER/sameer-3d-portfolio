import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { ACTION_BASE, ACTION_VARIANT, type ActionVariant } from '@/components/actionStyles'
import { cn } from '@/lib/cn'

interface ActionLinkProps {
  to: string
  variant?: ActionVariant
  className?: string
  children: ReactNode
}

/** Navigating action. Shares its treatment with `ActionButton`. */
export function ActionLink({ to, variant = 'primary', className, children }: ActionLinkProps) {
  return (
    <Link to={to} className={cn(ACTION_BASE, ACTION_VARIANT[variant], className)}>
      {children}
    </Link>
  )
}
