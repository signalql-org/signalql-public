# Contributing to SignalQL

## What belongs here

The open-source core includes the specification, parser, AST, compiler, tests, fixtures, examples, and documentation. Hosting products, proprietary ingestion stacks, private application code, and enterprise-only features stay out of this repository.

## Tracking the specification

Implementations that compile or interpret SignalQL should:

1. Target a released spec version (e.g. v0.1) and document which version they support.
2. Describe any dialect-specific behavior (SQL shapes, type coercion, unsupported clauses).
3. Prefer contributing clarifications and examples back to `docs/spec/` when they benefit all implementers.

## Development

```bash
npm install
npm run build
npm test
npm run docs:build
```

Pull requests should keep changes focused and include or update tests when behavior changes.

## Issues and roadmap

Work is tracked in Linear for the SignalQL public launch; community discussion can mirror GitHub issues when the repository is published publicly.
