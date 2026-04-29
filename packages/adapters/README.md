# @signalql/adapters

SignalQL adapter interfaces and minimal adapters for v0.1 workflows.

## Install

```bash
npm install @signalql/adapters
```

## Included adapters

- `postgresAdapter` compiles through the reference Postgres compiler and returns parameterized SQL.
- `csvAdapter` evaluates against caller-provided demo event rows for local/sample workflows.
- `clickHouseAdapter` provides minimal compile-focused SQL mapping.
- `bigQueryAdapter` provides minimal compile-focused SQL mapping.

## Usage

```ts
import { postgresAdapter } from "@signalql/adapters";

const output = postgresAdapter.compile(
  'COUNT events FROM events WHERE event_name = "signup" DURING LAST 7 DAYS'
);

console.log(output.sql);
console.log(output.params);
```

The ClickHouse and BigQuery adapters document a different safety contract than the Postgres reference compiler: they currently emit escaped SQL text and return `params: []`.

