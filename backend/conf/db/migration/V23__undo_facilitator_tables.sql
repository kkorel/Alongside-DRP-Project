-- Undo migrations V20-V22.
--
-- Those migrations moved the facilitator out of `participants` into a separate
-- `facilitators` table, linked it from `support_groups.facilitator_id`,
-- reseated its id (1 -> 1000) and dropped the participant foreign keys on the
-- message tables. This migration reverses all of that, returning to the V19
-- schema where the facilitator is just a participant with role = 'facilitator'.

-- --- Undo V20/V21 on support_groups: drop the facilitator link.
ALTER TABLE support_groups DROP CONSTRAINT IF EXISTS group_facilitator_id;
ALTER TABLE support_groups DROP COLUMN IF EXISTS facilitator_id;

-- --- Undo V20 on participants: restore `fun_fact` and `role`.
ALTER TABLE participants RENAME COLUMN fact TO fun_fact;
ALTER TABLE participants ADD COLUMN role TEXT NOT NULL DEFAULT 'participant';
ALTER TABLE participants ALTER COLUMN role DROP DEFAULT;

-- V20 deleted the facilitator participant (Sean, id 8) and reused id 8 for a
-- new participant (Henry). Drop Henry and restore Sean as the facilitator,
-- along with his original group memberships (groups 1 and 2, per V6/V18).
DELETE FROM participants WHERE participant_id = 8;
INSERT INTO participants
    (participant_id, name, initials, fun_fact, pronouns, age, hobbies, role)
  VALUES
    (8, 'Sean', 'S', 'I love formula 1', 'He / him', '40-45', 'Cooking', 'facilitator');
INSERT INTO group_participants (group_id, participant_id) VALUES (1, 8), (2, 8);

-- --- Undo V22's reseat: messages that referenced the facilitator at the
-- reseated id (1000) reference participant id 8 again.
UPDATE facilitator_messages SET from_id = 8 WHERE from_id = 1000;
UPDATE facilitator_messages SET to_id   = 8 WHERE to_id   = 1000;
UPDATE group_messages       SET participant_id = 8 WHERE participant_id = 1000;

-- --- Drop the separate facilitators table (created in V20).
DROP TABLE facilitators;

-- --- Undo V22's constraint drops: restore the participant foreign keys.
ALTER TABLE facilitator_messages
  ADD CONSTRAINT facilitator_messages_from_id_fkey
  FOREIGN KEY (from_id) REFERENCES participants(participant_id) ON DELETE CASCADE;
ALTER TABLE facilitator_messages
  ADD CONSTRAINT facilitator_messages_to_id_fkey
  FOREIGN KEY (to_id) REFERENCES participants(participant_id) ON DELETE CASCADE;
ALTER TABLE group_messages
  ADD CONSTRAINT group_messages_participant_id_fkey
  FOREIGN KEY (participant_id) REFERENCES participants(participant_id) ON DELETE CASCADE;
