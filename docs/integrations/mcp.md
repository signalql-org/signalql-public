# SignalQL MCP server

The `@signalql/mcp` package exposes SignalQL over MCP **stdio** for Cursor, Claude Desktop, and compatible hosts.

## Tools

| Tool | Purpose |
| ---- | ------- |
| `run_signalql` | Validate + compile; optionally execute when `DATABASE_URL` is set |
| `get_schema` | Portable model metadata for prompts |
| `list_events` | Known event names for your demo/schema bundle |
| `describe_event` | Short description + sample properties |

```mermaid
sequenceDiagram
    participant Client as AI client
    participant MCP as SignalQL MCP server
    participant DB as Postgres (optional)

    Client->>MCP: list_events / get_schema
    MCP-->>Client: event + schema context
    Client->>Client: Draft SignalQL query
    Client->>MCP: run_signalql(query)
    MCP->>MCP: Parse + validate + compile (Postgres reference path)
    alt DATABASE_URL configured
      MCP->>DB: Execute SQL with bound params
      DB-->>MCP: rows
      MCP-->>Client: sql + params + ast + rows
    else No DATABASE_URL
      MCP-->>Client: sql + params + ast
    end
```

## Run from npm

```bash
npx @signalql/mcp
```

## Run from a local checkout

```bash
npm install
npm run build
npm exec -w @signalql/mcp -- signalql-mcp
```

Equivalent local command: `node packages/mcp/dist/server.js`.

Configure your MCP client to launch one of those commands. Logs go to **stderr**; **stdout** carries MCP frames only.

## Safety

`run_signalql` uses `@signalql/sdk` compile path—parameterized SQL only. Execution uses bound parameters via `postgres`.

## Run this query now

```signalql
COUNT events FROM events WHERE event_name = "signup" DURING LAST 7 DAYS
```

Expected output shape: `sql` plus `params` from `run_signalql`; literal filters should be present as bound params.

Validation check: verify `params` is non-empty and SQL text contains placeholders instead of inline literal values.
