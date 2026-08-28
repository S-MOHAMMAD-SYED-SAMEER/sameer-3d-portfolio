import { useCallback, useMemo, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import {
  ExperienceModeContext,
  MODE_ROUTE,
  modeFromPathname,
  type ExperienceMode,
  type ExperienceModeValue,
} from '@/systems/experienceMode'

/**
 * Publishes the active experience mode to the tree and provides the only
 * supported way to switch between Normal and 3D.
 *
 * Must be rendered inside a router.
 */
export function ExperienceModeProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const mode = modeFromPathname(pathname)

  const setMode = useCallback(
    (next: ExperienceMode) => {
      navigate(MODE_ROUTE[next])
    },
    [navigate],
  )

  const toggleMode = useCallback(() => {
    setMode(mode === '3d' ? 'normal' : '3d')
  }, [mode, setMode])

  const value = useMemo<ExperienceModeValue>(
    () => ({ mode, isImmersive: mode === '3d', setMode, toggleMode }),
    [mode, setMode, toggleMode],
  )

  return <ExperienceModeContext value={value}>{children}</ExperienceModeContext>
}
