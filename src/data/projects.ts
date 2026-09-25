/**
 * Single source of truth for the three portfolio projects.
 *
 * Every surface — the Normal portfolio, the 3D experience, project detail
 * pages, and any future metadata — reads from here. Do not restate any of
 * these values inside a component.
 *
 * These describe real projects. Only add a field here when the claim is
 * backed by the project's own repository or a reachable deployment.
 */

export type ProjectId = 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6'

/** Deployment state of a project. */
export type ProjectStatus =
  /** Publicly reachable live demo. */
  | 'live'
  /** Complete and source-available, no public demo deployed yet. */
  | 'demo-pending'

export interface ProjectProof {
  /** Number of automated tests in the project's suite. */
  tests: number
  /**
   * Formal evaluation result, written exactly as the project reports it.
   * `null` when the project has no evaluation harness.
   */
  evaluation: string | null
  /** Other verified engineering properties worth surfacing. */
  properties: string[]
}

export interface ProjectLinks {
  /** Live deployment. `null` until one exists. */
  demo: string | null
  /** Source repository. `null` until the URL is filled in. */
  github: string | null
  /** Long-form write-up. `null` until the URL is filled in. */
  caseStudy: string | null
}

/**
 * What a visitor needs in order to use the live demo.
 *
 * `public-demo` is the only variant that carries credentials, and it exists
 * for an account deliberately created to be shared in public. Nothing that
 * belongs to a real person or a real customer goes in here, and no value is
 * ever guessed: a project with no known access simply leaves `access` unset
 * and the demo link behaves like any other link.
 */
export type ProjectAccess =
  /** Open to anyone with the link. */
  | { kind: 'open' }
  /** Needs an account. The portfolio says so rather than pretending. */
  | { kind: 'sign-in-required'; note?: string }
  /** A shared account made for the demo. Only ever filled in by hand. */
  | { kind: 'public-demo'; username: string; password: string; note?: string }

/**
 * A screenshot of the project actually running.
 *
 * Real captures from the deployed or locally-run application — never a mockup
 * and never an illustration, because a drawing presented as a screenshot
 * misrepresents what the thing looks like.
 *
 * `alt` and `caption` describe only what is visible in the frame. Neither is
 * allowed to claim behaviour the image does not show; the case study is where
 * claims belong, and they are backed by the repository rather than by a
 * picture.
 *
 * The intrinsic size is recorded so the panel can reserve the right box before
 * the file arrives and the text below it never jumps.
 */
export interface ProjectShot {
  /** Served from public/, so root-relative. */
  src: string
  alt: string
  /** One line naming what the visitor is looking at. */
  caption: string
  width: number
  height: number
}

/**
 * A recorded demo of the project actually running.
 *
 * The video counterpart of `ProjectShot`: a real capture, never a stand-in
 * for `interactiveDemo`, which is a separate, live, in-browser mechanism
 * rather than a recording. At most one per project — this is evidence, not a
 * highlight reel.
 *
 * `caption` describes only what is visible in the recording, for the same
 * reason a screenshot's caption does. The intrinsic size is recorded so the
 * panel can reserve the right box before the file arrives.
 */
export interface ProjectVideo {
  /** Served from public/, so root-relative. */
  src: string
  /** A still frame shown before playback starts. Served from public/, so root-relative. */
  poster?: string
  /** One line naming what the visitor is watching. */
  caption: string
  width: number
  height: number
}

export type ProjectActionEmphasis = 'primary' | 'secondary'

export interface ProjectAction {
  id: 'interactiveDemo' | 'demo' | 'github' | 'caseStudy'
  label: string
  href: string
  emphasis: ProjectActionEmphasis
  /**
   * False for a case study this portfolio hosts itself. It still opens in a
   * new tab — leaving the 3D route mid-visit would drop the visitor's place in
   * the journey — but being same-origin it carries no referrer policy.
   */
  external: boolean
  /** Spoken name, since the visible label is only two words. */
  accessibleName: string
}

/**
 * The long-form case study behind a project.
 *
 * Every field is optional and, right now, every one is absent: none of this
 * is written down anywhere in this repository. The panel renders a section
 * only when it has content, so filling any of these in makes it appear and
 * nothing has to be invented in the meantime.
 */
export interface ProjectCaseStudy {
  /** What was actually wrong before the system existed. */
  problem?: string
  /** How it was tackled. */
  approach?: string
  /** The moving parts, one per line. */
  architecture?: readonly string[]
  /** Engineering decisions worth defending. */
  engineering?: readonly string[]
  /** What changed once it shipped. Only with something real to say. */
  result?: string
}

export interface Project {
  id: ProjectId
  /** Ordinal used for stable ordering and 3D placement in later phases. */
  order: number
  title: string
  /** A few words placing the project, shown above the title. */
  category: string
  shortDescription: string
  status: ProjectStatus
  /**
   * The stack, once it is written down somewhere verifiable. Empty until
   * then — the panel simply omits the section rather than guessing.
   */
  technologies: readonly string[]
  proof: ProjectProof
  /** Evidence that it runs. Empty until a real capture exists. */
  screenshots: readonly ProjectShot[]
  /** A recorded walkthrough, if one has been captured. Absent until then. */
  video?: ProjectVideo
  links: ProjectLinks
  /** Absent until written. See `ProjectCaseStudy`. */
  caseStudy?: ProjectCaseStudy
  /** How the demo is reached. Absent while unknown. */
  access?: ProjectAccess
  /**
   * Whether this portfolio hosts an interactive demo of the project.
   *
   * A capability rather than a URL, which is why it is not in `ProjectLinks`:
   * the address is derived from the project's own id, so there is nothing to
   * store and nothing that can point at the wrong place. `links.demo` means
   * something different and must not be confused with it — that is a deployed
   * instance of the real system, reached over the network, and it is what the
   * "Live deployment" action opens.
   *
   * Absent means no demo, which is the state of every project that has not had
   * one built.
   */
  interactiveDemo?: boolean
}

export const PROJECTS: readonly Project[] = [
  {
    id: 'p1',
    order: 1,
    title: 'AI Customer Support & Sales Recovery',
    category: 'AI automation',
    technologies: [
      'Node.js',
      'Express',
      'Google Gemini',
      'Anthropic Claude',
      'Chroma',
      'Hugging Face Transformers',
      'SQLite',
      'Render',
    ],
    shortDescription:
      'An AI system that handles customer support conversations and recovers sales that would otherwise be lost.',
    status: 'live',
    proof: {
      tests: 206,
      evaluation: '16/16',
      properties: [
        'Eight guardrail policies enforced in code, not prompt text',
        'Evaluated against the live model, not only mocked responses',
      ],
    },
    screenshots: [
      {
        src: '/projects/p1-grounded-answer.png',
        alt: 'The support assistant answering “Is the Ceramic Mug in stock?” with “Yes, the Ceramic Mug is currently in stock with 42 units available.”, tagged “Checked product availability”.',
        caption: 'Every answer names the tool it checked first.',
        width: 942,
        height: 872,
      },
      {
        src: '/projects/p1-buying-signal-recovery.png',
        alt: 'A customer writes “I like this but I’m still deciding if I need it.” The assistant declines to answer and offers to connect them with the support team, tagged “Checked store information” and “Noticed: hesitation”.',
        caption: 'Hesitation is noticed — and an answer it cannot back is refused rather than guessed.',
        width: 912,
        height: 608,
      },
    ],
    links: {
      demo: 'https://sales-recovery-agent-j0mc.onrender.com',
      github:
        'https://github.com/S-MOHAMMAD-SYED-SAMEER/ai-business-automation/tree/main/sales-recovery-agent',
      caseStudy:
        'https://github.com/S-MOHAMMAD-SYED-SAMEER/ai-business-automation/blob/main/sales-recovery-agent/PROJECT-1.md',
    },
    access: { kind: 'open' },
    caseStudy: {
      problem:
        'A small D2C store loses sales in ways that each look minor: a shipping question left unanswered, a return policy unclear enough to make someone hesitate, a customer on the fence who gets a generic reply. Individually none of them are dramatic. Together they are a steady leak, and unlike a redesign they are fixable with support that is simply faster and more consistent than a small team can be by hand.',
      approach:
        'Two kinds of knowledge, kept deliberately apart. Static store policy is retrieved from documents; anything true only right now — an order status, a stock level, whether a discount code still works — comes from explicit tools. Both are offered to the model as ordinary tool calls, so it chooses what a message actually needs, and it is constrained by code rather than instructions from answering either kind of question without evidence.',
      architecture: [
        'Conversation history loaded from SQLite, keyed by session',
        'Deterministic signal detection over the current message',
        'System prompt assembled from a base plus any signal directive',
        'Tool-calling loop: business tools for live data, retrieval for policy',
        'Retrieval over the knowledge base with Chroma and local embeddings',
        'Guardrail validation of the drafted reply before it is returned',
        'User message and final reply persisted back to SQLite',
      ],
      engineering: [
        'Guardrails are application code, not prompt text: eight pure policies run against the reply after generation, whether or not the model followed instructions.',
        'Four of those policies cross-reference the reply against the tools that actually ran that turn, so a discount, stock or order-status claim with no matching tool call is blocked.',
        'Validation is fail-safe rather than silent — a failed policy returns a fixed, honest fallback offering a handover, never the unverified reply.',
        'Both model providers sit behind one interface, so switching between them is an environment variable rather than a code change.',
        'Memory uses the SQLite module built into Node, which avoids a native build step and an extra dependency entirely.',
        'Signal detection is deterministic rather than a second model call, so it is testable and costs nothing per message.',
      ],
      result:
        '206 of 206 automated tests pass. The 16-case evaluation suite passes 16/16 in deterministic mock mode and 16/16 in a real run against the live model — the real run being what surfaced two genuine bugs a mocked run could not have found. These numbers describe this dataset on these runs, not a general accuracy claim.',
    },
  },
  {
    id: 'p2',
    order: 2,
    title: 'AI Inbox & Lead Management',
    category: 'AI automation',
    technologies: [
      'Node.js',
      'TypeScript',
      'Express',
      'Anthropic Claude',
      'SQLite',
      'PostgreSQL',
      'React',
      'Vite',
      'Tailwind CSS',
      'Render',
    ],
    shortDescription:
      'An inbox-to-CRM system that triages incoming mail and moves qualified leads into the CRM.',
    status: 'live',
    proof: {
      tests: 827,
      evaluation: '10/10',
      properties: [
        'No value reaches the database without text quoted from the email',
        'Nothing is ever sent: an approved reply stops at the outbox',
      ],
    },
    screenshots: [
      {
        src: '/projects/p2-inbox-full-workflow.png',
        alt: 'An inbound email whose body contains a “SYSTEM: Ignore all previous instructions” block asking the agent to auto-approve the sender. The agent’s reading of it records only a large order and a request to confirm pricing, with most extracted fields marked “Not provided”.',
        caption: 'An instruction injected into the email body is read as text, not obeyed.',
        width: 1415,
        height: 868,
      },
      {
        src: '/projects/p2-human-approval.png',
        alt: 'The Approvals screen listing five decisions waiting on a person, each labelled “Consequential” with a confidence score and the rules that fired.',
        caption: 'Anything consequential waits for a person, with the rules that produced it shown.',
        width: 1762,
        height: 752,
      },
    ],
    links: {
      demo: 'https://inbox-crm-agent.onrender.com',
      github:
        'https://github.com/S-MOHAMMAD-SYED-SAMEER/ai-business-automation/tree/main/inbox-crm-agent',
      caseStudy: null,
    },
    access: {
      kind: 'sign-in-required',
      note: 'The dashboard is behind sign-in, so the demo needs an account. Free-tier hosting sleeps when idle — the first request after a quiet spell is slow.',
    },
    caseStudy: {
      problem:
        'Inbound business mail arrives faster than anyone keeps up with, and the cost is not the reading — it is that the CRM quietly drifts out of date. Handing the whole job to a model trades one problem for a worse one, because a confusing or hostile email then decides what gets written to the database.',
      approach:
        'One rule, applied throughout: the model proposes, deterministic code disposes, and a human authorises anything consequential. The model is used for the three things it is genuinely better at than code — classification, extraction and drafting — and for none of the things it is worse at: authority, arithmetic, state transitions, and judging whether an action is safe.',
      architecture: [
        'Ingest: inbound mail sanitised and stored',
        'Understand: the model reads each email behind a fenced user turn',
        'Resolve: entity matching against the CRM, with no model call at all',
        'Decide: deterministic rules turn understanding into a plan and a draft',
        'Approve: a queue ordered by remaining time, with a before/after diff',
        'Execute: the plan applied atomically, with before/after snapshots',
        'Two database drivers behind one interface, with an append-only audit log',
      ],
      engineering: [
        'The action registry is closed and contains no delete or bulk-update action — the destructive case is absent rather than merely gated.',
        'The approval gate is pure and deterministic, and never reads the model’s opinion; no setting or environment variable lets a consequential action run unattended.',
        'The executor re-runs the approval policy from stored facts and checks a fingerprint of the approved plan, so the UI is not the security boundary and a caller cannot assert approval.',
        'Email content never enters the system prompt: it arrives fenced in a user turn, escaped so it cannot close the fence, and the only tool the model has describes an email rather than acting.',
        'Every non-null extracted field must quote text present in the email; unsupported values are dropped and the drop is audited.',
        'Entity resolution is decided by fixed scores and thresholds, and two candidates within a narrow band are a conflict rather than a silent match.',
        'The audit repository exposes append and reads only — there is no update or delete method to call.',
      'Outbound sending sits behind two independent defaults that are both off, and the only provider implemented is a mock. An approved reply is written to the outbox as suppressed, with its reason recorded and the suppression audited — nothing in this build can deliver a message.',
      'The two database drivers disagreed over JSON columns — SQLite hands back the text it stored, Postgres hands back a parsed value — and it stayed hidden while every JSON column happened to hold an object. That divergence is pinned by a test now rather than by memory.',
      ],
      result:
        '827 automated tests pass across the API and the dashboard. The understand-stage evaluation runs ten demo cases through the real pipeline and passes 10/10, with a hallucinated-field rate of zero and full provenance and injection containment — the three metrics treated as absolutes rather than targets.',
    },
  },
  {
    id: 'p3',
    order: 3,
    title: 'Explainable ATS',
    category: 'Explainable systems',
    technologies: [
      'Node.js',
      'TypeScript',
      'Express',
      'SQLite',
      'PostgreSQL',
      'React',
      'Vite',
      'Tailwind CSS',
    ],
    shortDescription:
      'An applicant tracking system that scores candidates with logic you can read back and audit.',
    status: 'live',
    proof: {
      tests: 326,
      evaluation: null,
      properties: [
        'Deterministic integer scoring — no floating point in the scoring path',
        'Every citation verified character-for-character against the submitted CV',
        'Protected attributes redacted before the model sees the text',
      ],
    },
    screenshots: [
      {
        src: '/projects/p3-decision-audit-trail.png',
        alt: 'A ranked candidate list for a Senior Backend Engineer role. A candidate scoring 71 per cent is placed below one scoring 57 per cent, annotated “Does not meet: PostgreSQL”, and a candidate whose assessment has not finished is listed as “Not assessed yet” rather than hidden.',
        caption: 'Missing an essential outranks a higher score, and the reason sits next to it.',
        width: 1900,
        height: 1690,
      },
    ],
    links: {
      demo: 'https://explainable-ats.onrender.com',
      github:
        'https://github.com/S-MOHAMMAD-SYED-SAMEER/ai-business-automation/tree/main/explainable-ats',
      caseStudy: null,
    },
    // The pipeline also runs in the browser from the project's own source,
    // so the workflow can be stepped through here without leaving the
    // portfolio. The deployment above is the application itself.
    interactiveDemo: true,
    caseStudy: {
      problem:
        'A candidate score is only worth anything if the person reading it can see where it came from. Two failures make that impossible: a model that produces a citation which reads perfectly and does not exist in the CV, and a score whose parts do not add up to the number at the top of the page.',
      approach:
        'Treat both as things to make structurally impossible rather than to ask a model to avoid. Quotes are checked against the submitted text and rejected if they are not there. Scoring is integer arithmetic a recruiter can redo on paper. Protected attributes are removed from the input before the model is called, so they cannot influence an extraction because they are not present.',
      architecture: [
        'Ingest and parse the submitted CV',
        'Redact protected attributes, preserving exact character offsets',
        'Extract findings against the job requirements through a model adapter',
        'Verify every quoted finding against the original text',
        'Match findings to requirements by fixed rules',
        'Score by weighted integer arithmetic, then rank',
        'Two database drivers behind one interface, with an append-only audit log',
      ],
      engineering: [
        'Redaction masks each span with block characters of exactly equal length, so offsets in the redacted text index the original directly — no mapping table, no off-by-one.',
        'Redaction runs before the model is called, which is a stronger guarantee than instructing a model to ignore an attribute, because it does not depend on the model complying.',
        'A quoted finding must appear character-for-character in the submitted CV. Offsets are treated as a hint and the passage is searched for if it is not where the model said; a quote found nowhere is a fabrication and is rejected.',
        'The score is a weighted average computed entirely in integers, divided exactly once at the end, so the same evidence gives the same number on every machine.',
        'Per-requirement contributions are apportioned by largest remainder in a fixed order, so the column on the explanation screen sums exactly to the headline figure.',
        'Ranking issues five queries regardless of candidate count, writes nothing, and never reads evidence — it is a view of events, not an event.',
        'Both database drivers are held to the same behaviour by driver-parity and schema-parity tests.',
      ],
      result:
        '326 automated tests pass across the API and the dashboard. The build runs locally against a deterministic offline extractor by default, which is what makes the whole pipeline reproducible without a key or a spend; a Claude adapter is implemented behind the same interface but is not what the current build exercises.',
    },
  },
  {
    id: 'p4',
    order: 4,
    title: 'KnowledgeOS',
    category: 'RAG / Retrieval',
    technologies: [
      'Python',
      'FastAPI',
      'PostgreSQL',
      'pgvector',
      'SQLAlchemy',
      'Alembic',
      'sentence-transformers',
      'Google Gemini',
      'Jinja2',
      'Docker',
      'GitHub Actions',
    ],
    shortDescription:
      'Retrieval-grounded answers over internal documents, with citation validation and honest abstention.',
    status: 'demo-pending',
    proof: {
      tests: 1120,
      evaluation: null,
      properties: [
        'Hybrid retrieval (PostgreSQL full-text + pgvector) fused by Reciprocal Rank Fusion, reranked by a local CrossEncoder',
        'Every citation checked in Python against the retrieved evidence before an answer is shown — an invalid citation rejects the answer rather than displaying it',
        'Two separate demo mechanisms exist: a standalone, deterministic demo (`demo/`) that replays real, precomputed BGE and CrossEncoder output from committed fixtures through the production query pipeline via dependency overrides; and a newer, credential-free integrated demo mode inside the main application that serves fixed scenario answers without invoking BGE or CrossEncoder at all',
      ],
    },
    screenshots: [],
    links: {
      demo: null,
      github: 'https://github.com/S-MOHAMMAD-SYED-SAMEER/knowledgeos',
      caseStudy: null,
    },
    caseStudy: {
      problem:
        'An organization’s internal documentation is scattered and rarely trusted: an employee either digs through wikis and PDFs by hand, or asks a general LLM that answers confidently and cites nothing. A wrong answer with no citation is indistinguishable from a right one — the risk is not that evidence is missing, but that a system full of evidence still says something it cannot back.',
      approach:
        'Retrieval and generation are treated as separate failure modes, measured separately rather than blended into one score. Hybrid retrieval finds candidate evidence, a local reranker orders it, and generation is constrained to produce only citations a deterministic validator checks — in Python, not in the prompt — before an answer is ever shown. The system refuses outright when the evidence is insufficient rather than guessing.',
      architecture: [
        'Ingest, parse and chunk documents; embed with a local BGE model',
        'Hybrid retrieval: PostgreSQL full-text search + pgvector similarity, fused by Reciprocal Rank Fusion',
        'A local CrossEncoder reranks the fused candidates',
        'Generation constrained to a versioned prompt and a structured output contract (answer, citations, sufficient_evidence)',
        'Citation validation in Python: every citation checked against the retrieved, selected evidence before an answer is returned',
        'Deterministic grounding and evidence-based abstention when citation checks fail or evidence is insufficient',
        'One active document version enforced by a database constraint; superseded versions stay queryable for audit',
      ],
      engineering: [
        'Every model sits behind a provider interface — embedding, reranking and generation can each be swapped by writing an adapter, not changing a config flag',
        "The standalone demo/ package replays real, precomputed BGE and CrossEncoder output — generated once, historically, during that package's own fixture build — through the identical production query pipeline via FastAPI dependency overrides. A second, separately built demo mode now lives directly in the application (app/), serving fixed scenario answers through the same query API for a credential-free walkthrough; it does not invoke BGE or CrossEncoder, and is a distinct mechanism from the fixture-replay demo, not a replacement for it.",
        'Static tests enforce the architecture itself: no application module may select a fake provider, and full-text search is never mislabelled as BM25',
        'One active document version per document is a database-level constraint, not just application logic',
        'Retrieval and answer-quality evaluation each run as a separate offline harness against a labelled fixture corpus, kept apart from the deterministic citation and grounding checks',
      ],
      result:
        'The full merged test suite — covering both demo mechanisms, the core retrieval/reranking/generation pipeline, and the citation and grounding checks — passes 1,120 of 1,124 collected tests, with 4 skipped and 0 failed. The skips are a single, disclosed environment limitation: the real BGE and CrossEncoder model weights are not cached and network access to fetch them is blocked in the verification environment, so those specific real-model-inference tests are skipped rather than faked or force-passed. Retrieval and answer-quality evaluation harnesses exist and are proven correct against fixtures, but neither has produced an official score yet — none is claimed here.',
    },
  },
  {
    id: 'p5',
    order: 5,
    title: 'DocIntel',
    category: 'Document Intelligence',
    technologies: [
      'FastAPI',
      'Pydantic',
      'SQLAlchemy',
      'Alembic',
      'PostgreSQL',
      'Anthropic SDK',
      'pypdfium2',
      'Docker',
    ],
    shortDescription:
      'Extracts structured data from invoices and purchase orders, validates it deterministically outside the model, scores per-field confidence, and routes anything uncertain to a human review queue.',
    status: 'demo-pending',
    proof: {
      tests: 494,
      evaluation: null,
      properties: [
        'Deterministic validation runs outside the model — arithmetic, dates and currency codes are checked in Python, not trusted to generation',
        'Confidence scoring combines the model’s own signal with independent deterministic-check outcomes',
        'A failed deterministic check routes a field to human review regardless of how confident the model was',
        'Human corrections preserve the model’s original answer in an audit trail rather than overwriting it',
        'A deterministic, credential-free demo replays committed, hand-verified invoice answers through the same production extraction, validation, confidence-scoring and review pipeline via a FastAPI dependency override — never a separate implementation',
      ],
    },
    screenshots: [],
    links: {
      demo: null,
      github: 'https://github.com/S-MOHAMMAD-SYED-SAMEER/docintel',
      caseStudy: null,
    },
    caseStudy: {
      problem:
        'Businesses receive invoices and purchase orders as PDFs and photographs and need reliable structured data out of them. Handing the page to a vision model and storing whatever comes back is worse than no automation at all — a model will produce a plausible total that is off by one digit, or a date read day-first instead of month-first, with exactly the same confident tone as when it is right.',
      approach:
        'Extraction and trust are kept separate. A model proposes a structured answer against a strict schema, and every field is then independently re-checked in Python — arithmetic, line-item sums, ISO 4217 currency codes, date validity — regardless of what the model claims; the prompt explicitly instructs the model not to compute totals itself. Confidence is a weighted combination of the model’s own signal and those deterministic outcomes, and anything below a configurable threshold, or that fails a deterministic check outright, is routed to a human review queue rather than the export.',
      architecture: [
        'Upload validated by file signature and rendered to page images with pypdfium2',
        'Extraction through a provider-agnostic interface, currently backed by the Anthropic SDK (vision, structured outputs)',
        'Deterministic validation in Python: totals arithmetic, line-item sums, ISO 4217 currency codes, date validity',
        'Per-field confidence scoring combines model self-report with deterministic-check outcomes',
        'Anything below threshold — or failing a deterministic check regardless of score — is routed to a human review queue',
        'Corrections recorded with a full audit trail, preserving the model’s original answer for comparison',
        'One pipeline shared by invoices and purchase orders through registries, with no document-type conditionals',
      ],
      engineering: [
        'Deterministic checks run entirely outside the model; the prompt explicitly instructs it not to compute totals, so arithmetic is never trusted to generation',
        'Model confidence carries under half the weight of the final score, and a failed deterministic check forces review regardless of the model’s own confidence',
        'Corrections preserve the model’s original answer rather than overwriting it, so human and model judgment stay comparable',
        'An autouse test fixture patches the Anthropic client to raise on any call, with a dedicated test asserting the guard fires — no test can reach the real API',
        'The container runs as a non-root user with a health check; Alembic migrations are verified to upgrade, downgrade and re-upgrade cleanly',
        'An offline evaluation harness runs a committed, deterministic synthetic invoice dataset through the real pipeline with a stub provider, proving the harness itself works without needing model credentials',
        'The demo provider matches an uploaded document by the SHA-256 of its rendered page images against three committed fixtures — an unrecognised document fails closed with the same error path a real provider failure takes, never a silent guess',
        'Docker Compose packages the demo alongside production: a shared `migrate` service runs once, and both `app` and a dedicated `demo` service (serving `demo.app:app` on host port 8001) depend on it completing before either starts — `docker compose config` validates the merged graph, though the image has not yet been built or run against a live Docker daemon',
      ],
      result:
        '495 tests are collected; 494 pass. The one remaining failure is a known, environment-specific test-capture artifact — not a defect in the application — and has been reproduced independently of the environment it runs in. No real-model benchmark has been run: the evaluation harness is proven correct against a stub provider and a committed synthetic dataset, but extraction accuracy, cost and latency require an Anthropic API key and credits that were not available, so none of those numbers are claimed here. A deterministic, credential-free demo now exists, reusing the real pipeline end to end, and is packaged in Docker Compose alongside the production service; the Compose configuration itself has been validated, but building and running the container has not yet been verified against a live Docker daemon.',
    },
  },
  {
    id: 'p6',
    order: 6,
    title: 'VoiceDesk',
    category: 'Voice AI',
    technologies: [
      'Python 3.13',
      'FastAPI',
      'Uvicorn',
      'WebSockets',
      'SQLAlchemy 2.x',
      'Alembic',
      'psycopg 3',
      'PostgreSQL',
      'Twilio Media Streams',
      'Anthropic SDK',
    ],
    shortDescription:
      'Answers a business phone line, understands the caller, books or reschedules appointments in a real calendar, and hands off to a human when it should.',
    status: 'demo-pending',
    proof: {
      tests: 1660,
      evaluation: '18/18',
      properties: [
        'Double-booking prevented by a PostgreSQL exclusion constraint, not application logic alone',
        'A deterministic evaluation suite scripts eighteen calls through the real system and scores tool-calling, escalation and final database state against structured ground truth',
        'Speech-to-text, text-to-speech and the dialogue model each sit behind a provider interface, swappable without touching the dialogue code',
        'A browser harness exercises the real dialogue, tool-calling and calendar pipeline with no telephony credential required, bounded by a 300-second session limit and a 20-turn cap so a demo session cannot run unbounded',
      ],
    },
    screenshots: [],
    links: {
      demo: null,
      github: 'https://github.com/S-MOHAMMAD-SYED-SAMEER/voicedesk',
      caseStudy: null,
    },
    caseStudy: {
      problem:
        'A missed call is a lost booking. Clinics, salons and trades businesses lose revenue to calls nobody could answer in time, and the hard part is not recognising speech — it is knowing when to stop talking and hand off to a person.',
      approach:
        'Six tools mediate every action the model can take on a call: check_availability, book_appointment, reschedule, cancel, take_message and transfer_to_human. The dialogue layer was built and tested as text in, text out — no audio involved — before telephony was added, so the logic was stable before the hardest engineering (streaming speech, barge-in, latency) had to work at the same time. Double-booking is prevented at the database layer, not trusted to application code.',
      architecture: [
        'Caller → Twilio Media Stream (WS) → audio buffer → streaming speech-to-text → turn manager',
        'LLM turn with tool use → tool executor → CalendarService → PostgreSQL',
        'Text-to-speech → audio back to the caller, with full transcript, tool calls, latency and cost persisted per call',
        'A PostgreSQL exclusion constraint (EXCLUDE USING gist) prevents two callers from ever double-booking the same slot',
        'A deterministic evaluation harness scripts eighteen calls through the real system and scores the result against structured ground truth',
      ],
      engineering: [
        'Double-booking is enforced by a PostgreSQL exclusion constraint ahead of any booking code, so two callers who both pass an availability check cannot both win the race',
        'The dialogue layer is testable with text in, text out and no audio anywhere near it — audio is an adapter, not the product',
        '`transfer_to_human` records the intent and reason to escalate; actually connecting the caller to a person is not implemented',
        'Speech-to-text, text-to-speech and the dialogue model each sit behind a provider interface, so swapping one is an adapter, not a config change',
        'A browser harness (`/harness`, `/ws/harness`) runs the identical `Conversation` → tool layer → `CalendarService` → PostgreSQL pipeline a phone call runs, with speech providers defaulting to a deterministic offline mode — a fixed transcript and a tone — so it needs no STT/TTS credential; real dialogue still needs an Anthropic key, and telephony itself is untouched and stays off by default',
        'Two harness-only bounds — a 300-second session limit and a 20-turn cap, neither a rate limit nor authentication — close a demo session cleanly through the same admission and cleanup path a hung-up call already uses',
      ],
      result:
        '1,661 tests collected; 1,660 pass, with one known pre-existing intermittent realtime telephony timing test. Focused browser-harness/demo coverage: 73/73 pass. The deterministic evaluation suite — eighteen scripted call scenarios run against the real system — scores 18/18 task success, covering straightforward booking, rescheduling, ambiguous dates and four adversarial scenarios that must be refused. This measures VoiceDesk’s own tool-calling, escalation and database behaviour against structured ground truth; the scenario model answers from a script, so the suite does not measure a real model’s conversational quality. A browser demo is documented and runnable through the existing Docker Compose stack, exercising the real pipeline end to end without a phone number; production telephony behaviour is unchanged.',
    },
  },
] as const

/** Human-readable labels for each status, for use in UI. */
export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  live: 'Live',
  'demo-pending': 'Demo pending',
}

export function getProject(id: ProjectId): Project | undefined {
  return PROJECTS.find((project) => project.id === id)
}

export function isProjectId(value: string): value is ProjectId {
  return PROJECTS.some((project) => project.id === value)
}

/**
 * The verifiable facts about a project, phrased for display.
 *
 * Built from `proof` rather than written by hand, so nothing can appear here
 * that is not already recorded above.
 */
export function projectHighlights(project: Project): string[] {
  const highlights = [`${project.proof.tests.toLocaleString()} automated tests`]

  if (project.proof.evaluation !== null) {
    highlights.push(`${project.proof.evaluation} on its evaluation suite`)
  }

  return [...highlights, ...project.proof.properties]
}

/**
 * The actions a project can actually offer.
 *
 * Built from the links that exist, so a missing URL produces no button at
 * all rather than one that goes nowhere. The demo leads because it is the
 * thing a visitor most wants; source and write-up follow.
 */
export function projectActions(project: Project): ProjectAction[] {
  const candidates: (ProjectAction | null)[] = [
    project.interactiveDemo !== true
      ? null
      : {
          id: 'interactiveDemo',
          label: 'Try interactive demo',
          // Built here rather than imported from `lib/routes`, which imports
          // `ProjectId` from this file — the same reason the case-study action
          // below writes its path out by hand.
          href: `/projects/${project.id}/demo`,
          emphasis: 'primary',
          external: false,
          accessibleName: `Open the interactive demo of ${project.title}`,
        },
    project.links.demo === null
      ? null
      : {
          id: 'demo',
          label: 'Live demo',
          href: project.links.demo,
          emphasis: 'primary',
          external: true,
          accessibleName: `Open the live demo for ${project.title} in a new tab`,
        },
    project.links.github === null
      ? null
      : {
          id: 'github',
          label: 'GitHub',
          href: project.links.github,
          emphasis: 'secondary',
          external: true,
          accessibleName: `Open the source for ${project.title} on GitHub in a new tab`,
        },
    caseStudyAction(project),
  ]

  return candidates.filter((action): action is ProjectAction => action !== null)
}

/**
 * Where "Case study" points.
 *
 * A published write-up wins when one exists — P1 has one, and a document the
 * author wrote about his own project beats anything assembled here. Where none
 * exists the portfolio hosts the case study itself on a shareable per-project
 * URL, rather than pointing at a README and calling that a write-up.
 *
 * A project with neither gets no action, which is why this returns null.
 */
function caseStudyAction(project: Project): ProjectAction | null {
  if (project.links.caseStudy !== null) {
    return {
      id: 'caseStudy',
      label: 'Case study',
      href: project.links.caseStudy,
      emphasis: 'secondary',
      external: true,
      accessibleName: `Read the case study for ${project.title} in a new tab`,
    }
  }

  if (project.caseStudy === undefined) return null

  return {
    id: 'caseStudy',
    label: 'Case study',
    href: `/projects/${project.id}`,
    emphasis: 'secondary',
    external: false,
    accessibleName: `Read the case study for ${project.title} in a new tab`,
  }
}

export interface CaseStudySection {
  id: string
  title: string
  body: string | readonly string[]
}

/**
 * The case-study sections that actually have content.
 *
 * Returning only populated sections is what keeps the detail view free of
 * empty headings — there is no "coming soon" state, a section either says
 * something or is not there.
 */
export function caseStudySections(project: Project): CaseStudySection[] {
  const study = project.caseStudy
  if (study === undefined) return []

  const candidates: CaseStudySection[] = [
    { id: 'problem', title: 'The problem', body: study.problem ?? '' },
    { id: 'approach', title: 'The approach', body: study.approach ?? '' },
    { id: 'architecture', title: 'System', body: study.architecture ?? [] },
    { id: 'engineering', title: 'Engineering', body: study.engineering ?? [] },
    { id: 'result', title: 'Result', body: study.result ?? '' },
  ]

  return candidates.filter((section) =>
    typeof section.body === 'string' ? section.body.length > 0 : section.body.length > 0,
  )
}

export function projectById(id: ProjectId): Project | undefined {
  return PROJECTS.find((project) => project.id === id)
}
