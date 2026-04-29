# Adapters (`@signalql/adapters`)

`@signalql/adapters` provides concrete compile/run behavior for v0.1:

- `postgresAdapter` — compiles to parameterized SQL through `@signalql/compiler`.
- `csvAdapter` — evaluates SignalQL AST in-memory against demo events (no database required).
- `clickHouseAdapter` — minimal SQL mapping for count/group/funnel.
- `bigQueryAdapter` — minimal SQL mapping for count/group/funnel.

## Interface

Each adapter exposes:

- `describe()`
- `setup()` instructions
- `compile(query, context?)`
- optional `run(query, context?)`

`context.tableMap` binds logical sources (`events`, `users`, `sessions`) to physical tables.

```mermaid
flowchart TB
    A[SignalQL query]

    A --> P[Postgres adapter]
    P --> P1[@signalql/compiler]
    P1 --> P2[Parameterized SQL + params]

    A --> C[CSV adapter]
    C --> C1[Parse to AST]
    C1 --> C2[In-memory demo evaluation]
    C2 --> C3[Rows/columns result]

    A --> O[ClickHouse/BigQuery adapters]
    O --> O1[Adapter SQL compiler]
    O1 --> O2[Escaped SQL text]
    O2 --> O3[params: []]
```

## Setup and limitations

### CSV adapter

- Requires `context.demoEvents` rows.
- Supports local sample/demo workflows.
- Evaluator supports `FROM events` for v0.1 demo execution.

### Postgres adapter

- Uses safe source binding and parameterized SQL.
- Pair with CLI or your own `postgres` client execution path.

### ClickHouse / BigQuery adapters

- Provide minimal mapped SQL for v0.1 shapes.
- String literals are escaped in generated SQL (single quote `'` becomes `''`).
- Adapters are compile-focused and currently return `params: []`; they do not emit prepared-statement placeholders.
- This is a different safety contract than the Postgres reference compiler: safety here relies on escaping plus identifier checks, not bound-value placeholders.
- Review generated SQL and adapt JSON/time semantics before production rollout.

## Smoke coverage

See `packages/adapters/test/adapters.test.ts`.
