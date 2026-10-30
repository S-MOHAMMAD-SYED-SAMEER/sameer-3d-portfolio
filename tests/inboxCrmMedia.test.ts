import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'

import { PROJECTS } from '../src/data/projects.ts'

/**
 * The Inbox-to-CRM entry's video is the one the portfolio site hosts (by URL, so the file is not committed here), with a
 * captions track, and its caption says what the recording is and what it is not.
 */

const ROOT = join(import.meta.dirname, '..')
const p2 = PROJECTS.find((project) => project.id === 'p2')!

test('the video is the portfolio site\'s own file, by URL, with captions, and is not copied into this repository', () => {
  const video = p2.video
  assert.ok(video, 'no video on p2')
  const host = 'https://portfolio-azure-six-79.vercel.app/videos/'
  assert.equal(video.src, `${host}inbox-crm-agent-clean-16x9.mp4`)
  assert.equal(video.captions, `${host}inbox-crm-agent.vtt`)
  assert.equal(video.poster, `${host}inbox-crm-agent-clean-poster.jpg`)
  assert.equal(`${video.width}x${video.height}`, '1920x1080')
  for (const claim of ['live Gemini run', '2026-10-18', 'invented', 'AI-voice', 'not hosted']) {
    assert.ok(`${video.caption} ${video.detail}`.includes(claim), `the caption and detail do not say "${claim}"`)
  }
  assert.ok(!existsSync(join(ROOT, 'public/videos')), 'the video must not be committed here')
})
