import { useState, type ReactNode } from 'react'

import { cn } from '@/lib/cn'
import { formatScore } from './vendored/agent/score.ts'
import type { CandidateRun, DemoRunResult } from './run.ts'
import type { MatchVerdict } from './vendored/domain/ats.ts'
import type { RankedCandidate } from './vendored/agent/rankRules.ts'

/*
 * The ten stages, rendered.
 *
 * NOTHING IN THIS FILE DECIDES ANYTHING.
 *
 * Every number, verdict, quote, offset, placement and sentence shown here was
 * produced by `run.ts`, which composes the project's own vendored modules.
 * There is no scoring, no matching, no verification and no ordering in this
 * file — only reading fields off a result that already exists and putting them
 * where a person can see them. The one thing it computes is which characters to
 * wrap in a <mark>, from spans P3 supplied.
 */

// --- small shared pieces -----------------------------------------------------

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-mist/70 text-[10px] tracking-[0.3em] uppercase">{children}</p>
}

function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('border-line bg-surface/30 rounded-lg border p-4 sm:p-5', className)}>
      {children}
    </div>
  )
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <dt className="text-mist/60 text-[10px] tracking-[0.2em] uppercase">{label}</dt>
      <dd className="mt-1 text-2xl font-medium tabular-nums">{value}</dd>
      {hint !== undefined && <p className="text-mist/70 mt-1 text-xs">{hint}</p>}
    </div>
  )
}

/** The CV, with a run of characters marked. Marking only; nothing is decided. */
function MarkedText({
  text,
  spans,
  className,
}: {
  text: string
  spans: readonly { charStart: number; charEnd: number }[]
  className?: string
}) {
  const ordered = [...spans].sort((a, b) => a.charStart - b.charStart)
  const parts: ReactNode[] = []
  let cursor = 0

  ordered.forEach((span, index) => {
    if (span.charStart > cursor) parts.push(text.slice(cursor, span.charStart))
    parts.push(
      <mark
        key={`${span.charStart}-${index}`}
        className="bg-accent/25 text-chalk rounded-sm px-0.5"
      >
        {text.slice(span.charStart, span.charEnd)}
      </mark>,
    )
    cursor = span.charEnd
  })
  if (cursor < text.length) parts.push(text.slice(cursor))

  return (
    <pre
      className={cn(
        'text-mist max-h-96 overflow-auto text-xs leading-relaxed whitespace-pre-wrap',
        className,
      )}
    >
      {parts}
    </pre>
  )
}

/*
 * Verdict wording, taken from the project's own recruiter-facing copy so the
 * demo and the real dashboard say the same thing about a person.
 *
 * Never colour alone: each carries its words and a rule whose weight differs,
 * so the distinction survives a monochrome screen and a screen reader.
 */
const VERDICT_LABEL: Record<MatchVerdict, string> = {
  met: 'Met',
  partial: 'Partly met',
  not_met: 'Does not meet',
  unclear: 'Not demonstrated',
}

const VERDICT_RULE: Record<MatchVerdict, string> = {
  met: 'border-l-accent',
  partial: 'border-l-chalk/60',
  not_met: 'border-l-mist/70',
  unclear: 'border-l-line',
}

function VerdictChip({ verdict }: { verdict: MatchVerdict }) {
  return (
    <span
      className={cn(
        'border-line rounded-full border px-2.5 py-0.5 text-[10px] tracking-wider uppercase',
        verdict === 'met' ? 'text-accent border-accent/40' : 'text-mist',
      )}
    >
      {VERDICT_LABEL[verdict]}
    </span>
  )
}

/** Said when a stage has nothing to show because the CV was never assessed. */
function NotAssessed({ name }: { name: string }) {
  return (
    <Panel>
      <p className="text-mist text-sm leading-relaxed">
        {name} was received and their CV was read and masked, but the assessment has not been run.
        There is nothing to show at this stage — and nothing is invented to fill it, which is why
        they still appear in the ranking rather than quietly disappearing from it.
      </p>
    </Panel>
  )
}

// --- 01 Resume ---------------------------------------------------------------

export function ResumeStage({ run }: { run: CandidateRun }) {
  return (
    <div className="space-y-5">
      <Panel>
        <dl className="flex flex-wrap gap-x-10 gap-y-4">
          <Stat label="Candidate" value={run.candidate.displayName ?? run.candidate.reference} />
          <Stat label="Reference" value={run.candidate.reference} />
          <Stat label="Characters" value={run.resume.charCount.toLocaleString()} />
        </dl>
        <p className="text-mist/70 mt-4 text-xs leading-relaxed">
          Invented person, invented employers. The email domain is reserved so it can never resolve
          and the phone number comes from a range set aside for fiction. The personal details are
          here so the next stage has something real-looking to remove.
        </p>
      </Panel>

      <div>
        <Eyebrow>The CV as submitted</Eyebrow>
        <div className="border-line mt-3 rounded-lg border p-4">
          <MarkedText text={run.resume.contentText} spans={[]} />
        </div>
      </div>
    </div>
  )
}

// --- 02 Requirements ---------------------------------------------------------

export function RequirementsStage({ result }: { result: DemoRunResult }) {
  return (
    <div className="space-y-5">
      <Panel>
        <Eyebrow>{result.job.seniority}</Eyebrow>
        <h3 className="mt-2 text-xl font-medium">{result.job.title}</h3>
        <p className="text-mist mt-2 max-w-2xl text-sm leading-relaxed">
          {result.job.description}
        </p>
      </Panel>

      <ul className="space-y-3">
        {result.requirements.map((requirement) => (
          <li
            key={requirement.id}
            className={cn(
              'border-line rounded-lg border border-l-2 p-4',
              requirement.kind === 'must_have' ? 'border-l-accent' : 'border-l-line',
            )}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h4 className="text-base font-medium">{requirement.label}</h4>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'text-[10px] tracking-[0.2em] uppercase',
                    requirement.kind === 'must_have' ? 'text-accent' : 'text-mist/70',
                  )}
                >
                  {requirement.kind === 'must_have' ? 'Essential' : 'Desirable'}
                </span>
                <span className="text-mist/70 text-xs tabular-nums">
                  weight {requirement.weight}
                </span>
              </div>
            </div>
            <p className="text-mist mt-2 text-sm leading-relaxed">{requirement.criterion}</p>
          </li>
        ))}
      </ul>

      <p className="text-mist/70 text-xs leading-relaxed">
        An essential that is not demonstrated changes where a candidate is placed, never their
        score. The two are kept apart deliberately, and stage 08 is where that becomes visible.
      </p>
    </div>
  )
}

// --- 03 Redaction ------------------------------------------------------------

export function RedactionStage({ run }: { run: CandidateRun }) {
  const categories = [...new Set(run.resume.spans.map((span) => span.category))].sort()

  return (
    <div className="space-y-5">
      <Panel>
        <dl className="flex flex-wrap gap-x-10 gap-y-4">
          <Stat label="Spans masked" value={String(run.resume.spans.length)} />
          <Stat label="Categories" value={String(categories.length)} />
        </dl>
        <ul className="mt-4 flex flex-wrap gap-2">
          {categories.map((category) => (
            <li
              key={category}
              className="border-line text-mist rounded-full border px-2.5 py-0.5 text-[10px] tracking-wider uppercase"
            >
              {category.replace(/_/g, ' ')}
            </li>
          ))}
        </ul>
        <p className="text-mist/70 mt-4 text-xs leading-relaxed">
          Each mask is exactly as long as what it replaced, so both copies below share character
          offsets — which is what lets a quotation found in the masked copy be checked against the
          original with no mapping table in between. This runs before anything reads the CV, so a
          protected attribute cannot influence a reading: it is not in the input.
        </p>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <Eyebrow>Original — highlighted where it will be masked</Eyebrow>
          <div className="border-line mt-3 rounded-lg border p-4">
            <MarkedText text={run.resume.contentText} spans={run.resume.spans} />
          </div>
        </div>
        <div>
          <Eyebrow>What the extractor is given</Eyebrow>
          <div className="border-line mt-3 rounded-lg border p-4">
            <MarkedText text={run.resume.redactedText} spans={[]} />
          </div>
        </div>
      </div>
    </div>
  )
}

// --- 04 Evidence -------------------------------------------------------------

export function EvidenceStage({ run }: { run: CandidateRun }) {
  if (run.extraction === null) return <NotAssessed name={run.candidate.displayName ?? 'This candidate'} />

  const label = (requirementId: string): string =>
    run.score?.rows.find((row) => row.requirement.id === requirementId)?.requirement.label ??
    requirementId

  return (
    <div className="space-y-5">
      <Panel>
        <Eyebrow>Deterministic extractor — no model call</Eyebrow>
        <p className="text-mist mt-3 text-sm leading-relaxed">
          A keyword matcher reads the masked CV and quotes whole lines from it. It is cruder than a
          language model on purpose: the same CV gives the same passages on every machine, forever,
          and it never quotes a line containing a mask. It cites; it does not judge, and it returns
          no score.
        </p>
        <dl className="mt-4 flex flex-wrap gap-x-10 gap-y-4">
          <Stat label="Passages quoted" value={String(run.extraction.accepted.length)} />
          <Stat
            label="Dropped for shape"
            value={String(run.extraction.malformed.length)}
            hint="Findings that did not satisfy the contract"
          />
        </dl>
      </Panel>

      <ul className="space-y-3">
        {run.extraction.accepted.map((finding, index) => (
          <li key={`${finding.requirementId}-${index}`} className="border-line rounded-lg border p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <Eyebrow>{label(finding.requirementId)}</Eyebrow>
              <span className="text-mist/60 text-[10px] tabular-nums">
                characters {finding.charStart}–{finding.charEnd}
              </span>
            </div>
            <blockquote className="border-accent/40 text-chalk mt-3 border-l-2 pl-3 text-sm leading-relaxed">
              {finding.quote}
            </blockquote>
            <p className="text-mist/70 mt-2 text-xs">{finding.reasoning}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

// --- 05 Verification ---------------------------------------------------------

export function VerificationStage({ run }: { run: CandidateRun }) {
  const [selected, setSelected] = useState<number | null>(null)

  if (run.verification === null)
    return <NotAssessed name={run.candidate.displayName ?? 'This candidate'} />

  const { verified, rejected } = run.verification
  const active = selected === null ? null : verified[selected]

  return (
    <div className="space-y-5">
      <Panel>
        <dl className="flex flex-wrap gap-x-10 gap-y-4">
          <Stat label="Found in the CV" value={String(verified.length)} />
          <Stat label="Rejected" value={String(rejected.length)} />
          <Stat
            label="Offsets corrected"
            value={String(verified.filter((item) => !item.offsetsWereCorrect).length)}
            hint="Quote located by searching rather than by the offsets given"
          />
        </dl>
        <p className="text-mist/70 mt-4 text-xs leading-relaxed">
          Every quotation is checked character for character against the CV as submitted — not
          against the masked copy. The offsets are treated as a hint and the passage is searched for
          if it is not where it was said to be; a quotation found nowhere is a fabrication and is
          refused. Only whitespace is normalised, because a changed word is not a quotation.
        </p>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <Eyebrow>Verified passages — select one to locate it</Eyebrow>
          <ul className="mt-3 space-y-2">
            {verified.map((item, index) => (
              <li key={item.finding.quote + String(index)}>
                <button
                  type="button"
                  onClick={() => setSelected(selected === index ? null : index)}
                  aria-pressed={selected === index}
                  className={cn(
                    'focus-ring border-line w-full rounded-lg border p-3 text-left transition-colors duration-200',
                    selected === index ? 'bg-surface border-accent/40' : 'hover:bg-surface/50',
                  )}
                >
                  <span className="text-accent text-[10px] tracking-[0.2em] uppercase">
                    Verified · {item.charStart}–{item.charEnd}
                  </span>
                  <span className="text-chalk mt-2 block text-sm leading-relaxed">
                    {item.finding.quote}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {rejected.length > 0 && (
            <>
              <Eyebrow>Rejected</Eyebrow>
              <ul className="mt-3 space-y-2">
                {rejected.map((item, index) => (
                  <li
                    key={item.finding.quote + String(index)}
                    className="border-line rounded-lg border border-l-2 border-l-mist/70 p-3"
                  >
                    <span className="text-mist text-[10px] tracking-[0.2em] uppercase">
                      {item.reason.replace(/_/g, ' ')}
                    </span>
                    <span className="text-mist mt-2 block text-sm">{item.finding.quote}</span>
                    <p className="text-mist/70 mt-1 text-xs">{item.detail}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div>
          <Eyebrow>
            {active === null ? 'The CV as submitted' : 'Located in the CV as submitted'}
          </Eyebrow>
          <div className="border-line mt-3 rounded-lg border p-4">
            <MarkedText
              text={run.resume.contentText}
              spans={active === null ? [] : [{ charStart: active.charStart, charEnd: active.charEnd }]}
            />
          </div>
          <p className="text-mist/70 mt-2 text-xs">
            {active === null
              ? 'Select a passage to see where it really sits in the document.'
              : `Offsets ${active.charStart}–${active.charEnd}, reported by the verifier.`}
          </p>
        </div>
      </div>
    </div>
  )
}

// --- 06 Matching -------------------------------------------------------------

export function MatchingStage({ run }: { run: CandidateRun }) {
  if (run.score === null) return <NotAssessed name={run.candidate.displayName ?? 'This candidate'} />

  return (
    <div className="space-y-4">
      <p className="text-mist max-w-2xl text-sm leading-relaxed">
        The model has already done the one thing it is better at than code: it found passages and
        quoted them. What remains — whether a passage satisfies a criterion — is decided by fixed
        rules over the terms the criterion asks for, so the answer can be reproduced by hand.
      </p>

      <ul className="space-y-3">
        {run.score.rows.map((row) => (
          <li
            key={row.requirement.id}
            className={cn(
              'border-line rounded-lg border border-l-2 p-4',
              VERDICT_RULE[row.decision.verdict],
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              {/* h3, not h4: the stage title above is an h2 and skipping a
                  level leaves a screen reader with a gap in the outline. */}
              <h3 className="text-base font-medium">{row.requirement.label}</h3>
              <div className="flex flex-wrap items-center gap-3">
                <VerdictChip verdict={row.decision.verdict} />
                <span className="text-mist/70 text-xs">
                  confidence {row.decision.confidence}
                </span>
                <span className="text-mist/70 text-xs tabular-nums">
                  {row.decision.evidenceCount} passage
                  {row.decision.evidenceCount === 1 ? '' : 's'}
                </span>
              </div>
            </div>

            <p className="text-mist mt-3 text-sm leading-relaxed">{row.decision.rationale}</p>

            <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
              <div>
                <dt className="text-mist/60 text-[10px] tracking-[0.2em] uppercase">Covered</dt>
                <dd className="text-chalk mt-1">
                  {row.decision.matchedTerms.length > 0 ? row.decision.matchedTerms.join(', ') : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-mist/60 text-[10px] tracking-[0.2em] uppercase">
                  Nothing found for
                </dt>
                <dd className="text-mist mt-1">
                  {row.decision.missingTerms.length > 0 ? row.decision.missingTerms.join(', ') : '—'}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </div>
  )
}

// --- 07 Scoring --------------------------------------------------------------

export function ScoringStage({ run }: { run: CandidateRun }) {
  if (run.score === null) return <NotAssessed name={run.candidate.displayName ?? 'This candidate'} />

  const score = run.score
  const contributionTotal = score.rows.reduce((sum, row) => sum + row.contributionBasisPoints, 0)

  return (
    <div className="space-y-5">
      <Panel>
        <dl className="flex flex-wrap gap-x-10 gap-y-4">
          <Stat label="Score" value={formatScore(score.scoreBasisPoints)} />
          <Stat
            label="Essentials met"
            value={`${score.mustHavesMet} / ${score.mustHavesTotal}`}
          />
          <Stat
            label="Essentials unaddressed"
            value={String(score.mustHavesUnclear)}
            hint="Said nothing about, rather than failed"
          />
          <Stat label="Total weight" value={String(score.totalWeight)} />
        </dl>
      </Panel>

      {/*
       * The same rows twice, laid out for the width available.
       *
       * Below `sm` the table needs 34rem and the viewport has about 20, so the
       * contribution column — and the total, which is the whole proof that the
       * parts add up to the headline — sat off the right edge behind a sideways
       * scroll nobody would think to try. Stacking is the only layout where the
       * number and its total are both simply there.
       *
       * Exactly one of the two is in the accessibility tree at any width:
       * `hidden` is `display: none`, so a screen reader never meets both.
       */}
      <ul className="space-y-2 sm:hidden" aria-label="Weighted contribution of each requirement">
        {score.rows.map((row) => (
          <li key={row.requirement.id} className="border-line rounded-lg border p-3">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium">{row.requirement.label}</span>
              <span className="text-sm tabular-nums">
                {row.contributionBasisPoints.toLocaleString()}
                <span className="text-mist/60 ml-2 text-xs">
                  {formatScore(row.contributionBasisPoints)}
                </span>
              </span>
            </div>
            <p className="text-mist/70 mt-1 text-xs">
              {VERDICT_LABEL[row.decision.verdict]} · weight {row.weightApplied}
            </p>
          </li>
        ))}
        <li className="border-accent/40 bg-surface/30 rounded-lg border p-3">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-medium">Total</span>
            <span className="text-sm font-medium tabular-nums">
              {contributionTotal.toLocaleString()}
              <span className="text-accent ml-2 text-xs">
                {formatScore(score.scoreBasisPoints)}
              </span>
            </span>
          </div>
        </li>
      </ul>

      <div className="border-line hidden overflow-x-auto rounded-lg border sm:block">
        <table className="w-full min-w-[34rem] text-sm">
          <caption className="sr-only">
            Weighted contribution of each requirement to the final score
          </caption>
          <thead>
            <tr className="border-line text-mist/60 border-b text-[10px] tracking-[0.2em] uppercase">
              <th scope="col" className="px-4 py-3 text-left font-normal">
                Requirement
              </th>
              <th scope="col" className="px-4 py-3 text-left font-normal">
                Verdict
              </th>
              <th scope="col" className="px-4 py-3 text-right font-normal">
                Weight
              </th>
              <th scope="col" className="px-4 py-3 text-right font-normal">
                Contribution
              </th>
            </tr>
          </thead>
          <tbody>
            {score.rows.map((row) => (
              <tr key={row.requirement.id} className="border-line/60 border-b last:border-b-0">
                <th scope="row" className="px-4 py-3 text-left font-normal">
                  {row.requirement.label}
                </th>
                <td className="text-mist px-4 py-3">{VERDICT_LABEL[row.decision.verdict]}</td>
                <td className="px-4 py-3 text-right tabular-nums">{row.weightApplied}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {row.contributionBasisPoints.toLocaleString()}
                  <span className="text-mist/60 ml-2 text-xs">
                    {formatScore(row.contributionBasisPoints)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-line border-t">
              <th scope="row" colSpan={3} className="px-4 py-3 text-left font-medium">
                Total
              </th>
              <td className="px-4 py-3 text-right font-medium tabular-nums">
                {contributionTotal.toLocaleString()}
                <span className="text-accent ml-2 text-xs">
                  {formatScore(score.scoreBasisPoints)}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="text-mist/70 text-xs leading-relaxed">
        Scores are integers in basis points, 0–10,000, divided exactly once at the end. The
        contribution column sums to {contributionTotal.toLocaleString()}, which is the headline
        figure — the remainder is apportioned in a fixed order so the parts always add to the whole.
        A missed essential is counted, not deducted: it changes placement, not this number.
      </p>
    </div>
  )
}

// --- 08 Ranking --------------------------------------------------------------

export function RankingStage({
  result,
  selectedReference,
  onSelect,
}: {
  result: DemoRunResult
  selectedReference: string
  onSelect: (reference: string) => void
}) {
  return (
    <div className="space-y-4">
      <p className="text-mist max-w-2xl text-sm leading-relaxed">
        Ranking is derived on read and writes nothing — it is a view of what the scorer already
        committed to. The order below is exactly what the project's ranking rules returned; nothing
        here re-sorts it.
      </p>

      <ul className="space-y-2">
        {result.ranking.entries.map((entry) => (
          <li key={entry.candidateId}>
            <button
              type="button"
              onClick={() => onSelect(entry.reference)}
              aria-pressed={entry.reference === selectedReference}
              className={cn(
                'focus-ring border-line w-full rounded-lg border p-4 text-left transition-colors duration-200',
                entry.reference === selectedReference
                  ? 'bg-surface border-accent/40'
                  : 'hover:bg-surface/50',
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-mist/60 text-xs tabular-nums">
                    {String(entry.position).padStart(2, '0')}
                  </span>
                  <span className="text-base font-medium">{entry.displayName}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <TierChip entry={entry} />
                  <span className="text-lg font-medium tabular-nums">
                    {entry.scorePercent ?? '—'}
                  </span>
                </div>
              </div>

              {(entry.failedMustHaves.length > 0 || entry.unclearMustHaves.length > 0) && (
                <p className="text-mist mt-2 text-xs">
                  {entry.failedMustHaves.length > 0 && (
                    <>Does not demonstrate: {entry.failedMustHaves.join(', ')}. </>
                  )}
                  {entry.unclearMustHaves.length > 0 && (
                    <>CV silent on: {entry.unclearMustHaves.join(', ')}.</>
                  )}
                </p>
              )}

              {entry.tiedWith > 0 && (
                <p className="text-mist/70 mt-1 text-xs">
                  Tied with {entry.tiedWith} other candidate{entry.tiedWith === 1 ? '' : 's'}.
                </p>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function TierChip({ entry }: { entry: RankedCandidate }) {
  const label =
    entry.tier === 'qualified'
      ? 'Meets every essential'
      : entry.tier === 'gated'
        ? 'Missing an essential'
        : entry.tier === 'needs_review'
          ? 'Worth a look'
          : 'Not assessed yet'

  return (
    <span
      className={cn(
        'border-line rounded-full border px-2.5 py-0.5 text-[10px] tracking-wider uppercase',
        entry.tier === 'qualified' ? 'text-accent border-accent/40' : 'text-mist',
      )}
    >
      {label}
    </span>
  )
}

// --- 09 Explanation ----------------------------------------------------------

export function ExplanationStage({
  result,
  run,
}: {
  result: DemoRunResult
  run: CandidateRun
}) {
  const entry = result.ranking.entries.find(
    (item) => item.reference === run.candidate.reference,
  )
  if (entry === undefined) return null

  return (
    <div className="space-y-5">
      <Panel>
        <Eyebrow>Why {entry.displayName} placed here</Eyebrow>
        {/* Written by the project's ranking rules, not by this page. */}
        <p className="text-chalk mt-3 max-w-3xl text-base leading-relaxed">{entry.rationale}</p>
      </Panel>

      {run.score !== null && (
        <div>
          <Eyebrow>What drove it</Eyebrow>
          <ul className="mt-3 space-y-2">
            {run.score.rows.map((row) => (
              <li
                key={row.requirement.id}
                className={cn(
                  'border-line rounded-lg border border-l-2 p-3',
                  VERDICT_RULE[row.decision.verdict],
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                  <span className="text-sm font-medium">
                    {row.requirement.label}
                    <span className="text-mist/60 ml-2 text-xs">
                      {row.requirement.kind === 'must_have' ? 'essential' : 'desirable'}
                    </span>
                  </span>
                  <span className="flex items-center gap-3">
                    <VerdictChip verdict={row.decision.verdict} />
                    <span className="text-xs tabular-nums">
                      {row.contributionBasisPoints.toLocaleString()} bp
                    </span>
                  </span>
                </div>
                <p className="text-mist mt-2 text-xs leading-relaxed">{row.decision.rationale}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// --- 10 Audit ----------------------------------------------------------------

export function AuditStage({ run }: { run: CandidateRun }) {
  return (
    <div className="space-y-4">
      <p className="text-mist max-w-2xl text-sm leading-relaxed">
        Every stage records what it did. The trail is append-only and carries the numbers the score
        was computed from, so the figure can be re-derived from these events alone. Ranking appears
        nowhere below, because it writes nothing.
      </p>

      <ol className="space-y-2">
        {run.audit.map((event) => (
          <li key={event.id} className="border-line rounded-lg border p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-mist/60 text-xs tabular-nums">
                  {String(event.sequence).padStart(2, '0')}
                </span>
                <span className="text-accent text-[10px] tracking-[0.2em] uppercase">
                  {event.stage}
                </span>
                <span className="text-sm font-medium">{event.eventType.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'text-[10px] tracking-[0.2em] uppercase',
                    event.outcome === 'ok' ? 'text-mist' : 'text-chalk',
                  )}
                >
                  {event.outcome}
                </span>
                <span className="text-mist/60 text-[10px] tabular-nums">{event.createdAt}</span>
              </div>
            </div>

            <p className="text-mist mt-2 text-sm leading-relaxed">{event.summary}</p>

            {Object.keys(event.payload).length > 0 && (
              <details className="mt-3">
                <summary className="focus-ring text-mist/70 hover:text-chalk cursor-pointer rounded text-xs">
                  Recorded values
                </summary>
                <pre className="text-mist/80 mt-2 overflow-x-auto text-[11px] leading-relaxed">
                  {JSON.stringify(event.payload, null, 2)}
                </pre>
              </details>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}
