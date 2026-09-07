import { ProjectActions } from '@/components/experience/ProjectActions'
import { ProjectEvidence } from '@/components/experience/ProjectEvidence'
import {
  PROJECT_STATUS_LABEL,
  caseStudySections,
  projectActions,
  type Project,
} from '@/data/projects'

/**
 * The long form, used by the per-project case-study route.
 *
 * Overview and proof → evidence → problem → approach → system → engineering →
 * result → technology → actions. The order matches the 3D panel exactly: what
 * it is, what is measured, what it looks like running, how it was built, and
 * only then what the reader can go and do with it.
 */
export function ProjectArticle({ project }: { project: Project }) {
  const sections = caseStudySections(project)
  const hasActions = projectActions(project).length > 0

  return (
    <article>
      <p className="text-mist/70 text-[10px] tracking-[0.3em] uppercase">{project.category}</p>
      <h1 className="mt-2 text-2xl leading-snug font-medium sm:text-3xl">{project.title}</h1>
      <p className="text-mist mt-3 max-w-2xl text-base leading-relaxed">
        {project.shortDescription}
      </p>

      <Block title="Proof">
        <dl className="flex flex-wrap gap-x-10 gap-y-4">
          <Stat label="Automated tests" value={project.proof.tests.toLocaleString()} />
          {project.proof.evaluation !== null && (
            <Stat label="Evaluation" value={project.proof.evaluation} />
          )}
          <Stat label="Status" value={PROJECT_STATUS_LABEL[project.status]} />
        </dl>

        {project.proof.properties.length > 0 && (
          <ul className="mt-5 space-y-1.5">
            {project.proof.properties.map((property) => (
              <li key={property} className="text-mist flex gap-2 text-sm leading-relaxed">
                <span aria-hidden className="text-accent/70">
                  —
                </span>
                {property}
              </li>
            ))}
          </ul>
        )}
      </Block>

      {project.screenshots.length > 0 && (
        <Block title="Evidence">
          {/* Two up on a wide screen; the component itself stays unchanged. */}
          <div className="max-w-3xl">
            <ProjectEvidence shots={project.screenshots} />
          </div>
        </Block>
      )}

      {sections.map((section) => (
        <Block key={section.id} title={section.title}>
          {typeof section.body === 'string' ? (
            <p className="text-mist max-w-2xl text-sm leading-relaxed">{section.body}</p>
          ) : (
            <ul className="max-w-2xl space-y-2">
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
        </Block>
      ))}

      {project.technologies.length > 0 && (
        <Block title="Technology">
          <p className="text-mist max-w-2xl text-sm leading-relaxed">
            {project.technologies.join(' · ')}
          </p>
        </Block>
      )}

      {hasActions && (
        <div className="mt-8">
          <ProjectActions project={project} />
        </div>
      )}
    </article>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-mist/70 mb-3 text-[10px] tracking-[0.3em] uppercase">{title}</h2>
      {children}
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-mist/60 text-[10px] tracking-[0.2em] uppercase">{label}</dt>
      <dd className="mt-1 text-2xl font-medium">{value}</dd>
    </div>
  )
}
