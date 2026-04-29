import assert from "node:assert/strict";
import { parse } from "../src/index.js";

const mustParse = (q: string) => assert.ok(parse(q));

const mustFailParse = (q: string) =>
  assert.throws(() => parse(q), (e) => e instanceof Error);

mustParse(
  `COUNT events FROM events WHERE event_name = "signup" DURING LAST 30 DAYS`
);
mustParse(
  `COUNT events FROM events WHERE event_name = "a" DURING LAST 7 DAYS GROUP BY DAY`
);
mustParse(`COUNT users FROM events WHERE properties.plan = "pro" DURING LAST 28 DAYS`);
mustParse(`FUNNEL "a" THEN "b" FROM events DURING LAST 7 DAYS`);

mustFailParse(`SELECT * FROM events`);
mustFailParse(`COUNT events FROM events DURING LAST 30 DAYS`);
mustFailParse(`COUNT mistakes FROM events WHERE event_name = "x" DURING LAST 1 DAYS`);
mustFailParse(`COUNT events FROM events WHERE event_name = "x"`);
mustFailParse(`COUNT events FROM events`);
mustFailParse(`;;;`);

console.log("parser package tests ok");
