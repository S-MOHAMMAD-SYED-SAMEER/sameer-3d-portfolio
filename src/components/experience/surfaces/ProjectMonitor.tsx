import { SceneSurface } from '@/components/experience/surfaces/SceneSurface'
import { outcomeLine, projectActions, type Project, type ProjectAction } from '@/data/projects'
import type { SurfaceId } from '@/data/surfaces'
import { cn } from '@/lib/cn'

interface ProjectMonitorProps {
  surface: SurfaceId
  project: Project
  /** This monitor is the one being read: the camera is on it and it shows more. */
  focused: boolean
  onSelect: (project: Project) => void
}

/** The wording on a monitor, which is shorter than the labels on the flat panel. */
const LINK_LABEL: Record<ProjectAction['id'], string> = {
  interactiveDemo: 'Try demo',
  caseStudy: 'Open case study',
  github: 'GitHub',
}

/**
 * One project, on one of the three monitors.
 *
 * Overview: title, the one-line outcome, the test count and the two main links, at a size that reads
 * on a screen a third of the frame wide. Focused: the camera is on this monitor, so it can say more.
 */
export function ProjectMonitor({ surface, project, focused, onSelect }: ProjectMonitorProps) {
  const actions = projectActions(project)
  // Demo and case study lead; the source link joins them once the monitor is being read.
  const shown = focused ? actions : actions.filter((action) => action.id !== 'github')

  return (
    <SceneSurface id={surface} label={`Project: ${project.title}`} className="bg-[#0b0e13]">
      <div
        className={cn(
          'flex h-full flex-col p-3.5',
          !focused && 'hover:bg-surface/40 cursor-pointer transition-colors duration-200',
        )}
        onClick={focused ? undefined : () => onSelect(project)}
      >
        <h3 className="m-0">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onSelect(project)
            }}
            aria-label={`Look closely at ${project.title}`}
            aria-pressed={focused}
            className={cn(
              'focus-ring block w-full text-left font-semibold',
              focused ? 'text-[24px] leading-[28px]' : 'line-clamp-2 text-[23px] leading-[27px]',
            )}
          >
            {project.title}
          </button>
        </h3>

        {focused && (
          <p className="text-mist m-0 mt-1.5 line-clamp-3 text-[16px] leading-[21px]">
            {project.shortDescription}
          </p>
        )}

        <p
          className={cn(
            'text-mist m-0',
            focused ? 'mt-2 text-[16px] leading-[21px]' : 'mt-2 line-clamp-2 text-[20px] leading-[25px]',
          )}
        >
          {outcomeLine(project)}
        </p>

        <div className="mt-auto">
          <p
            className={cn(
              'text-accent m-0 font-medium',
              focused ? 'text-[16px] leading-[21px]' : 'text-[20px] leading-[25px]',
            )}
          >
            {project.proof.tests.toLocaleString()} automated tests
          </p>

          <div
            className={cn(
              'mt-1.5 flex flex-wrap items-baseline gap-x-4 gap-y-0.5',
              focused ? 'text-[16px] leading-[22px]' : 'text-[20px] leading-[27px]',
            )}
            onClick={(event) => event.stopPropagation()}
          >
            {shown.map((action) => (
              <a
                key={action.id}
                href={action.href}
                target="_blank"
                rel={action.external ? 'noreferrer noopener' : undefined}
                aria-label={action.accessibleName}
                className="focus-ring text-chalk hover:text-accent underline decoration-white/30 underline-offset-4"
              >
                {LINK_LABEL[action.id]} →
              </a>
            ))}
          </div>
        </div>
      </div>
    </SceneSurface>
  )
}
