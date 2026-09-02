import { DEMO_JOB, DEMO_CANDIDATES, type DemoCandidate } from './dataset.gen.ts'
import { createAuditLog } from './audit.ts'
import { redact } from './vendored/agent/redact.ts'
import { buildSystemPrompt, buildUserMessage } from './vendored/agent/extractionPrompt.ts'
import {
  EXTRACTION_PROMPT_VERSION,
  EXTRACTION_TOOL,
  validateExtraction,
} from './vendored/agent/extractionSchema.ts'
import { verifyEvidence } from './vendored/agent/verifyEvidence.ts'
import { scoreEvaluation } from './vendored/agent/score.ts'
import { rankCandidates } from './vendored/agent/rankRules.ts'
import { createMockLlmProvider } from './vendored/adapters/llm/mock.ts'
import { installDeterministicExtractor } from './vendored/agent/mockExtractor.ts'

import type { RedactionSpan } from './vendored/agent/redact.ts'
import type { RawFinding, RejectedFinding } from './vendored/agent/extractionSchema.ts'
import type { VerificationResult } from './vendored/agent/verifyEvidence.ts'
import type { ScoreBreakdown } from './vendored/agent/score.ts'
import type { RankInput, Ranking } from './vendored/agent/rankRules.ts'
import type { AuditEvent } from './vendored/domain/ats.ts'
import type {
  Candidate,
  Evaluation,
  Evidence,
  Job,
  JobRequirement,
  RequirementMatch,
} from './vendored/domain/ats.ts'

/**
 * The Explainable ATS pipeline, running in a browser.
 *
 * WHAT THIS FILE IS ALLOWED TO DO
 *
 * Compose. Every judgement — what counts as a protected attribute, which
 * passages are evidence, whether a quote is real, whether a requirement is met,
 * what the score is, who ranks where — is made by a function imported from
 * `vendored/`, which is the project's own source copied byte for byte. Nothing
 * in this file decides any of those things, and if it ever starts to, the demo
 * has quietly become a second ATS that can disagree with the first.
 *
 * What it does own: deterministic ids and timestamps, carrying values between
 * stages, and emitting the audit events the server's repository would have
 * written. That is the whole of it.
 *
 * THE ORDER IS NOT ARBITRARY
 *
 * It is the server's, read off `ingest.ts`, `extract.ts`, `match.ts` and
 * `rank.ts` and reproduced call for call — including two things that look like
 * details and are not:
 *
 *   * the model is shown `redactedText`, and every quote is later checked
 *     against `contentText`. Verifying against the redacted copy would pass
 *     and would be meaningless;
 *   * `extraction_recorded` is emitted AFTER `evidence_verified`, because that
 *     is the order `extract.ts` appends them in.
 *
 * WHAT IS SUBSTITUTED
 *
 * The repositories, and only the repositories. There is no database, so rows
 * are objects; there is no clock, so time is a constant; there is no
 * `randomUUID`, so ids are literals. The provider is the project's own mock,
 * driven by the project's own deterministic extractor — not a recorded result.
 * It receives a prompt built from this candidate's real CV text and answers by
 * reading it, which is why a CV the dataset has never seen would also work.
 */

// --- deterministic identity --------------------------------------------------
//
// Every id below is a literal derived from the dataset, never generated. The
// server uses UUIDs from `lib/ids.ts`, which is Node-only and deliberately not
// vendored; nothing in the pipeline parses an id, so a readable string is a
// strictly better choice here.

const JOB_ID = 'demo-job'
const RESUME_MODEL = 'mock'

/**
 * The timestamp every generated record carries.
 *
 * A constant, because `Date.now()` would make two runs differ and there would
 * then be nothing to compare a run against. Chosen to be obviously synthetic.
 */
export const DEMO_TIMESTAMP = '2026-01-01T00:00:00.000Z'

/** `demo-003` -> `003`, so ids stay readable and tied to the dataset. */
function suffixOf(reference: string): string {
  const match = /(\d+)$/.exec(reference)
  return match ? (match[1] as string) : reference
}

// --- the result model --------------------------------------------------------

/** What the extractor was asked, and what it answered. */
export type ExtractionRun = {
  systemPrompt: string
  userMessage: string
  /** The provider's raw tool input, before validation. */
  rawOutput: Record<string, unknown>
  model: string
  promptVersion: string
  /** Findings that satisfied the contract. */
  accepted: RawFinding[]
  /** Findings dropped for shape, with the reason. Never shown as evidence. */
  malformed: RejectedFinding[]
}

export type CandidateRun = {
  candidate: Candidate
  /** The CV as submitted, the masked copy, and where the masks are. */
  resume: {
    id: string
    contentText: string
    redactedText: string
    spans: RedactionSpan[]
    charCount: number
  }
  evaluation: Evaluation
  /**
   * False for a candidate the dataset leaves queued.
   *
   * Their CV is still ingested and redacted — the fairness step happens at
   * intake, not at assessment — and their evaluation is opened and left there.
   * They appear in the ranking as unassessed rather than being hidden.
   */
  assessed: boolean
  extraction: ExtractionRun | null
  verification: VerificationResult | null
  /** Every recorded passage, verified or not, ordered as the server orders it. */
  evidence: Evidence[]
  /** Only what may be shown or scored. */
  verifiedEvidence: Evidence[]
  matches: RequirementMatch[]
  score: ScoreBreakdown | null
  /** This candidate's events, in order. Also present in the run-level trail. */
  audit: AuditEvent[]
}

export type DemoRunProvenance = {
  /** Every stage below ran in this browser; nothing was replayed. */
  mode: 'deterministic'
  /** The stand-in for the model. No network call is made. */
  extractor: 'deterministic-offline'
  promptVersion: string
  timestamp: string
  /** Named so a UI can say what did and did not happen. */
  modelCalled: false
  networkUsed: false
}

export type DemoRunResult = {
  job: Job
  requirements: JobRequirement[]
  candidates: CandidateRun[]
  ranking: Ranking
  /** Every event from every candidate, plus the job, in emission order. */
  audit: AuditEvent[]
  provenance: DemoRunProvenance
}

export type DemoRunOptions = {
  /** Subset of the dataset to run. Defaults to all of it. */
  candidates?: readonly DemoCandidate[]
  /** Passed straight to the vendored extractor. */
  maxPerRequirement?: number
}

// --- the run -----------------------------------------------------------------

/**
 * Runs the whole pipeline over the demo dataset.
 *
 * Async because the provider interface is async — the same interface a real
 * Claude adapter implements, which is what makes swapping one in later a
 * one-object change rather than a rewrite.
 */
export async function runDemo(options: DemoRunOptions = {}): Promise<DemoRunResult> {
  const candidates = options.candidates ?? DEMO_CANDIDATES
  const audit = createAuditLog({ createdAt: DEMO_TIMESTAMP })

  // --- the job -------------------------------------------------------------
  //
  // `createJob` in the server assigns ids and derives `position` from how many
  // requirements already exist, then reads them back ordered by position. Doing
  // it in dataset order reproduces that exactly, which matters: the scorer's
  // largest-remainder apportionment breaks ties by requirement index.

  const job: Job = {
    id: JOB_ID,
    title: DEMO_JOB.title,
    seniority: DEMO_JOB.seniority,
    description: DEMO_JOB.description,
    status: 'open',
    createdAt: DEMO_TIMESTAMP,
    updatedAt: DEMO_TIMESTAMP,
  }

  const requirements: JobRequirement[] = DEMO_JOB.requirements.map((requirement, index) => ({
    id: `demo-requirement-${String(index + 1).padStart(3, '0')}`,
    jobId: job.id,
    label: requirement.label,
    criterion: requirement.criterion,
    kind: requirement.kind,
    weight: requirement.weight,
    position: index + 1,
    createdAt: DEMO_TIMESTAMP,
  }))

  audit.append({
    correlationId: job.id,
    stage: 'job',
    eventType: 'job_created',
    actor: 'human',
    outcome: 'ok',
    summary: `Created "${job.title}" with ${requirements.length} requirement(s).`,
    payload: {
      mustHaves: requirements.filter((r) => r.kind === 'must_have').length,
      niceToHaves: requirements.filter((r) => r.kind === 'nice_to_have').length,
    },
    entityType: 'job',
    entityId: job.id,
  })

  const knownRequirementIds = new Set(requirements.map((requirement) => requirement.id))

  // One provider for the whole run, as the seeder does per candidate. It is
  // stateless between calls apart from its `calls` log, and the extractor
  // registered on it is a pure function of the request.
  const provider = createMockLlmProvider()
  installDeterministicExtractor(
    provider,
    options.maxPerRequirement === undefined ? {} : { maxPerRequirement: options.maxPerRequirement },
  )

  const runs: CandidateRun[] = []

  for (const entry of candidates) {
    runs.push(
      await runCandidate({
        entry,
        job,
        requirements,
        knownRequirementIds,
        provider,
        audit,
      }),
    )
  }

  // --- ranking -------------------------------------------------------------
  //
  // `rankCandidates` is a total order over its input and writes nothing, so the
  // input order below cannot affect the result. It is NOT sorted here, and must
  // not be: the placement is the product, and pre-sorting would hide whether
  // the vendored rules actually produced it.

  const inputs: RankInput[] = runs.map((run) => ({
    candidate: {
      id: run.candidate.id,
      reference: run.candidate.reference,
      displayName: run.candidate.displayName,
    },
    evaluation: run.evaluation,
    matches: run.matches,
  }))

  const ranking = rankCandidates(job.id, requirements, inputs)

  return {
    job,
    requirements,
    candidates: runs,
    ranking,
    audit: [...audit.events],
    provenance: {
      mode: 'deterministic',
      extractor: 'deterministic-offline',
      promptVersion: EXTRACTION_PROMPT_VERSION,
      timestamp: DEMO_TIMESTAMP,
      modelCalled: false,
      networkUsed: false,
    },
  }
}

// --- one candidate -----------------------------------------------------------

type CandidateContext = {
  entry: DemoCandidate
  job: Job
  requirements: JobRequirement[]
  knownRequirementIds: ReadonlySet<string>
  provider: ReturnType<typeof createMockLlmProvider>
  audit: ReturnType<typeof createAuditLog>
}

async function runCandidate(context: CandidateContext): Promise<CandidateRun> {
  const { entry, job, requirements, knownRequirementIds, provider, audit } = context
  const suffix = suffixOf(entry.reference)

  const candidate: Candidate = {
    id: `demo-candidate-${suffix}`,
    reference: entry.reference,
    displayName: entry.displayName,
    source: 'demo',
    createdAt: DEMO_TIMESTAMP,
  }

  const before = audit.events.length

  // --- ingest + redact -----------------------------------------------------
  //
  // Redaction happens before anything is stored and before anything reads the
  // CV, which is the ordering the fairness guarantee rests on. The candidate's
  // own name is passed in rather than guessed, exactly as `ingest.ts` does it.

  const contentText = entry.resume
  const { redactedText, spans } = redact(contentText, {
    knownNames: candidate.displayName ? [candidate.displayName] : [],
  })

  const resumeId = `demo-resume-${suffix}`

  audit.append({
    correlationId: resumeId,
    stage: 'ingest',
    eventType: 'resume_ingested',
    actor: 'system',
    outcome: 'ok',
    summary: `Stored a ${contentText.length}-character resume for ${candidate.reference}.`,
    payload: { candidateReference: candidate.reference, charCount: contentText.length },
    entityType: 'resume',
    entityId: resumeId,
  })

  audit.append({
    correlationId: resumeId,
    stage: 'redact',
    eventType: spans.length > 0 ? 'sensitive_attributes_masked' : 'no_sensitive_attributes_found',
    actor: 'system',
    outcome: 'ok',
    summary:
      spans.length > 0
        ? `Masked ${spans.length} protected attribute(s) before anything read this resume.`
        : 'No protected attributes were detected.',
    payload: {
      categories: [...new Set(spans.map((span) => span.category))].sort(),
      count: spans.length,
    },
    entityType: 'resume',
    entityId: resumeId,
  })

  // --- open the evaluation -------------------------------------------------

  const evaluationId = `demo-evaluation-${suffix}`

  audit.append({
    correlationId: evaluationId,
    stage: 'extract',
    eventType: 'evaluation_opened',
    actor: 'human',
    outcome: 'ok',
    summary: 'Opened an evaluation of this candidate against this job.',
    payload: { jobId: job.id, candidateId: candidate.id },
    entityType: 'evaluation',
    entityId: evaluationId,
  })

  const pending: Evaluation = {
    id: evaluationId,
    jobId: job.id,
    candidateId: candidate.id,
    resumeId,
    status: 'pending',
    model: null,
    promptVersion: null,
    latencyMs: null,
    scoreBasisPoints: null,
    mustHavesMet: null,
    mustHavesTotal: null,
    failureReason: null,
    supersededBy: null,
    createdAt: DEMO_TIMESTAMP,
  }

  const resume = {
    id: resumeId,
    contentText,
    redactedText,
    spans,
    charCount: contentText.length,
  }

  // A queued candidate stops here, with an evaluation opened and nothing run.
  // Their CV has still been read and masked, and the ranking will list them as
  // unassessed rather than omitting them — a list that quietly drops someone
  // looks complete and is not.
  if (entry.assess === 'queued') {
    return {
      candidate,
      resume,
      evaluation: pending,
      assessed: false,
      extraction: null,
      verification: null,
      evidence: [],
      verifiedEvidence: [],
      matches: [],
      score: null,
      audit: audit.events.slice(before),
    }
  }

  // --- extract -------------------------------------------------------------
  //
  // The request is built exactly as `extract.ts` builds it, and carries
  // `redactedText`. The original never enters this call.

  const systemPrompt = buildSystemPrompt()
  const userMessage = buildUserMessage(requirements, redactedText)

  const response = await provider.complete({
    purpose: 'extract_evidence',
    promptVersion: EXTRACTION_PROMPT_VERSION,
    systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
    tool: EXTRACTION_TOOL,
    maxTokens: 2048,
  })

  const { accepted, rejected: malformed } = validateExtraction(response.output, knownRequirementIds)

  if (malformed.length > 0) {
    audit.append({
      correlationId: evaluationId,
      stage: 'extract',
      eventType: 'malformed_findings_dropped',
      actor: 'system',
      outcome: 'blocked',
      summary: `${malformed.length} finding(s) did not match the required shape and were dropped.`,
      payload: {
        reasons: malformed.map((item) => item.reason),
        details: malformed.map((item) => item.detail),
      },
      entityType: 'evaluation',
      entityId: evaluationId,
    })
  }

  // --- verify --------------------------------------------------------------
  //
  // Against `contentText` — the document as submitted — never the masked copy.

  const verification = verifyEvidence(accepted, {
    contentText,
    redactionSpans: spans,
  })

  // Rejected passages are recorded rather than discarded, so a fabrication
  // stays visible. They are stored unverified, which is what keeps them out of
  // the score: nothing downstream reads them.
  let evidenceCounter = 0
  const nextEvidenceId = (): string =>
    `demo-evidence-${suffix}-${String(++evidenceCounter).padStart(2, '0')}`

  const verifiedRows: Evidence[] = verification.verified.map((item) => ({
    id: nextEvidenceId(),
    evaluationId,
    resumeId,
    requirementId: item.finding.requirementId,
    quote: item.finding.quote,
    charStart: item.charStart,
    charEnd: item.charEnd,
    verified: true,
    createdAt: DEMO_TIMESTAMP,
  }))

  const rejectedRows: Evidence[] = verification.rejected.map((item) => ({
    id: nextEvidenceId(),
    evaluationId,
    resumeId,
    requirementId: item.finding.requirementId,
    quote: item.finding.quote,
    charStart: Math.max(0, item.finding.charStart),
    charEnd: Math.max(1, item.finding.charEnd),
    verified: false,
    createdAt: DEMO_TIMESTAMP,
  }))

  // The server reads these back ordered by `char_start`, so the demo orders
  // them the same way. Nothing in the scoring depends on it — `decideMatch`
  // joins the quotes and asks whether a term appears — but the evidence a
  // reader is shown should arrive in the order the real screen shows it.
  const byCharStart = (a: Evidence, b: Evidence): number => a.charStart - b.charStart
  const evidence = [...verifiedRows, ...rejectedRows].sort(byCharStart)
  const verifiedEvidence = [...verifiedRows].sort(byCharStart)

  if (verification.rejected.length > 0) {
    audit.append({
      correlationId: evaluationId,
      stage: 'verify',
      eventType: 'unverifiable_evidence_rejected',
      actor: 'system',
      outcome: 'blocked',
      summary:
        `${verification.rejected.length} quoted passage(s) could not be found in the resume and were rejected. ` +
        'Nothing that cannot be found in the document is shown or counted.',
      payload: { reasons: verification.rejected.map((item) => item.reason) },
      entityType: 'evaluation',
      entityId: evaluationId,
    })
  }

  audit.append({
    correlationId: evaluationId,
    stage: 'verify',
    eventType: 'evidence_verified',
    actor: 'system',
    outcome: 'ok',
    summary: `${verification.verified.length} passage(s) were found in the resume exactly as quoted.`,
    payload: {
      verified: verification.verified.length,
      rejected: verification.rejected.length,
      malformed: malformed.length,
      offsetsCorrected: verification.verified.filter((item) => !item.offsetsWereCorrect).length,
    },
    entityType: 'evaluation',
    entityId: evaluationId,
  })

  // Emitted after `evidence_verified`, because that is the order `extract.ts`
  // appends them in — the extraction is recorded once the evidence it produced
  // has been checked.
  audit.append({
    correlationId: evaluationId,
    stage: 'extract',
    eventType: 'extraction_recorded',
    actor: 'ai',
    actorId: response.model,
    outcome: 'ok',
    summary: `Read the resume against ${requirements.length} requirement(s).`,
    payload: {
      model: response.model,
      promptVersion: EXTRACTION_PROMPT_VERSION,
      requirements: requirements.length,
    },
    entityType: 'evaluation',
    entityId: evaluationId,
  })

  // --- match and score -----------------------------------------------------
  //
  // `scoreEvaluation` calls `decideMatch` for every requirement itself, and
  // `decideMatch` re-checks `verified` on each passage rather than trusting the
  // list it was handed. Both locks are left in place: only verified rows are
  // passed in, and the rules check again.

  const score = scoreEvaluation(requirements, verifiedEvidence)
  const evidenceIgnored = evidence.length - verifiedEvidence.length

  const matches: RequirementMatch[] = score.rows.map((row, index) => ({
    id: `demo-match-${suffix}-${String(index + 1).padStart(2, '0')}`,
    evaluationId,
    requirementId: row.requirement.id,
    verdict: row.decision.verdict,
    confidence: row.decision.confidence,
    weightApplied: row.weightApplied,
    contributionBasisPoints: row.contributionBasisPoints,
    rationale: row.decision.rationale,
    createdAt: DEMO_TIMESTAMP,
  }))

  if (evidenceIgnored > 0) {
    audit.append({
      correlationId: evaluationId,
      stage: 'match',
      eventType: 'unverified_evidence_ignored',
      actor: 'system',
      outcome: 'blocked',
      summary:
        `${evidenceIgnored} quoted passage(s) were never found in the resume and took no part in this score. ` +
        'Only evidence checked against the document is counted.',
      payload: { ignored: evidenceIgnored, counted: verifiedEvidence.length },
      entityType: 'evaluation',
      entityId: evaluationId,
    })
  }

  audit.append({
    correlationId: evaluationId,
    stage: 'match',
    eventType: 'requirements_matched',
    actor: 'system',
    outcome: 'ok',
    summary: `Judged ${score.rows.length} requirement(s) against ${verifiedEvidence.length} verified passage(s).`,
    payload: {
      verdicts: score.rows.map((row) => ({
        requirementId: row.requirement.id,
        label: row.requirement.label,
        verdict: row.decision.verdict,
        confidence: row.decision.confidence,
      })),
      evidenceCounted: verifiedEvidence.length,
    },
    entityType: 'evaluation',
    entityId: evaluationId,
  })

  audit.append({
    correlationId: evaluationId,
    stage: 'score',
    eventType: 'score_computed',
    actor: 'system',
    outcome: 'ok',
    summary:
      `Scored ${score.scoreBasisPoints} of 10000, meeting ${score.mustHavesMet} of ` +
      `${score.mustHavesTotal} must-have(s).`,
    payload: {
      scoreBasisPoints: score.scoreBasisPoints,
      totalWeight: score.totalWeight,
      mustHavesMet: score.mustHavesMet,
      mustHavesTotal: score.mustHavesTotal,
      mustHavesUnclear: score.mustHavesUnclear,
      contributions: score.rows.map((row) => ({
        requirementId: row.requirement.id,
        weightApplied: row.weightApplied,
        verdict: row.decision.verdict,
        contributionBasisPoints: row.contributionBasisPoints,
      })),
    },
    entityType: 'evaluation',
    entityId: evaluationId,
  })

  const evaluation: Evaluation = {
    ...pending,
    status: 'scored',
    model: RESUME_MODEL,
    promptVersion: EXTRACTION_PROMPT_VERSION,
    latencyMs: response.latencyMs,
    scoreBasisPoints: score.scoreBasisPoints,
    mustHavesMet: score.mustHavesMet,
    mustHavesTotal: score.mustHavesTotal,
  }

  return {
    candidate,
    resume,
    evaluation,
    assessed: true,
    extraction: {
      systemPrompt,
      userMessage,
      rawOutput: response.output,
      model: response.model,
      promptVersion: EXTRACTION_PROMPT_VERSION,
      accepted,
      malformed,
    },
    verification,
    evidence,
    verifiedEvidence,
    matches,
    score,
    audit: audit.events.slice(before),
  }
}
