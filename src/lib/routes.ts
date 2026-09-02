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

/**
 * The interactive demo that runs inside this portfolio.
 *
 * Nested under the project rather than given its own namespace, so the URL
 * reads as "the demo belonging to this project" and the same shape works for
 * the other two when they get one.
 */
export function projectDemoRoute(id: ProjectId): string {
  return `${projectRoute(id)}/demo`
}
