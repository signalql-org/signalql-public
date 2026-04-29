# AI prompting guide for SignalQL

Ask models for **SignalQL first**, then compile to SQL for execution—analytics intent stays explicit and reviewable.

## Bad vs good prompts

**Bad:** “Write SQL for daily signups.”  
**Good:** “Emit SignalQL for daily signups over the last 14 days on table `events`, then explain the result shape in plain language.”

**Bad:** “Query the warehouse.”  
**Good:** “Given schema: event names [signup, …], produce SignalQL counting `signup` per day for the last 30 days.”

## Patterns by topic

### Retention (starter)

Ask for **two counts** or a funnel proxy (v0.1 does not encode cohort retention SQL fully in one clause):

“Generate SignalQL `COUNT users` for event `active` and separately for `signup` in the same window; describe how you’d compare them.”

### Funnel conversion

“FUNNEL `step_a` THEN `step_b` FROM events DURING LAST N DAYS — include interpretation.”

### Onboarding dropoff

“FUNNEL first onboarding events THEN activation event…”

### Feature usage

“COUNT events WHERE event_name = `feature_event` AND properties.plan = …”

### Segmentation

“COUNT users WHERE properties.KEY = `value` AND event_name = …”

## Providing schema context

Paste short lists:

- Known `event_name` values (from product taxonomy).
- Important `properties` keys.
- Whether `user_id` is present.

Link tools: MCP `list_events`, `describe_event`, `get_schema`.

## Output format

Ask for:

1. **SignalQL** query text.
2. **Interpretation** (what rows/columns mean).
3. Optional: mention that compiled SQL is produced by `@signalql/compiler`, not hand-written.

## Related

- [Grammar pack](./grammar-pack.md)
- [Examples library](../examples/library.md)
- Playground: run `npm run dev -w @signalql/playground` from the repo for interactive compile checks
- [MCP server](../integrations/mcp) (`@signalql/mcp`)
