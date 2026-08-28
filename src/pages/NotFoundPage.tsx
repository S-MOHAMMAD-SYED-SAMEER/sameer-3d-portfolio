import { ActionLink } from '@/components/ActionLink'
import { ROUTES } from '@/lib/routes'

export function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col justify-center px-6 sm:px-10">
      <p className="text-mist text-xs tracking-[0.3em] uppercase">404</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">Page not found</h1>
      <div className="mt-10">
        <ActionLink to={ROUTES.landing} variant="secondary">
          Back to start
        </ActionLink>
      </div>
    </main>
  )
}
