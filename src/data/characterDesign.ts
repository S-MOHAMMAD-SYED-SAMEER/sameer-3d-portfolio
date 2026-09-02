/**
 * The host's proportions, in metres, for a figure standing 1.78m.
 *
 * Real human proportions with the joints a walk actually needs — knees and
 * elbows, not single capsules. The stylisation is in the low segment counts
 * and the simplified masses, not in the skeleton; that is what keeps it from
 * reading as either a mannequin or a mascot.
 *
 * Plain data so a rigged GLB can replace the body behind the same seam.
 */
export const FIGURE = {
  hipY: 0.94,
  legSpread: 0.1,

  thighLength: 0.44,
  thighTop: 0.088,
  thighBottom: 0.068,

  shinLength: 0.41,
  shinTop: 0.066,
  shinBottom: 0.052,

  footLength: 0.27,
  footHeight: 0.085,
  footWidth: 0.105,

  /** Pelvis sits at the hips; the jacket starts just above it. */
  pelvisHeight: 0.19,
  /** Hips are as wide as the outside of the thighs, and widest low down. */
  pelvisRadius: 0.174,

  torsoLength: 0.46,
  torsoShoulder: 0.188,
  torsoWaist: 0.148,
  /**
   * Chest depth as a fraction of its width. Too flat and the figure reads as
   * a board seen edge-on the moment the camera comes off axis.
   */
  torsoDepth: 0.72,

  shoulderHalfWidth: 0.178,
  /** The joint sits below the top of the yoke, so the deltoid tucks under
   * it rather than standing above it like an epaulette. */
  shoulderDrop: 0.05,

  upperArmLength: 0.29,
  upperArmTop: 0.056,
  upperArmBottom: 0.047,

  forearmLength: 0.27,
  forearmTop: 0.047,
  forearmBottom: 0.039,

  /**
   * Wrist to fingertip. A hand that stops at the wrist-plus-a-ball leaves
   * the arm looking amputated: on a 1.78m figure the fingertips reach
   * mid-thigh, and this is the length that puts them there.
   */
  handLength: 0.17,

  /** Caps over the joints. Without these the limbs read as detached rods. */
  deltoidRadius: 0.062,
  elbowRadius: 0.05,
  kneeRadius: 0.063,
  jawRadius: 0.082,
  earRadius: 0.026,

  neckRadius: 0.056,
  neckLength: 0.075,

  headRadius: 0.101,
  /** A head is taller than it is wide, and narrower than it is deep. */
  headScale: [0.94, 1.14, 1.02] as const,
  hairRadius: 0.108,

  /**
   * Face structure. Every one of these is small on purpose: at the closest
   * camera the head is about forty pixels tall, so they read as shading
   * breaks across brow, nose and mouth rather than as features. Modelling
   * eyes at this scale buys nothing and lands squarely in the uncanny.
   */
  browRadius: 0.036,
  noseRadius: 0.026,
  noseTipRadius: 0.0155,
  mouthWidth: 0.037,
  chinRadius: 0.031,

  /** Wrist and fingers, so the hand is not one lump. */
  wristRadius: 0.034,
  fingerRadius: 0.042,
} as const

/** Heights derived once, so nothing has to re-add the skeleton by hand. */
export const FIGURE_JOINTS = {
  hipY: FIGURE.hipY,
  kneeY: -FIGURE.thighLength,
  ankleY: -FIGURE.thighLength - FIGURE.shinLength,
  /** Relative to the hips. */
  chestY: FIGURE.pelvisHeight * 0.55,
  shoulderY: FIGURE.pelvisHeight * 0.55 + FIGURE.torsoLength - FIGURE.shoulderDrop,
  elbowY: -FIGURE.upperArmLength,
  wristY: -FIGURE.forearmLength,
} as const

export const FIGURE_MOTION = {
  /**
   * Swing sized against the stride the journey actually walks, so the feet
   * roughly keep up with the ground instead of skating over it.
   */
  hipSwing: 0.75,
  kneeBend: 1.05,
  shoulderSwing: 0.4,
  elbowBend: 0.5,
  /** Arms rest a little off the body rather than clipping through it. */
  armRest: 0.07,
  /** Standing still is never perfectly still. */
  breathAmplitude: 0.007,
  breathSpeed: 0.85,
  swayAmplitude: 0.022,
  swaySpeed: 0.31,
  knockRap: 0.26,
  /** Idle is never perfectly still: the head drifts, slowly. */
  headDrift: 0.09,
  headDriftSpeed: 0.23,

  /**
   * Standing posture. A relaxed arm is not a straight one: the elbow keeps a
   * little flexion and the shoulder sits a touch forward of the seam. Without
   * these the figure stands to attention, which is the single thing that most
   * makes a procedural body read as a mannequin.
   *
   * All of it is scaled by how still and how ungesturing the host is, so a
   * walk and a gesture each take the arm cleanly off idle.
   */
  idleShoulderX: -0.06,
  idleElbowX: -0.19,
  /** The arms drift very slightly, out of phase with the breath. */
  idleArmSway: 0.032,
  idleArmSwaySpeed: 0.26,
  /** Feet turn out a few degrees; parallel feet read as a shop dummy. */
  footToeOut: 0.1,
} as const

/**
 * One pose per gesture, blended in by `gesturePhase`.
 *
 * Angles are for the gesturing (right) arm; `shoulderZ` is abduction, away
 * from the body. Kept as data so a rigged model can map the same set onto
 * real animation clips.
 */
/**
 * How fast one gesture's pose gives way to the next.
 *
 * Two held gestures back to back — welcome into present into invite — leave
 * `gesturePhase` pinned at 1, so without this the arm would change pose in a
 * single frame. Blending the pose itself is what removes that snap while
 * leaving the gesture contract exactly as it was.
 */
export const GESTURE_BLEND_LAMBDA = 9

/**
 * A held pose is a beat, not a state.
 *
 * It arrives, stays for a moment, and then gives the arm back. Without the
 * release the host stands with his hand out for as long as the visitor takes
 * to read the line — which in Controlled mode, where nothing advances until
 * they say so, is indefinitely.
 *
 * Seconds for the hold; the other two are damping rates, so a gesture that
 * arrives mid-release eases across rather than snapping to the new pose.
 */
export const GESTURE_BEAT = {
  /* Long enough to carry the longest line in the script, so the arm never
     drops out from under the words it belongs to. */
  seconds: 4.5,
  riseLambda: 2.6,
  releaseLambda: 2.2,
} as const

export const GESTURE_POSE = {
  knock: { shoulderX: -1.15, shoulderZ: 0.05, elbowX: -1.05, torsoY: 0, headY: 0 },
  welcome: { shoulderX: -0.5, shoulderZ: 0.5, elbowX: -0.62, torsoY: 0.12, headY: 0.05 },
  present: { shoulderX: -0.6, shoulderZ: 0.1, elbowX: -1.6, torsoY: 0.05, headY: 0 },
  invite: { shoulderX: -0.45, shoulderZ: 0.95, elbowX: -0.3, torsoY: -0.22, headY: -0.34 },
} as const

/**
 * Dark neutral tailoring that sits inside the hall's palette. The figure is
 * read by silhouette most of the time, so the cloth is separated by value
 * rather than by colour.
 */
export const FIGURE_PALETTE = {
  jacket: '#1b1f27',
  /** Reads down the open front of the jacket, not only at the collar. */
  shirt: '#2a3040',
  trousers: '#15171c',
  shoes: '#0a0b0e',
  hair: '#141519',
  skin: '#6d5849',
  /** A shade under the skin: enough to find the mouth, never a drawn line. */
  mouth: '#4e3d33',
} as const

/**
 * Roughness per material. Cloth, skin and leather catch the hall's light
 * differently, and at a distance where no texture would survive that
 * difference is most of what separates them.
 */
export const FIGURE_FINISH = {
  jacket: 0.74,
  shirt: 0.66,
  trousers: 0.86,
  shoes: 0.42,
  hair: 0.92,
  skin: 0.84,
} as const

/** Warm and dim: enough to find the form, never a spotlight. */
export const CHARACTER_PALETTE = {
  revealLight: '#ffd9ae',
  revealIntensity: 20,
  revealDistance: 5.5,
  revealOffset: [0.5, 1.5, 1.25] as const,
} as const
