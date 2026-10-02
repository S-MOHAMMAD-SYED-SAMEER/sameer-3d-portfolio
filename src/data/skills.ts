/**
 * What the workshop is for.
 *
 * Grouped around what each capability achieves rather than what it is
 * called, and every technology named is one genuinely demonstrated by one
 * of the six canonical projects — taken from the professional portfolio's
 * own canonical `src/data/skills.ts` (frozen at commit ff4d65d8), which is
 * the source of truth for which technologies the six projects actually
 * demonstrate. Nothing here is a learning-roadmap item or a general
 * familiarity claim; if a project doesn't demonstrate it, it is not listed.
 */
export interface SkillGroup {
  id: string
  title: string
  items: readonly string[]
}

export const SKILL_GROUPS: readonly SkillGroup[] = [
  {
    id: 'customer-answers',
    title: 'Answer customer questions accurately',
    items: [
      'Retrieval-Augmented Generation (RAG)',
      'Hybrid retrieval & reranking (PostgreSQL + pgvector, Chroma, Qdrant)',
      'Tool-calling / function-calling agents',
      'Conversation memory',
    ],
  },
  {
    id: 'trustworthy-output',
    title: 'Keep the output trustworthy',
    items: [
      'Guardrails',
      'Eval harnesses',
      'Deterministic validation & confidence scoring',
      'Explainable AI output',
    ],
  },
  {
    id: 'beyond-chat',
    title: 'Extend automation beyond chat',
    items: [
      'Document extraction & human-review workflows',
      'Real-time voice (Deepgram speech-to-text, ElevenLabs text-to-speech)',
      'Twilio telephony integration',
      'PostgreSQL exclusion constraints for scheduling',
    ],
  },
  {
    id: 'working-software',
    title: 'Ship it as working software',
    items: [
      'Python / FastAPI / PostgreSQL / SQLAlchemy / Alembic',
      'React / TypeScript / Vite / Tailwind CSS',
      'Node.js',
      'Docker & Docker Compose',
      'Claude API (Haiku 4.5, Sonnet 5)',
    ],
  },
]
