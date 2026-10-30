import type { ProjectId } from './projects.ts'

/**
 * The results image of each case study: slide 6 of that project's LinkedIn carousel, as WebP.
 *
 * The alt text is the slide's own words, in the slide's own order: the title, each figure with its label, and the
 * limits box that sits under them. The limits are part of the text so that a reader who cannot see the image gets
 * the number and the reason not to over-read it together, exactly as a reader who can see it does.
 */
export interface ResultsImage {
  src: string
  alt: string
  width: number
  height: number
}

const make = (name: string, alt: string): ResultsImage => ({
  src: `/images/${name}-results.webp`,
  alt,
  width: 1080,
  height: 1350,
})

export const RESULTS_IMAGES: Record<ProjectId, ResultsImage> = {
  p1: make('sales-recovery-agent', "AI Customer Support & Sales Recovery. What was measured. 21 / 21 Evaluation on a live model (Gemini 3.5 Flash-Lite). 0 / 83 Clean replies the guardrails blocked (was 2 / 40). 530 / 530 Automated tests passing. Limits: One model, one day, invented data. The first live run scored 18/21; the misses were grader errors. Drafts are AI-labelled; two kinds of claim still get through."),
  p2: make('inbox-crm-agent', "Inbox-to-CRM Agent. What was measured. 0 of 21 Plans with an unsafe action. 12 of 12 Attack emails that reached a person. 10/10 vs 2–4/10 Scripted mock vs real model, full-case passes. Limits: The evaluation plans and does not execute. The attack set is not held out from the detector. One model, ten invented emails, three runs."),
  p3: make('explainable-ats', "Explainable ATS. What was measured. 86.8% Verdicts matching the labels (one run). 0 Scores produced by an AI. 886 Automated tests passing. Limits: Twenty invented CVs, one model. Labels drafted by ChatGPT, reviewed by ChatGPT and Claude, approved by Sameer: not an independent human labelling."),
  p4: make('knowledgeos', "KnowledgeOS. What was measured. 32 of 33 Answers passed the citation check (prompt v2, the default). 12 of 45 Answerable questions got no answer. Limits: One model, one run each. The abstention threshold was calibrated on the same 52 questions it is scored on, so this is in-sample. The questions were written by an AI."),
  p5: make('docintel', "DocIntel. What was measured. 387 of 390 Fields correct on 30 synthetic invoices. 2 of 390 Wrong values not flagged for review. Limits: Synthetic data, one model, one run each. Both unflagged values are on image-only documents. Not an accuracy figure for real invoices."),
  p6: make('voicedesk', "VoiceDesk. What was measured. 10 of 12 Real-model run: task scenarios. 5 of 5 Real-model run: safety-only scenarios. Limits: One run, typed text, fictional salon. A do-nothing receptionist also passes the five safety-only ones. Once it called a taken slot free; once it cancelled before the caller confirmed. Typed text only. Voice and phone are not connected yet."),
}
