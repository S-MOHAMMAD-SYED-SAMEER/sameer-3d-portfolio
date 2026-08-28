import { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

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

export default function App() {
  return (
    <BrowserRouter>
      <ExperienceModeProvider>
        <Suspense fallback={<div className="bg-void min-h-dvh" />}>
          <Routes>
            <Route path={ROUTES.landing} element={<LandingPage />} />
            <Route path={ROUTES.normal} element={<NormalPortfolioPage />} />
            <Route path={ROUTES.experience} element={<ExperiencePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </ExperienceModeProvider>
    </BrowserRouter>
  )
}
