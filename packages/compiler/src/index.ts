import type { Query } from "./ast.js";
import { parseQuery } from "./parse.js";
import type { CompileResult } from "./pg.js";
import { compilePostgres } from "./pg.js";
import type { SourceMap } from "./source.js";
import { resolveBoundSource } from "./source.js";
import { tokenize } from "./tokenize.js";

export type Dialect = "postgres";

export type CompileOptions = {
  dialect?: Dialect;
  sourceMap?: SourceMap;
};

export type CompileOutput = CompileResult & { ast: Query };

export const compile = (
  query: string,
  opts: CompileOptions = {}
): CompileOutput => {
  const dialect = opts.dialect ?? "postgres";
  const ast = parseQuery(tokenize(query.trim()));
  if (dialect !== "postgres") {
    throw new RangeError(`Unsupported dialect: ${dialect}`);
  }
  const sourceTable = resolveBoundSource(ast, opts.sourceMap);
  const out = compilePostgres(ast, sourceTable, opts.sourceMap);
  return { ...out, ast };
};

export const parse = (query: string): Query => parseQuery(tokenize(query.trim()));

export { ParseError } from "./errors.js";
export type { ParseErrorDetails } from "./errors.js";
export { tokenize } from "./tokenize.js";
export type { SourceMap } from "./source.js";
export type { Query } from "./ast.js";
