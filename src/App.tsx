import { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { ExperienceLoading } from '@/components/experience/ExperienceLoading'
import { LandingPage } from '@/pages/LandingPage'
import { NormalPortfolioPage } from '@/pages/NormalPortfolioPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ROUTES } from '@/lib/routes'
import { ExperienceModeProvider } from '@/systems/ExperienceModeProvider'

/*
 * The 3D experience is loaded on demand. Three.js and the R3F runtime are a
 * large dependency and a visitor who only ever opens the Normal portfolio
 * should never download them.
 */
const ExperiencePage = lazy(() =>
  import('@/pages/ExperiencePage').then((module) => ({ default: module.ExperiencePage })),
)

/*
 * Per-project case studies are their own chunk. A visitor who never opens one
 * should not carry them, and the Normal portfolio already renders the same
 * content inline for the visitor who is simply scrolling.
 */
const ProjectCaseStudyPage = lazy(() =>
  import('@/pages/ProjectCaseStudyPage').then((module) => ({
    default: module.ProjectCaseStudyPage,
  })),
)

/*
 * The interactive demo is its own chunk, and the heaviest reason for that is
 * what it carries: the project's own pipeline, copied into this repository. A
 * visitor reading the Normal portfolio should never download an ATS.
 */
const ProjectDemoPage = lazy(() =>
  import('@/pages/ProjectDemoPage').then((module) => ({ default: module.ProjectDemoPage })),
)

export default function App() {
  return (
    <BrowserRouter>
      <ExperienceModeProvider>
        <Suspense fallback={<ExperienceLoading />}>
          <Routes>
            <Route path={ROUTES.landing} element={<LandingPage />} />
            <Route path={ROUTES.normal} element={<NormalPortfolioPage />} />
            <Route path={ROUTES.experience} element={<ExperiencePage />} />
            <Route path={`${ROUTES.projects}/:id`} element={<ProjectCaseStudyPage />} />
            <Route path={`${ROUTES.projects}/:id/demo`} element={<ProjectDemoPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </ExperienceModeProvider>
    </BrowserRouter>
  )
}
