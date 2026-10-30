import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'

import { PROJECTS } from '../src/data/projects.ts'
import { RESULTS_IMAGES } from '../src/data/resultsImages.ts'

/**
 * All six projects carry the same demo video and results image. The video files live on the portfolio site (this
 * repository only links them); the results images and the resume are small and are served from here.
 */

const ROOT = join(import.meta.dirname, '..')
const read = (path: string) => readFileSync(join(ROOT, path), 'utf8')
const HOST = 'https://portfolio-azure-six-79.vercel.app/videos/'
const STANDARD = 'Demo: the real app on a real model, fictional data, AI voice narration.'
const FILES = {
  p1: 'sales-recovery-agent',
  p2: 'inbox-crm-agent',
  p3: 'explainable-ats',
  p4: 'knowledgeos',
  p5: 'docintel',
  p6: 'voicedesk',
} as const

test('every project links the new clean cut, its poster and its captions on the portfolio site, with the standard caption', () => {
  assert.equal(PROJECTS.length, 6)
  for (const project of PROJECTS) {
    const file = FILES[project.id]
    const video = project.video
    assert.ok(video, `${project.id} has no video`)
    assert.equal(video.src, `${HOST}${file}-clean-16x9.mp4`)
    assert.equal(video.poster, `${HOST}${file}-clean-poster.jpg`)
    assert.equal(video.captions, `${HOST}${file}.vtt`)
    assert.equal(`${video.width}x${video.height}`, '1920x1080')
    assert.ok(video.caption.startsWith(STANDARD), `${project.id}: the caption is not the standard one`)
  }
  assert.ok(!existsSync(join(ROOT, 'public/videos')), 'the videos must not be committed here')
})

test('VoiceDesk says in its caption that voice and phone are not connected', () => {
  const video = PROJECTS.find((project) => project.id === 'p6')!.video!
  assert.equal(video.caption, `${STANDARD} Typed text only. Voice and phone are not connected yet.`)
})

test('the player starts muted, fetches nothing until pressed, and keeps a fixed 16:9 box', () => {
  const source = read('src/components/experience/ProjectVideo.tsx')
  assert.match(source, /\bmuted\b/)
  assert.match(source, /preload="none"/)
  assert.match(source, /aspect-video/)
  assert.match(source, /\bplaysInline\b/)
})

test('the case-study article puts the video under the summary and shows the results image in the proof block', () => {
  const source = read('src/components/normal/ProjectArticle.tsx')
  assert.ok(source.indexOf('<ProjectVideo') < source.indexOf('<Block title="Proof">'), 'the video is not above the proof')
  assert.ok(source.indexOf('resultsShot(project.id)') > source.indexOf('<Block title="Proof">'))
  assert.ok(source.indexOf('resultsShot(project.id)') < source.indexOf('<Block title="Evidence">'))
  assert.equal(source.split('<ProjectVideo').length - 1, 1, 'the video is rendered more than once')
})

test('every results image is a WebP that exists, with the slide\'s numbers and limits as its alt text', () => {
  for (const project of PROJECTS) {
    const image = RESULTS_IMAGES[project.id]
    assert.equal(image.src, `/images/${FILES[project.id]}-results.webp`)
    const bytes = readFileSync(join(ROOT, 'public', image.src))
    assert.equal(bytes.subarray(0, 4).toString('latin1'), 'RIFF')
    assert.equal(bytes.subarray(8, 12).toString('latin1'), 'WEBP')
    assert.match(image.alt, /What was measured\./)
    assert.match(image.alt, /Limits: /)
  }
  assert.match(RESULTS_IMAGES.p3.alt, /86\.8% Verdicts matching the labels \(one run\)/)
  assert.match(RESULTS_IMAGES.p3.alt, /not an independent human labelling/)
  assert.match(RESULTS_IMAGES.p6.alt, /Typed text only\. Voice and phone are not connected yet\./)
})

test('the resume is served under its own name and linked from the landing page and the normal portfolio, nav and hero', () => {
  const name = 'Mohammad_Syed_Sameer_AI_Engineer_Resume.pdf'
  const bytes = readFileSync(join(ROOT, 'public', name))
  assert.equal(bytes.subarray(0, 4).toString('latin1'), '%PDF')
  assert.match(read('src/data/contact.ts'), new RegExp(`RESUME_URL = '/${name}'`))
  assert.equal(read('src/pages/LandingPage.tsx').split('Resume (PDF)').length - 1, 1)
  assert.equal(read('src/pages/NormalPortfolioPage.tsx').split('Resume (PDF)').length - 1, 2, 'one in the nav, one in the hero')
})
