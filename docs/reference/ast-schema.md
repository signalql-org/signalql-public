# AST JSON Schema (v0.1)

The formal JSON Schema for AST nodes lives in the repository at:

- [`schemas/signalql-ast-v0.1.schema.json`](https://github.com/signalql/signalql/blob/main/schemas/signalql-ast-v0.1.schema.json)

**Schema ID:** `https://signalql.org/schemas/signalql-ast-v0.1.schema.json`  
**Language version:** v0.1 (schema version tracks the spec, not the npm package semver).

## Examples

### Valid `count` AST

```json
{
  "kind": "count",
  "target": "events",
  "distinct": false,
  "source": "events",
  "where": [{ "field": ["event_name"], "value": "signup" }],
  "during": { "kind": "last_days", "days": 30 },
  "groupBy": null
}
```

### Valid `funnel` AST

```json
{
  "kind": "funnel",
  "source": "events",
  "steps": ["signup", "activated"],
  "during": { "kind": "last_days", "days": 14 }
}
```

### Invalid example (missing `where` for count shape)

```json
{
  "kind": "count",
  "target": "events",
  "distinct": false,
  "source": "events",
  "where": [],
  "during": { "kind": "last_days", "days": 7 },
  "groupBy": null
}
```

Reference parsers may still reject empty `where` at parse time; the schema allows an empty array—tighten at application level if you require at least one predicate.
