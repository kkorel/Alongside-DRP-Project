-- When the facilitator last ended a session. NULL means never closed, so the
-- weekly once-only lock does not apply yet.
ALTER TABLE support_groups ADD COLUMN last_ended_at TIMESTAMP;
