# SignalQL v0.1 language scope

This document locks the **smallest useful** v0.1 surface and defers the rest. It complements the [normative specification](./v0.1.md).

## In scope (v0.1)

- **Event querying** over a logical `events` table (and optional `users` / `sessions` per [data model](../guide/data-model.md)).
- **Source binding safety:** compiler accepts logical sources `events`, `users`, `sessions` only; SQL tables come from explicit adapter/source maps.
- **Time filters** via `DURING LAST N DAYS` (reference compiler). `BETWEEN` is reserved in the grammar; reference compilation for `FUNNEL` + `BETWEEN` is not implemented.
- **Basic aggregation:** `COUNT events`, `COUNT DISTINCT events`, `COUNT users` (distinct users), with optional `GROUP BY DAY` on `timestamp`.
- **Simple funnels** as ordered event names: `FUNNEL "a" THEN "b" [THEN ...] FROM source DURING LAST N DAYS` (2–6 steps in the reference compiler).
- **Segmentation** by `event_name`, `properties.KEY`, or `traits.KEY` (users table) in `WHERE`, combined with `AND`.

All string comparisons are **literal** in v0.1. User literals are **never** concatenated into SQL; the reference compiler uses **bound parameters**.

## Explicitly deferred (not v0.1)

| Feature | Rationale |
| --------| ---------- |
| Cohort definitions, window functions, HAVING | Needs richer grammar and safety review |
| Joins across arbitrary tables | Keep portable model minimal |
| arbitrary math / derived metrics in language | Prefer adapter-side views for v0.1 |
| Result LIMIT / OFFSET in SignalQL text | Enforced in adapters or execution layer |
| Non-Postgres execution in reference compiler | Other dialects via adapters + separate tickets |

## Ten valid baseline queries

1. `COUNT events FROM events WHERE event_name = "signup" DURING LAST 30 DAYS`
2. `COUNT distinct events FROM events WHERE event_name = "page_view" DURING LAST 7 DAYS`
3. `COUNT users FROM events WHERE event_name = "purchase" DURING LAST 28 DAYS`
4. `COUNT events FROM events WHERE event_name = "view_item" DURING LAST 14 DAYS GROUP BY DAY`
5. `COUNT users FROM events WHERE properties.plan = "pro" AND event_name = "purchase" DURING LAST 28 DAYS`
6. `FUNNEL "signup" THEN "activated" FROM events DURING LAST 14 DAYS`
7. `FUNNEL "view_item" THEN "add_cart" THEN "purchase" FROM events DURING LAST 30 DAYS`
8. `COUNT events FROM events WHERE properties.source = "seo" AND event_name = "signup" DURING LAST 90 DAYS`
9. `COUNT users FROM events WHERE traits.country = "US" AND event_name = "session_start" DURING LAST 7 DAYS`
10. `COUNT distinct events FROM events WHERE event_name = "error" DURING LAST 1 DAYS GROUP BY DAY`

## Ten invalid or non-goal examples

1. `SELECT * FROM events` — not SignalQL; use `COUNT` / `FUNNEL` forms.
2. `COUNT events FROM events DURING LAST 7 DAYS` — **missing required `WHERE`** in reference grammar.
3. `COUNT mistakes FROM events WHERE event_name = "x" DURING LAST 7 DAYS` — target must be `events` or `users`.
4. `COUNT events FROM events WHERE event_name = "a"` — **missing `DURING`** clause.
5. `;;;` — stray tokens / not a query.
6. `FUNNEL "only_one_step" FROM events DURING LAST 7 DAYS` — funnel requires **at least two steps** in the reference compiler (unsafe funnel counts may error at compile time).
7. `COUNT events FROM events WHERE created_at > now()` — no raw SQL expressions in v0.1 filters.
8. `COUNT events FROM events WHERE event_name LIKE "pay%"` — **no `LIKE`** in v0.1.
9. `COUNT events FROM events WHERE event_name = "a" OR event_name = "b" DURING LAST 7 DAYS` — **no `OR`** in v0.1 predicates.
10. `WITH x AS (...) COUNT events FROM x ...` — **no CTEs** in v0.1.

Determinism for compilation is defined in the spec: equivalent inputs and compiler version produce stable SQL text and parameter ordering for Postgres.
