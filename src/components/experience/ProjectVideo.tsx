import type { ProjectVideo as ProjectVideoData } from '@/data/projects'

/**
 * A recorded demo of the project actually running.
 *
 * The video counterpart of `ProjectEvidence`: a real capture, played back
 * with the browser's own controls — never a stand-in for `interactiveDemo`,
 * which is a separate, in-browser reproduction of the system rather than a
 * recording.
 *
 * Plain `<video>` rather than a hosted-embed player: there is no tracking
 * script and no player chrome to reconcile with the rest of the page. The file
 * is served from this site's own `public/`, or (the Sales-Recovery demo) from
 * the main portfolio's deployment, which is the same owner's static hosting
 * and not a third-party player. A file from another origin needs `crossOrigin`
 * for its captions track to load, and the portfolio sends the matching CORS
 * header for `/videos/*`. `preload="metadata"` matters here for the same reason
 * `loading="lazy"` matters on `ProjectEvidence` — the file is only fetched
 * once a visitor opens the project that owns it.
 *
 * Renders nothing when no video has been captured yet.
 */
const isAbsolute = (url: string) => /^https?:\/\//.test(url)

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
        playsInline
        preload="metadata"
        crossOrigin={isAbsolute(video.src) ? 'anonymous' : undefined}
        aria-label={video.caption}
        className="border-line block h-auto w-full overflow-hidden rounded-lg border"
      >
        {video.captions !== undefined && (
          <track kind="captions" src={video.captions} srcLang="en" label="English" default />
        )}
      </video>
      <p className="text-mist mt-2 text-xs leading-relaxed">{video.caption}</p>
    </div>
  )
}
