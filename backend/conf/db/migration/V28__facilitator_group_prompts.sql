ALTER TABLE facilitator_group_notes 
  ADD COLUMN reason_for_putting_people_together TEXT,
  ADD COLUMN known_safeguarding_concerns TEXT;

UPDATE facilitator_group_notes SET known_safeguarding_concerns='N/A';
