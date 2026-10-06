import { testsLabel } from './projects.ts'

/**
 * What gets built for other people.
 *
 * Described by what is delivered, not by claims about outcomes: there are
 * no clients, results or figures here because none are recorded anywhere in
 * this repository.
 *
 * The seven services, their names, their one-line positioning and their
 * evidence are taken from the professional portfolio's own canonical
 * `src/data/services.ts` (frozen at commit ff4d65d8), which is the source of
 * truth for what can actually be commissioned. `delivers` below holds each
 * service's own `evidence` array verbatim — real, reproducible figures,
 * never a restated marketing claim.
 */
export interface Service {
  id: string
  title: string
  summary: string
  /** The concrete things handed over at the end. */
  delivers: readonly string[]
}

export const SERVICES: readonly Service[] = [
  {
    id: 'support-recovery',
    title: 'AI Customer Support & Sales Recovery',
    summary:
      'Answer customer questions from your own policies and live data — and notice the buyer who is about to leave.',
    delivers: [testsLabel('p1'), '16/16 eval', '8 guardrail policies enforced in code'],
  },
  {
    id: 'inbox-crm',
    title: 'AI Inbox & Lead Management',
    summary:
      'Turn the enquiries sitting in your inbox into tracked CRM records with drafted replies — nothing sent without your approval.',
    delivers: [testsLabel('p2'), '10/10 eval', 'interactive in-browser demo'],
  },
  {
    id: 'recruitment',
    title: 'AI Recruitment Intelligence',
    summary: 'Screening decisions you can defend to the person they were made about.',
    delivers: [testsLabel('p3'), '10-stage demo ending in Decision + Audit'],
  },
  {
    // Generalises the Inbox-to-CRM agent's own machinery rather than being a
    // project of its own — said in the summary itself, matching the
    // canonical portfolio's `caveat` for this service, since this data shape
    // has no separate field for it.
    id: 'workflow-automation',
    title: 'AI Workflow Automation',
    summary:
      'The connective work between systems that never quite talk to each other — generalising the adapter layer, approval gate and audit trail built for the Inbox-to-CRM agent, rather than being a project of its own.',
    delivers: ['Proven by the Inbox-to-CRM adapter layer'],
  },
  {
    id: 'rag-knowledge',
    title: 'RAG / Knowledge Systems',
    summary:
      'Answers grounded in your own documents, with every citation checked before it reaches you — never a guess dressed up as a source.',
    delivers: [
      `${testsLabel('p4')} · CI green (4 skipped: need model weights)`,
      'deterministic, credential-free demo',
      'citations checked in Python before display',
    ],
  },
  {
    id: 'document-intelligence',
    title: 'Document Intelligence',
    summary:
      'Structured data out of invoices and purchase orders, with every field checked outside the model and anything uncertain sent to a person — never silently guessed.',
    delivers: [
      testsLabel('p5'),
      'deterministic, credential-free demo',
      'confidence-scored human review queue',
    ],
  },
  {
    id: 'voice-ai',
    title: 'Voice AI',
    summary:
      'A phone line that checks the calendar before it promises a slot, and hands off to a person when it should.',
    delivers: [
      testsLabel('p6'),
      'double-booking prevented at the database layer',
      'browser demo needs no telephony credential',
    ],
  },
]

/** Shown under the list; routes to the contact panel rather than a form. */
export const SERVICES_CTA = 'Start a conversation'
