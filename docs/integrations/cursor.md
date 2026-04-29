# Cursor + SignalQL

## Add grammar context

- Drop [`docs/ai/grammar-pack.md`](../ai/grammar-pack.md) or [`docs/spec/v0.1.md`](../spec/v0.1.md) into Cursor **Docs** or project rules.
- Pin [`schemas/signalql-ast-v0.1.schema.json`](https://github.com/signalql-org/signalql-public/blob/main/schemas/signalql-ast-v0.1.schema.json) when asking the model to emit structured AST JSON.

## MCP

Start the published MCP server package:

```bash
npx @signalql/mcp
```

From a local repo checkout after `npm run build`, use the workspace binary:

```bash
npm exec -w @signalql/mcp -- signalql-mcp
```

In a local checkout, `node ./packages/mcp/dist/server.js` is equivalent to the workspace command above.

Register the stdio command in **Cursor Settings → MCP**. Tools exposed: `run_signalql`, `get_schema`, `list_events`, `describe_event`.

## First Query

1. `list_events` (or paste taxonomy from your product).
2. Ask: “Using SignalQL v0.1 only, count `signup` in the last 7 days on table `events`.”
3. `run_signalql` with the generated query; verify compiled SQL uses bound parameters.

Prefer **SignalQL** in prompts over raw SQL so intent stays stable across dialects.

## Run this query now

```signalql
COUNT events FROM events WHERE event_name = "signup" DURING LAST 7 DAYS
```

Expected output shape (from `run_signalql`): compiled SQL text plus `params` where `"signup"` and day count are parameter values.

Validation check: confirm SQL contains placeholders and `params` is non-empty (no interpolated literals in SQL text).
