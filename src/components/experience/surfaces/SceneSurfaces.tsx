import { AboutBoard } from '@/components/experience/surfaces/AboutBoard'
import { ContactConsole } from '@/components/experience/surfaces/ContactConsole'
import { ProjectMonitor } from '@/components/experience/surfaces/ProjectMonitor'
import { ServicesBoard } from '@/components/experience/surfaces/ServicesBoard'
import { SkillsBoard } from '@/components/experience/surfaces/SkillsBoard'
import { MONITOR_SURFACES } from '@/data/surfaces'
import type { ProjectId } from '@/data/projects'
import { projectsOnPage } from '@/systems/projectNavigation'
import type { WorkshopArea } from '@/systems/workshopArea'

interface SceneSurfacesProps {
  open: WorkshopArea | null
  project: ProjectId | null
  page: number
  onSelectProject: (id: ProjectId) => void
  onOpenArea: (area: WorkshopArea) => void
}

/**
 * Every page that can sit on an object, mounted while its destination is open.
 *
 * The pages are mounted only for the open destination, so the others cost nothing and nothing
 * hidden can be tabbed to. `SurfaceTracker` (inside the Canvas) shows and places the ones that are
 * mounted.
 */
export function SceneSurfaces({ open, project, page, onSelectProject, onOpenArea }: SceneSurfacesProps) {
  return (
    <div aria-label="Content in the room" className="pointer-events-none absolute inset-0 overflow-hidden">
      {open === 'projects' &&
        projectsOnPage(page).map((entry, slot) => (
          <ProjectMonitor
            key={entry.id}
            surface={MONITOR_SURFACES[slot]!}
            project={entry}
            focused={entry.id === project}
            onSelect={(selected) => onSelectProject(selected.id)}
          />
        ))}
      {open === 'skills' && <SkillsBoard />}
      {open === 'services' && <ServicesBoard onContact={() => onOpenArea('contact')} />}
      {open === 'contact' && <ContactConsole />}
      {open === 'about' && <AboutBoard />}
    </div>
  )
}
