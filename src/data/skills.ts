/**
 * What the workshop is for.
 *
 * Taken verbatim from what Sameer has stated he works with — nothing has
 * been added to round out a group. If a technology is not on this list it
 * does not belong on the wall.
 */
export interface SkillGroup {
  id: string
  title: string
  items: readonly string[]
}

export const SKILL_GROUPS: readonly SkillGroup[] = [
  {
    id: 'ai',
    title: 'AI / GenAI',
    items: ['LLM integration', 'AI agents', 'RAG', 'AI automation'],
  },
  {
    id: 'software',
    title: 'Software',
    items: ['Python', 'Go', 'React', 'TypeScript', 'SQL'],
  },
  {
    id: 'backend',
    title: 'Backend / Data',
    items: ['APIs', 'PostgreSQL', 'SQLAlchemy', 'Data systems'],
  },
  {
    id: 'cloud',
    title: 'Cloud / DevOps',
    items: ['Git', 'GitHub', 'CI/CD', 'Cloud infrastructure'],
  },
]
