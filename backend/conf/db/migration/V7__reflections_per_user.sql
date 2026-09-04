-- Tie reflections to the participant who wrote them, store free writing, and
-- track which sections (guided answers vs free writing) were shared with the
-- facilitator independently so the facilitator only ever sees shared sections.

ALTER TABLE reflections
  ADD COLUMN participant_id INTEGER REFERENCES participants(participant_id) ON DELETE CASCADE,
  ADD COLUMN free_writing TEXT,
  ADD COLUMN shared_free_writing BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN shared_free_writing_at TIMESTAMP;

-- The existing shared flag/timestamp only ever covered the guided answers.
ALTER TABLE reflections RENAME COLUMN shared_with_facilitator TO shared_guided;
ALTER TABLE reflections RENAME COLUMN shared_at TO shared_guided_at;

-- One evolving reflection row per participant per group (used for upserts).
ALTER TABLE reflections
  ADD CONSTRAINT reflections_group_participant_unique UNIQUE (group_id, participant_id);
