import type { CompileOutput } from "@signalql/sdk";

export type PlaygroundPreview = {
  caption: string;
  columns: string[];
  rows: Array<Array<string | number | null>>;
};

export type PlaygroundUIProps = {
  source: string;
  error: string | null;
  compiled: CompileOutput | null;
  preview: PlaygroundPreview | null;
  showSql: boolean;
  examples: string[];
  onChangeSource: (next: string) => void;
  onRun: () => void;
  onToggleSql: () => void;
  onPickExample: (q: string) => void;
};

export const PlaygroundUI = (props: PlaygroundUIProps) => (
  <div style={{ fontFamily: "system-ui", maxWidth: 960, margin: "0 auto", padding: 24 }}>
    <header style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
      <strong>SignalQL playground</strong>
      <span style={{ marginLeft: 12, fontSize: 12, color: "#64748b" }}>
        v0.1 · compile + run against bundled demo events
      </span>
    </header>
    <div style={{ display: "grid", gap: 12 }}>
      <textarea
        value={props.source}
        onChange={(e) => props.onChangeSource(e.target.value)}
        rows={8}
        style={{ width: "100%", fontFamily: "monospace", fontSize: 13 }}
      />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" onClick={props.onRun}>
          Run
        </button>
        <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input type="checkbox" checked={props.showSql} onChange={props.onToggleSql} />
          <span>Show generated SQL</span>
        </label>
      </div>
      {props.error ? (
        <pre style={{ color: "crimson", whiteSpace: "pre-wrap" }}>{props.error}</pre>
      ) : null}
      {props.showSql && props.compiled ? (
        <pre style={{ background: "#0b1020", color: "#e6edf3", padding: 12, overflow: "auto" }}>
          {props.compiled.sql.trim()}
          {"\n\n-- params\n"}
          {JSON.stringify(props.compiled.params, null, 2)}
        </pre>
      ) : null}
      {props.preview && !props.error ? (
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>{props.preview.caption}</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                {props.preview.columns.map((c) => (
                  <th key={c} style={{ textAlign: "left", borderBottom: "1px solid #e2e8f0", padding: 6 }}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {props.preview.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((cell, j) => (
                    <td key={j} style={{ padding: 6, borderBottom: "1px solid #f1f5f9" }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      <div>
        <div style={{ marginBottom: 8 }}>Examples</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {props.examples.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => props.onPickExample(q)}
              style={{ textAlign: "left" }}
            >
              {q.slice(0, 72)}
              {q.length > 72 ? "…" : ""}
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
);
