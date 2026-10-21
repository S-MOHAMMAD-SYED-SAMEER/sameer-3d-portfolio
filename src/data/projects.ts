/**
 * Single source of truth for the three portfolio projects.
 *
 * Every surface — the Normal portfolio, the 3D experience, project detail
 * pages, and any future metadata — reads from here. Do not restate any of
 * these values inside a component.
 *
 * These describe real projects. Only add a field here when the claim is
 * backed by the project's own repository.
 */

export type ProjectId = 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6'

/** State of a project. */
export type ProjectStatus =
  /** Complete, tested and source-available. */
  'built'

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
  /** Source repository. `null` until the URL is filled in. */
  github: string | null
  /** Long-form write-up. `null` until the URL is filled in. */
  caseStudy: string | null
}

/**
 * A screenshot of the project actually running.
 *
 * Real captures of the running application — never a mockup
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
 * for `interactiveDemo`, which is a separate, in-browser mechanism
 * rather than a recording. At most one per project — this is evidence, not a
 * highlight reel.
 *
 * `caption` describes only what is visible in the recording, for the same
 * reason a screenshot's caption does. The intrinsic size is recorded so the
 * panel can reserve the right box before the file arrives.
 */
export interface ProjectVideo {
  /** Root-relative (served from this site's public/), or an absolute https URL when the file is hosted by the portfolio site. */
  src: string
  /** A still frame shown before playback starts. Same rule as `src`. */
  poster?: string
  /** WebVTT captions for `src` (an English text track, on by default). Same rule as `src`; a cross-origin file needs CORS. */
  captions?: string
  /** One line naming what the visitor is watching. */
  caption: string
  width: number
  height: number
}

export type ProjectActionEmphasis = 'primary' | 'secondary'

export interface ProjectAction {
  id: 'interactiveDemo' | 'github' | 'caseStudy'
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
  /**
   * Whether this portfolio hosts an interactive demo of the project.
   *
   * A capability rather than a URL, which is why it is not in `ProjectLinks`:
   * the address is derived from the project's own id, so there is nothing to
   * store and nothing that can point at the wrong place.
   *
   * Absent means no demo, which is the state of every project that has not had
   * one built.
   */
  interactiveDemo?: boolean
  /**
   * An interactive demo that lives on the normal portfolio rather than here: the same address that
   * site uses for it. Offered as "Try interactive demo" and opened in a new tab. Absent where this site
   * has its own demo (`interactiveDemo`) or there is none.
   */
  interactiveDemoUrl?: string
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
    ],
    shortDescription:
      'An AI system that handles customer support conversations and recovers sales that would otherwise be lost.',
    status: 'built',
    proof: {
      tests: 530,
      evaluation: '21/21 (live Gemini)',
      properties: [
        'Eight guardrail policies enforced in code, not prompt text',
        'Evaluated on a live model (Gemini), not only mocked responses, with the first result and the grader fix both reported',
        'Every reply carries a trace of what the server did, shown in an Operator view',
      ],
    },
    screenshots: [
      {
        src: '/projects/p1-hesitation-operator.png',
        alt: 'A hesitant buyer’s reply stating the 30-day return window, with chips for the store information checked, the source file returns-policy.md and the hesitation noticed, beside an Activity panel listing the signal, the model call, the knowledge-base search and the guardrail policies.',
        caption: 'Hesitation is noticed by a plain rule, the store’s own return policy is searched, and the panel shows the file it used. Live Gemini run, 2026-10-15, fictional store.',
        width: 1920,
        height: 960,
      },
      {
        src: '/projects/p1-guardrail-provenance.png',
        alt: 'A reply declining a 50% off code and mentioning only WELCOME10, beside the guardrail list where the discount-claim line reads: WELCOME10 verified by checkDiscount on question 2.',
        caption: 'Asked for 50% off, it declines and mentions only a code it already verified; the guardrail records which question that was. Live Gemini run, 2026-10-15.',
        width: 1920,
        height: 960,
      },
      {
        src: '/projects/p1-operator-steps.png',
        alt: 'The Operator view for an order question: a model call, the getOrderStatus tool call with its arguments and result, a second model call, and the guardrail with its eight policies all passed.',
        caption: 'The steps of one reply: model call, tool call, model call, then eight guardrail policies. Live Gemini run, 2026-10-15.',
        width: 1920,
        height: 960,
      },
    ],
    video: {
      src: 'https://portfolio-azure-six-79.vercel.app/videos/sales-recovery-agent-16x9.mp4',
      poster: 'https://portfolio-azure-six-79.vercel.app/videos/sales-recovery-agent-poster.jpg',
      captions: 'https://portfolio-azure-six-79.vercel.app/videos/sales-recovery-agent.vtt',
      caption: 'A 90-second recording of the real app on a live Gemini run (2026-10-15): fictional store and data, nothing edited. AI-voice narration.',
      width: 1920,
      height: 1080,
    },
    links: {
      github: 'https://github.com/S-MOHAMMAD-SYED-SAMEER/sales-recovery-agent',
      caseStudy:
        'https://github.com/S-MOHAMMAD-SYED-SAMEER/sales-recovery-agent/blob/main/PROJECT-1.md',
    },
    interactiveDemoUrl: 'https://portfolio-azure-six-79.vercel.app/demo-sales-recovery.html',
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
        'A per-turn trace recorded as the turn runs and returned with the reply, drawn in an Operator view',
      ],
      engineering: [
        'Guardrails are application code, not prompt text: eight pure policies run against the reply after generation, whether or not the model followed instructions.',
        'Four of those policies cross-reference the reply against the tools that actually ran that turn, so a discount, stock or order-status claim with no matching tool call is blocked.',
        'Validation is fail-safe rather than silent — a failed policy returns a fixed fallback that says the support team can help, never the unverified reply. Nothing in the system actually hands the customer to a person.',
        'Both model providers sit behind one interface, so switching between them is an environment variable rather than a code change. The Anthropic adapter is implemented but has not yet been run against the live API.',
        'Memory uses the SQLite module built into Node, which avoids a native build step and an extra dependency entirely.',
        'Signal detection is deterministic rather than a second model call, so it is testable and costs nothing per message.',
        'The trace is recorded by the code that does the work, not reconstructed from the reply, and holds names, ids and numbers only: never a key, the environment, the system prompt or a passage’s text.',
      ],
      result:
        '530 of 530 automated tests pass. The 21-case evaluation suite passes 21/21 in deterministic mock mode, which replays scripted answers, and was run three times on a live model (Gemini 3.5 Flash-Lite): 18/21 the first time, where all three misses were correct replies the grader mis-scored, then 21/21 on the corrected grader with fresh replies, and 21/21 again on 2026-10-15 after one prompt directive changed. On real drafts, AI-labelled by one reviewer (Claude Code); a sample of 20 checked by Sameer: agreed with 19, relabelled 1, the guardrails blocked two good replies (2 of 40), which was fixed; a first fix for a gap in promotion claims blocked 6 of 11 fresh answers, five of them honest, and was revised; the final policy blocks 0 of 83 clean drafts and misses none of four promotion claims, though two unsupported claims of kinds the guardrails don\'t check (a store fact and a promised capability) still get through. Ten injection attempts all held, as read by the same AI reviewer. One recorded run of the five demo prompts with the trace on made 8 model requests, blocked no reply, and all five traces agreed with what the turn did. These numbers describe this dataset on these runs, not a general accuracy claim. The Anthropic adapter is implemented and has not yet been run.',
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
      'Google Gemini (gemini-3.5-flash-lite, evaluated)',
      'Anthropic Claude (implemented, not run)',
      'SQLite',
      'PostgreSQL',
      'React',
      'Vite',
      'Tailwind CSS',
    ],
    shortDescription:
      'An inbox-to-CRM system that triages incoming mail and moves qualified leads into the CRM.',
    status: 'built',
    proof: {
      tests: 1103,
      evaluation: '0 unsafe actions planned in 21 real-model plans',
      properties: [
        'On the ten demo emails the scripted mock passes 10 of 10 full cases and the real model 2 to 4 of 10 (three runs, one model, one temperature): the mock measures the code around a model, not the model',
        'No value reaches the database without text quoted from the email',
        'Nothing is ever sent: an approved reply stops at the outbox',
      ],
    },
    screenshots: [
      {
        src: '/projects/p2-inbox-full-workflow.png',
        alt: 'The one example email that carries hidden instructions, opened in the mock-provider demo. Beside it is the scripted answer standing in for the model, which records only a large order and a request to confirm pricing, with most extracted fields marked “Not provided”.',
        caption: 'The one example email (of ten) with hidden instructions, run with scripted model answers. That answer was deliberately fooled; the separate deterministic check is what flagged it and sent it to a person. A real model flagged it itself in three runs.',
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
    video: {
      src: 'https://portfolio-azure-six-79.vercel.app/videos/inbox-crm-agent-16x9.mp4',
      poster: 'https://portfolio-azure-six-79.vercel.app/videos/inbox-crm-agent-poster.jpg',
      captions: 'https://portfolio-azure-six-79.vercel.app/videos/inbox-crm-agent.vtt',
      caption: 'An 86-second recording of the real app on a live Gemini run (2026-10-18): invented data, nothing edited. The last scene is the guest demo, which runs when you run the app locally (not hosted yet). AI-voice narration.',
      width: 1920,
      height: 1080,
    },
    links: {
      github: 'https://github.com/S-MOHAMMAD-SYED-SAMEER/inbox-crm-agent',
      caseStudy: null,
    },
    interactiveDemoUrl: 'https://portfolio-azure-six-79.vercel.app/demo-inbox-crm.html',
    caseStudy: {
      problem:
        'Inbound business mail arrives faster than anyone keeps up with, and the cost is not the reading — it is that the CRM quietly drifts out of date. Handing the whole job to a model trades one problem for a worse one, because a confusing or hostile email then decides what gets written to the database.',
      approach:
        'One rule, applied throughout: the model proposes, deterministic code disposes, and a human authorises anything consequential. The model is used for the three things it is genuinely better at than code — classification, extraction and drafting — and for none of the things it is worse at: authority, arithmetic, state transitions, and judging whether an action is safe.',
      architecture: [
        'Ingest: inbound mail sanitised and stored',
        'Understand: the model reads each email behind a fenced user turn (evaluated with a scripted mock and, separately, with a real model), then a deterministic injection check runs on the email after the model has answered',
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
        '1103 automated tests pass across the API and the dashboard. Against a real model (gemini-3.5-flash-lite, temperature 1), three repeats of the ten-email evaluation gave: category 80% and priority 70%; extraction F1 0.91 to 0.95; no invented fields once names, titles and companies had to be written in the email; 6 of 7 planned decisions matching, with action accuracy and approval-policy accuracy both 100%; and 0 unsafe actions in 21 plans. 12 of 12 attack emails reached a person in the latest run, and the ambiguous email reached a person in 3 of 3 runs. The scripted mock passes every case (10/10) while the real model passes every check on only 2 to 4 of the ten: the mock tests the code around a model, not a model. Limits: ten emails, seven planned decisions and twelve attacks; one model; the expected answers were written by Claude and reviewed with AI assistance (final decisions by Sameer), not independently; the attack set is not held out from the detector; and in an earlier run the model once obeyed an attack, yet the email still reached a person. The Claude provider is implemented and has not been run. Nothing was run against a real mailbox.',
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
    status: 'built',
    proof: {
      tests: 886,
      evaluation: '86.8% verdict agreement (one run, AI-drafted labels)',
      properties: [
        'Deterministic integer scoring — integer arithmetic with one floor-division',
        'A model proposes each verdict; the code lowers any verdict whose quote is not in the CV',
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
      github: 'https://github.com/S-MOHAMMAD-SYED-SAMEER/explainable-ats',
      caseStudy: null,
    },
    // The pipeline also runs in the browser from the project's own source,
    // so the workflow can be stepped through here without leaving the
    // portfolio.
    interactiveDemo: true,
    caseStudy: {
      problem:
        'A candidate score is only worth anything if the person reading it can see where it came from. Two failures make that impossible: a model that produces a citation which reads perfectly and does not exist in the CV, and a score whose parts do not add up to the number at the top of the page.',
      approach:
        'Treat both as things to make structurally impossible rather than to ask a model to avoid. Quotes are checked against the submitted text and rejected if they are not there. Scoring is integer arithmetic a recruiter can redo on paper. A model proposes each verdict and the code checks it: a verdict with no verified quote is lowered to not demonstrated, and a rule-based second opinion is shown and never changes the score. Protected attributes are removed from the input before the model is called, so they cannot influence an extraction because they are not present.',
      architecture: [
        'Ingest the submitted CV (plain text)',
        'Redact protected attributes, preserving exact character offsets',
        'Extract a verdict and its quotes for each requirement through a model adapter',
        'Verify every quote against the original text, and lower any verdict left without one',
        'Check each verdict against its quotes; a fixed rule gives a second opinion that changes no score',
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
        'The model proposes the verdict and the code checks it because rules alone agreed with the labels only 35 to 40% of the time, even when handed perfect quotes. A first attempt that let the rules overrule the model cost nine points on the same rows, and was removed.',
      ],
      result:
        '886 automated tests pass across the API and the dashboard when the two portfolio repositories are checked out beside the project, as its CI does (in a standalone clone 874 pass and 12 skip). Against a real model (Claude Haiku 4.5, temperature 0, one run on 2026-10-19), 59 of 68 verdicts (86.8%) matched the labels, 17 of 20 candidates landed in the right tier, 92.5% of the labelled passages were found, and 2 of 77 quotes were not in the CV and were rejected; the code lowered 2 verdicts that had no verified quote and flagged 6 credited verdicts whose quote shared no word with the requirement, which sent 1 of 20 candidates to review. A rule-based check alone, on the same quotes, matched 38.2%. Limits: twenty CVs written by an AI and 68 labels that are not an independent human labelling (drafted by ChatGPT, reviewed independently by ChatGPT and Claude, who agreed on 64 of 68 rows; final decisions approved by Sameer); one model, one run; the rules were chosen on those same rows, so this is not a held-out figure; five more CVs were written to be held out and were never labelled or run. Of eight hostile CVs, the seven with hidden instructions did not fool the real model; the one stuffed with keywords was credited in full, which is a known limit. The public demo runs a deterministic offline extractor, not the model.',
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
    status: 'built',
    proof: {
      tests: 1314,
      evaluation: 'retrieval MRR 0.91 with reranking (0.74 without); real model: 32 of 33 answers passed the citation check, 12 of 45 answerable questions got no answer',
      properties: [
        'Hybrid retrieval (PostgreSQL full-text + pgvector) fused by Reciprocal Rank Fusion, reranked by a local CrossEncoder',
        'Retrieval measured offline with the real models and no API key, on a 30-chunk fixture corpus (45 of 52 questions scored): Recall@5 0.9444, Recall@10 0.9926, MRR 0.9081 and nDCG@10 0.9142 with the reranker, against 0.8889, 0.9630, 0.7375 and 0.7927 without it. Answers measured on gemini-3.5-flash-lite on 2026-10-20 against 52 questions written by Claude, reviewed by ChatGPT and Claude, and approved by Sameer: 32 of 33 answers passed the citation check with the default prompt (29 of 33 with the original), 12 of the 45 answerable questions got no answer (stopped by the abstention threshold before the model was asked), 7 of 7 unanswerable questions abstained on, one run per prompt, and an abstention threshold calibrated on the same questions',
        'Every citation checked in Python against the retrieved evidence before an answer is shown — an invalid citation rejects the answer rather than displaying it',
        'Two separate demo mechanisms exist: a standalone, deterministic demo (`demo/`) that replays real, precomputed BGE and CrossEncoder output from committed fixtures through the production query pipeline via dependency overrides; and a credential-free integrated demo mode inside the main application that runs the real BGE embedding and CrossEncoder reranking providers while using fixed scenario answers for the generation step',
      ],
    },
    screenshots: [],
    links: {
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
        "The standalone demo/ package replays real, precomputed BGE and CrossEncoder output — generated once, historically, during that package's own fixture build — through the identical production query pipeline via FastAPI dependency overrides. A second demo mode now lives directly in the application (app/): it runs the real BGE embedding and CrossEncoder reranking providers against the seeded corpus, while the generation step uses fixed scenario answers through the credential-free DemoLLMProvider.",
        'Static tests enforce the architecture itself: no application module may select a fake provider, and full-text search is never mislabelled as BM25',
        'One active document version per document is a database-level constraint, not just application logic',
        'Retrieval and answer-quality evaluation each run as a separate offline harness against a labelled fixture corpus, kept apart from the deterministic citation and grounding checks',
      ],
      result:
        'The full merged test suite — covering both demo mechanisms, the core retrieval/reranking/generation pipeline, and the citation and grounding checks — passes 1,314 of 1,318 collected tests in CI, with 4 skipped and 0 failed. The skips are the three tests that load the real BGE and CrossEncoder weights (CI never downloads them) and the opt-in Gemini smoke test: skipped rather than faked or counted as passing. On a laptop with both models cached, 1,316 of the same 1,318 pass, with 2 skipped and 0 failed; an earlier 11 failures there were all environmental, none were application bugs, and they are fixed. CI also builds the image, starts the demo stack and asks it a question. The retrieval evaluation ran on 2026-10-20 with the real models and no API key: on a 30-chunk corpus, the reranker lifts MRR from 0.7375 to 0.9081 and Recall@5 from 0.8889 to 0.9444. The answers evaluation ran the same day on gemini-3.5-flash-lite, once per prompt version: with the default prompt 32 of the 33 questions that reached the model passed the citation check (1 rejected), against 29 of 33 (4 rejected) with the original prompt, and all 7 questions with no answer in the documents were abstained on. Those figures are small and narrow: the 52 questions were written by Claude, reviewed by ChatGPT and Claude, and approved by Sameer; the abstention threshold was calibrated on the same 52 questions; it is one model, one day and one run per prompt; and 12 of the 45 answerable questions got no answer because the threshold stopped them before the model was asked. Nothing has been measured at scale.',
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
    status: 'built',
    proof: {
      tests: 658,
      evaluation: 'real model: 387 of 390 fields correct on 30 synthetic invoices (one run); 2 wrong values not flagged for review',
      properties: [
        'Deterministic validation runs outside the model — arithmetic, dates and currency codes are checked in Python, not trusted to generation',
        'Confidence scoring combines the model’s own signal with independent deterministic-check outcomes',
        'A failed deterministic check routes a field to human review regardless of how confident the model was',
        'Human corrections preserve the model’s original answer in an audit trail rather than overwriting it',
        'A deterministic, credential-free demo replays committed, hand-verified invoice answers through the same production extraction, validation, confidence-scoring and review pipeline via a FastAPI dependency override — never a separate implementation',
        'Real-model runs of 2026-10-21 (claude-haiku-4-5, 64 requests, USD 0.51, synthetic documents, labels by construction, one run of each prompt): 387 of 390 fields correct with the default prompt, 3 wrong, 2 of those not flagged for review, both on image-only documents where the model\'s own confidence is the only signal; 384 of 390 with the first prompt, 4 wrong values not flagged as run and 2 after the text-layer check was fixed and the saved outputs re-scored. The harder 10-invoice set is a smoke test, barely harder: both prompts missed the same 3 of 130 fields',
      ],
    },
    screenshots: [],
    links: {
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
        'The demo provider matches an uploaded document by the SHA-256 of the uploaded PDF’s own bytes against three committed fixtures — an unrecognised document fails closed with the same error path a real provider failure takes, never a silent guess',
        'CI runs ruff and the full suite on Linux with PostgreSQL, the no-database tests on Windows and a dependency audit, builds the Docker image, starts the stack (database, migration, app, seed, demo), extracts a seeded invoice through the demo and reads the record back',
      ],
      result:
        '658 tests pass in CI on Linux with PostgreSQL (391 pass and 267 skip without a database). Real-model runs on 2026-10-21 (claude-haiku-4-5, 64 requests and USD 0.51 of an 80-request, USD 2.00 cap; one run of each prompt on 30 synthetic invoices whose labels are the values they were rendered from, plus a 3-document purchase-order smoke test): the default prompt got 387 of 390 fields correct, 3 wrong, and 2 of those 3 were not flagged for review; the first prompt got 384 of 390, with 4 wrong values not flagged as run. The text-layer check had accepted a truncated value and one with an invisible character; it was replaced after the runs and the saved outputs re-scored offline, which left 2 unflagged wrong values for the first prompt and 2 for the default. Both unflagged values are on image-only documents, where there is no text layer and the model\'s own confidence is the only signal; the 0.85 review threshold is unchanged and has a boundary case (a score of exactly 0.850 passes). All of the default prompt\'s gain is on the 20 easy invoices it was written from; on the 10 harder invoices (a smoke test, barely harder) both prompts missed the same 3 of 130 fields. A date read month-first was caught by the deterministic date check and sent to review. These numbers describe these documents on these runs, not accuracy on real invoices, other models, or production use.',
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
    status: 'built',
    proof: {
      tests: 1666,
      evaluation: '18/18 scripted calls (no real model)',
      properties: [
        'Double-booking prevented by a PostgreSQL exclusion constraint, not application logic alone',
        'A deterministic evaluation suite scripts eighteen calls through the real system and scores tool-calling, escalation and final database state against structured ground truth',
        'Speech-to-text, text-to-speech and the dialogue model each sit behind a provider interface, swappable without touching the dialogue code',
        'A browser harness exercises the real dialogue, tool-calling and calendar pipeline with no telephony credential required, bounded by a 300-second session limit and a 20-turn cap so a demo session cannot run unbounded',
      ],
    },
    screenshots: [],
    links: {
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
        '1,666 collected, with a PostgreSQL database available; 1,666 pass. The deterministic evaluation suite — eighteen scripted call scenarios run against the real system — scores 18/18 task success, covering straightforward booking, rescheduling, ambiguous dates and four adversarial scenarios that must be refused. This measures VoiceDesk’s own tool-calling, escalation and database behaviour against structured ground truth; the scenario model answers from a script, so the suite does not measure a real model’s conversational quality. A browser demo is documented and runnable through the existing Docker Compose stack, exercising the real pipeline end to end without a phone number; production telephony behaviour is unchanged.',
    },
  },
] as const

/** Human-readable labels for each status, for use in UI. */
export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  built: 'Built',
}

export function getProject(id: ProjectId): Project | undefined {
  return PROJECTS.find((project) => project.id === id)
}

export function isProjectId(value: string): value is ProjectId {
  return PROJECTS.some((project) => project.id === value)
}

/** A count as shown on the site: thousands separated, the same everywhere. */
export function formatCount(value: number): string {
  return value.toLocaleString('en-US')
}

/**
 * Total automated tests across projects — the one place the headline figure is
 * computed, so it cannot drift from the per-project `proof.tests` it sums.
 */
export function totalTests(projects: readonly Project[] = PROJECTS): number {
  return projects.reduce((total, project) => total + project.proof.tests, 0)
}

/** "1,135 tests": a project's own count, phrased for a services list. */
export function testsLabel(id: ProjectId): string {
  const project = getProject(id)
  if (project === undefined) throw new Error(`No project with id "${id}"`)
  return `${formatCount(project.proof.tests)} tests`
}

/**
 * A project's evaluation headline, exactly as its `proof.evaluation` says it, for a services line that
 * restates it. Read from the project rather than written again, so the two cannot drift.
 */
export function evaluationOf(id: ProjectId): string {
  const project = getProject(id)
  if (project === undefined) throw new Error(`No project with id "${id}"`)
  if (project.proof.evaluation === null) throw new Error(`Project ${id} records no evaluation`)
  return project.proof.evaluation
}

/** "1,259 tests passing (CI)": the same count, for a project whose figure is its CI run's. */
export function testsPassingInCiLabel(id: ProjectId): string {
  return `${testsLabel(id)} passing (CI)`
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
 * The interactive-demo action, if this project has a demo: this site's own (opens a tab inside the
 * experience, and navigates in place outside it) or the normal portfolio's, which is always a new tab.
 */
function demoAction(project: Project): ProjectAction | null {
  if (project.interactiveDemoUrl !== undefined) {
    return {
      id: 'interactiveDemo',
      label: 'Try interactive demo',
      href: project.interactiveDemoUrl,
      emphasis: 'primary',
      external: true,
      accessibleName: `Open the interactive demo of ${project.title} on the portfolio site in a new tab`,
    }
  }

  if (project.interactiveDemo !== true) return null

  return {
    id: 'interactiveDemo',
    label: 'Try interactive demo',
    // Built here rather than imported from `lib/routes`, which imports `ProjectId` from this file.
    href: `/projects/${project.id}/demo`,
    emphasis: 'primary',
    external: false,
    accessibleName: `Open the interactive demo of ${project.title}`,
  }
}

/**
 * The actions a project can actually offer.
 *
 * Built from the links that exist, so a missing URL produces no button at
 * all rather than one that goes nowhere. The interactive demo leads when there
 * is one, because it is the thing a visitor can act on at once; source and
 * write-up follow.
 */
export function projectActions(project: Project): ProjectAction[] {
  const candidates: (ProjectAction | null)[] = [
    demoAction(project),
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

/** The one line a monitor in the workshop leads with: the project's evaluation result, else the first thing its repository records. */
export function outcomeLine(project: Project): string {
  return project.proof.evaluation ?? project.proof.properties[0] ?? project.shortDescription
}
