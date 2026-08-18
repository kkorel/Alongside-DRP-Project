-- Facilitator-curated resource links surfaced in the quiet space "Resources"
-- view. group_id NULL means the link is shown to every group.
CREATE TABLE support_links (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES support_groups(group_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Demo seed data for the presentation (facilitator-curated bereavement resources).
INSERT INTO support_links (group_id, title, url, description, sort_order) VALUES
  (
    NULL,
    'Cruse Bereavement Support',
    'https://www.cruse.org.uk',
    'Free support and information for anyone grieving — a helpline, online chat, and local services, whenever you feel ready.',
    1
  ),
  (
    1,
    'Marie Curie — Coping with bereavement',
    'https://www.mariecurie.org.uk/help/support/bereaved-family-friends',
    'Gentle guidance on grief, with a free support line for when you would like someone to talk to.',
    2
  ),
  (
    1,
    'At a Loss — find support near you',
    'https://www.ataloss.org',
    'A signposting service to help you find bereavement support that fits where you are. No rush.',
    3
  );