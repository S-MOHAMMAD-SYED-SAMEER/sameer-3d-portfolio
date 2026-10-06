import { PROJECTS, PROJECT_STATUS_LABEL, type Project } from '@/data/projects'
import { ProjectActions } from '@/components/experience/ProjectActions'
import { ProjectEvidence } from '@/components/experience/ProjectEvidence'

interface ProjectSlideProps {
  project: Project
  /** Returns to the project list — `workshop.clearProject`, unchanged. */
  onBack: () => void
  /** Moves the selected project by one; clamped at both ends by the
      existing `clampProjectStep` — `workshop.stepProject`, unchanged. */
  onStep: (direction: 1 | -1) => void
}

/**
 * The projector's own presentation of one project.
 *
 * Deliberately concise — this is a slide, not the case study. `CaseStudy`
 * (in `ProjectsPanel.tsx`) still holds the long-form write-up for now.
 *
 * Laid out for the landscape projector screen: identity, status, the
 * sentence that says what it does and the proof behind it sit in a left
 * column; the evidence, stack and what a visitor can actually do about it
 * sit in a right column beside them, rather than stacked into one long
 * portrait scroll. Only the scrollable area between the header and the
 * navigation footer grows or shrinks with content — Previous/Next, the
 * counter and Back to projects stay in a footer outside that scroll region,
 * so moving between projects never depends on how far a visitor has
 * scrolled. Nothing here comes from `caseStudy` — that prose belongs to the
 * case study, not the slide that points toward it.
 */
export function ProjectSlide({ project, onBack, onStep }: ProjectSlideProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <article className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          <div>
            <p className="text-mist/70 text-[10px] tracking-[0.3em] uppercase">
              {project.category}
            </p>
            <h3 className="mt-1.5 text-xl leading-snug font-medium">{project.title}</h3>

            <dl className="mt-3">
              <dt className="text-mist/60 text-[10px] tracking-[0.2em] uppercase">Status</dt>
              <dd className="mt-1 text-sm font-medium">{PROJECT_STATUS_LABEL[project.status]}</dd>
            </dl>

            <p className="text-mist mt-4 text-sm leading-relaxed">{project.shortDescription}</p>

            <ProjectProof project={project} />
          </div>

          {/* The existing action system: it already knows which links exist
              (GitHub always; the interactive demo only where one is hosted;
              Case Study for every project, external where one was written, the portfolio's own
              `/projects/:id` route otherwise), already renders nothing when
              there is nothing to show, and already opens every external
              action in a new tab because this component lives inside the 3D
              route. None of that is recomputed here. */}
          <div className="space-y-5">
            <ProjectVisualEvidence project={project} />
            <ProjectTechnologies project={project} />
            <ProjectActions project={project} />
          </div>
        </article>
      </div>

      <ProjectNavigation project={project} onBack={onBack} onStep={onStep} />
    </div>
  )
}

/**
 * Previous/Next and the "N / 6" counter, derived from the canonical
 * `PROJECTS` order rather than stored — there is no project-index state
 * anywhere in this component, only a lookup against the same array
 * `clampProjectStep` already uses. `onStep` calls straight into
 * `workshop.stepProject`, which already clamps at both ends; the buttons
 * here only mirror that boundary visually (`disabled`) rather than
 * re-deciding it.
 *
 * "Back to projects" is a separate control from Previous/Next on purpose —
 * leaving the selected project entirely is a different action from moving
 * to a neighbour, and the existing keyboard hierarchy already treats them
 * as separate layers (`ExperiencePage.goBack` only calls `clearProject`,
 * never `stepProject`). Rendered as a footer outside `ProjectSlide`'s
 * scrollable region, so it never requires scrolling to reach.
 */
function ProjectNavigation({
  project,
  onBack,
  onStep,
}: {
  project: Project
  onBack: () => void
  onStep: (direction: 1 | -1) => void
}) {
  const index = PROJECTS.findIndex((entry) => entry.id === project.id)
  // `-1` only if `project` were somehow not in `PROJECTS`, which the
  // `Project` type already rules out — guarded anyway rather than trusting
  // that at a render boundary.
  const position = index === -1 ? null : index + 1
  const isFirst = index <= 0
  const isLast = index === PROJECTS.length - 1
  const previous = isFirst ? null : PROJECTS[index - 1]
  const next = isLast ? null : PROJECTS[index + 1]

  return (
    <nav aria-label="Project navigation" className="border-line shrink-0 border-t px-5 py-4">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onStep(-1)}
          disabled={isFirst}
          aria-label={previous ? `Previous project: ${previous.title}` : 'Previous project'}
          className="focus-ring text-mist hover:text-chalk rounded-full px-3 py-1.5 text-xs font-medium tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-mist"
        >
          ← Previous
        </button>

        {position !== null && (
          <p className="text-mist/60 text-xs tabular-nums">
            {position} / {PROJECTS.length}
          </p>
        )}

        <button
          type="button"
          onClick={() => onStep(1)}
          disabled={isLast}
          aria-label={next ? `Next project: ${next.title}` : 'Next project'}
          className="focus-ring text-mist hover:text-chalk rounded-full px-3 py-1.5 text-xs font-medium tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-mist"
        >
          Next →
        </button>
      </div>

      <button
        type="button"
        onClick={onBack}
        aria-label="Back to the project list"
        className="focus-ring text-mist hover:text-chalk mt-3 rounded text-xs tracking-wide transition-colors"
      >
        ← Back to projects
      </button>
    </nav>
  )
}

/**
 * Real captures of the project actually running — nothing else. The first
 * item in the right column, above Technologies and Actions, so the three
 * read top to bottom as "what it looks like, what it's built with, what you
 * can do with it" — beside, not below, the identity and proof in the left
 * column.
 *
 * p1–p3 have real screenshots; p4–p6 currently have none
 * (`screenshots: []`), and `ProjectEvidence` already renders nothing in
 * that case — including even the "Evidence" label would leave an empty
 * heading floating over nothing, so this wrapper renders nothing at all
 * for those three rather than a labelled empty section or placeholder
 * imagery. The right column still carries Technologies and Actions for
 * those projects, so it is never left empty.
 */
function ProjectVisualEvidence({ project }: { project: Project }) {
  if (project.screenshots.length === 0) return null

  return (
    <section>
      <h4 className="text-mist/60 text-[10px] tracking-[0.2em] uppercase">Evidence</h4>
      <div className="mt-2">
        <ProjectEvidence shots={project.screenshots} />
      </div>
    </section>
  )
}

/**
 * Tests and evaluation are two distinct, verified figures — kept as two
 * separate stats rather than folded into one line, the same distinction
 * `CaseStudy`'s own proof section already draws. `evaluation` stays absent
 * rather than shown as a dash or a zero when a project has none (p3's,
 * p4's and p5's evaluation is `null`): there is nothing to claim, so
 * nothing is claimed.
 *
 * `properties` are real, verified engineering facts — not case-study
 * prose — so they are shown in full rather than cut to an arbitrary count;
 * what keeps the section compact is typography (small text, tight
 * leading), not trimming true content.
 */
function ProjectProof({ project }: { project: Project }) {
  const { tests, evaluation, properties } = project.proof

  return (
    <section className="mt-5">
      <h4 className="text-mist/60 text-[10px] tracking-[0.2em] uppercase">Proof</h4>

      <dl className="mt-2 flex flex-wrap gap-x-8 gap-y-3">
        <div>
          <dt className="text-mist/60 text-[10px] tracking-[0.2em] uppercase">Tests</dt>
          <dd className="mt-1 text-sm font-medium">{tests.toLocaleString()}</dd>
        </div>
        {evaluation !== null && (
          <div>
            <dt className="text-mist/60 text-[10px] tracking-[0.2em] uppercase">Evaluation</dt>
            <dd className="mt-1 text-sm font-medium">{evaluation}</dd>
          </div>
        )}
      </dl>

      {properties.length > 0 && (
        <ul className="mt-4 space-y-1">
          {properties.map((property) => (
            <li key={property} className="text-mist flex gap-2 text-xs leading-relaxed">
              <span aria-hidden className="text-accent/70">
                —
              </span>
              {property}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/**
 * The stack, as plain tags rather than the prose-joined line `CaseStudy`
 * uses — a projector slide is read at a glance, and a row of short chips
 * scans faster than a comma-separated sentence. `flex-wrap` is what keeps a
 * long stack (p1 has eight entries, p6 has ten) from forcing the column
 * wider instead of taller.
 */
function ProjectTechnologies({ project }: { project: Project }) {
  if (project.technologies.length === 0) return null

  return (
    <section>
      <h4 className="text-mist/60 text-[10px] tracking-[0.2em] uppercase">Technologies</h4>
      <ul className="mt-2 flex flex-wrap gap-2">
        {project.technologies.map((technology) => (
          <li
            key={technology}
            className="border-line text-mist rounded-full border px-2.5 py-1 text-[11px] leading-none"
          >
            {technology}
          </li>
        ))}
      </ul>
    </section>
  )
}
