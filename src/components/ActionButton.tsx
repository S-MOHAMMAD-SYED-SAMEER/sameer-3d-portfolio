import type { ReactNode } from 'react'

import { ACTION_BASE, ACTION_VARIANT, type ActionVariant } from '@/components/actionStyles'
import { cn } from '@/lib/cn'

interface ActionButtonProps {
  onClick: () => void
  variant?: ActionVariant
  className?: string
  children: ReactNode
}

/** In-place action. Shares its treatment with `ActionLink`. */
export function ActionButton({
  onClick,
  variant = 'primary',
  className,
  children,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(ACTION_BASE, ACTION_VARIANT[variant], className)}
    >
      {children}
    </button>
  )
}
