import type { Query, SourceMap } from "@signalql/compiler";

export const escapeSqlStringLiteral = (value: string) =>
  `'${value.replaceAll("'", "''")}'`;

const safeIdent = (value: string) => {
  if (!/^[a-zA-Z_]\w*$/.test(value)) {
    throw new RangeError(`Unsafe identifier: ${value}`);
  }
  return value;
};

const sourceTable = (q: Query, map?: SourceMap) => {
  const logical = q.source.toLowerCase() as keyof SourceMap;
  if (!["events", "users", "sessions"].includes(logical)) {
    throw new RangeError(
      `Unknown source: ${q.source}. Allowed logical sources: events, users, sessions.`
    );
  }
  return safeIdent((map?.[logical] ?? q.source).toLowerCase());
};

const whereSql = (q: Extract<Query, { kind: "count" }>) =>
  q.where
    .map((p) => {
      if (p.field[0] === "event_name")
        return `event_name = ${escapeSqlStringLiteral(p.value)}`;
      if (p.field[0] === "properties" && p.field[1]) {
        const path = `$.${p.field[1]}`;
        return `JSON_VALUE(properties, ${escapeSqlStringLiteral(path)}) = ${escapeSqlStringLiteral(p.value)}`;
      }
      if (p.field[0] === "traits" && p.field[1]) {
        const path = `$.${p.field[1]}`;
        return `JSON_VALUE(traits, ${escapeSqlStringLiteral(path)}) = ${escapeSqlStringLiteral(p.value)}`;
      }
      throw new RangeError(`Unsupported field path for adapter SQL: ${p.field.join(".")}`);
    })
    .join(" AND ");

const timeSql = (q: Query, dialect: "clickhouse" | "bigquery") => {
  if (q.during.kind === "between") {
    return dialect === "clickhouse"
      ? `timestamp >= parseDateTimeBestEffort(${escapeSqlStringLiteral(q.during.start)}) AND timestamp < parseDateTimeBestEffort(${escapeSqlStringLiteral(q.during.end)})`
      : `timestamp >= TIMESTAMP(${escapeSqlStringLiteral(q.during.start)}) AND timestamp < TIMESTAMP(${escapeSqlStringLiteral(q.during.end)})`;
  }
  return dialect === "clickhouse"
    ? `timestamp >= now() - INTERVAL ${q.during.days} DAY`
    : `timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL ${q.during.days} DAY)`;
};

export const compileClickHouse = (q: Query, map?: SourceMap) => {
  const source = sourceTable(q, map);
  if (q.kind === "funnel") {
    const stepSql = q.steps
      .map(
        (step, i) =>
          `uniqExactIf(user_id, event_name = ${escapeSqlStringLiteral(step)}) AS step_${i + 1}`
      )
      .join(", ");
    return {
      sql: `SELECT ${stepSql} FROM ${source} WHERE ${timeSql(q, "clickhouse")}`,
      params: [],
    };
  }
  const where = whereSql(q);
  const whereAll = [where, timeSql(q, "clickhouse")].filter(Boolean).join(" AND ");
  if (q.groupBy === "day") {
    const agg = q.target === "users" || q.distinct ? "uniqExact(user_id)" : "count()";
    return {
      sql: `SELECT toDate(timestamp) AS day, ${agg} AS count FROM ${source} WHERE ${whereAll} GROUP BY day ORDER BY day`,
      params: [],
    };
  }
  const agg = q.target === "users" || q.distinct ? "uniqExact(user_id)" : "count()";
  return { sql: `SELECT ${agg} AS count FROM ${source} WHERE ${whereAll}`, params: [] };
};

export const compileBigQuery = (q: Query, map?: SourceMap) => {
  const source = sourceTable(q, map);
  if (q.kind === "funnel") {
    const stepSql = q.steps
      .map(
        (step, i) =>
          `COUNT(DISTINCT IF(event_name = ${escapeSqlStringLiteral(step)}, user_id, NULL)) AS step_${i + 1}`
      )
      .join(", ");
    return {
      sql: `SELECT ${stepSql} FROM \`${source}\` WHERE ${timeSql(q, "bigquery")}`,
      params: [],
    };
  }
  const where = whereSql(q);
  const whereAll = [where, timeSql(q, "bigquery")].filter(Boolean).join(" AND ");
  if (q.groupBy === "day") {
    const agg =
      q.target === "users" || q.distinct ? "COUNT(DISTINCT user_id)" : "COUNT(*)";
    return {
      sql: `SELECT DATE(timestamp) AS day, ${agg} AS count FROM \`${source}\` WHERE ${whereAll} GROUP BY day ORDER BY day`,
      params: [],
    };
  }
  const agg =
    q.target === "users" || q.distinct ? "COUNT(DISTINCT user_id)" : "COUNT(*)";
  return { sql: `SELECT ${agg} AS count FROM \`${source}\` WHERE ${whereAll}`, params: [] };
};
