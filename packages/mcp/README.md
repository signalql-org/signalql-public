# @signalql/mcp

SignalQL MCP stdio server for AI analytics workflows.

## Install

```bash
npm install -g @signalql/mcp
```

Or run without a global install:

```bash
npx @signalql/mcp
```

## Exposed MCP tools

- `run_signalql` parses, validates, compiles, and optionally executes SignalQL.
- `get_schema` returns portable SignalQL model metadata.
- `list_events` returns known demo event names.
- `describe_event` returns demo event descriptions and sample properties.

Execution is optional. Without `DATABASE_URL`, `run_signalql` returns compiled SQL, params, and AST only. With `DATABASE_URL`, it can execute the generated Postgres query.

