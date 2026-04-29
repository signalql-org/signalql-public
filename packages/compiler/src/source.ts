import type { Query } from "./ast.js";

export type PortableSource = "events" | "users" | "sessions";
export type SourceMap = Partial<Record<PortableSource, string>>;

const PORTABLE_SOURCES = new Set<PortableSource>(["events", "users", "sessions"]);
const SAFE_IDENT = /^[a-zA-Z_]\w*$/;

const assertSafeTableName = (table: string) => {
  if (!SAFE_IDENT.test(table)) {
    throw new RangeError(`Unsafe table binding: ${table}`);
  }
};

export const resolveMappedSource = (
  logicalSource: string,
  map: SourceMap = {}
): string => {
  const source = logicalSource.toLowerCase();
  if (!PORTABLE_SOURCES.has(source as PortableSource)) {
    throw new RangeError(
      `Unknown source: ${logicalSource}. Allowed logical sources: events, users, sessions.`
    );
  }
  const logical = source as PortableSource;
  const physical = map[logical] ?? logical;
  assertSafeTableName(physical);
  return physical;
};

export const resolveBoundSource = (q: Query, map: SourceMap = {}): string =>
  resolveMappedSource(q.source, map);
