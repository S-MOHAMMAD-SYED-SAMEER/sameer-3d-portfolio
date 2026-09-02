import { ABOUT } from '@/data/about'
import { ContactPanel } from '@/components/experience/ContactPanel'
import { ProjectsPanel } from '@/components/experience/ProjectsPanel'
import type { ProjectId } from '@/data/projects'
import { SERVICES, SERVICES_CTA } from '@/data/services'
import { SKILL_GROUPS } from '@/data/skills'
import { AREA_LABEL, type WorkshopArea } from '@/systems/workshopArea'

interface WorkshopPanelProps {
  area: WorkshopArea
  onClose: () => void
  onOpen: (area: WorkshopArea) => void
  /** Projects has one layer inside it: the case study being read. */
  project: ProjectId | null
  highlightedProject: ProjectId | null
  onSelectProject: (id: ProjectId) => void
  onHighlightProject: (id: ProjectId | null) => void
  onClearProject: () => void
}

/**
 * The content for one destination.
 *
 * A column on desktop and a sheet on a phone, both leaving the room visible
 * alongside — the point of building this in 3D is lost the moment a panel
 * covers it. Same palette as everything else: dark ground, one accent, no
 * cards.
 */
export function WorkshopPanel({
  area,
  onClose,
  onOpen,
  project,
  highlightedProject,
  onSelectProject,
  onHighlightProject,
  onClearProject,
}: WorkshopPanelProps) {
  return (
    <aside
      aria-label={AREA_LABEL[area]}
      className="border-line bg-ink/92 pointer-events-auto flex max-h-[58dvh] w-full flex-col rounded-2xl border backdrop-blur-md sm:max-h-[66dvh] sm:w-[26rem]"
    >
      <header className="border-line flex items-center justify-between border-b px-5 py-4">
        <p className="text-mist text-[11px] tracking-[0.35em] uppercase">{AREA_LABEL[area]}</p>
        <button
          type="button"
          onClick={onClose}
          className="focus-ring text-mist hover:text-chalk rounded-full px-2 py-1 text-xs tracking-wide transition-colors"
        >
          Close
        </button>
      </header>

      <div className="overflow-y-auto px-5 py-5">
        {area === 'projects' && (
          <ProjectsPanel
            project={project}
            highlighted={highlightedProject}
            onSelect={onSelectProject}
            onHighlight={onHighlightProject}
            onBack={onClearProject}
          />
        )}
        {area === 'skills' && <Skills />}
        {area === 'services' && <Services onOpen={onOpen} />}
        {area === 'about' && <About />}
        {area === 'contact' && <ContactPanel />}
      </div>
    </aside>
  )
}

function Skills() {
  return (
    <ul className="space-y-6">
      {SKILL_GROUPS.map((group) => (
        <li key={group.id}>
          <p className="text-mist/70 text-[10px] tracking-[0.3em] uppercase">{group.title}</p>
          <p className="mt-2 text-sm leading-relaxed">{group.items.join(' · ')}</p>
        </li>
      ))}
    </ul>
  )
}

function Services({ onOpen }: { onOpen: (area: WorkshopArea) => void }) {
  return (
    <div>
      <ul className="space-y-6">
        {SERVICES.map((service) => (
          <li key={service.id}>
            <h3 className="text-base font-medium">{service.title}</h3>
            <p className="text-mist mt-1.5 text-sm leading-relaxed">{service.summary}</p>
            <p className="text-mist/80 mt-2 text-xs">{service.delivers.join(' · ')}</p>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => onOpen('contact')}
        className="focus-ring text-accent mt-7 rounded text-sm hover:underline"
      >
        {SERVICES_CTA} →
      </button>
    </div>
  )
}

function About() {
  return (
    <div>
      <p className="text-sm font-medium tracking-[0.12em]">{ABOUT.name}</p>
      <p className="text-mist/70 mt-1 text-[10px] tracking-[0.3em] uppercase">{ABOUT.title}</p>

      <div className="mt-5 space-y-4">
        {ABOUT.paragraphs.map((paragraph) => (
          <p key={paragraph} className="text-mist text-sm leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  )
}
