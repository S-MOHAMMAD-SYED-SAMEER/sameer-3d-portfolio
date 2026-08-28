/**
 * Single source of truth for the three portfolio projects.
 *
 * Every surface — the Normal portfolio, the 3D experience, project detail
 * pages, and any future metadata — reads from here. Do not restate any of
 * these values inside a component.
 *
 * These describe real projects. Only add a field here when the claim is
 * backed by the project's own repository or a reachable deployment.
 */

export type ProjectId = 'p1' | 'p2' | 'p3'

/** Deployment state of a project. */
export type ProjectStatus =
  /** Publicly reachable live demo. */
  | 'live'
  /** Complete and source-available, no public demo deployed yet. */
  | 'demo-pending'

export interface ProjectProof {
  /** Number of automated tests in the project's suite. */
  tests: number
  /**
   * Formal evaluation result, written exactly as the project reports it.
   * `null` when the project has no evaluation harness.
   */
  evaluation: string | null
  /** Other verified engineering properties worth surfacing. */
  properties: string[]
}

export interface ProjectLinks {
  /** Live deployment. `null` until one exists. */
  demo: string | null
  /** Source repository. `null` until the URL is filled in. */
  github: string | null
  /** Long-form write-up. `null` until the URL is filled in. */
  caseStudy: string | null
}

export interface Project {
  id: ProjectId
  /** Ordinal used for stable ordering and 3D placement in later phases. */
  order: number
  title: string
  shortDescription: string
  status: ProjectStatus
  proof: ProjectProof
  links: ProjectLinks
}

export const PROJECTS: readonly Project[] = [
  {
    id: 'p1',
    order: 1,
    title: 'AI Customer Support & Sales Recovery',
    shortDescription:
      'An AI system that handles customer support conversations and recovers sales that would otherwise be lost.',
    status: 'live',
    proof: {
      tests: 206,
      evaluation: '16/16',
      properties: [],
    },
    links: {
      demo: null,
      github: null,
      caseStudy: null,
    },
  },
  {
    id: 'p2',
    order: 2,
    title: 'AI Inbox & Lead Management',
    shortDescription:
      'An inbox-to-CRM system that triages incoming mail and moves qualified leads into the CRM.',
    status: 'live',
    proof: {
      tests: 827,
      evaluation: '10/10',
      properties: [],
    },
    links: {
      demo: null,
      github: null,
      caseStudy: null,
    },
  },
  {
    id: 'p3',
    order: 3,
    title: 'Explainable ATS',
    shortDescription:
      'An applicant tracking system that scores candidates with logic you can read back and audit.',
    status: 'demo-pending',
    proof: {
      tests: 315,
      evaluation: null,
      properties: ['Deterministic scoring'],
    },
    links: {
      demo: null,
      github: null,
      caseStudy: null,
    },
  },
] as const

/** Human-readable labels for each status, for use in UI. */
export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  live: 'Live',
  'demo-pending': 'Demo pending',
}

export function getProject(id: ProjectId): Project | undefined {
  return PROJECTS.find((project) => project.id === id)
}

export function isProjectId(value: string): value is ProjectId {
  return PROJECTS.some((project) => project.id === value)
}
