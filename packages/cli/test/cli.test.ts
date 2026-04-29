import assert from "node:assert/strict";
import { compile } from "@signalql/sdk";

const out = compile(`COUNT events FROM events WHERE event_name = "signup" DURING LAST 30 DAYS`);
assert.match(out.sql, /event_name/);
assert.equal(out.params.includes("signup"), true);
console.log("cli smoke ok");
