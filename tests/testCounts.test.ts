import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'

import { PROJECTS, formatCount, testsLabel, totalTests, type ProjectId } from '../src/data/projects.ts'
import { SERVICES } from '../src/data/services.ts'

/**
 * Every test count on the site comes from one number per project:
 * `proof.tests`. The headline total is computed from those, the services list
 * is built from them, and the prose is checked against them here — so a count
 * that is changed in one place and forgotten in another fails a test instead of
 * reaching a visitor.
 */

const ROOT = join(import.meta.dirname, '..')

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return sourceFiles(path)
    return /\.(ts|tsx)$/.test(path) ? [path] : []
  })
}

test('the headline total is the sum of the per-project counts', () => {
  const sum = PROJECTS.reduce((total, project) => total + project.proof.tests, 0)

  assert.equal(totalTests(), sum)
  assert.equal(totalTests(PROJECTS.slice(0, 2)), PROJECTS[0]!.proof.tests + PROJECTS[1]!.proof.tests)
})

test('the headline is computed, not written down', () => {
  const page = readFileSync(join(ROOT, 'src/pages/NormalPortfolioPage.tsx'), 'utf8')
  assert.ok(page.includes('totalTests()'), 'the /normal headline no longer reads totalTests()')

  // The current total, in either spelling, must not appear as a literal
  // anywhere in the source: it would be a second copy that can go stale.
  const total = totalTests()
  const literals = [formatCount(total), String(total)]
  for (const file of sourceFiles(join(ROOT, 'src'))) {
    if (file.includes('dataset.gen') || file.includes('vendored')) continue
    const source = readFileSync(file, 'utf8')
    for (const literal of literals) {
      assert.ok(
        !new RegExp(`(?<![0-9,.])${literal}(?![0-9,])`).test(source),
        `${file.slice(ROOT.length + 1)} hard-codes the headline total ${literal}`,
      )
    }
  }
})

test('every count in a project\'s prose is that project\'s own count', () => {
  // "247 of 247 automated tests pass", "895 automated tests pass", "1,661 tests
  // collected" — a number followed by the word tests. A count of anything else
  // ("73/73 pass", "16/16") is not a test count and is not matched.
  const claim = /\b([0-9][0-9,]*)(?: of ([0-9][0-9,]*))? (?:automated )?tests\b/g

  for (const project of PROJECTS) {
    const prose = project.caseStudy?.result ?? ''
    for (const match of prose.matchAll(claim)) {
      for (const figure of [match[1], match[2]]) {
        if (figure === undefined) continue
        assert.equal(
          Number(figure.replace(/,/g, '')),
          project.proof.tests,
          `${project.id} prose says "${match[0]}" but proof.tests is ${project.proof.tests}`,
        )
      }
    }
  }
})

test('the services list shows each project\'s own count', () => {
  const provenBy: Record<string, ProjectId> = {
    'support-recovery': 'p1',
    'inbox-crm': 'p2',
    recruitment: 'p3',
    'rag-knowledge': 'p4',
    'document-intelligence': 'p5',
    'voice-ai': 'p6',
  }

  for (const [serviceId, projectId] of Object.entries(provenBy)) {
    const service = SERVICES.find((candidate) => candidate.id === serviceId)
    assert.ok(service, `no service "${serviceId}"`)
    assert.ok(
      service.delivers[0]!.startsWith(testsLabel(projectId)),
      `${serviceId} says "${service.delivers[0]}" but ${projectId} has ${testsLabel(projectId)}`,
    )
  }
})
