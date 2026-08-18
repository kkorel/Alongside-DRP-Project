CREATE TABLE facilitator_group_notes (
    group_id   INTEGER   PRIMARY KEY REFERENCES support_groups(group_id),
    notes      TEXT      NOT NULL DEFAULT '',
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
