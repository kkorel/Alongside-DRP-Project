CREATE TABLE support_groups (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    facilitator_name TEXT NOT NULL,
    scheduled_duration_minutes INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE participants (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES support_groups(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    initials TEXT NOT NULL,
    about_me TEXT NOT NULL,
    fun_fact TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE group_messages (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES support_groups(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    sender_role TEXT NOT NULL,
    body TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'group',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reflections (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES support_groups(id) ON DELETE CASCADE,
    private_note TEXT,
    facilitator_note TEXT,
    shared_with_facilitator BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    shared_at TIMESTAMP
);

INSERT INTO support_groups (id, name, facilitator_name, scheduled_duration_minutes)
VALUES (1, 'Monday Group', 'Sean', 30);

SELECT setval('support_groups_id_seq', 1, true);

INSERT INTO participants (
    group_id,
    display_name,
    initials,
    about_me,
    fun_fact,
    role
) VALUES
    (
        1,
        'Amber',
        'A',
        'I am trying to find steadier ways to talk about grief without feeling like I am bringing the mood down.',
        'I collect old postcards from places I have never been.',
        'participant'
    ),
    (
        1,
        'Mo',
        'M',
        'I joined because I wanted somewhere gentle to say the things that do not fit into normal catch-ups.',
        'I can make a very good cup of mint tea.',
        'participant'
    ),
    (
        1,
        'Andrew',
        'A',
        'I am learning how to keep memories close while still making room for ordinary days.',
        'I know far too much about train routes.',
        'participant'
    ),
    (
        1,
        'Isabel',
        'I',
        'I find it easier to listen first, but I am hoping to share more when I feel ready.',
        'I always notice the soundtrack in films before the plot.',
        'participant'
    ),
    (
        1,
        'Sarah',
        'S',
        'I wanted a space where grief does not need a long explanation before people understand.',
        'I bake when I cannot sleep.',
        'participant'
    ),
    (
        1,
        'Jenny',
        'J',
        'I am here to feel less alone in the strange practical parts of loss.',
        'I once learned calligraphy for a week and still label everything beautifully.',
        'participant'
    ),
    (
        1,
        'Richard',
        'R',
        'I am looking for a calm group where I can be honest without needing to fix anything.',
        'I can solve a Rubik''s cube, slowly.',
        'participant'
    );

INSERT INTO group_messages (
    group_id,
    sender_name,
    sender_role,
    body,
    message_type,
    created_at
) VALUES
    (
        1,
        'Sean',
        'facilitator',
        'Welcome to Monday Group. There is no pressure to speak straight away; reading along is also taking part.',
        'group',
        CURRENT_TIMESTAMP - INTERVAL '8 minutes'
    ),
    (
        1,
        'Amber',
        'participant',
        'I am glad this space exists. I have found this week quite heavy.',
        'group',
        CURRENT_TIMESTAMP - INTERVAL '5 minutes'
    ),
    (
        1,
        'Mo',
        'participant',
        'Same here. It helps to be somewhere that already understands why ordinary days can feel complicated.',
        'group',
        CURRENT_TIMESTAMP - INTERVAL '3 minutes'
    );
