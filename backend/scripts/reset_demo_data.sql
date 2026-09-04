/*
  Presentation demo data reset
  ============================

  Purpose:
  Remove only user-created/demo-test data while keeping the spoofed Monday Group
  seed data used for the presentation.

  This script keeps:
  - support_groups
  - participants
  - seeded group messages from spoofed participants

  This script deletes:
  - reflections
  - facilitator direct messages
  - chat messages sent by the demo user, usually sender_name = 'You'
  - old support_requests from the previous prototype

  How to run:
  1. Export your database URL:
       export DATABASE_URL='postgresql://USER:PASSWORD@HOST:PORT/DATABASE'

  2. From the repository root, run:
       psql "$DATABASE_URL" -f backend/drp-backend/scripts/reset_demo_data.sql

  3. To preview counts without deleting anything, run each SELECT below manually
     in psql instead of running the whole file.
*/

BEGIN;

-- Preview the rows this script is intended to remove.
SELECT COUNT(*) AS reflections_to_delete
FROM reflections;

SELECT COUNT(*) AS group_messages_to_delete
FROM group_messages
WHERE sender_name = 'You'
   OR message_type <> 'group';

SELECT COUNT(*) AS support_requests_to_delete
FROM support_requests;

-- Delete reflection-room data created during demos/tests.
DELETE FROM reflections;

-- Delete demo-user chat messages and facilitator direct messages.
-- Seeded participant messages are message_type = 'group' and sender_name <> 'You',
-- so they are preserved.
DELETE FROM group_messages
WHERE sender_name = 'You'
   OR message_type <> 'group';

-- Delete old prototype support requests.
DELETE FROM support_requests;

-- Safety checks after delete. These should remain populated for the presentation.
SELECT COUNT(*) AS support_groups_kept
FROM support_groups;

SELECT COUNT(*) AS participants_kept
FROM participants;

SELECT COUNT(*) AS seeded_group_messages_kept
FROM group_messages
WHERE message_type = 'group'
  AND sender_name <> 'You';

COMMIT;
