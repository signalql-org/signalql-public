# @signalql/sdk

SignalQL SDK for parse, compile, and validate workflows.

## Install

```bash
npm install @signalql/sdk
```

## Usage

```ts
import { compile, validate } from "@signalql/sdk";

const result = compile(
  'COUNT events FROM events WHERE event_name = "signup" DURING LAST 7 DAYS',
  { dialect: "postgres" }
);

console.log(result.sql);
console.log(result.params);

const checked = validate(
  'COUNT events FROM events WHERE event_name = "signup" DURING LAST 7 DAYS',
  { dialect: "postgres" }
);

if (!checked.ok) {
  console.error(checked.error.message);
}
```

Use this package when integrating SignalQL into applications, AI tools, or validation pipelines.

