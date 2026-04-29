import fixtures from "../../../fixtures/query-fixtures.json" assert { type: "json" };
import demoEvents from "../../../fixtures/sample-events.json" assert { type: "json" };
import { csvAdapter } from "@signalql/adapters";
import type { CompileOutput } from "@signalql/sdk";
import type { PlaygroundPreview } from "./PlaygroundUI.js";
import { useCallback, useMemo, useState } from "react";
import { useToggle } from "react-use";
import { validate } from "@signalql/sdk";
import { PlaygroundUI } from "./PlaygroundUI.js";

const defaultQuery =
  fixtures.queries.find((q) => q.id === "count_signup_30d")?.signalql ??
  `COUNT events FROM events WHERE event_name = "signup" DURING LAST 30 DAYS`;

const initialCompile = () => validate(defaultQuery, { dialect: "postgres" });

export const PlaygroundWrapper = () => {
  const boot = initialCompile();
  const [source, setSource] = useState(defaultQuery);
  const [showSql, toggleSql] = useToggle(true);
  const [lastGood, setLastGood] = useState<CompileOutput | null>(() =>
    boot.ok ? boot.output : null
  );
  const [error, setError] = useState<string | null>(() =>
    boot.ok ? null : boot.error.message
  );
  const [preview, setPreview] = useState<PlaygroundPreview | null>(null);

  const runQuery = useCallback((query: string) => {
    const compiled = validate(query, { dialect: "postgres" });
    if (!compiled.ok) {
      setError(`Compile: ${compiled.error.message}`);
      return;
    }
    setLastGood(compiled.output);
    try {
      const result = csvAdapter.run?.(query, { demoEvents: demoEvents as never[] });
      if (!result) {
        setError("Sample data execution: CSV adapter did not return a result.");
        return;
      }
      setError(null);
      setPreview({
        caption: "Result from bundled sample events",
        columns: result.columns,
        rows: result.rows,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(`Sample data execution: ${message}`);
    }
  }, []);

  const runCompile = useCallback(() => {
    runQuery(source);
  }, [runQuery, source]);

  const examples = useMemo(() => fixtures.queries.map((q) => q.signalql), []);

  return (
    <PlaygroundUI
      source={source}
      error={error}
      compiled={lastGood}
      preview={preview}
      showSql={showSql}
      examples={examples}
      onChangeSource={setSource}
      onRun={runCompile}
      onToggleSql={toggleSql}
      onPickExample={(q) => {
        setSource(q);
        runQuery(q);
      }}
    />
  );
};
