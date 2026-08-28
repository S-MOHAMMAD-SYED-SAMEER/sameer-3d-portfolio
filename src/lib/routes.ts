import type { ProjectId } from '@/data/projects'

/**
 * Every route in the application, in one place, so links never drift
 * from the router definition.
 */
export const ROUTES = {
  landing: '/',
  normal: '/normal',
  experience: '/3d',
  projects: '/projects',
} as const

export function projectRoute(id: ProjectId): string {
  return `${ROUTES.projects}/${id}`
}
