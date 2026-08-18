-- More demo data for the facilitator view: a second group and a handful of people who
-- have finished onboarding but are not yet placed in any group (so they appear as
-- "new arrivals"). Uses the current schema (post-V15/V16: no country/about_me; time is a
-- TIME; description exists after V17). who_lost is a single mutually-exclusive value
-- (family | partner | friend | pet | a free-text own-words | rather_not_say).

INSERT INTO support_groups (group_id, name, day_of_week, time, duration, description)
VALUES (
  2,
  'Sunday Mornings',
  'SUNDAY',
  '10:30',
  60,
  'A gentle, slower-paced circle to start the week. Come as you are — listening is taking part.'
);

SELECT setval(
  pg_get_serial_sequence('support_groups', 'group_id'),
  2,
  true
);

-- The facilitator (Sean, id 8) also holds this group.
INSERT INTO group_participants (group_id, participant_id) VALUES (2, 8);

-- People waiting to be placed (finished onboarding, not in any group).
INSERT INTO participants (
    participant_id,
    name,
    pronouns,
    initials,
    age,
    cultural_background,
    hobbies,
    fun_fact,
    grief_recency,
    who_lost,
    role,
    onboarding_status
) VALUES
    (
        9,
        'Sam',
        'he / him',
        'S',
        '21–24',
        'British',
        'Music, Reading, Being outside',
        'I''m happiest by the sea — my dad taught me to sail.',
        'A few months ago',
        'family',
        'participant',
        'complete'
    ),
    (
        10,
        'Isla',
        'she / her',
        'I',
        '18–20',
        'Scottish',
        'Being outside, Music, Painting',
        'I paint tiny watercolours of the Highlands.',
        'In the last few weeks',
        'My wee sister, Robyn',
        'participant',
        'complete'
    ),
    (
        11,
        'Rowan',
        'he / him',
        'R',
        '45+',
        '—',
        'Being outside, Games',
        'Bramble and I walked the same canal path every morning for a decade.',
        'In the last few weeks',
        'pet',
        'participant',
        'complete'
    ),
    (
        12,
        'Marcus',
        'he / him',
        'M',
        '35–44',
        '—',
        'Films & TV',
        'I''m a lifelong film buff — I keep a journal of every film I watch.',
        'Longer ago',
        'partner',
        'participant',
        'complete'
    ),
    (
        13,
        'Nadia',
        'she / her',
        'N',
        '25–29',
        'British-Egyptian',
        'Cooking, Reading',
        'I make a very good cup of mint tea.',
        'A few months ago',
        'rather_not_say',
        'participant',
        'complete'
    );

SELECT setval(
  pg_get_serial_sequence('participants', 'participant_id'),
  13,
  true
);
