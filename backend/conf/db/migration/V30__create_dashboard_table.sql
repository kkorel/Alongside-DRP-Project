CREATE TABLE dashboard_reflections(
  griever_id INTEGER NOT NULL,
  choice TEXT NOT NULL,
  description TEXT,
  reflection_time TIMESTAMP NOT NULL,
  PRIMARY KEY(griever_id, reflection_time),
  CONSTRAINT fk_griever_id FOREIGN KEY (griever_id) REFERENCES participants(participant_id)
);
