import type { Query } from "@signalql/compiler";

export type DemoEvent = {
  event_name: string;
  user_id: string | null;
  timestamp: string;
  properties?: Record<string, unknown> | null;
  traits?: Record<string, unknown> | null;
};

export type DemoResult = {
  columns: string[];
  rows: Array<Array<string | number | null>>;
};

const getPathValue = (event: DemoEvent, path: string[]) => {
  if (path[0] === "event_name") return event.event_name;
  if (path[0] === "properties" && path[1]) return event.properties?.[path[1]] ?? null;
  if (path[0] === "traits" && path[1]) return event.traits?.[path[1]] ?? null;
  return null;
};

const windowStartMs = (q: Query, events: DemoEvent[]) => {
  if (q.during.kind === "between") return Date.parse(q.during.start);
  const latest = events.reduce((max, e) => Math.max(max, Date.parse(e.timestamp)), 0);
  return latest - q.during.days * 24 * 60 * 60 * 1000;
};

const inWindow = (q: Query, e: DemoEvent, events: DemoEvent[]) => {
  if (q.during.kind === "between") {
    const ts = Date.parse(e.timestamp);
    return ts >= Date.parse(q.during.start) && ts < Date.parse(q.during.end);
  }
  return Date.parse(e.timestamp) >= windowStartMs(q, events);
};

const applyPredicates = (q: Query, events: DemoEvent[]) => {
  if (q.kind === "funnel") return events.filter((e) => inWindow(q, e, events));
  return events.filter((e) => {
    if (!inWindow(q, e, events)) return false;
    return q.where.every((p) => {
      const actual = getPathValue(e, p.field);
      if (typeof actual === "string" || typeof actual === "number" || typeof actual === "boolean") {
        return String(actual) === p.value;
      }
      return false;
    });
  });
};

const dayKey = (isoTs: string) => new Date(isoTs).toISOString().slice(0, 10);

const evalCount = (q: Extract<Query, { kind: "count" }>, events: DemoEvent[]): DemoResult => {
  const filtered = applyPredicates(q, events);
  if (q.groupBy === "day") {
    const bucket = new Map<string, Set<string> | number>();
    for (const e of filtered) {
      const key = dayKey(e.timestamp);
      if (q.target === "users" || q.distinct) {
        const set = (bucket.get(key) as Set<string> | undefined) ?? new Set<string>();
        if (e.user_id) set.add(e.user_id);
        bucket.set(key, set);
      } else {
        bucket.set(key, ((bucket.get(key) as number | undefined) ?? 0) + 1);
      }
    }
    const rows = [...bucket.entries()]
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([day, v]) => [day, v instanceof Set ? v.size : v]);
    return { columns: ["day", "count"], rows };
  }
  if (q.target === "users" || q.distinct) {
    const users = new Set(filtered.map((e) => e.user_id).filter(Boolean) as string[]);
    return { columns: ["count"], rows: [[users.size]] };
  }
  return { columns: ["count"], rows: [[filtered.length]] };
};

const evalFunnel = (q: Extract<Query, { kind: "funnel" }>, events: DemoEvent[]): DemoResult => {
  const filtered = applyPredicates(q, events);
  const stepCounts = q.steps.map((step) => {
    const users = new Set(
      filtered
        .filter((e) => e.event_name === step && e.user_id)
        .map((e) => e.user_id)
    );
    return users.size;
  });
  const first = stepCounts[0] ?? 0;
  const last = stepCounts.at(-1) ?? 0;
  const conversionRate = first > 0 ? last / first : null;
  const columns = q.steps.map((_, i) => `step_${i + 1}`).concat("conversion_rate");
  return { columns, rows: [[...stepCounts, conversionRate]] };
};

export const evaluateOnDemoEvents = (q: Query, events: DemoEvent[]): DemoResult =>
  (() => {
    if (q.source.toLowerCase() !== "events") {
      throw new RangeError(
        `Demo evaluator supports FROM events only. Received FROM ${q.source}.`
      );
    }
    return q.kind === "funnel" ? evalFunnel(q, events) : evalCount(q, events);
  })();
