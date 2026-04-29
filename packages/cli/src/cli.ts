#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import postgres from "postgres";
import { compile } from "@signalql/sdk";

const printHelp = () => {
  console.log(`signalql <compile|run> <file.sqlq> [options]

Environment:
  DATABASE_URL   Postgres connection string for run

Options:
  --json-params  Print parameters as JSON line after SQL (compile)
`);
};

const main = async () => {
  const argv = process.argv.slice(2);
  if (argv.length < 2 || argv[0] === "-h" || argv[0] === "--help") {
    printHelp();
    process.exit(argv.length < 2 ? 1 : 0);
  }
  const [cmd, file] = argv;
  const body = await readFile(file, "utf8");
  const flags = new Set(argv.slice(2));
  const out = compile(body, { dialect: "postgres" });

  if (cmd === "compile") {
    console.log(out.sql.trim());
    if (flags.has("--json-params")) {
      console.log(JSON.stringify(out.params));
    }
    return;
  }

  if (cmd === "run") {
    const url = process.env.DATABASE_URL;
    if (!url) {
      console.error("DATABASE_URL is required for run (or use compile to inspect SQL).");
      process.exit(1);
    }
    const sql = postgres(url, { max: 1 });
    try {
      const rows = await sql.unsafe(out.sql, out.params as never[]);
      console.log(JSON.stringify(rows, null, 2));
    } finally {
      await sql.end({ timeout: 1 });
    }
    return;
  }

  printHelp();
  process.exit(1);
};

try {
  await main();
} catch (e) {
  console.error(e);
  process.exit(1);
}
