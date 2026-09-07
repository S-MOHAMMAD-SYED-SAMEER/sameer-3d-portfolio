import { useEffect } from 'react'

import { ActionLink } from '@/components/ActionLink'
import { ROUTES } from '@/lib/routes'

/**
 * Keeps wrong addresses out of the index.
 *
 * Vercel rewrites every path to this one HTML file, so a mistyped URL is
 * served with a 200 and a crawler has no status code telling it the page is
 * not real. `CanonicalUrl` then points the canonical at whatever was typed,
 * which on its own would invite the address to be indexed. `noindex` is the
 * only signal available from inside the page, and it outranks the canonical.
 *
 * This also covers `/projects/<unknown>`, which renders this page rather than
 * an empty case study.
 */
function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.append(meta)

    // Removed on the way out, so a real page reached from here is indexable.
    return () => meta.remove()
  }, [])
}

export function NotFoundPage() {
  useNoIndex()

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
