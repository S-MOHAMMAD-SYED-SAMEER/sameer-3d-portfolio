import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'

/**
 * Two links went out wrong and stayed wrong for months: a LinkedIn address with
 * a stale suffix, and a portfolio hostname with a typo in it. This stops either
 * coming back, and checks every LinkedIn address in the repository is the one
 * correct form.
 *
 * The banned strings are built from pieces so this file does not contain them
 * and can scan itself like any other.
 */

const ROOT = join(import.meta.dirname, '..')
const TEXT_FILE = /\.(ts|tsx|js|jsx|css|html|md|json|xml|txt|svg)$/
const SKIPPED_DIRS = new Set(['node_modules', 'dist', '.git'])
const SKIPPED_FILES = new Set(['package-lock.json'])

const STALE_LINKEDIN_SUFFIX = ['a879', 'a235a'].join('')
const MISSPELT_PORTFOLIO = ['porfolio', 'sigma', 'woad'].join('-')
const CORRECT_LINKEDIN = 'https://www.linkedin.com/in/mohammad-syed-sameer-s'

function filesUnder(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    if (SKIPPED_DIRS.has(name) || SKIPPED_FILES.has(name)) return []
    const path = join(dir, name)
    return statSync(path).isDirectory() ? filesUnder(path) : TEXT_FILE.test(path) ? [path] : []
  })
}

const FILES = filesUnder(ROOT)

test('the stale LinkedIn suffix and the misspelt portfolio hostname are gone', () => {
  const offenders = FILES.filter((path) => {
    const source = readFileSync(path, 'utf8')
    return source.includes(STALE_LINKEDIN_SUFFIX) || source.includes(MISSPELT_PORTFOLIO)
  })

  assert.deepEqual(
    offenders.map((path) => path.slice(ROOT.length + 1)),
    [],
    'these files carry a link that was corrected',
  )
})

test('every LinkedIn address is exactly the correct one', () => {
  const address = /https?:\/\/[^\s"'`)\]]*linkedin\.com\/in\/[^\s"'`)\]]*/gi

  for (const path of FILES) {
    for (const match of readFileSync(path, 'utf8').matchAll(address)) {
      assert.equal(match[0], CORRECT_LINKEDIN, `${path.slice(ROOT.length + 1)} has ${match[0]}`)
    }
  }
})
