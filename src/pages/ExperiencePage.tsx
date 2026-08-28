import { PlaceholderScene } from '@/components/3d/PlaceholderScene'
import { SceneCanvas } from '@/components/3d/SceneCanvas'
import { ModeSwitch } from '@/components/navigation/ModeSwitch'

/**
 * Owns the 3D experience. The Canvas lives only here, so navigating away
 * unmounts it and releases the WebGL context.
 *
 * The world itself is not built yet — this renders a placeholder scene.
 */
export function ExperiencePage() {
  return (
    <main className="bg-void relative h-dvh w-full overflow-hidden">
      <SceneCanvas>
        <PlaceholderScene />
      </SceneCanvas>

      {/* DOM overlay. Kept entirely outside the Canvas tree. */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6 sm:p-8">
        <header className="flex items-start justify-between gap-4">
          <p className="text-mist text-xs tracking-[0.3em] uppercase">3D Experience</p>
          <div className="pointer-events-auto">
            <ModeSwitch />
          </div>
        </header>

        <p className="text-mist/70 text-xs tracking-wide">
          Placeholder scene — the environment is built in a later phase.
        </p>
      </div>
    </main>
  )
}
