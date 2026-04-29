import assert from "node:assert/strict";
import { compile, validate } from "../src/index.js";

const r = validate(`COUNT events FROM events WHERE event_name = "signup" DURING LAST 7 DAYS`);
assert.equal(r.ok, true);
if (r.ok) assert.match(r.output.sql, /COUNT/);

const bad = validate(`NOT A QUERY`);
assert.equal(bad.ok, false);

compile(`COUNT events FROM events WHERE event_name = "signup" DURING LAST 7 DAYS`);
console.log("sdk tests ok");
