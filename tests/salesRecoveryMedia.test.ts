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
  assert.equal(video.src, `${host}sales-recovery-agent-clean-16x9.mp4`)
  assert.equal(video.captions, `${host}sales-recovery-agent.vtt`)
  assert.ok(video.poster?.startsWith(host))
  assert.equal(`${video.width}x${video.height}`, '1920x1080')
  const text = `${video.caption} ${video.detail}`
  assert.ok(/fictional/.test(text) && /AI-voice/.test(text) && /2026-10-15/.test(text))
  assert.ok(!existsSync(join(ROOT, 'public/videos')), 'the video must not be committed here')
})

test('the player has controls, plays inline, loads nothing until pressed, and gives a cross-origin video a captions track', () => {
  const source = readFileSync(join(ROOT, 'src/components/experience/ProjectVideo.tsx'), 'utf8')
  assert.match(source, /\bcontrols\b/)
  assert.match(source, /\bplaysInline\b/)
  assert.match(source, /preload="none"/)
  assert.match(source, /crossOrigin=\{isAbsolute\(video\.src\) \? 'anonymous' : undefined\}/)
  // Available, but off at first: no `default`, and the text track mode is set to hidden so a browser does not turn it on by itself.
  assert.match(source, /<track kind="captions" src=\{video\.captions\} srcLang="en" label="English" \/>/)
  assert.ok(!/<track[^>]*\bdefault\b/.test(source), 'the captions track is marked default')
  assert.match(source, /track\.mode = 'hidden'/)
  assert.match(source, /addEventListener\('addtrack', hide\)/)
})

test('the numbers are current and the old ones are gone', () => {
  assert.equal(p1.proof.tests, 530)
  const text = JSON.stringify(p1)
  assert.ok(!/\b372\b/.test(text), 'the old test count is still in the entry')
  assert.match(p1.caseStudy?.result ?? '', /530 of 530/)
  assert.match(p1.caseStudy?.result ?? '', /2026-10-15/)
  // claims that must stay hedged
  assert.match(p1.caseStudy?.result ?? '', /not a general accuracy claim/)
  assert.match(p1.caseStudy?.result ?? '', /Anthropic adapter is implemented and has not yet been run/)
})

test('the guardrail figures say who labelled the drafts: one AI reviewer, not a person by hand', () => {
  const result = p1.caseStudy?.result ?? ''
  assert.match(result, /AI-labelled by one reviewer \(Claude Code\); a sample of 20 checked by Sameer: agreed with 19, relabelled 1/)
  assert.match(result, /0 of 83 clean drafts/)
  assert.match(result, /two unsupported claims of kinds the guardrails don't check \(a store fact and a promised capability\) still get through/)
  assert.ok(!/unrelated unsupported/.test(result), 'the result still calls the missed claim unrelated')
  // (the problem text legitimately says a small team answers questions "by hand"; what must not appear is the drafts being)
  assert.ok(!/checked by hand|drafts[^.]{0,80}by hand|by hand[^.]{0,80}drafts/i.test(result), 'the result says the drafts were checked by hand')
})
