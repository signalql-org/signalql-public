# Run your first query

If you are starting from the docs site, the fastest path is the published CLI package. The playground is also available, but it currently runs as a local app from this repository.

## Primary Path: Published CLI

Compile one query and inspect SQL plus params:

```bash
printf 'COUNT events FROM events WHERE event_name = "signup" DURING LAST 7 DAYS\n' > query.sqlq
npx @signalql/cli compile ./query.sqlq --json-params
```

The command prints parameterized SQL followed by a JSON array of bound parameters.

## Local Workspace CLI

From a cloned repo checkout, use the workspace command:

```bash
npm install
npm run build
printf 'COUNT events FROM events WHERE event_name = "signup" DURING LAST 7 DAYS\n' > query.sqlq
npm exec -w @signalql/cli -- signalql compile ./query.sqlq --json-params
```

## Local Playground (repo checkout required)

The playground is not a hosted docs-site runner. It requires a local checkout and local dev server:

From the repo root:

```bash
npm install
npm run dev -w @signalql/playground
```

Open the URL printed in the terminal, usually `http://localhost:5173`. Edit the sample query and inspect the generated SQL and params side by side.

## Local Postgres

To execute the same query against seeded sample data, use [Run SignalQL against local Postgres](./postgres-local.md).

## Next steps

- Browse the [canonical examples](/examples/library).
- Read the [v0.1 specification](/spec/v0.1) and [why SignalQL exists](./why-signalql).
