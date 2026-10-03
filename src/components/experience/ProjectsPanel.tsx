import {
  PROJECTS,
  PROJECT_STATUS_LABEL,
  caseStudySections,
  projectById,
  projectActions,
  projectHighlights,
  type Project,
  type ProjectId,
} from '@/data/projects'
import { ProjectActions } from '@/components/experience/ProjectActions'
import { ProjectEvidence } from '@/components/experience/ProjectEvidence'
import { ProjectSlide } from '@/components/experience/ProjectSlide'
import { ProjectVideo } from '@/components/experience/ProjectVideo'
import { cn } from '@/lib/cn'

interface ProjectsPanelProps {
  project: ProjectId | null
  highlighted: ProjectId | null
  onSelect: (id: ProjectId) => void
  onHighlight: (id: ProjectId | null) => void
  /** Returns from a selected project to the list — `ProjectSlide`'s own
      "Back to projects" control. */
  onBack: () => void
  /** Moves the selected project by one; clamped at both ends — `ProjectSlide`'s
      own Previous/Next controls. */
  onStep: (direction: 1 | -1) => void
}

/**
 * Projects: a list of systems, and the case study behind one of them.
 *
 * Two views in one component because they are one destination — the list is
 * an index of what is on the screens, and selecting an entry is stepping
 * closer to read it. The projector screen is landscape, so the index is a
 * two-column grid of compact cards rather than one tall column of rows —
 * all six still read at a glance, without scrolling further than the panel
 * itself already allows for.
 */
export function ProjectsPanel({
  project,
  highlighted,
  onSelect,
  onHighlight,
  onBack,
  onStep,
}: ProjectsPanelProps) {
  const selected = project === null ? undefined : projectById(project)

  if (selected !== undefined) {
    return <ProjectSlide project={selected} onBack={onBack} onStep={onStep} />
  }

  return (
    <ul className="grid min-h-0 flex-1 auto-rows-min grid-cols-1 gap-3 overflow-y-auto px-5 py-5 sm:grid-cols-2">
      {PROJECTS.map((entry) => (
        <li key={entry.id}>
          <button
            type="button"
            onClick={() => onSelect(entry.id)}
            onMouseEnter={() => onHighlight(entry.id)}
            onMouseLeave={() => onHighlight(null)}
            onFocus={() => onHighlight(entry.id)}
            onBlur={() => onHighlight(null)}
            aria-label={`Inspect ${entry.title}`}
            className={cn(
              'focus-ring group border-line block h-full w-full rounded-lg border px-4 py-4 text-left transition-colors duration-200',
              entry.id === highlighted ? 'bg-surface/50' : 'hover:bg-surface/40',
            )}
          >
            <p className="text-mist/70 text-[10px] tracking-[0.3em] uppercase">
              {entry.category}
            </p>
            <h3 className="mt-1.5 text-sm leading-snug font-medium">{entry.title}</h3>
            <p className="text-mist mt-2 line-clamp-2 text-xs leading-relaxed">
              {entry.shortDescription}
            </p>

            <div className="text-mist/80 mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
              {projectHighlights(entry).map((highlight) => (
                <span key={highlight}>{highlight}</span>
              ))}
            </div>

            <span className="text-accent mt-3 inline-block text-xs">Inspect →</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

/**
 * The long-form write-up, kept here and exported rather than deleted: it
 * has no caller now that the selected-project view renders `ProjectSlide`
 * instead, but its fate (reuse, or retire in favour of `ProjectArticle`'s
 * own rendering of the same data) is an open question for a later phase,
 * not this one. `export` only so the compiler's unused-code check doesn't
 * force a decision that hasn't been made yet.
 */
export function CaseStudy({ project, onBack }: { project: Project; onBack: () => void }) {
  const sections = caseStudySections(project)
  // No links means no actions block, and no rule introducing one.
  const hasActions = projectActions(project).length > 0

  return (
    <article>
      <button
        type="button"
        onClick={onBack}
        className="focus-ring text-mist hover:text-chalk -mx-1 rounded px-1 text-xs tracking-wide transition-colors"
      >
        ← Back to projects
      </button>

      <p className="text-mist/70 mt-5 text-[10px] tracking-[0.3em] uppercase">
        {project.category}
      </p>
      <h3 className="mt-1.5 text-xl leading-snug font-medium">{project.title}</h3>
      <p className="text-mist mt-3 text-sm leading-relaxed">{project.shortDescription}</p>

      <Rule />

      {/* Proof leads, because it is the part that is actually recorded. */}
      <Section title="Proof">
        <dl className="flex flex-wrap gap-x-8 gap-y-3">
          <Stat label="Automated tests" value={project.proof.tests.toLocaleString()} />
          {project.proof.evaluation !== null && (
            <Stat label="Evaluation" value={project.proof.evaluation} />
          )}
          <Stat label="Status" value={PROJECT_STATUS_LABEL[project.status]} />
        </dl>

        {project.proof.properties.length > 0 && (
          <ul className="mt-4 space-y-1">
            {project.proof.properties.map((property) => (
              <li key={property} className="text-mist flex gap-2 text-xs leading-relaxed">
                <span aria-hidden className="text-accent/70">
                  —
                </span>
                {property}
              </li>
            ))}
          </ul>
        )}
      </Section>

      {(project.screenshots.length > 0 || project.video !== undefined) && (
        <>
          <Rule />
          <Section title="Evidence">
            <div className="space-y-5">
              <ProjectVideo video={project.video} />
              <ProjectEvidence shots={project.screenshots} />
            </div>
          </Section>
        </>
      )}

      {sections.map((section) => (
        <div key={section.id}>
          <Rule />
          <Section title={section.title}>
            {typeof section.body === 'string' ? (
              <p className="text-mist text-sm leading-relaxed">{section.body}</p>
            ) : (
              <ul className="space-y-1.5">
                {section.body.map((line) => (
                  <li key={line} className="text-mist flex gap-2 text-sm leading-relaxed">
                    <span aria-hidden className="text-accent/70">
                      —
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>
      ))}

      {project.technologies.length > 0 && (
        <>
          <Rule />
          <Section title="Technology">
            <p className="text-mist text-sm leading-relaxed">
              {project.technologies.join(' · ')}
            </p>
          </Section>
        </>
      )}

      {hasActions && (
        <>
          <Rule />
          <ProjectActions project={project} />
        </>
      )}
    </article>
  )
}

function Rule() {
  return <hr className="border-line my-6" />
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h4 className="text-mist/70 mb-3 text-[10px] tracking-[0.3em] uppercase">{title}</h4>
      {children}
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-mist/60 text-[10px] tracking-[0.2em] uppercase">{label}</dt>
      <dd className="mt-1 text-lg font-medium">{value}</dd>
    </div>
  )
}
