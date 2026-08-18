-- A participant's private doodles for a room. shared_with_facilitator marks the
-- ones explicitly shared via the quiet space "Share with facilitator" action;
-- everything else stays private to the participant.
CREATE TABLE user_doodles (
  id SERIAL PRIMARY KEY,
  participant_id INTEGER NOT NULL REFERENCES participants(participant_id) ON DELETE CASCADE,
  group_id INTEGER NOT NULL REFERENCES support_groups(group_id) ON DELETE CASCADE,
  image_data TEXT NOT NULL,
  shared_with_facilitator BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- STORAGE NOTE: this app persists everything in Postgres — there is no blob/object
-- store or static-upload pattern to reuse — so the PNG is stored as a base64 data
-- URL in image_data, mirroring how a saved text reflection lives in a column.
-- KNOWN SCALING LIMITATION: data URLs are heavy; a production deployment should
-- move the image to object storage and keep only a key/URL in image_data.