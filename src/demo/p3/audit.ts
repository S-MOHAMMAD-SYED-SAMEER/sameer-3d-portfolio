import type { AuditEvent, AuditActor, AuditOutcome, AuditStage } from './vendored/domain/ats.ts'

/**
 * The demo's audit trail.
 *
 * The Explainable ATS records what it did in an append-only table, and the
 * events it writes are not decoration — they are how a score can be recomputed
 * from the trail alone. The demo has no database, so this stands in for the
 * repository, and it has exactly one job: produce the same events, with the
 * same payloads, in the same order.
 *
 * WHAT IS COPIED FROM THE SERVER, AND WHAT IS NOT
 *
 * The event shape is the server's `AuditEvent`, imported from the vendored
 * domain module rather than restated here, so the two cannot drift. What the
 * server keeps in a table, this keeps in an array.
 *
 * `sequence` is per `correlationId` and starts at 1, because that is what the
 * server's repository does — it reads `MAX(sequence) WHERE correlation_id = ?`
 * and adds one. A single global counter would have looked fine and been wrong:
 * the server's sequences restart for every resume and every evaluation, and a
 * parity check on sequence numbers would then fail for a reason that has
 * nothing to do with the pipeline.
 *
 * WHY THE IDS AND TIMESTAMPS ARE NOT REAL
 *
 * The server uses `randomUUID()` and a clock. Both are forbidden here: a demo
 * whose output changes between two page loads cannot be compared to anything,
 * including its own previous run. So ids are a counter and the timestamp is a
 * constant. They are deliberately shaped so nobody mistakes them for real
 * records — `demo-audit-0001` is not a UUID and is not trying to be.
 */

/** What a caller supplies. Everything else is filled in deterministically. */
export type AuditAppendInput = {
  correlationId: string
  stage: AuditStage
  eventType: string
  actor: AuditActor
  actorId?: string | null
  outcome: AuditOutcome
  summary: string
  payload?: Record<string, unknown>
  entityType?: string | null
  entityId?: string | null
}

export type AuditLog = {
  append: (input: AuditAppendInput) => AuditEvent
  /** Every event appended so far, in the order they were appended. */
  readonly events: readonly AuditEvent[]
}

export type AuditLogOptions = {
  /**
   * The timestamp every event carries.
   *
   * One value for the whole run rather than one per event. The server's
   * timestamps are real and therefore differ; nothing in the pipeline reads
   * them, and inventing an increasing fake series would suggest a precision
   * this has no way to have.
   */
  createdAt: string
  /** Prefix for generated event ids. */
  idPrefix?: string
}

export function createAuditLog(options: AuditLogOptions): AuditLog {
  const { createdAt, idPrefix = 'demo-audit' } = options

  const events: AuditEvent[] = []
  // Per-correlation, exactly as the server's `MAX(sequence)` query is.
  const sequences = new Map<string, number>()

  function append(input: AuditAppendInput): AuditEvent {
    const sequence = (sequences.get(input.correlationId) ?? 0) + 1
    sequences.set(input.correlationId, sequence)

    const event: AuditEvent = {
      id: `${idPrefix}-${String(events.length + 1).padStart(4, '0')}`,
      correlationId: input.correlationId,
      sequence,
      stage: input.stage,
      eventType: input.eventType,
      actor: input.actor,
      actorId: input.actorId ?? null,
      outcome: input.outcome,
      summary: input.summary,
      payload: input.payload ?? {},
      entityType: input.entityType ?? null,
      entityId: input.entityId ?? null,
      createdAt,
    }

    events.push(event)
    return event
  }

  return {
    append,
    get events() {
      return events
    },
  }
}
