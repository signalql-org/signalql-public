import { compile, parse, type Query, type SourceMap } from "@signalql/compiler";
import { compileBigQuery, compileClickHouse } from "./dialects.js";
import { evaluateOnDemoEvents, type DemoEvent, type DemoResult } from "./evaluate.js";

export type AdapterDialect = "postgres" | "clickhouse" | "bigquery" | "csv";
export type AdapterCompileResult = { sql: string; params: unknown[]; note?: string };
export type AdapterRunResult = DemoResult;

export type AdapterContext = {
  tableMap?: SourceMap;
  demoEvents?: DemoEvent[];
};

export type Adapter = {
  id: string;
  dialect: AdapterDialect;
  describe: () => string;
  setup: () => string;
  compile: (query: string, ctx?: AdapterContext) => AdapterCompileResult;
  run?: (query: string, ctx?: AdapterContext) => AdapterRunResult;
};

const toAst = (query: string): Query => parse(query);

export const csvAdapter: Adapter = {
  id: "csv-local",
  dialect: "csv",
  describe: () =>
    "In-memory demo evaluator for SignalQL using bundled or user-supplied event rows.",
  setup: () =>
    "Provide demo events via AdapterContext.demoEvents (for docs/playground fixtures use fixtures/sample-events.json).",
  compile: () => ({
    sql: "-- csv adapter evaluates AST in-memory for demo workflows",
    params: [],
    note: "CSV adapter does not emit warehouse SQL in this reference package.",
  }),
  run: (query, ctx) => {
    const events = ctx?.demoEvents ?? [];
    if (events.length === 0) {
      throw new RangeError(
        "CSV adapter requires demoEvents. Pass fixture rows in AdapterContext."
      );
    }
    return evaluateOnDemoEvents(toAst(query), events);
  },
};

export const postgresAdapter: Adapter = {
  id: "postgres-reference",
  dialect: "postgres",
  describe: () =>
    "Uses @signalql/compiler and source binding map for safe parameterized Postgres SQL.",
  setup: () =>
    "Optional table map: { events, users, sessions }. Unknown logical sources are rejected.",
  compile: (query, ctx) => compile(query, { sourceMap: ctx?.tableMap }),
};

export const clickHouseAdapter: Adapter = {
  id: "clickhouse-minimal",
  dialect: "clickhouse",
  describe: () => "Minimal ClickHouse SQL mapping for count/group/funnel v0.1 shapes.",
  setup: () => "Provide optional table map for logical sources; review SQL before production use.",
  compile: (query, ctx) => compileClickHouse(toAst(query), ctx?.tableMap),
};

export const bigQueryAdapter: Adapter = {
  id: "bigquery-minimal",
  dialect: "bigquery",
  describe: () => "Minimal BigQuery SQL mapping for count/group/funnel v0.1 shapes.",
  setup: () => "Provide optional table map for logical sources; review SQL before production use.",
  compile: (query, ctx) => compileBigQuery(toAst(query), ctx?.tableMap),
};

export const adapters = [csvAdapter, postgresAdapter, clickHouseAdapter, bigQueryAdapter];
