/**
 * The contract between the character's motion and whatever is drawing it.
 *
 * The controller writes to this object every frame; the body reads it.
 * Passing it as a ref rather than as props is deliberate — a walk cycle
 * updating React state sixty times a second would re-render the tree for
 * nothing. It is also the seam a real rigged model plugs into: an
 * animation mixer can drive its clips from exactly these values.
 */

/** The poses the host can hold. One at a time, blended by `gesturePhase`. */
export type CharacterGesture =
  | 'none'
  /** Arm up at the door, two raps. */
  | 'knock'
  /** Open hand toward the visitor. */
  | 'welcome'
  /** Hand toward own chest, while introducing himself. */
  | 'present'
  /** Arm swept out, showing the way in. */
  | 'invite'

export interface CharacterMotionState {
  /** 0 standing, 1 at full walking speed. */
  speed: number
  /** Accumulates with distance travelled. Drives the gait. */
  gait: number
  /** 0 pure silhouette, 1 fully lit and readable. */
  reveal: number
  /** Which pose is playing. */
  gesture: CharacterGesture
  /** 0 to 1 envelope for that pose. */
  gesturePhase: number
  /** Short pulses on each rap. Only meaningful while knocking. */
  knockTap: number
}

export function createCharacterMotionState(): CharacterMotionState {
  return { speed: 0, gait: 0, reveal: 0, gesture: 'none', gesturePhase: 0, knockTap: 0 }
}
