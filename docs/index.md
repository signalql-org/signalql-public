---
layout: home

hero:
  name: SignalQL
  text: Query language for product analytics
  tagline: Open, portable, and friendly to humans and AI tools
  actions:
    - theme: brand
      text: Run first query
      link: /guide/first-query
    - theme: alt
      text: Browse examples
      link: /examples/library
    - theme: alt
      text: Read the v0.1 spec
      link: /spec/v0.1

features:
  - title: Predictable semantics
    details: Same query compiles to dialect-specific SQL with stable shapes and limits.
  - title: Portable model
    details: Events, users, sessions, and properties map across warehouses and tools.
  - title: AI-native
    details: Structured surface area so assistants generate safe, reviewable queries.
---

## From Question to Answer

SignalQL gives product, data, and engineering teams a shared way to ask behavioral analytics questions. Funnels, counts, windows, and segments live in a readable query instead of a one-off dashboard change or a long SQL thread.

The result is faster iteration with clearer review: AI tools can draft SignalQL, the Postgres reference compiler produces SQL with bound parameters, and the portable model keeps analytics intent from getting trapped inside one vendor’s dashboard or warehouse dialect.

## Choose your path

### Build with SignalQL

- Run a first query with the [CLI path](/guide/first-query), or run the local playground from a repo checkout.
- Connect AI tools through [Cursor](/integrations/cursor), [Claude](/integrations/claude), [ChatGPT](/integrations/chatgpt), or [MCP](/integrations/mcp).
- Implement against the [v0.1 spec](/spec/v0.1), [language scope](/spec/scope), and [AST schema](/reference/ast-schema).

### Evaluate Adoption

- [Why SignalQL](/guide/why-signalql) explains the analytics and AI workflow gap.
- [Adoption brief](/launch/adoption-brief) outlines a low-risk pilot, success criteria, and rollback.
- [Portable data model](/guide/data-model) shows how events, users, and sessions map across implementations.
