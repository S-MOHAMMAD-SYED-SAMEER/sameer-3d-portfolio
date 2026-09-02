import { use, useMemo, useState } from 'react'

import { ActionButton } from '@/components/ActionButton'
import { cn } from '@/lib/cn'
import { DemoModeBanner } from '@/demo/ui/DemoModeBanner'
import { WorkflowRail, type WorkflowStage } from '@/demo/ui/WorkflowRail'
import { runDemo, type CandidateRun, type DemoRunResult } from './run.ts'
import {
  AuditStage,
  EvidenceStage,
  ExplanationStage,
  MatchingStage,
  RankingStage,
  RedactionStage,
  RequirementsStage,
  ResumeStage,
  ScoringStage,
  VerificationStage,
} from './stages.tsx'

/**
 * The Explainable ATS, running.
 *
 * The pipeline is executed ONCE, before the first render, and every stage below
 * reads from that one result. Moving between stages re-renders; it does not
 * re-run anything, because there is nothing to re-run — the whole thing
 * completes in well under a millisecond and changing stage is a change of view,
 * not of work.
 *
 * That is also why there is no loading state, no progress bar and no delay. The
 * honest thing to show is how fast deterministic code is, and dressing it up
 * with a spinner would be inventing a wait that does not exist.
 */

/**
 * The run, kept outside React so it happens once per page load rather than once
 * per mount. `use()` unwraps it under the route's existing Suspense boundary;
 * creating the promise here rather than during render is what makes that safe.
 */
let pending: Promise<DemoRunResult> | null = null
function demoRun(): Promise<DemoRunResult> {
  pending ??= runDemo()
  return pending
}

const STAGE_IDS = [
  'resume',
  'requirements',
  'redaction',
  'evidence',
  'verification',
  'matching',
  'scoring',
  'ranking',
  'explanation',
  'audit',
] as const

type StageId = (typeof STAGE_IDS)[number]

const STAGE_LABEL: Record<StageId, string> = {
  resume: 'Resume',
  requirements: 'Requirements',
  redaction: 'Redaction',
  evidence: 'Evidence',
  verification: 'Verification',
  matching: 'Matching',
  scoring: 'Scoring',
  ranking: 'Ranking',
  explanation: 'Explanation',
  audit: 'Audit trail',
}

/** Stages with nothing to show for a CV that was never assessed. */
const NEEDS_ASSESSMENT: ReadonlySet<StageId> = new Set<StageId>([
  'evidence',
  'verification',
  'matching',
  'scoring',
  'explanation',
])

export function AtsDemo() {
  const result = use(demoRun())

  const [reference, setReference] = useState(
    () => result.candidates[0]?.candidate.reference ?? '',
  )
  const [stage, setStage] = useState<StageId>('resume')

  const run = useMemo(
    () => result.candidates.find((entry) => entry.candidate.reference === reference),
    [result, reference],
  )

  const stages = useMemo<WorkflowStage[]>(
    () =>
      STAGE_IDS.map((id) => ({
        id,
        label: STAGE_LABEL[id],
        unavailable:
          run !== undefined && !run.assessed && NEEDS_ASSESSMENT.has(id)
            ? 'This candidate has not been assessed, so this stage has nothing to show.'
            : undefined,
      })),
    [run],
  )

  if (run === undefined) return null

  const index = STAGE_IDS.indexOf(stage)
  const reachable = stages.filter((entry) => entry.unavailable === undefined)
  const positionInReachable = reachable.findIndex((entry) => entry.id === stage)

  const step = (delta: number): void => {
    const next = reachable[positionInReachable + delta]
    if (next !== undefined) setStage(next.id as StageId)
  }

  // Selecting a candidate keeps the visitor where they are, unless the stage
  // they were reading has nothing to say about the person they just picked.
  const selectCandidate = (next: string): void => {
    setReference(next)
    const candidate = result.candidates.find((entry) => entry.candidate.reference === next)
    if (candidate !== undefined && !candidate.assessed && NEEDS_ASSESSMENT.has(stage)) {
      setStage('resume')
    }
  }

  return (
    <div className="space-y-8">
      <DemoModeBanner>
        Interactive demonstration using synthetic candidate data. Every stage below — redaction,
        evidence extraction, citation checking, scoring and ranking — is the project&rsquo;s own
        code running in your browser, with a deterministic offline extractor in place of a language
        model. No data leaves this page. Production deployments connect the same workflow to live
        models and real applicant systems.
      </DemoModeBanner>

      <CandidatePicker
        candidates={result.candidates}
        selected={reference}
        onSelect={selectCandidate}
      />

      <WorkflowRail stages={stages} activeId={stage} onSelect={(id) => setStage(id as StageId)} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-mist/70 text-[10px] tracking-[0.3em] uppercase">
            Stage {String(index + 1).padStart(2, '0')} of {STAGE_IDS.length}
          </p>
          <h2 className="mt-1 text-xl font-medium sm:text-2xl">{STAGE_LABEL[stage]}</h2>
        </div>

        <div className="flex items-center gap-3">
          <StepButton
            label="Previous stage"
            disabled={positionInReachable <= 0}
            onClick={() => step(-1)}
          >
            ← Back
          </StepButton>
          <StepButton
            label="Next stage"
            disabled={positionInReachable >= reachable.length - 1}
            onClick={() => step(1)}
          >
            Next →
          </StepButton>
          <ActionButton variant="secondary" onClick={() => setStage('resume')}>
            Restart
          </ActionButton>
        </div>
      </div>

      {/*
       * Just the stage name is announced, not the panel. A live region wrapped
       * around the whole stage would read an entire CV aloud every time someone
       * pressed Next, which is worse than silence.
       */}
      <p aria-live="polite" className="sr-only">
        Stage {index + 1} of {STAGE_IDS.length}: {STAGE_LABEL[stage]}
      </p>

      <section aria-label={STAGE_LABEL[stage]}>
        {stage === 'resume' && <ResumeStage run={run} />}
        {stage === 'requirements' && <RequirementsStage result={result} />}
        {stage === 'redaction' && <RedactionStage run={run} />}
        {stage === 'evidence' && <EvidenceStage run={run} />}
        {stage === 'verification' && <VerificationStage run={run} />}
        {stage === 'matching' && <MatchingStage run={run} />}
        {stage === 'scoring' && <ScoringStage run={run} />}
        {stage === 'ranking' && (
          <RankingStage result={result} selectedReference={reference} onSelect={selectCandidate} />
        )}
        {stage === 'explanation' && <ExplanationStage result={result} run={run} />}
        {stage === 'audit' && <AuditStage run={run} />}
      </section>

      <footer className="border-line text-mist/70 border-t pt-5 text-xs leading-relaxed">
        Ran offline, with no network request and no model call. Extractor:{' '}
        {result.provenance.extractor}. Prompt version: {result.provenance.promptVersion}. Timestamps
        are fixed so two runs are identical.
      </footer>
    </div>
  )
}

function StepButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        'focus-ring border-line rounded-full border px-4 py-2 text-sm transition-colors duration-200',
        disabled ? 'text-mist/40 cursor-not-allowed' : 'text-chalk hover:border-mist/60 hover:bg-surface',
      )}
    >
      {children}
    </button>
  )
}

function CandidatePicker({
  candidates,
  selected,
  onSelect,
}: {
  candidates: readonly CandidateRun[]
  selected: string
  onSelect: (reference: string) => void
}) {
  return (
    <div>
      <p className="text-mist/70 text-[10px] tracking-[0.3em] uppercase">Candidate</p>
      <div
        role="group"
        aria-label="Choose a candidate"
        className="mt-3 flex flex-wrap gap-2"
      >
        {candidates.map((entry) => {
          const isActive = entry.candidate.reference === selected
          return (
            <button
              key={entry.candidate.reference}
              type="button"
              onClick={() => onSelect(entry.candidate.reference)}
              aria-pressed={isActive}
              className={cn(
                'focus-ring rounded-full border px-4 py-2 text-sm transition-colors duration-200',
                isActive
                  ? 'border-accent bg-accent text-void font-medium'
                  : 'border-line text-mist hover:border-mist/60 hover:text-chalk',
              )}
            >
              {entry.candidate.displayName ?? entry.candidate.reference}
              {!entry.assessed && (
                <span className={cn('ml-2 text-[10px]', isActive ? 'text-void/70' : 'text-mist/60')}>
                  not assessed
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
