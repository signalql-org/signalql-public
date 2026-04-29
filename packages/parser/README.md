# @signalql/parser

SignalQL v0.1 parser package.

## Install

```bash
npm install @signalql/parser
```

## Usage

```ts
import { parse } from "@signalql/parser";

const ast = parse('COUNT events FROM events WHERE event_name = "signup" DURING LAST 7 DAYS');
console.log(ast);
```

This package provides the parser entry point for tools that want SignalQL AST output without using the full SDK surface.

