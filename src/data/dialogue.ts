import { PROFILE } from '@/data/profile'
import type { CharacterGesture } from '@/systems/character'
import type { ExperienceStage } from '@/systems/experienceStage'

/**
 * What the host says, and what he does while he says it.
 *
 * A separate layer from the journey: stages own where he stands and what the
 * camera does, this owns the lines. Adding or cutting a line changes nothing
 * about the stage machine.
 *
 * Scripted, not conversational — this is an introduction, not a chatbot.
 */
export interface DialogueLine {
  text: string
  /** Held while this line is on screen. Falls back to the stage's gesture. */
  gesture?: CharacterGesture
  /** Seconds the line holds in Auto. Long enough to read, without dawdling. */
  hold: number
}

export const STAGE_DIALOGUE: Record<ExperienceStage, readonly DialogueLine[]> = {
  /* The room speaks for itself here. */
  intro: [],

  entrance: [{ text: 'Let me get you inside.', hold: 2.6 }],

  approachDoor: [],

  knock: [],

  knocking: [],

  /* Shown while the door is swinging; the beat is timed, not clicked. */
  doorOpen: [{ text: 'One moment.', hold: 2.4 }],

  /*
   * The introduction, in five beats: greeting, identity, role, what he
   * actually builds, and the way in. One idea per line, so a phone never has
   * to carry a paragraph and the visitor is never held in a conversation.
   *
   * No two consecutive lines share a gesture. The pose envelope restarts when
   * the gesture changes, so a repeat would read as one long hold rather than
   * as two beats — and the speaker is named on the identity line, which is
   * the one the panel keys on.
   */
  welcome: [
    { text: 'Hello. Welcome.', gesture: 'welcome', hold: 2.4 },
    { text: `I'm ${PROFILE.spokenName}.`, gesture: 'present', hold: 2.9 },
    { text: `I'm an ${PROFILE.title}.`, gesture: 'none', hold: 2.6 },
    {
      text: 'I take work that happens by hand and turn it into systems you can test and trust.',
      gesture: 'welcome',
      hold: 4.4,
    },
    { text: "Come in. I'll show you what I build.", gesture: 'invite', hold: 3.2 },
  ],

  /* Nothing. He has shown the visitor in, and the room is the portfolio —
     Projects, Skills, Services, About and Contact carry it from here, so the
     host stops talking and lets them look. */
  workshop: [],
}

/** Named once, on the line where he introduces himself. */
export const SPEAKER_LABEL = PROFILE.name

export function dialogueFor(stage: ExperienceStage): readonly DialogueLine[] {
  return STAGE_DIALOGUE[stage]
}
