import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'

/**
 * Each project is presented as a case study, an in-browser interactive demo
 * where one exists, and a repository. Nothing here links to a hosted copy of
 * any project. This file stops one coming back by accident — a pasted URL, a
 * restored field — before it reaches a visitor.
 */

const ROOT = join(import.meta.dirname, '..')
const TEXT_FILE = /\.(ts|tsx|js|jsx|css|html|md|json|xml|txt|svg)$/

function filesUnder(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? filesUnder(path) : [path]
  })
}

function shippedFiles(): string[] {
  const rootFiles = readdirSync(ROOT)
    .filter((name) => name.endsWith('.html') || name === 'README.md')
    .map((name) => join(ROOT, name))

  return [...filesUnder(join(ROOT, 'src')), ...filesUnder(join(ROOT, 'public')), ...rootFiles].filter(
    (path) => TEXT_FILE.test(path),
  )
}

test('nothing shipped links to a hosted onrender.com deployment', () => {
  const offenders = shippedFiles().filter((path) => /onrender\.com/i.test(readFileSync(path, 'utf8')))

  assert.deepEqual(
    offenders.map((path) => path.slice(ROOT.length + 1)),
    [],
    'these files mention onrender.com',
  )
})
