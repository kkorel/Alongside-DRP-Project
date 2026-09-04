ALTER TABLE grievers ADD COLUMN time_of_onboarding TIMESTAMP;
ALTER TABLE support_groups ADD COLUMN time_of_creation TIMESTAMP;

UPDATE grievers SET time_of_onboarding=CURRENT_TIMESTAMP;
UPDATE support_groups SET time_of_creation=CURRENT_TIMESTAMP;

ALTER TABLE grievers ALTER COLUMN time_of_onboarding SET NOT NULL;
ALTER TABLE support_groups ALTER COLUMN time_of_creation SET NOT NULL;
