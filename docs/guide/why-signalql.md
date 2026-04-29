# Why SignalQL exists

SignalQL is an **open query language for behavioral product analytics**. It is not owned by a single product and is designed for multi-implementation adoption around a shared standard model and compiler contract.

## Neutral positioning

- **signalql.org** describes SignalQL as a portable language for analytics semantics: events, actors, time, and aggregation.
- Vendors implement adapters and compilers; the community evolves the specification.
- SQL remains the execution substrate in many deployments, but authors write SignalQL for clarity and safety.

## Why not raw SQL?

SQL is universal but **too low-level for analytics intent**. Dashboard SQL becomes repetitive; AI assistants hallucinate table shapes. SignalQL lifts repeated patterns—sessions, funnels, cohort windows—into named constructs with a documented compilation contract and **documented result shapes**.

## Why not only dashboards?

Dashboards are **rigid** by design: they answer preselected questions with prebuilt charts. That works for recurring KPIs, but product teams constantly ask follow-up questions that were not modeled in advance. As soon as the question changes ("only for users from campaign X", "compare week-over-week by plan", "show the funnel drop between step 2 and 3"), dashboards either require manual reconfiguration or a handoff to SQL.

SignalQL fills that gap with a language built for exploratory analysis. Instead of rebuilding charts for every variation, analysts and AI tools can express intent directly in a compact, reviewable query format. The guardrails still matter: bounded time windows, allowed aggregates, and predictable typing reduce accidental misuse and make results easier to validate and reproduce.

## Why now?

AI tools need **structured, predictable** surfaces. A small, explicit grammar beats prose-to-SQL for reviewability and testing. SignalQL pairs human-readable queries with **deterministic compilation** and dialect-documented SQL safety behavior.

## What Teams Gain

- Product teams can turn follow-up questions into structured queries instead of waiting for every dashboard variation.
- Data teams get a smaller, reviewable surface for AI-assisted analysis instead of unconstrained prose-to-SQL.
- Engineering and platform teams can keep analytics intent portable instead of encoding every question in vendor-specific dashboard logic.

## Pilot Without a Migration Cliff

Start with a narrow slice before changing broader workflows:

1. Map one dev or staging warehouse slice to the [portable data model](./data-model.md).
2. Try compile-first workflows ([first query](./first-query.md)) and optional Postgres execution ([local Postgres](./postgres-local.md)).
3. Expand only where SignalQL covers your v0.1 questions; everything else stays on existing tools until the spec grows.

Rollback stays simple: stop authoring SignalQL and keep using approved SQL or existing dashboards. The spec does not require adopting a new hosted runtime.

## Design Principles

- Lead with user and event semantics, not implementation details.
- Treat the reference Postgres compiler as one dialect; others follow the same AST bounds.
- Prefer examples that match the portable data model documented alongside this guide.
