import assert from "node:assert/strict";
import { escapeSqlStringLiteral } from "../src/dialects.js";

assert.equal(escapeSqlStringLiteral("plain"), "'plain'");
assert.equal(escapeSqlStringLiteral("O'Reilly"), "'O''Reilly'");
assert.equal(escapeSqlStringLiteral("a''b"), "'a''''b'");
assert.equal(
  escapeSqlStringLiteral("2026-04-0'1T00:00:00Z"),
  "'2026-04-0''1T00:00:00Z'"
);

console.log("sql escape tests ok");
