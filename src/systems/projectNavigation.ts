// Relative import, not the `@/` alias every other file in this tree uses:
// this module is exercised directly by `node --test`, which has no alias
// resolution, so the one import it needs has to be a real relative path.
// `PROJECTS` itself has no further imports, so the chain ends here.
import { PROJECTS, type ProjectId } from '../data/projects.ts'

/**
 * The project one step from `current`, clamped at both ends.
 *
 * A plain function rather than a method on the workshop hook so it can be
 * tested directly — hook state cannot be exercised by this repository's
 * test runner, which has no React renderer.
 *
 * Deliberately clamps instead of wrapping: this is a portfolio presentation
 * with a first and a last project, not a carousel. Stepping past the last
 * project should leave the visitor there, not loop back to the first.
 */
export function clampProjectStep(current: ProjectId | null, direction: 1 | -1): ProjectId {
  const index = current === null ? -1 : PROJECTS.findIndex((project) => project.id === current)
  const next = Math.min(Math.max(index + direction, 0), PROJECTS.length - 1)
  return PROJECTS[next]!.id
}

/** The three monitors on the bench show three projects at a time. */
export const MONITOR_COUNT = 3

/** How many sets of three there are. Six projects make two. */
export const PAGE_COUNT = Math.ceil(PROJECTS.length / MONITOR_COUNT)

/** Which set of three a project is in. */
export function pageOfProject(id: ProjectId): number {
  const index = PROJECTS.findIndex((project) => project.id === id)
  return Math.floor(Math.max(index, 0) / MONITOR_COUNT)
}

/** The projects shown on the monitors for one set, left to right. */
export function projectsOnPage(page: number) {
  const start = Math.min(Math.max(page, 0), PAGE_COUNT - 1) * MONITOR_COUNT
  return PROJECTS.slice(start, start + MONITOR_COUNT)
}

/** Which monitor, left to right, a project is on within its set. */
export function monitorOfProject(id: ProjectId): number {
  const index = PROJECTS.findIndex((project) => project.id === id)
  return Math.max(index, 0) % MONITOR_COUNT
}
