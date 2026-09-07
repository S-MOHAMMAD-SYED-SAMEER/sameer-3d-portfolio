import { ProjectCard } from '@/components/normal/ProjectCard'
import { PROJECTS } from '@/data/projects'

/**
 * The three projects, summarised, on the homepage.
 *
 * Each is a card rather than a case study: the homepage exists to say what
 * was built and whether it works, and the full engineering write-up lives on
 * its own route where it can be read and linked on its own.
 *
 * The long form lives in `ProjectArticle`, in its own module. Both read the
 * same `Project`, so there is one project model and one set of renderers; it
 * is a separate file because it is the only thing that reaches the screenshot
 * component, and keeping it here made this page carry that code without ever
 * rendering it.
 */
export function NormalProjects() {
  return (
    <div className="divide-line divide-y">
      {PROJECTS.map((project) => (
        <div key={project.id} className="py-10 first:pt-0 last:pb-0">
          <ProjectCard project={project} />
        </div>
      ))}
    </div>
  )
}
