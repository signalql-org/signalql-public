-- Sample analytics dataset matching the portable SignalQL model (Postgres).
BEGIN;

CREATE TABLE IF NOT EXISTS users (
  user_id text PRIMARY KEY,
  traits jsonb
);

CREATE TABLE IF NOT EXISTS sessions (
  session_id text PRIMARY KEY,
  user_id text,
  started_at timestamptz NOT NULL,
  ended_at timestamptz
);

CREATE TABLE IF NOT EXISTS events (
  event_name text NOT NULL,
  user_id text,
  session_id text,
  timestamp timestamptz NOT NULL,
  properties jsonb
);

INSERT INTO users (user_id, traits) VALUES
  ('u1', '{"plan":"free","country":"US"}'),
  ('u2', '{"plan":"pro","country":"US"}'),
  ('u3', '{"plan":"pro","country":"CA"}')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO events (event_name, user_id, session_id, timestamp, properties) VALUES
  ('signup', 'u1', 's1', NOW() - INTERVAL '5 days', '{}'),
  ('onboarding_complete', 'u1', 's1', NOW() - INTERVAL '5 days' + INTERVAL '10 minutes', '{}'),
  ('view_item', 'u2', 's2', NOW() - INTERVAL '2 days', '{"sku":"A"}'),
  ('purchase', 'u2', 's2', NOW() - INTERVAL '2 days' + INTERVAL '1 hour', '{"amount":49,"plan":"pro"}'),
  ('signup', 'u3', 's3', NOW() - INTERVAL '20 days', '{}'),
  ('activated', 'u3', 's3', NOW() - INTERVAL '19 days', '{}');

COMMIT;
