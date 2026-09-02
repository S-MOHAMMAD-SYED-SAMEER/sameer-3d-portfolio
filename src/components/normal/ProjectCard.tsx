import { Link } from 'react-router-dom'

import { ProjectActions } from '@/components/experience/ProjectActions'
import { PROJECT_STATUS_LABEL, projectActions, type Project } from '@/data/projects'
import { projectRoute } from '@/lib/routes'

/** Enough of the stack to place the project; the rest is on the case study. */
const TAG_LIMIT = 5

/**
 * One project, summarised.
 *
 * The homepage answers "what is this and does it work"; the case study answers
 * "how was it built". Keeping the full write-up here as well meant a reader
 * scrolled three complete case studies before reaching About, and the "Case
 * study" action pointed at content they had already passed.
 *
 * Reads the same `Project` the case study reads, and delegates the buttons to
 * the same `ProjectActions`, so the two views cannot disagree about what a
 * project offers.
 */
export function ProjectCard({ project }: { project: Project }) {
  const shot = project.screenshots[0]
  const tags = project.technologies.slice(0, TAG_LIMIT)
  const rest = project.technologies.length - tags.length
  const hasActions = projectActions(project).length > 0

  return (
    <article className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] sm:gap-8">
      {shot !== undefined && (
        <Link
          to={projectRoute(project.id)}
          tabIndex={-1}
          aria-hidden
          className="border-line hover:border-mist/50 block overflow-hidden rounded-lg border transition-colors duration-200"
        >
          {/* The card's own reader already has the title link; this is the
              same destination, so it is skipped rather than announced twice. */}
          <img
            src={shot.src}
            alt=""
            width={shot.width}
            height={shot.height}
            loading="lazy"
            decoding="async"
            className="block h-auto w-full"
          />
        </Link>
      )}

      <div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="text-mist/70 text-[10px] tracking-[0.3em] uppercase">{project.category}</p>
          <span aria-hidden className="text-mist/30">
            ·
          </span>
          <p className="text-mist/70 text-[10px] tracking-[0.3em] uppercase">
            {PROJECT_STATUS_LABEL[project.status]}
          </p>
        </div>

        <h3 className="mt-2 text-xl leading-snug font-medium sm:text-2xl">
          <Link
            to={projectRoute(project.id)}
            aria-label={`Read the case study for ${project.title}`}
            className="focus-ring hover:text-accent rounded transition-colors duration-200"
          >
            {project.title} <span aria-hidden>→</span>
          </Link>
        </h3>

        <p className="text-mist mt-3 text-sm leading-relaxed">{project.shortDescription}</p>

        {tags.length > 0 && (
          <p className="text-mist/80 mt-4 text-xs">
            {tags.join(' · ')}
            {rest > 0 && <span className="text-mist/50"> · +{rest} more</span>}
          </p>
        )}

        <dl className="border-line mt-5 flex flex-wrap gap-x-8 gap-y-2 border-t pt-4">
          <Stat label="Automated tests" value={project.proof.tests.toLocaleString()} />
          {project.proof.evaluation !== null && (
            <Stat label="Evaluation" value={project.proof.evaluation} />
          )}
        </dl>

        {hasActions && (
          <div className="mt-5">
            <ProjectActions project={project} />
          </div>
        )}
      </div>
    </article>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <dt className="text-mist/60 text-[10px] tracking-[0.2em] uppercase">{label}</dt>
      <dd className="text-base font-medium">{value}</dd>
    </div>
  )
}
