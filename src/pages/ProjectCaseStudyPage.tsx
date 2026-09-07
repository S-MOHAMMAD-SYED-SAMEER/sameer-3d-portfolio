import { Link, useParams } from 'react-router-dom'

import { ModeSwitch } from '@/components/navigation/ModeSwitch'
import { ProjectArticle } from '@/components/normal/ProjectArticle'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PROFILE } from '@/data/profile'
import { ROUTES } from '@/lib/routes'
import { getProject, isProjectId } from '@/data/projects'

/**
 * One project, on its own shareable URL.
 *
 * This exists because two of the three projects have no published write-up to
 * link to, and pointing "Case study" at a README would be calling something a
 * case study that was never written as one. Rather than invent an external
 * document, the portfolio hosts the case study it already holds the data for.
 *
 * It renders `ProjectArticle` — the same component the Normal portfolio uses,
 * reading the same project data — so there is exactly one case study per
 * project and one renderer for it. Nothing here is a second copy of the prose.
 */
export function ProjectCaseStudyPage() {
  const { id } = useParams()
  const project = id !== undefined && isProjectId(id) ? getProject(id) : undefined

  // An unknown id is a wrong address, not an empty case study.
  if (project === undefined) return <NotFoundPage />

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 sm:px-10">
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <p className="text-sm font-semibold tracking-[0.2em]">{PROFILE.name}</p>
        <ModeSwitch />
      </header>

      <main className="py-16 sm:py-20">
        <Link
          to={`${ROUTES.normal}#projects`}
          className="focus-ring text-mist hover:text-chalk rounded text-xs tracking-wide transition-colors"
        >
          ← All projects
        </Link>

        <p className="text-mist/70 mt-10 text-[10px] tracking-[0.35em] uppercase">Case study</p>

        <div className="mt-6">
          <ProjectArticle project={project} />
        </div>
      </main>

      <footer className="border-line text-mist/60 mt-8 border-t py-10 text-xs">
        {PROFILE.name} — {PROFILE.title}
      </footer>
    </div>
  )
}
