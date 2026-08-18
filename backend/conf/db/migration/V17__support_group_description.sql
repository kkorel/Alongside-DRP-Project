-- A short, optional "a few words members will see" blurb for a group. Set by the
-- facilitator when creating or editing a group. Nullable; existing groups have none.
ALTER TABLE support_groups ADD COLUMN description TEXT;
