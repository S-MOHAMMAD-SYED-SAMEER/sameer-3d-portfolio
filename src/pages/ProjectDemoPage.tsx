import { Link, useParams } from 'react-router-dom'

import { ModeSwitch } from '@/components/navigation/ModeSwitch'
import { AtsDemo } from '@/demo/p3/AtsDemo'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PROFILE } from '@/data/profile'
import { getProject, isProjectId } from '@/data/projects'
import { projectRoute } from '@/lib/routes'

/**
 * A project's interactive demo, on its own shareable URL.
 *
 * The shell is the case-study page's: same width, same header, same back link,
 * same eyebrow. A demo that arrived looking like a different website would read
 * as an embed of someone else's work, which is the opposite of the point.
 *
 * Two things have to be true before anything renders: the id has to name a
 * project, and that project has to actually have a demo. Both failures are the
 * same kind of mistake — a URL that does not describe anything — so both get
 * the same answer the case study gives a bad id, rather than an empty page
 * apologising for itself.
 */
export function ProjectDemoPage() {
  const { id } = useParams()
  const project = id !== undefined && isProjectId(id) ? getProject(id) : undefined

  if (project === undefined || project.interactiveDemo !== true) return <NotFoundPage />

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 sm:px-10">
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <p className="text-sm font-semibold tracking-[0.2em]">{PROFILE.name}</p>
        <ModeSwitch />
      </header>

      <main className="py-12 sm:py-16">
        <Link
          to={projectRoute(project.id)}
          className="focus-ring text-mist hover:text-chalk rounded text-xs tracking-wide transition-colors"
        >
          ← {project.title} case study
        </Link>

        <p className="text-mist/70 mt-10 text-[10px] tracking-[0.35em] uppercase">
          Interactive demo
        </p>
        <h1 className="mt-3 text-2xl leading-snug font-medium sm:text-3xl">{project.title}</h1>
        <p className="text-mist mt-3 max-w-2xl text-base leading-relaxed">
          {project.shortDescription}
        </p>

        <div className="mt-10">
          {/* Only P3 has a demo, and this is it. When the other two arrive they
              get their own component here rather than a shared renderer built
              before there is anything to share. */}
          <AtsDemo />
        </div>
      </main>
    </div>
  )
}
