import { ActionLink } from '@/components/ActionLink'
import { PROFILE } from '@/data/profile'
import { ROUTES } from '@/lib/routes'

/**
 * The entry point. Its only job is to name the work and hand the visitor a
 * choice of mode — recruiters take the Normal portfolio, everyone else can
 * take the 3D experience.
 */
export function LandingPage() {
  return (
    <main className="relative min-h-dvh overflow-hidden">
      {/* Single soft light source. Kept as a static gradient — no particles,
          no canvas — so the first paint stays cheap. */}
      <div
        aria-hidden
        className="bg-accent/10 pointer-events-none absolute top-[-30%] left-1/2 h-[70vh] w-[110vw] -translate-x-1/2 rounded-[50%] blur-[140px]"
      />

      <div className="relative mx-auto flex min-h-dvh max-w-5xl flex-col justify-center px-6 py-24 sm:px-10">
        <h1 className="text-display max-w-4xl leading-[0.95] font-semibold tracking-[-0.02em] text-balance">
          {PROFILE.name}
        </h1>

        <div className="mt-8 flex items-center gap-5">
          <span aria-hidden className="bg-accent h-px w-12 shrink-0" />
          <p className="text-mist text-sm font-medium tracking-[0.3em] uppercase sm:text-base">
            {PROFILE.title}
          </p>
        </div>

        <p className="text-mist mt-10 max-w-xl text-base leading-relaxed sm:text-lg">
          {PROFILE.intro}
        </p>

        <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center">
          <ActionLink to={ROUTES.experience}>Enter 3D Experience</ActionLink>
          <ActionLink to={ROUTES.normal} variant="secondary">
            View Normal Portfolio
          </ActionLink>
        </div>
      </div>
    </main>
  )
}
