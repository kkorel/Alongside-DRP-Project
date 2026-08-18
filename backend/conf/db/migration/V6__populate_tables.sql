INSERT INTO support_groups (group_id, name, day_of_week, time, duration)
VALUES (1, 'Monday Group', 'MONDAY', CURRENT_TIMESTAMP - INTERVAL '3 minutes', 30);

SELECT setval(
  pg_get_serial_sequence('support_groups', 'group_id'),
  1,
  true
);

INSERT INTO participants (
    participant_id,
    name,
    initials,
    country,
    about_me,
    fun_fact,
    role
) VALUES
    (
        1,
        'Amber',
        'A',
        'United Kingdom',
        'I am trying to find steadier ways to talk about grief without feeling like I am bringing the mood down.',
        'I collect old postcards from places I have never been.',
        'participant'
    ),
    (
        2,
        'Mo',
        'M',
        'France',
        'I joined because I wanted somewhere gentle to say the things that do not fit into normal catch-ups.',
        'I can make a very good cup of mint tea.',
        'participant'
    ),
    (
        3,
        'Andrew',
        'A',
        'Germany',
        'I am learning how to keep memories close while still making room for ordinary days.',
        'I know far too much about train routes.',
        'participant'
    ),
    (
        4,
        'Isabel',
        'I',
        'Switzerland',
        'I find it easier to listen first, but I am hoping to share more when I feel ready.',
        'I always notice the soundtrack in films before the plot.',
        'participant'
    ),
    (
        5,
        'Sarah',
        'S',
        'Germany',
        'I wanted a space where grief does not need a long explanation before people understand.',
        'I bake when I cannot sleep.',
        'participant'
    ),
    (
        6,
        'Jenny',
        'J',
        'United Kingdom',
        'I am here to feel less alone in the strange practical parts of loss.',
        'I once learned calligraphy for a week and still label everything beautifully.',
        'participant'
    ),
    (
        7,
        'Richard',
        'R',
        'United Kingdom',
        'I am looking for a calm group where I can be honest without needing to fix anything.',
        'I can solve a Rubik''s cube, slowly.',
        'participant'
    ),
    (
        8,
        'Sean',
        'S',
        'United Kingdom',
        'I want to help people.',
        'I love formula 1',
        'facilitator'
    );

SELECT setval(
  pg_get_serial_sequence('participants', 'participant_id'),
  8,
  true
);

INSERT INTO group_participants (
    group_id,
    participant_id
) VALUES (
  1,
  1
),
(
  1,
  2
),
(
  1,
  3
),
(
  1,
  4
),
(
  1,
  5
),
(
  1,
  6
),
(
  1,
  7
),
(
  1,
  8
);

INSERT INTO group_messages (
    participant_id,
    group_id,
    body,
    created_at
) VALUES
    (
        8,
        1,
        'Welcome to Monday Group. There is no pressure to speak straight away; reading along is also taking part.',
        CURRENT_TIMESTAMP - INTERVAL '8 minutes'
    ),
    (
        1,
        1,
        'I am glad this space exists. I have found this week quite heavy.',
        CURRENT_TIMESTAMP - INTERVAL '5 minutes'
    ),
    (
        2,
        1,
        'Same here. It helps to be somewhere that already understands why ordinary days can feel complicated.',
        CURRENT_TIMESTAMP - INTERVAL '3 minutes'
    );
