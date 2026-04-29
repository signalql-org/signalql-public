# @signalql/compiler

Reference SignalQL v0.1 parser and Postgres compiler.

## Install

```bash
npm install @signalql/compiler
```

## Usage

```ts
import { compile, parse } from "@signalql/compiler";

const ast = parse('COUNT events FROM events WHERE event_name = "signup" DURING LAST 7 DAYS');
const output = compile('COUNT events FROM events WHERE event_name = "signup" DURING LAST 7 DAYS');

console.log(ast);
console.log(output.sql);
console.log(output.params);
```

The reference compiler emits Postgres SQL with bound parameters for user string literals and time-window values.

## Scope

SignalQL v0.1 supports bounded behavioral analytics queries: counts, simple filters, time windows, `GROUP BY DAY`, and simple funnels. See the repository docs for the full language scope and safety notes.

