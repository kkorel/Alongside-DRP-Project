ALTER TABLE participants
  ADD COLUMN pronouns TEXT,
  ADD COLUMN age INTEGER,
  ADD COLUMN hobbies TEXT,
  ADD COLUMN cultural_background TEXT,
  ADD COLUMN grief_recency TEXT,
  ADD COLUMN who_lost TEXT,
  ADD COLUMN onboarding_status TEXT NOT NULL DEFAULT 'draft';
