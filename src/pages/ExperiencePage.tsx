import { useState } from 'react'

import { SceneCanvas } from '@/components/3d/SceneCanvas'
import { EntranceScene } from '@/components/3d/entrance/EntranceScene'
import { EntranceOverlay } from '@/components/experience/EntranceOverlay'
import type { ExperienceStage } from '@/systems/experienceStage'

/**
 * Owns the 3D experience. The Canvas lives only here, so navigating away
 * unmounts it and releases the WebGL context.
 *
 * Stage is the one piece of React state in the experience: it changes on a
 * click, never on a frame, and the camera rig reads it to pick its pose.
 */
export function ExperiencePage() {
  const [stage, setStage] = useState<ExperienceStage>('intro')

  return (
    <main className="bg-void relative h-dvh w-full overflow-hidden">
      <SceneCanvas>
        <EntranceScene stage={stage} />
      </SceneCanvas>

      {/* Fades the first frame in, so the scene never pops. */}
      <div aria-hidden className="experience-veil bg-void pointer-events-none absolute inset-0" />

      <EntranceOverlay stage={stage} onEnter={() => setStage('explore')} />
    </main>
  )
}
