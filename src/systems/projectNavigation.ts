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
