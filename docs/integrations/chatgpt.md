# ChatGPT + SignalQL

ChatGPT does not share a single MCP configuration with Cursor/Claude Desktop. Use **schema-in-prompt** flows until your host exposes MCP tools.

## Schema and context prompting

Paste a compact bundle:

- Event list (`signup`, `purchase`, …).
- Important property keys (`plan`, `source`, …).
- Link or excerpt from [`grammar pack`](../ai/grammar-pack.md).

Ask the model for SignalQL instead of raw SQL, then validate the query locally:

```bash
printf 'COUNT events FROM events WHERE event_name = "signup" DURING LAST 7 DAYS\n' > query.sqlq
npx @signalql/cli compile ./query.sqlq
```

From a local repo checkout, the equivalent workspace command is `npm exec -w @signalql/cli -- signalql compile ./query.sqlq`.

## Tools

Where Custom GPTs or Actions exist, mirror the MCP contract:

- `run_signalql` → compile + optional execute with bound parameters.
- `list_events` / `describe_event` → static taxonomy until wired to your warehouse.

## First Query

1. Paste event taxonomy + grammar pack excerpt.
2. Prompt: “Write SignalQL v0.1 counting event `signup` over the last 30 days from table `events`.”
3. Run the CLI compile step.

Emphasize **SignalQL** over hand-written SQL so results align with the portable model.

## Run this query now

```signalql
COUNT events FROM events WHERE event_name = "signup" DURING LAST 7 DAYS
```

Expected output shape (CLI with `--json-params`): first line SQL text, second line JSON params array.

Validation check: run `npx @signalql/cli compile ./query.sqlq --json-params`. The SQL should use placeholders while filter values appear in params.
