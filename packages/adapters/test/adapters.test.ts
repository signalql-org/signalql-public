import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  bigQueryAdapter,
  clickHouseAdapter,
  csvAdapter,
  postgresAdapter,
} from "../src/index.js";

const fixturePath = path.resolve(
  process.cwd(),
  "../../fixtures/sample-events.json"
);
const raw = await readFile(fixturePath, "utf8");
const demoEvents = JSON.parse(raw) as Array<Record<string, unknown>>;

const q = `COUNT events FROM events WHERE event_name = "signup" DURING LAST 30 DAYS`;
const pg = postgresAdapter.compile(q);
assert.match(pg.sql, /FROM events/);

const pgMapped = postgresAdapter.compile(q, { tableMap: { events: "analytics_events" } });
assert.match(pgMapped.sql, /FROM analytics_events/);

const ch = clickHouseAdapter.compile(q);
assert.match(ch.sql, /count\(\)/i);

const bq = bigQueryAdapter.compile(q);
assert.match(bq.sql, /COUNT\(\*\)/);

const qQuoted = `COUNT events FROM events WHERE event_name = "O'Reilly" AND properties.plan = "pro's" DURING BETWEEN "2026-04-0'1T00:00:00Z" AND "2026-04-30T00:00:00Z"`;
const chQuoted = clickHouseAdapter.compile(qQuoted);
assert.match(chQuoted.sql, /O''Reilly/);
assert.match(chQuoted.sql, /pro''s/);
assert.match(chQuoted.sql, /2026-04-0''1T00:00:00Z/);

const bqQuoted = bigQueryAdapter.compile(qQuoted);
assert.match(bqQuoted.sql, /O''Reilly/);
assert.match(bqQuoted.sql, /pro''s/);
assert.match(bqQuoted.sql, /TIMESTAMP\('2026-04-0''1T00:00:00Z'\)/);

const qFunnelQuoted = `FUNNEL "step'a" THEN "step'b" FROM events DURING LAST 7 DAYS`;
const chFunnelQuoted = clickHouseAdapter.compile(qFunnelQuoted);
assert.match(chFunnelQuoted.sql, /step''a/);
assert.match(chFunnelQuoted.sql, /step''b/);

const csv = csvAdapter.run?.(q, { demoEvents: demoEvents as never[] });
assert.ok(csv);
if (csv) {
  assert.deepEqual(csv.columns, ["count"]);
  assert.equal(typeof csv.rows[0]?.[0], "number");
}

const customQuery = `COUNT users FROM events WHERE properties.plan = "pro" DURING LAST 30 DAYS`;
const customRes = csvAdapter.run?.(customQuery, { demoEvents: demoEvents as never[] });
assert.ok(customRes);
if (customRes) assert.deepEqual(customRes.columns, ["count"]);

console.log("adapter tests ok");
