-- A support group's `time` is the recurring time-of-day the session meets
-- (paired with day_of_week), not a single instant. It was originally created as
-- a TIMESTAMP (V5), which Slick reads back as a LocalTime and fails to parse,
-- 500-ing any read of the group. Convert it to TIME so it matches the
-- SupportGroup model (LocalTime) and the frontend's "HH:MM" schedule label.
ALTER TABLE support_groups
  ALTER COLUMN time DROP DEFAULT,
  ALTER COLUMN time TYPE TIME USING time::time;

-- Seeded as CURRENT_TIMESTAMP (≈ midnight), which displays oddly. Give the demo
-- group a calm, sensible meeting time.
UPDATE support_groups SET time = TIME '18:00' WHERE group_id = 1;
