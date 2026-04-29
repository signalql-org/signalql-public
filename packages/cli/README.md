# @signalql/cli

SignalQL command-line compiler and Postgres runner.

## Install

```bash
npm install -g @signalql/cli
```

Or run without a global install:

```bash
npx @signalql/cli compile ./query.sqlq --json-params
```

## Usage

```bash
printf 'COUNT events FROM events WHERE event_name = "signup" DURING LAST 7 DAYS\n' > query.sqlq
signalql compile ./query.sqlq --json-params
```

To execute against Postgres:

```bash
export DATABASE_URL="postgres://postgres:postgres@127.0.0.1:5432/postgres"
signalql run ./query.sqlq
```

`compile` prints generated Postgres SQL. With `--json-params`, it also prints the parameter array as JSON.

