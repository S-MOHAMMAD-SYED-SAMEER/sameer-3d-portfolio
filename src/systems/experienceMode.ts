import { createContext } from 'react'

import { ROUTES } from '@/lib/routes'

/**
 * The two ways a visitor can consume the portfolio.
 *
 * `normal` is the fast, traditional site. `3d` is the immersive experience.
 * The current route is the source of truth for which one is active — there
 * is deliberately no duplicated mode state to keep in sync.
 */
export type ExperienceMode = 'normal' | '3d'

export interface ExperienceModeValue {
  mode: ExperienceMode
  /** True when the 3D experience owns the viewport and its Canvas is mounted. */
  isImmersive: boolean
  setMode: (mode: ExperienceMode) => void
  toggleMode: () => void
}

export const MODE_ROUTE: Record<ExperienceMode, string> = {
  normal: ROUTES.normal,
  '3d': ROUTES.experience,
}

export const MODE_LABEL: Record<ExperienceMode, string> = {
  normal: 'Normal',
  '3d': '3D',
}

/** Derives the active mode from the current pathname. */
export function modeFromPathname(pathname: string): ExperienceMode {
  return pathname === ROUTES.experience || pathname.startsWith(`${ROUTES.experience}/`)
    ? '3d'
    : 'normal'
}

export const ExperienceModeContext = createContext<ExperienceModeValue | null>(null)
