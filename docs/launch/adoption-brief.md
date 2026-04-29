# Adoption Brief

SignalQL gives teams a shared language for behavioral analytics questions. A useful pilot should prove faster answers, safer AI-assisted analysis, and portability without forcing a platform migration.

## What improves

- **Fewer handoffs:** product and data teams express common questions in a small, reviewable grammar instead of bespoke SQL for every variation.
- **Safer AI self-service:** assistants target SignalQL while the Postgres reference compiler emits SQL with bound parameters.
- **Less lock-in:** the portable model for events, users, and sessions keeps analytics intent separate from one warehouse or dashboard product.

## Expected Effort

- **Technical spike:** map one Postgres or warehouse schema to the portable model, run the CLI or MCP against a dev database, and review the compiled SQL.
- **Team pilot:** use SignalQL for a bounded set of v0.1 questions, such as funnels, counts, and segmentation, with normal code or query review.

Effort grows with schema drift and each additional dialect beyond the reference Postgres path.

## Risks and Controls

| Risk | Mitigation in v0.1 |
| ---- | ------------------ |
| Query scope creep | Language scope is explicit; compiler enforces limits documented in the spec. |
| Adapter mismatch | Each dialect documents its SQL safety contract (parameterized Postgres vs escaped literals elsewhere). |
| AI generating unsafe SQL | Prefer SignalQL + compile over raw SQL; review compiled SQL and params before production execution. |

## Integration Path

1. Align event/user/session shapes with [Portable data model](../guide/data-model.md).
2. Compile a first query, then optionally run it against local Postgres ([first query](../guide/first-query.md), [local Postgres](../guide/postgres-local.md)).
3. Add MCP or SDK workflows where they improve day-to-day analysis ([integrations](../integrations/cursor.md)).

## Pilot Success

- Canonical queries compile deterministically and match reviewed expectations.
- Stakeholders can read SignalQL without deep SQL expertise for supported clauses.
- Rollback is straightforward: stop issuing SignalQL and continue with stored SQL or prior tools.

## Limitations (v0.1)

Not every analytics question belongs in v0.1. Deferred features and boundaries are listed in [Language scope](../spec/scope.md). Treat SignalQL as a focused layer for behavioral analytics semantics, not a full BI replacement.

## Related

- [Why SignalQL](../guide/why-signalql.md)
