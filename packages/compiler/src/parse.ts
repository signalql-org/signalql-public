import type { Query, TimeWindow } from "./ast.js";
import { ParseError } from "./errors.js";
import type { Tok } from "./tokenize.js";

const expectKw = (toks: Tok[], i: number, kw: string, clause: string) => {
  const t = toks[i];
  if (!t || t.k !== "kw" || t.v !== kw) {
    throw new ParseError(`Expected "${kw}"`, { tokenIndex: i, clause });
  }
};

const parseTime = (
  toks: Tok[],
  pos: { i: number }
): { win: TimeWindow; next: number } => {
  expectKw(toks, pos.i, "during", "time clause");
  pos.i += 1;
  const a = toks[pos.i];
  if (a?.k === "kw" && a.v === "last") {
    pos.i += 1;
    const n = toks[pos.i];
    const d = toks[pos.i + 1];
    expectKw(toks, pos.i + 1, "days", "time clause");
    if (n?.k !== "num") {
      throw new ParseError("Expected day count after LAST", {
        tokenIndex: pos.i,
        clause: "time clause",
      });
    }
    pos.i += 2;
    return { win: { kind: "last_days", days: n.v }, next: pos.i };
  }
  if (a?.k === "kw" && a.v === "between") {
    pos.i += 1;
    const s = toks[pos.i];
    const and = toks[pos.i + 1];
    const e = toks[pos.i + 2];
    if (s?.k !== "str" || and?.k !== "kw" || and.v !== "and" || e?.k !== "str") {
      throw new ParseError(`Expected BETWEEN "ts" AND "ts"`, {
        tokenIndex: pos.i,
        clause: "time clause",
      });
    }
    pos.i += 3;
    return {
      win: { kind: "between", start: s.v, end: e.v },
      next: pos.i,
    };
  }
  throw new ParseError("Expected time window (LAST … DAYS or BETWEEN …)", {
    tokenIndex: pos.i,
    clause: "time clause",
  });
};

const parseWhere = (toks: Tok[], pos: { i: number }) => {
  const preds: { field: string[]; value: string }[] = [];
  expectKw(toks, pos.i, "where", "WHERE clause");
  pos.i += 1;
  for (;;) {
    const fieldTok = toks[pos.i];
    const eq = toks[pos.i + 1];
    const val = toks[pos.i + 2];
    if (
      fieldTok?.k !== "ident" ||
      eq?.k !== "kw" ||
      (eq as { v: string }).v !== "=" ||
      val?.k !== "str"
    ) {
      throw new ParseError(`Expected field = "value"`, {
        tokenIndex: pos.i,
        clause: "WHERE clause",
      });
    }
    preds.push({ field: fieldTok.v.split("."), value: val.v });
    pos.i += 3;
    const and = toks[pos.i];
    if (and?.k === "kw" && and.v === "and") {
      pos.i += 1;
      continue;
    }
    break;
  }
  return preds;
};

export const parseQuery = (toks: Tok[]): Query => {
  const pos = { i: 0 };
  const first = toks[0];
  if (first?.k === "kw" && first.v === "funnel") {
    pos.i = 1;
    const steps: string[] = [];
    for (;;) {
      const s = toks[pos.i];
      if (s?.k !== "str") {
        throw new ParseError("Funnel step string expected", {
          tokenIndex: pos.i,
          clause: "FUNNEL",
        });
      }
      steps.push(s.v);
      pos.i += 1;
      const then = toks[pos.i];
      if (then?.k === "kw" && then.v === "then") {
        pos.i += 1;
        continue;
      }
      break;
    }
    expectKw(toks, pos.i, "from", "FROM clause");
    pos.i += 1;
    const src = toks[pos.i];
    if (src?.k !== "ident") {
      throw new ParseError("Table name expected after FROM", { tokenIndex: pos.i, clause: "FROM" });
    }
    pos.i += 1;
    const { win } = parseTime(toks, pos);
    if (pos.i !== toks.length) {
      throw new ParseError("Unexpected tokens after funnel query", { tokenIndex: pos.i });
    }
    return { kind: "funnel", source: src.v, steps, during: win };
  }

  expectKw(toks, pos.i, "count", "SELECT aggregate");
  pos.i += 1;
  let distinct = false;
  if (toks[pos.i]?.k === "kw" && toks[pos.i]!.v === "distinct") {
    distinct = true;
    pos.i += 1;
  }
  const tgt = toks[pos.i];
  pos.i += 1;
  const tname =
    tgt?.k === "ident" && (tgt.v.toLowerCase() === "events" || tgt.v.toLowerCase() === "users")
      ? tgt.v.toLowerCase()
      : null;
  if (!tname) {
    throw new ParseError("COUNT events or COUNT users expected", {
      tokenIndex: pos.i - 1,
      clause: "SELECT aggregate",
    });
  }
  expectKw(toks, pos.i, "from", "FROM clause");
  pos.i += 1;
  const src = toks[pos.i];
  if (src?.k !== "ident") {
    throw new ParseError("Table name expected after FROM", { tokenIndex: pos.i, clause: "FROM" });
  }
  pos.i += 1;
  const where = parseWhere(toks, pos);
  const { win } = parseTime(toks, pos);
  let groupBy: "day" | null = null;
  const g = toks[pos.i];
  if (g?.k === "kw" && g.v === "group") {
    pos.i += 1;
    expectKw(toks, pos.i, "by", "GROUP BY");
    pos.i += 1;
    expectKw(toks, pos.i, "day", "GROUP BY");
    pos.i += 1;
    groupBy = "day";
  }
  if (pos.i !== toks.length) {
    throw new ParseError("Unexpected tokens after query", { tokenIndex: pos.i });
  }
  return {
    kind: "count",
    target: tname as "events" | "users",
    distinct,
    source: src.v,
    where,
    during: win,
    groupBy,
  };
};
