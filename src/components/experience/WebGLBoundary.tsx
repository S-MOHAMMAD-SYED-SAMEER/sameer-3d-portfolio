import { Component, type ErrorInfo, type ReactNode } from 'react'

import { ActionLink } from '@/components/ActionLink'
import { ROUTES } from '@/lib/routes'

interface WebGLBoundaryProps {
  children: ReactNode
}

interface WebGLBoundaryState {
  failed: boolean
}

/**
 * Can this browser actually give us a context?
 *
 * Asked directly rather than inferred from a thrown error, because the
 * failure does not reliably arrive as one: three logs the refusal and the
 * canvas element is still created, so the visitor would be left looking at
 * the overlay floating over a dead black rectangle. One probe context,
 * released immediately, answers it definitively before anything mounts.
 */
function hasWebGL(): boolean {
  if (typeof document === 'undefined') return true

  try {
    const probe = document.createElement('canvas')
    const gl = probe.getContext('webgl2') ?? probe.getContext('webgl')
    if (gl === null) return false

    // Hand the context straight back; the scene needs it, not us.
    const lose = gl.getExtension('WEBGL_lose_context')
    if (lose !== null) lose.loseContext()
    return true
  } catch {
    return false
  }
}

/**
 * The one place the 3D experience is allowed to fail.
 *
 * A machine with WebGL disabled, a blocked GPU driver, or a browser that has
 * run out of contexts throws while the Canvas is being created. Without a
 * boundary that unmounts the whole route and leaves a blank page — the worst
 * possible outcome, because the visitor came to read a portfolio and there is
 * a complete one on the other route.
 *
 * A class because error boundaries have to be. It holds one boolean and
 * renders a way out; anything more would be a second navigation system.
 */
export class WebGLBoundary extends Component<WebGLBoundaryProps, WebGLBoundaryState> {
  // Asked once, at construction: a device without WebGL never mounts a
  // Canvas at all, rather than mounting one that cannot draw.
  state: WebGLBoundaryState = { failed: !hasWebGL() }

  static getDerivedStateFromError(): WebGLBoundaryState {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Left visible on purpose: a device that cannot start WebGL is worth
    // seeing in the console rather than swallowing.
    console.error('3D experience failed to start:', error, info.componentStack)
  }

  render() {
    if (!this.state.failed) return this.props.children

    return (
      <div className="bg-void flex h-dvh w-full flex-col items-center justify-center px-6 text-center">
        <p className="text-mist/70 text-[10px] tracking-[0.35em] uppercase">3D Experience</p>
        <p className="mt-4 max-w-sm text-lg leading-snug font-medium">
          This device can’t start the 3D experience.
        </p>
        <p className="text-mist mt-3 max-w-sm text-sm leading-relaxed">
          The full portfolio is available without it — same work, same detail.
        </p>
        <ActionLink to={ROUTES.normal} className="mt-7">
          Open the portfolio
        </ActionLink>
      </div>
    )
  }
}
