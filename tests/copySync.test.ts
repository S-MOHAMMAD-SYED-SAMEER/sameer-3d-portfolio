import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'

import { PROJECTS, evaluationOf, type ProjectId } from '../src/data/projects.ts'
import { SERVICES } from '../src/data/services.ts'

/**
 * The numbers shown on the site are the numbers the projects' own READMEs state.
 *
 * Where a services line restates a project's result it is read from the project, so the two cannot
 * differ. And when the project repositories are checked out beside this one (as they are on the
 * author's machine), each README is read and the test count and the evaluation headline on the site
 * are checked against it. The READMEs are not part of this repository, so without them those checks
 * are skipped rather than failed.
 */

const ROOT = join(import.meta.dirname, '..')

const SIBLING: Record<ProjectId, string> = {
  p1: 'sales-recovery-agent',
  p2: 'inbox-crm-agent',
  p3: 'explainable-ats',
  p4: 'knowledgeos',
  p5: 'docintel',
  p6: 'voicedesk',
}

/** How each README states its own test count; the first capture group is the figure. */
const COUNT_IN_README: Record<ProjectId, RegExp> = {
  p1: /\*\*([0-9,]+) passing\*\*/,
  p2: /([0-9,]+) tests total/,
  p3: /reports ([0-9,]+) passing/,
  p4: /\*\*([0-9,]+) passed\*\*/,
  p5: /([0-9,]+) tests collected, [0-9,]+ passing/,
  p6: /\*\*([0-9,]+) pass\*\*/,
}

/** A figure from each project's evaluation line that its README has to carry too. */
const RESULT_IN_README: Partial<Record<ProjectId, string>> = {
  p1: '21/21',
  p2: '(21 plans)',
  p3: '86.8%',
  p4: '0.9081',
  p5: '387 of 390',
  p6: '(18/18)',
}

function readme(id: ProjectId): string | null {
  const path = join(ROOT, '..', SIBLING[id], 'README.md')
  return existsSync(path) ? readFileSync(path, 'utf8') : null
}

test('a services line that restates a project result is that project result, not a second copy', () => {
  const restated: Record<string, ProjectId> = { 'support-recovery': 'p1', 'inbox-crm': 'p2' }
  for (const [serviceId, projectId] of Object.entries(restated)) {
    const service = SERVICES.find((candidate) => candidate.id === serviceId)
    assert.ok(service?.delivers.includes(evaluationOf(projectId)), `${serviceId} does not carry ${projectId}'s evaluation line`)
  }
})

test('the inbox card leads with its safety headline, and keeps the mock-versus-real detail for the case study', () => {
  const inbox = PROJECTS.find((project) => project.id === 'p2')!
  assert.equal(inbox.proof.evaluation, '0 unsafe actions planned in 21 real-model plans')
  assert.ok(inbox.proof.properties.some((line) => line.includes('10 of 10') && line.includes('2 to 4 of 10')))
})

test('a scripted evaluation says it is scripted', () => {
  const voice = PROJECTS.find((project) => project.id === 'p6')!
  assert.match(voice.proof.evaluation ?? '', /scripted/)
  assert.match(voice.proof.evaluation ?? '', /no real model/)
})

test("each project's test count is the one its README states (when the README is beside this repo)", (t) => {
  let checked = 0
  for (const project of PROJECTS) {
    const text = readme(project.id)
    if (text === null) continue
    const match = COUNT_IN_README[project.id].exec(text)
    assert.ok(match, `${SIBLING[project.id]}'s README has no test count in the expected place`)
    assert.equal(Number(match[1]!.replace(/,/g, '')), project.proof.tests, `${project.id}: the site says ${project.proof.tests}, its README says ${match[1]}`)
    checked += 1
  }
  if (checked === 0) t.skip('no project README beside this repository')
})

test("each project's evaluation headline carries a figure its README states (when the README is beside this repo)", (t) => {
  let checked = 0
  for (const [id, figure] of Object.entries(RESULT_IN_README) as [ProjectId, string][]) {
    const text = readme(id)
    if (text === null) continue
    assert.ok(text.includes(figure), `${SIBLING[id]}'s README does not state ${figure}`)
    checked += 1
  }
  if (checked === 0) t.skip('no project README beside this repository')
})

test("a demo that lives on the normal portfolio links to the address that site uses (when it is beside this repo)", (t) => {
  const path = join(ROOT, '..', 'portfolio', 'src', 'data', 'projects.ts')
  const withUrl = PROJECTS.filter((project) => project.interactiveDemoUrl !== undefined)
  assert.deepEqual(withUrl.map((project) => project.id), ['p1', 'p2'])
  for (const project of withUrl) {
    assert.match(project.interactiveDemoUrl!, /^https:\/\/portfolio-azure-six-79\.vercel\.app\/demo-[a-z-]+\.html$/)
  }
  if (!existsSync(path)) return t.skip('the normal portfolio is not beside this repository')

  const source = readFileSync(path, 'utf8')
  for (const project of withUrl) {
    const block = source.slice(source.indexOf(`id: "${project.id}"`))
    const href = /interactiveDemoHref: "([^"]+)"/.exec(block)?.[1]
    assert.ok(href, `the normal portfolio has no demo for ${project.id}`)
    assert.equal(project.interactiveDemoUrl, `https://portfolio-azure-six-79.vercel.app${href}`)
  }
})

test('the DocIntel accuracy figure is never shown without its unflagged-error count and its limits', () => {
  const docintel = PROJECTS.find((project) => project.id === 'p5')!
  const shown = [docintel.proof.evaluation ?? '', ...docintel.proof.properties, docintel.caseStudy?.result ?? '']
  for (const text of shown.filter((line) => line.includes('387 of 390'))) {
    assert.match(text, /not flagged/, `"${text.slice(0, 60)}" gives the accuracy figure without the unflagged count`)
    assert.match(text, /synthetic/, `"${text.slice(0, 60)}" gives the accuracy figure without saying the data is synthetic`)
    assert.match(text, /one run/, `"${text.slice(0, 60)}" gives the accuracy figure without saying it is one run`)
  }
  assert.match(docintel.proof.evaluation ?? '', /2 wrong values not flagged for review$/)
  assert.ok(!(docintel.proof.evaluation ?? '').includes('after the checker fix'))
  assert.match(docintel.caseStudy?.result ?? '', /barely harder/)
  assert.ok(!(docintel.caseStudy?.result ?? '').includes('No real-model benchmark has been run'))
})
