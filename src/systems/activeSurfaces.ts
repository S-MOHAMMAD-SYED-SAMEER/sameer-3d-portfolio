import { MONITOR_SURFACES, type SurfaceId } from '@/data/surfaces'
import type { WorkshopArea } from '@/systems/workshopArea'

/** The surfaces that carry the content of an open destination. The rest stay hidden. */
export function activeSurfaces(area: WorkshopArea | null): SurfaceId[] {
  switch (area) {
    case 'projects':
      return [...MONITOR_SURFACES]
    case 'skills':
      return ['skills']
    case 'services':
      return ['services']
    case 'contact':
      return ['contact']
    case 'about':
      return ['about']
    default:
      return []
  }
}
