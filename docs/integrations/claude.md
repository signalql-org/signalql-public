# Claude + SignalQL

## MCP setup

1. Configure Claude Desktop (or your MCP host) to launch the published stdio server:

```bash
npx @signalql/mcp
```

2. If you are running from a local checkout, build and launch the workspace binary instead:

```bash
npm install
npm run build
npm exec -w @signalql/mcp -- signalql-mcp
```

3. Confirm tools appear: `run_signalql`, `get_schema`, `list_events`, `describe_event`.

## Prompt patterns

- Start sessions with: “Only emit SignalQL v0.1 for analytics; use `COUNT` / `FUNNEL` forms from the spec.”
- Paste [`grammar pack`](../ai/grammar-pack.md) once per project.

## First successful query path

1. Call `get_schema` to retrieve portable model metadata.
2. Call `list_events` to avoid hallucinated event names.
3. Ask Claude to author SignalQL for a concrete question, then `run_signalql` to compile (and optionally execute when `DATABASE_URL` is set on the server host).

Ask for **SignalQL plus interpretation**, not only SQL, so analytics semantics stay explicit.

## Run this query now

```signalql
COUNT events FROM events WHERE event_name = "signup" DURING LAST 7 DAYS
```

Expected output shape (from `run_signalql`): SQL string plus params array, where the literal filters are represented in params.

Validation check: verify the compiled SQL uses placeholders and values appear in params, not inline SQL.
