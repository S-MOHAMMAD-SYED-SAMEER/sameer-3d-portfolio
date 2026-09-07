/**
 * Shown while the 3D chunk is on its way down.
 *
 * Three.js and the R3F runtime are the one genuinely large download in this
 * application, and on a slow connection the visitor would otherwise sit on a
 * black screen with nothing to tell them the click registered.
 *
 * It does not appear at all on a fast connection: the fade is delayed, so a
 * chunk that arrives quickly swaps straight to the scene and this never
 * paints. That is the point — a spinner that flashes for 80ms reads as jank,
 * not as feedback.
 *
 * Same restraint as everything else: a tracked line on the same dark ground,
 * no spinner, no progress bar it could not honestly fill in.
 */
export function ExperienceLoading({ label = 'Entering experience' }: { label?: string }) {
  return (
    <div className="bg-void relative flex h-dvh w-full items-center justify-center">
      <p
        role="status"
        className="experience-loading text-mist text-[11px] tracking-[0.4em] uppercase"
      >
        {label}
      </p>
    </div>
  )
}
