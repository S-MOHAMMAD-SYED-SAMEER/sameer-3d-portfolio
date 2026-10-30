import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'

import { CONTACT_CHANNELS, contactActions } from '../src/data/contact.ts'

/**
 * A channel with nowhere to go is not shown. It is not linked, and it is not announced as missing
 * either: no "not linked yet" line, no résumé entry while its value is null.
 */

const ROOT = join(import.meta.dirname, '..')

test('a channel with no destination produces no action', () => {
  const nullIds = CONTACT_CHANNELS.filter((channel) => channel.value === null).map((channel) => channel.id)
  const shown = contactActions().map((action) => action.id)
  for (const id of nullIds) assert.ok(!shown.includes(id), `${id} is shown with no value`)
})

test('every action that is shown goes somewhere real', () => {
  for (const action of contactActions()) {
    assert.ok(action.href.length > 'mailto:'.length)
    // A file served from public/ (the résumé) is root-relative; every other channel is a mailto: or an https URL.
    assert.ok(action.href.startsWith('mailto:') || action.href.startsWith('https://') || /^\/[\w.-]+\.pdf$/.test(action.href), action.href)
  }
})

test('the résumé is hidden while its value is null, and would appear the moment it has one', () => {
  const resume = CONTACT_CHANNELS.find((channel) => channel.id === 'resume')
  assert.ok(resume)
  if (resume.value === null) {
    assert.ok(!contactActions().some((action) => action.id === 'resume'))
  } else {
    assert.ok(contactActions().some((action) => action.id === 'resume'))
  }
})

test('nothing in the interface says a channel is "not linked yet"', () => {
  for (const file of [
    'src/components/experience/ContactPanel.tsx',
    'src/components/experience/surfaces/ContactConsole.tsx',
    'src/data/contact.ts',
  ]) {
    const source = readFileSync(join(ROOT, file), 'utf8')
    assert.ok(!/not linked yet/i.test(source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')), `${file} still announces an unlinked channel`)
  }
})
