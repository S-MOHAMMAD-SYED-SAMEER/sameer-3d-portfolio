import { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { CanonicalUrl } from '@/components/CanonicalUrl'
import { ExperienceLoading } from '@/components/experience/ExperienceLoading'
import { LandingPage } from '@/pages/LandingPage'
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
 * The Normal portfolio is loaded on demand too. It is not heavy in itself,
 * but it reads the whole project dataset, and importing it statically put
 * that dataset in the entry graph — so the landing page, which shows a name
 * and two links, was preloading every project's case study and screenshot
 * metadata before the visitor had chosen a mode.
 */
const NormalPortfolioPage = lazy(() =>
  import('@/pages/NormalPortfolioPage').then((module) => ({
    default: module.NormalPortfolioPage,
  })),
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
        <CanonicalUrl />
        <Suspense fallback={<ExperienceLoading />}>
          <Routes>
            <Route path={ROUTES.landing} element={<LandingPage />} />
            <Route
              path={ROUTES.normal}
              element={
                <Suspense fallback={<ExperienceLoading label="Loading portfolio" />}>
                  <NormalPortfolioPage />
                </Suspense>
              }
            />
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
