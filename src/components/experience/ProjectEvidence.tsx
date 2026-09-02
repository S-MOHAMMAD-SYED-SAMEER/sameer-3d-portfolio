import type { ProjectShot } from '@/data/projects'

/**
 * Screenshots of the project actually running.
 *
 * A vertical stack rather than a carousel: there are one or two of these per
 * project, and a control that hides evidence behind a swipe is worse than
 * simply showing it. Each frame is a link to the full-size capture, because a
 * dense dashboard shrunk into a 26rem column is legible as a shape but not as
 * text — the caption carries the meaning at panel size, the link carries the
 * detail for anyone who wants it.
 *
 * `loading="lazy"` matters here: the files are only fetched once a visitor
 * opens the project that owns them, so the room, the journey and the other two
 * projects never pay for them.
 */
export function ProjectEvidence({ shots }: { shots: readonly ProjectShot[] }) {
  if (shots.length === 0) return null

  return (
    <ul className="space-y-5">
      {shots.map((shot) => (
        <li key={shot.src}>
          <a
            href={shot.src}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`Open the full-size screenshot: ${shot.caption}`}
            className="focus-ring border-line hover:border-mist/50 block overflow-hidden rounded-lg border transition-colors duration-200"
          >
            <img
              src={shot.src}
              alt={shot.alt}
              width={shot.width}
              height={shot.height}
              loading="lazy"
              decoding="async"
              // The intrinsic size above reserves the box, so the caption
              // never jumps when the file lands.
              className="block h-auto w-full"
            />
          </a>
          <p className="text-mist mt-2 text-xs leading-relaxed">{shot.caption}</p>
        </li>
      ))}
    </ul>
  )
}
