import type { ProjectVideo as ProjectVideoData } from '@/data/projects'

/**
 * A recorded demo of the project actually running.
 *
 * The video counterpart of `ProjectEvidence`: a real capture, played back
 * with the browser's own controls — never a stand-in for `interactiveDemo`,
 * which is a separate, live, in-browser reproduction of the system rather
 * than a recording.
 *
 * Plain `<video>` rather than a hosted-embed player: the file is served from
 * this portfolio's own `public/`, so there is no third-party origin to load,
 * no tracking script, and no player chrome to reconcile with the rest of the
 * page. `preload="metadata"` matters here for the same reason
 * `loading="lazy"` matters on `ProjectEvidence` — the file is only fetched
 * once a visitor opens the project that owns it.
 *
 * Renders nothing when no video has been captured yet.
 */
export function ProjectVideo({ video }: { video: ProjectVideoData | undefined }) {
  if (video === undefined) return null

  return (
    <div>
      <video
        src={video.src}
        poster={video.poster}
        width={video.width}
        height={video.height}
        controls
        preload="metadata"
        aria-label={video.caption}
        className="border-line block h-auto w-full overflow-hidden rounded-lg border"
      />
      <p className="text-mist mt-2 text-xs leading-relaxed">{video.caption}</p>
    </div>
  )
}
