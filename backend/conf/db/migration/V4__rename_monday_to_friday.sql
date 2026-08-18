-- Rename Monday Group to Friday Group in seed data
UPDATE support_groups
SET name = 'Friday Group'
WHERE name = 'Monday Group';

-- Update the welcome message to refer to Friday Group
UPDATE group_messages
SET body = REPLACE(body, 'Monday Group', 'Friday Group')
WHERE body LIKE '%Monday Group%';
