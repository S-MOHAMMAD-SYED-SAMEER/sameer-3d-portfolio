import { use } from 'react'

import { ExperienceModeContext, type ExperienceModeValue } from '@/systems/experienceMode'

/** Reads the active experience mode. Throws outside `ExperienceModeProvider`. */
export function useExperienceMode(): ExperienceModeValue {
  const value = use(ExperienceModeContext)

  if (value === null) {
    throw new Error('useExperienceMode must be used inside an ExperienceModeProvider')
  }

  return value
}
