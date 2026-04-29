import {
  compile as compileInner,
  parse as parseInner,
  type CompileOptions,
  type CompileOutput,
  type Query,
} from "@signalql/compiler";

export const parse = (source: string): Query => parseInner(source);

export const compile = (
  source: string,
  opts?: CompileOptions
): CompileOutput => compileInner(source, opts);

export const validate = (
  source: string,
  opts?: CompileOptions
): { ok: true; output: CompileOutput } | { ok: false; error: Error } => {
  try {
    return { ok: true, output: compileInner(source, opts) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e : new Error(String(e)) };
  }
};

export { ParseError } from "@signalql/compiler";
export type { CompileOptions, CompileOutput, Query } from "@signalql/compiler";
