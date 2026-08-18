-- Move facilitator data into a separate table
DELETE FROM participants WHERE role='facilitator';
ALTER TABLE participants DROP COLUMN role;
ALTER TABLE participants RENAME COLUMN fun_fact TO fact;

CREATE TABLE facilitators (
  facilitator_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  initials TEXT NOT NULL,
  fact TEXT NOT NULL,
  pronouns TEXT NOT NULL,
  age TEXT NOT NULL,
  hobbies TEXT NOT NULL
);

ALTER TABLE support_groups ADD COLUMN facilitator_id INTEGER;

ALTER TABLE support_groups ADD CONSTRAINT group_facilitator_id
  FOREIGN KEY (facilitator_id)
  REFERENCES facilitators(facilitator_id);

INSERT INTO facilitators (facilitator_id, name, initials, fact, pronouns, age, hobbies)
  VALUES (1, 'Sean', 'S', 'I love formula 1', 'He / him', '40-45', 'Cooking');

SELECT setval(pg_get_serial_sequence('facilitators', 'facilitator_id'), 1, true);

INSERT INTO participants (participant_id, name, initials, fact, pronouns, age, hobbies, cultural_background, grief_recency, who_lost, onboarding_status)
  VALUES (8, 'Henry', 'H', 'I like rocks!', 'They / them', '21-24', 'Rock-climbing', 'Gaming', 'Longer ago', 'partner', 'complete');
