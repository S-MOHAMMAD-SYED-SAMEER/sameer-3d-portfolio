import { ModeSwitch } from '@/components/navigation/ModeSwitch'
import { PROFILE } from '@/data/profile'

/**
 * The fast, traditional portfolio. Only the shell exists in Phase 1 — the
 * sections are built in a later phase from `src/data`.
 */
export function NormalPortfolioPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col px-6 py-8 sm:px-10">
      <header className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold tracking-[0.2em]">{PROFILE.name}</p>
        <ModeSwitch />
      </header>

      <div className="flex flex-1 flex-col justify-center py-20">
        <p className="text-mist text-xs tracking-[0.3em] uppercase">Normal Portfolio</p>
        <p className="text-mist mt-6 max-w-lg text-base leading-relaxed">
          The shell is in place. Sections are built in a later phase.
        </p>
      </div>
    </main>
  )
}
