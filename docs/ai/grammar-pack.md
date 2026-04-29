# LLM grammar pack (SignalQL v0.1)

Compact reference for prompts and MCP resources. Pair with the [v0.1 specification](../spec/v0.1.md) and [scope](../spec/scope.md).

## Grammar summary

- **Count:** `COUNT [DISTINCT] events|users FROM source WHERE predicates DURING time_window [GROUP BY DAY]`
- **Predicate:** `field_path = "value"` joined by `AND` only.
- **Field path:** `event_name`, or `properties.KEY`, or `traits.KEY` (when querying traits semantics).
- **Time:** `DURING LAST N DAYS` (reference compiler); `BETWEEN` exists in grammar but has limited compiler coverage—prefer `LAST N DAYS` for tooling.

## When to ask for schema first

Ask for **available event names**, **identity keys**, and **trait/property keys** before emitting SignalQL if:

- The user lists uncommon events (`invoice_paid_custom`).
- Segmentation targets unfamiliar traits (`billing_country`).
- Multiple workspaces/products share one warehouse.

If the user already pasted schema (`list_events`, MCP `get_schema`), proceed without re-asking.

## Canonical valid examples

```
COUNT events FROM events WHERE event_name = "signup" DURING LAST 30 DAYS
```

```
COUNT events FROM events WHERE event_name = "view_item" DURING LAST 14 DAYS GROUP BY DAY
```

```
FUNNEL "signup" THEN "activated" FROM events DURING LAST 14 DAYS
```

```
COUNT users FROM events WHERE properties.plan = "pro" AND event_name = "purchase" DURING LAST 28 DAYS
```

## Canonical invalid examples

| Bad snippet | Why |
| ----------- | --- |
| `OR` in `WHERE` | Not v0.1 |
| Raw SQL `SELECT` | Not SignalQL surface |
| Missing `WHERE` | Reference grammar requires filters for counts |
| `LIKE`, `>` on timestamps in clause | Use SignalQL time window instead |

## Intent → shape

| User intent | Shape |
| ----------- | ----- |
| Funnel | `FUNNEL "a" THEN "b" ... FROM events DURING LAST N DAYS` |
| Retention starter | Count returning users via second event + same window (narrow use-case in v0.1—often two counts) |
| Growth | `GROUP BY DAY` + signup or revenue-driving event |
| Onboarding dropoff | `FUNNEL` early steps vs activation |
| Feature usage | `COUNT events` filtered by `event_name` / `properties.feature` |
| Segmentation | Add `properties.*` or `traits.*` predicates with `AND` |

Copy this file into Cursor rules, Claude project knowledge, or MCP resources as needed.
