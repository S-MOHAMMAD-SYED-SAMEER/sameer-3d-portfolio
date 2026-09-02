import { Link, useLocation } from 'react-router-dom'

import { projectActions, type Project, type ProjectAction } from '@/data/projects'
import { ROUTES } from '@/lib/routes'
import { cn } from '@/lib/cn'

const PRIMARY_ACTION_CLASS = cn(
  'focus-ring bg-accent text-void inline-flex items-center gap-2 rounded-full',
  'px-5 py-2.5 text-sm font-medium tracking-wide transition-colors duration-200',
  'hover:bg-accent/85',
)

const SECONDARY_ACTION_CLASS = 'focus-ring text-accent rounded text-sm hover:underline'

/**
 * Whether this action navigates in place rather than opening a tab.
 *
 * Only the interactive demo does. Every other action keeps exactly the
 * behaviour it had before the demo existed — including the case study, which
 * is same-origin and still opens in a new tab, because that was a deliberate
 * choice made for the 3D journey and it is not this feature's business to
 * revisit it.
 *
 * The demo is the exception because it is a destination a visitor is expected
 * to come back from, and inside the 3D route even it opens a tab: navigating
 * away there unmounts the scene and loses the visitor's place.
 */
function navigatesInPlace(action: ProjectAction, insideExperience: boolean): boolean {
  return action.id === 'interactiveDemo' && !action.external && !insideExperience
}

/**
 * What a visitor can actually do with a project.
 *
 * Renders only the links that exist — a project with no URLs produces no
 * buttons rather than dead ones — and says plainly when the demo needs an
 * account instead of implying it is open.
 *
 * The live demo is the prominent action because it is the one that shows the
 * work running; source and write-up sit beside it as quiet links.
 */
export function ProjectActions({ project }: { project: Project }) {
  const actions = projectActions(project)
  const access = project.access
  const { pathname } = useLocation()

  /*
   * Inside the 3D experience every action opens a new tab, including the
   * same-origin ones: navigating away mid-visit unmounts the scene and drops
   * the visitor's place in the journey. See `navigatesInPlace` for which
   * action is allowed to behave differently outside it, and why only that one.
   */
  const insideExperience = pathname === ROUTES.experience

  // The interactive demo leads when there is one: it is the thing that shows
  // the work running. Otherwise the deployed instance keeps the position it
  // had, so nothing changes for a project without a demo.
  const demo =
    actions.find((action) => action.id === 'interactiveDemo') ??
    actions.find((action) => action.id === 'demo')
  const rest = actions.filter((action) => action !== demo)

  const needsSignIn = demo !== undefined && access?.kind === 'sign-in-required'
  const hasPublicLogin = demo !== undefined && access?.kind === 'public-demo'

  if (actions.length === 0) return null

  return (
    <div>
      {needsSignIn && (
        <div className="mb-4">
          <p className="text-mist/70 text-[10px] tracking-[0.3em] uppercase">Demo access</p>
          <p className="text-mist mt-2 text-sm leading-relaxed">
            {access.note ?? 'This project requires sign-in.'}
          </p>
        </div>
      )}

      {hasPublicLogin && (
        <div className="border-line mb-4 rounded-lg border p-3">
          <p className="text-mist/70 text-[10px] tracking-[0.3em] uppercase">Demo account</p>
          {access.note !== undefined && (
            <p className="text-mist mt-2 text-xs leading-relaxed">{access.note}</p>
          )}
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-xs">
            <dt className="text-mist/60">user</dt>
            <dd className="text-chalk break-all">{access.username}</dd>
            <dt className="text-mist/60">pass</dt>
            <dd className="text-chalk break-all">{access.password}</dd>
          </dl>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        {demo !== undefined &&
          (navigatesInPlace(demo, insideExperience) ? (
            <Link
              to={demo.href}
              aria-label={demo.accessibleName}
              className={cn(PRIMARY_ACTION_CLASS)}
            >
              {demo.label} →
            </Link>
          ) : (
            <a
              href={demo.href}
              target="_blank"
              rel={demo.external ? 'noreferrer noopener' : undefined}
              aria-label={demo.accessibleName}
              className={cn(PRIMARY_ACTION_CLASS)}
            >
              {demo.label} →
            </a>
          ))}

        {rest.map((action) =>
          navigatesInPlace(action, insideExperience) ? (
            <Link
              key={action.id}
              to={action.href}
              aria-label={action.accessibleName}
              className={SECONDARY_ACTION_CLASS}
            >
              {action.label} →
            </Link>
          ) : (
            <a
              key={action.id}
              href={action.href}
              target="_blank"
              rel={action.external ? 'noreferrer noopener' : undefined}
              aria-label={action.accessibleName}
              className={SECONDARY_ACTION_CLASS}
            >
              {action.label} →
            </a>
          ),
        )}
      </div>
    </div>
  )
}
