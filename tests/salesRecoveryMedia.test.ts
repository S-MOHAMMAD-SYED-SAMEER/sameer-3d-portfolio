import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'

import { PROJECTS } from '../src/data/projects.ts'

/**
 * The Sales-Recovery entry: its screenshots are real files at the size they declare, its video is the one the
 * portfolio site hosts (not a copy, so the file is not committed here) with a captions track, the player turns
 * that into a captions track with the cross-origin attribute it needs, and the old numbers and screenshots are gone.
 */

const ROOT = join(import.meta.dirname, '..')
const p1 = PROJECTS.find((project) => project.id === 'p1')!

test('the screenshots exist and are the size they declare', () => {
  assert.ok(p1.screenshots.length >= 3)
  for (const shot of p1.screenshots) {
    const file = join(ROOT, 'public', shot.src)
    assert.ok(existsSync(file), `${shot.src} is missing`)
    const header = readFileSync(file).subarray(0, 24)
    assert.equal(header.subarray(1, 4).toString('latin1'), 'PNG')
    assert.equal(`${header.readUInt32BE(16)}x${header.readUInt32BE(20)}`, `${shot.width}x${shot.height}`, shot.src)
    // honest captions: what the picture is, when it was taken, that the store is fictional
    assert.ok(/2026-10-15/.test(shot.caption), `${shot.src} caption does not say when it was taken`)
  }
  assert.ok(!existsSync(join(ROOT, 'public/projects/p1-grounded-answer.png')))
  assert.ok(!existsSync(join(ROOT, 'public/projects/p1-buying-signal-recovery.png')))
})

test('the video is the portfolio site\'s own file, by URL, with captions, and is not copied into this repository', () => {
  const video = p1.video
  assert.ok(video, 'no video on p1')
  const host = 'https://portfolio-azure-six-79.vercel.app/videos/'
  assert.equal(video.src, `${host}sales-recovery-agent-16x9.mp4`)
  assert.equal(video.captions, `${host}sales-recovery-agent.vtt`)
  assert.ok(video.poster?.startsWith(host))
  assert.equal(`${video.width}x${video.height}`, '1920x1080')
  assert.ok(/fictional/.test(video.caption) && /AI-voice/.test(video.caption) && /2026-10-15/.test(video.caption))
  assert.ok(!existsSync(join(ROOT, 'public/videos')), 'the video must not be committed here')
})

test('the player has controls, plays inline, loads metadata only, and gives a cross-origin video a captions track', () => {
  const source = readFileSync(join(ROOT, 'src/components/experience/ProjectVideo.tsx'), 'utf8')
  assert.match(source, /\bcontrols\b/)
  assert.match(source, /\bplaysInline\b/)
  assert.match(source, /preload="metadata"/)
  assert.match(source, /crossOrigin=\{isAbsolute\(video\.src\) \? 'anonymous' : undefined\}/)
  assert.match(source, /<track kind="captions" src=\{video\.captions\} srcLang="en" label="English" default \/>/)
})

test('the numbers are current and the old ones are gone', () => {
  assert.equal(p1.proof.tests, 529)
  const text = JSON.stringify(p1)
  assert.ok(!/\b372\b/.test(text), 'the old test count is still in the entry')
  assert.match(p1.caseStudy?.result ?? '', /529 of 529/)
  assert.match(p1.caseStudy?.result ?? '', /2026-10-15/)
  // claims that must stay hedged
  assert.match(p1.caseStudy?.result ?? '', /not a general accuracy claim/)
  assert.match(p1.caseStudy?.result ?? '', /Anthropic adapter is implemented and has not yet been run/)
})
