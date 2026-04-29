import assert from "node:assert/strict";
import { compile } from "../src/index.js";

const q1 = `COUNT EVENTS FROM events WHERE event_name = "signup" DURING LAST 30 DAYS`;
const r1 = compile(q1, { dialect: "postgres" });
const r1b = compile(q1, { dialect: "postgres" });
assert.equal(r1.sql, r1b.sql);
assert.deepEqual(r1.params, r1b.params);
assert.match(r1.sql, /event_name = \$\d+/);
assert.match(r1.sql, /COUNT\(\*\)/);
assert.equal(r1.params.includes(30), true);

const q2 = `COUNT EVENTS FROM events WHERE event_name = "view_item" DURING LAST 14 DAYS GROUP BY DAY`;
const r2 = compile(q2);
assert.match(r2.sql, /date_trunc\('day'/);
assert.match(r2.sql, /GROUP BY 1/);

const q3 = `FUNNEL "signup" THEN "activated" FROM events DURING LAST 7 DAYS`;
const r3 = compile(q3);
assert.match(r3.sql, /step_1/);
assert.match(r3.sql, /conversion_rate/);

const q4 = `COUNT USERS FROM events WHERE properties.plan = "pro" AND event_name = "purchase" DURING LAST 28 DAYS`;
const r4 = compile(q4);
assert.match(r4.sql, /properties->>/);
assert.match(r4.sql, /COUNT\(DISTINCT src\.user_id\)/);

const q5 = `COUNT EVENTS FROM events WHERE event_name = "signup" DURING LAST 30 DAYS`;
const r5 = compile(q5, { sourceMap: { events: "analytics_events" } });
assert.match(r5.sql, /FROM analytics_events/);

const q6 = `COUNT USERS FROM events WHERE traits.country = "US" AND event_name = "session_start" DURING LAST 7 DAYS`;
const r6 = compile(q6, {
  sourceMap: { events: "analytics_events", users: "analytics_users" },
});
assert.match(r6.sql, /FROM analytics_events AS src LEFT JOIN analytics_users AS usr ON src\.user_id = usr\.user_id/);
assert.match(r6.sql, /usr\.traits->>\$\d+ = \$\d+/);
assert.equal(r6.params.includes("country"), true);
assert.equal(r6.params.includes("US"), true);

assert.throws(
  () =>
    compile(
      `COUNT EVENTS FROM bad_table WHERE event_name = "signup" DURING LAST 30 DAYS`
    ),
  /Unknown source/
);

console.log("compile tests ok");
