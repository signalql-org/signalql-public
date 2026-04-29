# SignalQL

SignalQL is an open query language for behavioral product analytics. This repository contains the **v0.1** specification, a reference **Postgres compiler**, **parser**, **SDK**, **CLI**, **playground**, **docs**, and optional **MCP server** for AI tools.

## Start here

### 1) Playground

Run and inspect a SignalQL query in a local UI.

```bash
npm install
npm run dev -w @signalql/playground
```

Next step: [canonical examples](docs/examples/library.md).

### 2) AI tools (Cursor/Claude + MCP)

Let an AI tool draft SignalQL, then compile it through MCP tools.

```bash
npx @signalql/mcp
```

From this repo checkout, use the workspace command:

```bash
npm install
npm run build
npm exec -w @signalql/mcp -- signalql-mcp
```

Next step: [Cursor guide](docs/integrations/cursor.md), [Claude guide](docs/integrations/claude.md), [ChatGPT guide](docs/integrations/chatgpt.md), [MCP server](docs/integrations/mcp.md).

### 3) CLI/SDK

Compile SignalQL to parameterized SQL from npm:

```bash
printf 'COUNT events FROM events WHERE event_name = "signup" DURING LAST 7 DAYS\n' > query.sqlq
npx @signalql/cli compile ./query.sqlq --json-params
```

From this repo checkout, use the workspace command:

```bash
npm install
npm run build
printf 'COUNT events FROM events WHERE event_name = "signup" DURING LAST 7 DAYS\n' > query.sqlq
npm exec -w @signalql/cli -- signalql compile ./query.sqlq --json-params
```

Next step: [v0.1 specification](docs/spec/v0.1.md).

## Scope (v0.1)

Event counts, time windows (`DURING LAST N DAYS`), user/event aggregates, `GROUP BY DAY`, simple multi-step funnels, and segmentation via `properties.*` filters. See [Language scope](docs/spec/scope.md) and the [full specification](docs/spec/v0.1.md).

## Packages

| Package | Description |
| ------- | ----------- |
| `@signalql/parser` | `parse(query)` → AST |
| `@signalql/compiler` | `compile(query, { dialect: "postgres" })` → parameterized SQL |
| `@signalql/sdk` | `parse`, `compile`, `validate` |
| `@signalql/cli` | `signalql compile` / `signalql run` |
| `@signalql/mcp` | MCP stdio server for AI integrations |

## Quick start

```bash
npm install
npm run build
npm test
```

Use the SDK from another project (after `npm run build`):

```ts
import { compile } from "@signalql/sdk";

const { sql, params } = compile(
  `COUNT events FROM events WHERE event_name = "signup" DURING LAST 30 DAYS`,
  { dialect: "postgres" }
);
```

CLI:

```bash
printf 'COUNT events FROM events WHERE event_name = "signup" DURING LAST 7 DAYS\n' > query.sqlq
npx @signalql/cli compile ./query.sqlq --json-params
```

Playground dev server:

```bash
npm run dev -w @signalql/playground
```

Documentation site:

```bash
npm run docs:dev
```

Canonical analytics examples: see [`docs/examples/library.md`](docs/examples/library.md) (also built on the docs site under **Examples**).

## Repository layout

- `docs/` — VitePress site (spec, guides, AI docs, examples)
- `packages/` — Parser, compiler, SDK, CLI, adapters, MCP
- `apps/playground` — Web playground
- `fixtures/` — Sample Postgres seed + query fixtures
- `schemas/` — JSON Schema for the v0.1 AST

## Docs site and GitHub

The **signalql.org** site is the VitePress build of the `docs/` folder in this repo—there is a single source of truth; ship by deploying `npm run docs:build` output.

## Adoption paths

Start with the playground or CLI in [docs/guide/first-query.md](docs/guide/first-query.md). To execute against sample data, load `fixtures/seed.sql` into Postgres and run the full flow in [docs/guide/postgres-local.md](docs/guide/postgres-local.md). The **CSV** adapter in `@signalql/adapters` is aimed at demos and local workflows, not a full warehouse connector.

## Decision-maker quick read

- Why standardize: SignalQL keeps analytics intent portable across tools and teams.
- Why safer: reference compile path emits parameterized SQL with explicit query limits.
- Why practical: teams can start with Postgres and evolve adapters per dialect while staying inside v0.1 bounds.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). External implementations should track [docs/spec/v0.1.md](docs/spec/v0.1.md) and announce dialect-specific differences in their own docs.

## License

MIT — see [LICENSE](LICENSE).
