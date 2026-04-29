# Run SignalQL against local Postgres

Use the sample dataset with a local Postgres database to see `signalql run` execute end to end.

## Prerequisites

- Docker (recommended) **or** a local Postgres 14+ you control
- Node.js and npm

## 1. Install and Build

```bash
npm install
npm run build
```

## 2. Start Postgres and Load the Seed

With Docker:

```bash
docker run --name signalql-pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16
until docker exec signalql-pg pg_isready -U postgres; do sleep 1; done
docker exec -i signalql-pg psql -U postgres -d postgres < fixtures/seed.sql
```

Use the matching connection string:

```bash
export DATABASE_URL="postgres://postgres:postgres@127.0.0.1:5432/postgres"
```

## 3. Run a Query File

```bash
printf 'COUNT events FROM events WHERE event_name = "signup" DURING LAST 30 DAYS\n' > query.sqlq
npm exec -w @signalql/cli -- signalql run ./query.sqlq
```

The CLI prints JSON rows from Postgres. For the seeded data, the result is an aggregate row for `signup` events in the last 30 days.

## 4. Cleanup

```bash
docker rm -f signalql-pg
```

## Troubleshooting

- **`DATABASE_URL is required`:** export the URL in the same shell session before `signalql run`.
- **Connection refused:** confirm the container is running (`docker ps`) and port `5432` is free on the host.
- **Empty or unexpected rows:** ensure `fixtures/seed.sql` loaded without errors (check `docker exec` stderr).
