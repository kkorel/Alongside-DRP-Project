DROP TABLE support_requests CASCADE;
DROP TABLE support_groups CASCADE;
DROP TABLE participants CASCADE;
DROP TABLE group_messages CASCADE;

CREATE TABLE support_groups (
  group_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  day_of_week TEXT NOT NULL,
  time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  duration INTEGER
);

CREATE TABLE participants (
  participant_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  initials TEXT NOT NULL,
  country TEXT,
  about_me TEXT,
  fun_fact TEXT,
  role TEXT NOT NULL
);

CREATE TABLE group_participants (
  group_id INTEGER NOT NULL,
  participant_id INTEGER NOT NULL,
  PRIMARY KEY (group_id, participant_id),
  FOREIGN KEY (group_id) REFERENCES support_groups(group_id) ON DELETE CASCADE,
  FOREIGN KEY (participant_id) REFERENCES participants(participant_id) ON DELETE CASCADE
);

CREATE TABLE group_messages (
  participant_id INTEGER NOT NULL,
  group_id INTEGER NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (participant_id, group_id, created_at),
  FOREIGN KEY (participant_id) REFERENCES participants(participant_id) ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES support_groups(group_id) ON DELETE CASCADE
);

CREATE TABLE facilitator_messages (
  from_id INTEGER NOT NULL,
  to_id INTEGER NOT NULL,
  group_id INTEGER NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (from_id, to_id, group_id, created_at),
  FOREIGN KEY (from_id) REFERENCES participants(participant_id) ON DELETE CASCADE,
  FOREIGN KEY (to_id) REFERENCES participants(participant_id) ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES support_groups(group_id) ON DELETE CASCADE
);


