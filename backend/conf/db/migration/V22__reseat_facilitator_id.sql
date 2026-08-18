-- The facilitator now lives in its own `facilitators` table, separate from
-- `participants`. The message tables, however, still key on a single integer id
-- space (participant ids 1..n), so a facilitator whose id overlaps a participant
-- id is indistinguishable from that participant in a thread.
--
-- Move the facilitator to an id well outside the participant range, and drop the
-- participant foreign keys on the message tables (the sender/recipient of a
-- message may now legitimately be the facilitator, who is not a participant).

-- 1. Reseat the facilitator id (1 -> 1000) without tripping the support_groups FK:
--    copy the row to the new id, repoint the group, then drop the old row.
INSERT INTO facilitators (facilitator_id, name, initials, fact, pronouns, age, hobbies)
  SELECT 1000, name, initials, fact, pronouns, age, hobbies
  FROM facilitators
  WHERE facilitator_id = 1;

UPDATE support_groups SET facilitator_id = 1000 WHERE facilitator_id = 1;

DELETE FROM facilitators WHERE facilitator_id = 1;

SELECT setval(pg_get_serial_sequence('facilitators', 'facilitator_id'), 1000, true);

-- 2. A facilitator-authored message can no longer satisfy a foreign key into
--    `participants`, so relax those constraints. (The app controls valid ids.)
ALTER TABLE facilitator_messages DROP CONSTRAINT IF EXISTS facilitator_messages_from_id_fkey;
ALTER TABLE facilitator_messages DROP CONSTRAINT IF EXISTS facilitator_messages_to_id_fkey;
ALTER TABLE group_messages DROP CONSTRAINT IF EXISTS group_messages_participant_id_fkey;
