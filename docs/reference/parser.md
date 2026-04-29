# Parser and AST (`@signalql/parser`)

The `@signalql/parser` package exposes:

- `parse(query: string)` → [`Query`](./ast-schema.md)
- `tokenize(query: string)` for tokenizer debugging
- `ParseError` for structured failures

Implementation lives in `@signalql/compiler`; the standalone parser package gives downstream tools a **stable import surface** without pulling codegen unless needed.

## Stability expectations

- AST node kinds (`count`, `funnel`) and fields align with [`schemas/signalql-ast-v0.1.schema.json`](https://github.com/signalql-org/signalql-public/blob/main/schemas/signalql-ast-v0.1.schema.json).
- Breaking AST changes require a **spec minor/major** bump and schema revision.

## Tests

See `packages/parser/test/parser.test.ts` and `packages/compiler/test/compile.test.ts`.
