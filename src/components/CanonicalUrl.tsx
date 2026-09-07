import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Keeps `<link rel="canonical">` and `og:url` pointing at the route that is
 * actually open.
 *
 * This is a single HTML shell rewritten to every path, so a canonical baked
 * into `index.html` would be the same on all six routes — which is not a
 * missing optimisation but an active error: it would declare `/normal`, `/3d`
 * and every project page to be duplicates of the landing page, and ask search
 * engines to drop them. Either the tag is per route or it should not exist,
 * so it is written here and nowhere else.
 *
 * The origin is the deployment recorded in the README. It is a constant rather
 * than `window.location.origin` because a canonical has to name the address
 * the page should be indexed under, not whichever host happens to be serving
 * it — a preview deployment must still point at production.
 */
const SITE_ORIGIN = 'https://sameer-3d-portfolio-amber.vercel.app'

function head<E extends HTMLElement>(selector: string, create: () => E): E {
  const existing = document.head.querySelector<E>(selector)
  if (existing !== null) return existing

  const created = create()
  document.head.append(created)
  return created
}

export function CanonicalUrl() {
  const { pathname } = useLocation()

  useEffect(() => {
    const url = SITE_ORIGIN + pathname

    head<HTMLLinkElement>('link[rel="canonical"]', () => {
      const link = document.createElement('link')
      link.rel = 'canonical'
      return link
    }).href = url

    head<HTMLMetaElement>('meta[property="og:url"]', () => {
      const meta = document.createElement('meta')
      meta.setAttribute('property', 'og:url')
      return meta
    }).content = url
  }, [pathname])

  return null
}
