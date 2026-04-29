import { ParseError } from "./errors.js";

export type Tok =
  | { k: "kw"; v: string }
  | { k: "ident"; v: string }
  | { k: "str"; v: string }
  | { k: "num"; v: number };

const KW = new Set(
  [
    "count",
    "distinct",
    "from",
    "where",
    "and",
    "during",
    "last",
    "days",
    "between",
    "group",
    "by",
    "day",
    "funnel",
    "then",
  ].map((s) => s.toLowerCase())
);

export const tokenize = (input: string): Tok[] => {
  const out: Tok[] = [];
  let i = 0;
  const skipWs = () => {
    while (i < input.length && /\s/.test(input[i]!)) i += 1;
  };
  while (i < input.length) {
    skipWs();
    if (i >= input.length) break;
    const c = input[i]!;
    if (c === "=") {
      out.push({ k: "kw", v: "=" });
      i += 1;
      continue;
    }
    if (c === '"') {
      let j = i + 1;
      let buf = "";
      while (j < input.length && input[j] !== '"') {
        buf += input[j]!;
        j += 1;
      }
      if (j >= input.length) {
        throw new ParseError("Unterminated string", { offset: i });
      }
      out.push({ k: "str", v: buf });
      i = j + 1;
      continue;
    }
    if (/\d/.test(c)) {
      let j = i;
      while (j < input.length && /\d/.test(input[j]!)) j += 1;
      out.push({ k: "num", v: Number(input.slice(i, j)) });
      i = j;
      continue;
    }
    if (/[a-zA-Z_]/.test(c)) {
      const readSegEnd = (from: number) => {
        let j = from + 1;
        while (j < input.length && /[a-zA-Z0-9_]/.test(input[j]!)) j += 1;
        return j;
      };
      let j = readSegEnd(i);
      let raw = input.slice(i, j);
      while (j < input.length && input[j] === ".") {
        const start = j + 1;
        if (start >= input.length || !/[a-zA-Z_]/.test(input[start]!)) break;
        const end = readSegEnd(start);
        raw += input.slice(j, end);
        j = end;
      }
      const lower = raw.toLowerCase();
      if (KW.has(lower) && !raw.includes(".")) {
        out.push({ k: "kw", v: lower });
      } else {
        out.push({ k: "ident", v: raw });
      }
      i = j;
      continue;
    }
    throw new ParseError(`Unexpected character "${c}"`, { offset: i });
  }
  return out;
};
