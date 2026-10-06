import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  PROJECTS,
  PROJECT_STATUS_LABEL,
  caseStudySections,
  getProject,
  isProjectId,
  projectActions,
  projectById,
  projectHighlights,
} from '../src/data/projects.ts'

/**
 * This file is the portfolio's claim register.
 *
 * Both routes and the 3D panel read this one dataset, so a wrong value here is
 * wrong everywhere at once and is visible to whoever the portfolio was sent
 * to. The rules below are the ones that make a claim self-consistent — every
 * project is presented as built and source-available, and none of them
 * advertises a hosted instance, because none is hosted.
 */

test('every project has its own id, in stated order', () => {
  const ids = PROJECTS.map((project) => project.id)

  assert.equal(new Set(ids).size, ids.length)
  assert.deepEqual(
    PROJECTS.map((project) => project.order),
    [...PROJECTS].sort((a, b) => a.order - b.order).map((project) => project.order),
  )
})

test('both lookups agree, and only real ids are accepted', () => {
  for (const project of PROJECTS) {
    assert.equal(getProject(project.id), project)
    assert.equal(projectById(project.id), project)
    assert.ok(isProjectId(project.id))
  }

  for (const junk of ['p0', 'p7', '', 'P1', 'projects', '../p1']) {
    assert.equal(isProjectId(junk), false, `${junk} should not be a project id`)
  }
})

test('no project claims a hosted instance', () => {
  for (const project of PROJECTS) {
    assert.equal(project.status, 'built', `${project.id} is not presented as built`)
    assert.ok(!('demo' in project.links), `${project.id} carries a live-demo link`)
    assert.ok(
      !projectActions(project).some((action) => (action.id as string) === 'demo'),
      `${project.id} offers a live-demo action`,
    )
  }
})

test('the Explainable ATS has no live-demo link', () => {
  const p3 = getProject('p3')

  assert.ok(p3 !== undefined)
  assert.equal(p3.status, 'built')
  assert.ok(!('demo' in p3.links), 'p3 carries a live-demo link')
  for (const link of Object.values(p3.links)) {
    assert.ok(link === null || !link.includes('onrender.com'), `p3 links to ${link}`)
  }
})

test('a project with an interactive demo leads with it, and one without leads with its case study', () => {
  for (const project of PROJECTS) {
    const actions = projectActions(project)
    const lead =
      actions.find((action) => action.id === 'interactiveDemo') ??
      actions.find((action) => action.id === 'caseStudy')

    if (project.interactiveDemo === true) assert.equal(lead?.id, 'interactiveDemo')
    else assert.ok(lead === undefined || lead.id === 'caseStudy')
  }
})

test('every status that is used has a label to render', () => {
  for (const project of PROJECTS) {
    assert.ok(PROJECT_STATUS_LABEL[project.status]?.trim(), `${project.status} has no label`)
  }
})

test('every action points somewhere, and says where out loud', () => {
  for (const project of PROJECTS) {
    const actions = projectActions(project)

    assert.equal(new Set(actions.map((action) => action.id)).size, actions.length)

    for (const action of actions) {
      assert.ok(action.href.trim(), `${project.id}/${action.id} has an empty href`)
      assert.ok(
        action.href.startsWith('https://') || action.href.startsWith('/'),
        `${project.id}/${action.id} points at ${action.href}`,
      )
      assert.ok(action.label.trim())
      assert.ok(action.accessibleName.trim())
      // Anything off this origin has to open in a new tab, and anything this
      // portfolio hosts must not be flagged as external.
      assert.equal(action.external, !action.href.startsWith('/'))
    }
  }
})

test('an interactive demo is offered only where one is hosted', () => {
  for (const project of PROJECTS) {
    const offered = projectActions(project).some((action) => action.id === 'interactiveDemo')

    assert.equal(offered, project.interactiveDemo === true, `${project.id} disagrees about its demo`)
  }
})

test('every screenshot is a real file reference with a described image', () => {
  for (const project of PROJECTS) {
    for (const shot of project.screenshots) {
      assert.ok(shot.src.startsWith('/'), `${project.id} screenshot src is not absolute`)
      assert.ok(shot.alt.trim().length > 20, `${project.id} screenshot alt is too thin to help`)
      assert.ok(shot.caption.trim(), `${project.id} screenshot has no caption`)
      assert.ok(shot.width > 0 && shot.height > 0, `${project.id} screenshot has no intrinsic size`)
    }
  }
})

test('proof is present and highlights repeat what proof says', () => {
  for (const project of PROJECTS) {
    assert.ok(project.proof.tests > 0, `${project.id} claims no tests`)

    const highlights = projectHighlights(project)

    assert.ok(highlights[0]?.includes(project.proof.tests.toLocaleString()))
    assert.equal(
      highlights.some((line) => line.includes('evaluation suite')),
      project.proof.evaluation !== null,
    )
  }
})

test('case-study sections are only produced where there is prose', () => {
  for (const project of PROJECTS) {
    for (const section of caseStudySections(project)) {
      assert.ok(section.title.trim())
      assert.ok(section.body.length > 0, `${project.id}/${section.id} rendered an empty section`)
    }
  }
})
