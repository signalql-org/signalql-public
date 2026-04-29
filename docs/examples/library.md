# Canonical SignalQL examples

Each example lists the **product question**, **SignalQL**, **logical output shape**, and a **compiled Postgres SQL pattern summary**. For exact generated SQL text + params, run the query through the CLI or MCP `run_signalql`.

Dataset assumptions match [`fixtures/seed.sql`](https://github.com/signalql-org/signalql-public/blob/main/fixtures/seed.sql).

## Funnel — signup to activation

**Question:** What share of signups reach `activated` within the window?

**SignalQL:**

```
FUNNEL "signup" THEN "activated" FROM events DURING LAST 28 DAYS
```

**Shape:** One row with `step_1`, `step_2`, … counts and `conversion_rate`.

**SQL pattern:** Filtered aggregate with `COUNT(DISTINCT CASE WHEN event_name = $k …)` (see compiler output).

---

## Retention starter — active vs signup volume

**Question:** How many users fired `signup` vs `activated` recently?

Use two queries (v0.1 keeps retention algebra minimal):

```
COUNT users FROM events WHERE event_name = "signup" DURING LAST 28 DAYS
```

```
COUNT users FROM events WHERE event_name = "activated" DURING LAST 28 DAYS
```

**Shape:** Single-row `count` each.

**SQL pattern:** Two parameterized `COUNT(DISTINCT user_id)` queries over `events` filtered by `event_name` and time window.

---

## Growth — daily signups

**Question:** How many signup events per day?

```
COUNT events FROM events WHERE event_name = "signup" DURING LAST 30 DAYS GROUP BY DAY
```

**Shape:** Rows `(day, count)` ordered by day.

**SQL pattern:** `SELECT date_trunc('day', timestamp) AS day, COUNT(*) ... GROUP BY day ORDER BY day`.

---

## Onboarding dropoff — funnel slice

**Question:** Where do users drop between onboarding completion and activation?

```
FUNNEL "onboarding_complete" THEN "activated" FROM events DURING LAST 14 DAYS
```

**Shape:** Step counts + `conversion_rate`.

**SQL pattern:** Distinct-user conditional counts per funnel step with derived conversion ratio.

---

## Feature usage — view items

**Question:** How often was `view_item` tracked?

```
COUNT events FROM events WHERE event_name = "view_item" DURING LAST 14 DAYS GROUP BY DAY
```

**Shape:** `(day, count)` rows.

**SQL pattern:** Day-bucketed aggregate over `events` filtered by `event_name` and bounded `timestamp`.

---

## Segmentation — pro plan purchases

**Question:** Among purchases tagged `plan=pro` on the event, how many distinct users?

```
COUNT users FROM events WHERE properties.plan = "pro" AND event_name = "purchase" DURING LAST 28 DAYS
```

**Shape:** Single-row `count`.

**SQL pattern:** `COUNT(DISTINCT user_id)` with predicates on `properties.plan`, `event_name`, and `timestamp` window.

---

These examples are mirrored in [`fixtures/query-fixtures.json`](https://github.com/signalql-org/signalql-public/blob/main/fixtures/query-fixtures.json) and the playground presets.
