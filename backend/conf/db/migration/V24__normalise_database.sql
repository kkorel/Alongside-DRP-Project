CREATE TABLE facilitators (
  facilitator_id INTEGER PRIMARY KEY,
  logistics TEXT,
  CONSTRAINT fk_facilitator_id FOREIGN KEY (facilitator_id) REFERENCES participants(participant_id)
);

CREATE TABLE grievers (
  griever_id INTEGER PRIMARY KEY,
  cultural_background TEXT,
  grief_recency TEXT,
  who_lost TEXT,
  onboarding_status TEXT,
  CONSTRAINT fk_griever_id FOREIGN KEY (griever_id) REFERENCES participants(participant_id)
);

ALTER TABLE participants
  DROP COLUMN cultural_background,
  DROP COLUMN grief_recency,
  DROP COLUMN who_lost,
  DROP COLUMN onboarding_status;

INSERT INTO grievers (griever_id, onboarding_status)
  VALUES
    (2, 'draft'),
    (4, 'draft'),
    (3, 'draft'),
    (5, 'draft'),
    (6, 'draft');

INSERT INTO grievers (griever_id, cultural_background, grief_recency, who_lost, onboarding_status)
  VALUES
    (7, NULL, 'Longer ago', 'my dog', 'draft'),
    (1, 'White / European', 'Longer ago', 'A family member', 'draft'),
    (9, 'British', 'A few months ago', 'family', 'complete'),
    (10, 'Scottish', 'In the last few weeks', 'Sister', 'complete'),
    (11, NULL, 'In the last few weeks', 'pet', 'complete'),
    (12, NULL, 'Longer ago', 'partner', 'complete'),
    (13, 'British-Egyptian', 'A few months ago', 'rather_not_say', 'complete');

INSERT INTO facilitators (facilitator_id, logistics)
  VALUES (8, 'Office hours: 9am - 5:30pm every day');


