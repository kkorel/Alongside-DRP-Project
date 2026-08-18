-- Facilitator-curated meditation playlists surfaced in the quiet space
-- "Meditation" view. group_id NULL means available to every group.
CREATE TABLE meditation_playlists (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES support_groups(group_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  spotify_url TEXT NOT NULL,
  track_count INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Demo seed data for the presentation (real public Spotify playlists).
INSERT INTO meditation_playlists (group_id, title, description, spotify_url, track_count, sort_order) VALUES
  (
    NULL,
    'Peaceful meditation',
    'Soft, slow soundscapes to settle into',
    'https://open.spotify.com/playlist/37i9dQZF1DWZqd5JICZI0u',
    197,
    1
  ),
  (
    NULL,
    'Peaceful yoga flow & meditation',
    'Gentle music for slow movement or rest',
    'https://open.spotify.com/playlist/3oWjPUCEXu2HCJE0dTNH5H',
    371,
    2
  ),
  (
    NULL,
    'Deep relaxation',
    'For winding down or drifting off to sleep',
    'https://open.spotify.com/playlist/42jVRmhatn3CqPz5jSIA7E',
    80,
    3
  );