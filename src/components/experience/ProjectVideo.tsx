import { useEffect, useRef } from 'react'

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
 * header for `/videos/*`. `preload="none"` matters here for the same reason
 * `loading="lazy"` matters on `ProjectEvidence` — nothing but the poster is
 * fetched until a visitor presses play. The video starts muted (the narration
 * is one press of the volume control away), and the frame is a fixed 16:9 box
 * so nothing jumps when the file arrives.
 *
 * The captions track is available but OFF at first: it carries the full spoken
 * text, and short captions are already burned into the picture, so showing both
 * would put two sets of captions on screen. It has no `default` attribute, and
 * the text track mode is set to "hidden" on mount so a browser that turns
 * captions on by itself (a viewer's system setting, some browsers' auto
 * selection) does not either. It stays in the player's captions menu, and a
 * viewer who turns CC on gets the full text.
 *
 * Renders nothing when no video has been captured yet.
 */
const isAbsolute = (url: string) => /^https?:\/\//.test(url)

export function ProjectVideo({ video }: { video: ProjectVideoData | undefined }) {
  const player = useRef<HTMLVideoElement>(null)

  // Hidden, not showing, until the viewer turns captions on. Re-applied when a
  // track is added after mount; a track the viewer switches on is not "added",
  // so their choice is never overridden.
  useEffect(() => {
    const element = player.current
    if (element === null) return
    const hide = () => {
      for (const track of Array.from(element.textTracks)) {
        if (track.mode !== 'hidden') track.mode = 'hidden'
      }
    }
    hide()
    element.textTracks.addEventListener('addtrack', hide)
    return () => element.textTracks.removeEventListener('addtrack', hide)
  }, [video])

  if (video === undefined) return null

  return (
    <div>
      <video
        ref={player}
        src={video.src}
        poster={video.poster}
        width={video.width}
        height={video.height}
        controls
        playsInline
        muted
        preload="none"
        crossOrigin={isAbsolute(video.src) ? 'anonymous' : undefined}
        aria-label={video.caption}
        className="border-line block aspect-video h-auto w-full overflow-hidden rounded-lg border"
      >
        {video.captions !== undefined && (
          <track kind="captions" src={video.captions} srcLang="en" label="English" />
        )}
      </video>
      <p className="text-mist mt-2 text-xs leading-relaxed">
        {video.caption}
        {video.detail !== undefined && <span className="mt-2 block">{video.detail}</span>}
      </p>
    </div>
  )
}
