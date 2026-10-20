import assert from 'node:assert/strict'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'

import { MOBILE_HINT, MOBILE_POSTER } from '../src/data/experienceCopy.ts'

/**
 * On a phone the start screen used to be black apart from "Step inside". It now stands in front of a
 * still of the corridor, with a line that says the experience is best on a larger screen and links to
 * the normal portfolio.
 */

const ROOT = join(import.meta.dirname, '..')

test('the poster exists, is a real image, and is small enough to load at once on a phone', () => {
  assert.ok(MOBILE_POSTER.startsWith('/images/'))
  const file = join(ROOT, 'public', MOBILE_POSTER)
  assert.ok(existsSync(file), `${MOBILE_POSTER} is missing`)
  const bytes = statSync(file).size
  assert.ok(bytes > 10_000, 'the poster is suspiciously small')
  assert.ok(bytes < 250_000, `the poster is ${(bytes / 1024).toFixed(0)} KB`)
  // A JPEG starts with FF D8.
  const head = readFileSync(file).subarray(0, 2)
  assert.deepEqual([...head], [0xff, 0xd8])
})

test('the hint reads as one line and carries a link to the normal portfolio', () => {
  const line = `${MOBILE_HINT.before}${MOBILE_HINT.link}`
  assert.equal(line, 'Best on a larger screen — or use the normal portfolio')
  assert.ok(!line.includes('\n'))
})

test('the overlay shows the poster and the hint on a narrow viewport at the first beat, and links to /normal', () => {
  const overlay = readFileSync(join(ROOT, 'src/components/experience/ExperienceOverlay.tsx'), 'utf8')
  assert.match(overlay, /useNarrowViewport\(\)/)
  assert.match(overlay, /MOBILE_POSTER/)
  assert.match(overlay, /MOBILE_HINT\.before/)
  assert.match(overlay, /<Link to=\{ROUTES\.normal\}/)
  assert.match(overlay, /atStart/)
})

test('the poster also stands in while the 3D route is loading, on the 3D route only', () => {
  const loading = readFileSync(join(ROOT, 'src/components/experience/ExperienceLoading.tsx'), 'utf8')
  assert.match(loading, /MOBILE_POSTER/)
  assert.match(loading, /md:hidden/, 'the poster must not show on a desktop')
  const app = readFileSync(join(ROOT, 'src/App.tsx'), 'utf8')
  assert.match(app, /poster=\{pathname === ROUTES\.experience\}/)
})
