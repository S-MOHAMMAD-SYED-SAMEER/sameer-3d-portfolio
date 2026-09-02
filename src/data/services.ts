/**
 * What gets built for other people.
 *
 * Described by what is delivered, not by claims about outcomes: there are
 * no clients, results or figures here because none are recorded anywhere in
 * this repository.
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
    id: 'ai-automation',
    title: 'AI Automation',
    summary:
      'Work that currently happens by hand — triage, replies, routing, follow-up — handled by a system that can be tested.',
    delivers: ['Automated workflow', 'Evaluation suite', 'Handover and documentation'],
  },
  {
    id: 'ai-integration',
    title: 'AI Integration',
    summary:
      'Language models wired into the tools a business already runs, with the guardrails and evaluations that make them trustworthy.',
    delivers: ['Model integration', 'Retrieval over your own data', 'Guardrails and evaluations'],
  },
  {
    id: 'web-development',
    title: 'Web Development',
    summary:
      'Interfaces and services built to engineering standards: typed, tested, and quick on the devices people actually use.',
    delivers: ['Web application', 'API and data layer', 'Test coverage'],
  },
  {
    id: 'business-automation',
    title: 'Business Automation',
    summary:
      'The connective work between systems that never quite talk to each other — inbox to CRM, form to database, service to service.',
    delivers: ['System integrations', 'Scheduled and event-driven jobs', 'Monitoring'],
  },
]

/** Shown under the list; routes to the contact panel rather than a form. */
export const SERVICES_CTA = 'Start a conversation'
