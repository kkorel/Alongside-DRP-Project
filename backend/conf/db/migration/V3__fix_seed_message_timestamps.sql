UPDATE group_messages
SET created_at = CURRENT_TIMESTAMP - INTERVAL '12 minutes'
WHERE group_id = 1
  AND message_type = 'group'
  AND sender_name = 'Sean'
  AND body = 'Welcome to Monday Group. There is no pressure to speak straight away; reading along is also taking part.';

UPDATE group_messages
SET created_at = CURRENT_TIMESTAMP - INTERVAL '8 minutes'
WHERE group_id = 1
  AND message_type = 'group'
  AND sender_name = 'Amber'
  AND body = 'I am glad this space exists. I have found this week quite heavy.';

UPDATE group_messages
SET created_at = CURRENT_TIMESTAMP - INTERVAL '4 minutes'
WHERE group_id = 1
  AND message_type = 'group'
  AND sender_name = 'Mo'
  AND body = 'Same here. It helps to be somewhere that already understands why ordinary days can feel complicated.';
