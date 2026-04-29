import type { Query } from "./ast.js";
import type { SourceMap } from "./source.js";
import { resolveMappedSource } from "./source.js";
import {
  assertFunnelSteps,
  assertTimeWindow,
  MAX_DATE_SPAN_DAYS,
} from "./limits.js";

export type CompileResult = { sql: string; params: unknown[] };

const mergeWhere = (
  where: { field: string[]; value: string }[],
  params: unknown[],
  refs: { source: string; traits: string }
) => {
  const clauses: string[] = [];
  for (const w of where) {
    if (w.field.length === 1 && w.field[0] === "event_name") {
      const idx = params.push(w.value);
      clauses.push(`${refs.source}.event_name = $${idx}`);
      continue;
    }
    if (w.field[0] === "properties" && w.field.length === 2) {
      const key = w.field[1];
      if (!key) throw new RangeError("Missing properties key");
      const idxK = params.push(key);
      const idxV = params.push(w.value);
      clauses.push(`${refs.source}.properties->>$${idxK} = $${idxV}`);
      continue;
    }
    if (w.field[0] === "traits" && w.field.length === 2) {
      const key = w.field[1];
      if (!key) throw new RangeError("Missing traits key");
      const idxK = params.push(key);
      const idxV = params.push(w.value);
      clauses.push(`${refs.traits}.traits->>$${idxK} = $${idxV}`);
      continue;
    }
    throw new RangeError(`Unsupported field path: ${w.field.join(".")}`);
  }
  return clauses;
};

const timeClause = (
  during: Query["during"],
  params: unknown[],
  sourceRef: string
) => {
  if (during.kind === "last_days") {
    assertTimeWindow(during.days);
    const idx = params.push(Math.min(during.days, MAX_DATE_SPAN_DAYS));
    return `${sourceRef}.timestamp >= now() - ($${idx}::int * interval '1 day')`;
  }
  const a = params.push(during.start);
  const b = params.push(during.end);
  return `${sourceRef}.timestamp >= $${a}::timestamptz AND ${sourceRef}.timestamp < $${b}::timestamptz`;
};

export const compilePostgres = (
  q: Query,
  sourceTable: string,
  sourceMap: SourceMap = {}
): CompileResult => {
  if (q.kind === "funnel") {
    assertFunnelSteps(q.steps.length);
    if (q.during.kind === "between") {
      throw new RangeError("FUNNEL with BETWEEN is not implemented in v0.1 reference");
    }
    assertTimeWindow(q.during.days);
    const params: unknown[] = [];
    const tf = timeClause(q.during, params, sourceTable);
    const stepIdx = q.steps.map((s) => params.push(s));
    const cases = q.steps
      .map(
        (_, i) =>
          `COUNT(DISTINCT CASE WHEN event_name = $${stepIdx[i]} THEN user_id END)::bigint AS step_${i + 1}`
      )
      .join(", ");
    const conv = `CASE WHEN COUNT(DISTINCT CASE WHEN event_name = $${stepIdx[0]} THEN user_id END) > 0
      THEN COUNT(DISTINCT CASE WHEN event_name = $${stepIdx[q.steps.length - 1]} THEN user_id END)::float
        / NULLIF(COUNT(DISTINCT CASE WHEN event_name = $${stepIdx[0]} THEN user_id END)::float, 0)
      ELSE NULL END AS conversion_rate`;
    return {
      sql: `
SELECT ${cases},
${conv}
FROM ${sourceTable}
WHERE ${tf}`.trim(),
      params,
    };
  }

  const params: unknown[] = [];
  const sourceRef = "src";
  const hasTraitsPredicate = q.where.some((w) => w.field[0] === "traits");
  const sourceLogical = q.source.toLowerCase();
  const needsUsersJoin = hasTraitsPredicate && sourceLogical !== "users";
  const usersTable = needsUsersJoin ? resolveMappedSource("users", sourceMap) : null;
  const usersRef = "usr";
  const fromSql = needsUsersJoin
    ? `${sourceTable} AS ${sourceRef} LEFT JOIN ${usersTable} AS ${usersRef} ON ${sourceRef}.user_id = ${usersRef}.user_id`
    : `${sourceTable} AS ${sourceRef}`;

  const tf = timeClause(q.during, params, sourceRef);
  const clauses = mergeWhere(q.where, params, {
    source: sourceRef,
    traits: needsUsersJoin ? usersRef : sourceRef,
  });
  const whereAll = [...clauses, tf].join(" AND ");

  if (q.groupBy === "day") {
    const innerAgg =
      q.target === "users" || q.distinct
        ? `COUNT(DISTINCT ${sourceRef}.user_id)::bigint AS count`
        : "COUNT(*)::bigint AS count";
    return {
      sql: `
SELECT date_trunc('day', ${sourceRef}.timestamp AT TIME ZONE 'UTC') AS day,
       ${innerAgg}
FROM ${fromSql}
WHERE ${whereAll}
GROUP BY 1
ORDER BY 1`.trim(),
      params,
    };
  }

  const agg =
    q.target === "users" || q.distinct
      ? `COUNT(DISTINCT ${sourceRef}.user_id)::bigint AS count`
      : "COUNT(*)::bigint AS count";

  return {
    sql: `SELECT ${agg} FROM ${fromSql} WHERE ${whereAll}`,
    params,
  };
};
