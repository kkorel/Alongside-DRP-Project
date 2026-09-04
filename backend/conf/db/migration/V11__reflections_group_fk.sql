-- Re-establish referential integrity on reflections.group_id. The original FK
-- (V2) was dropped as a side-effect of the V5 CASCADE rebuild of support_groups
-- (primary key changed id -> group_id) and never re-added. This matters once
-- onboarding creates multiple groups: it enforces that a reflection belongs to a
-- real group, and cascades cleanup when a group is removed.

ALTER TABLE reflections
  ALTER COLUMN group_id SET NOT NULL;

ALTER TABLE reflections
  ADD CONSTRAINT reflections_group_fk
  FOREIGN KEY (group_id) REFERENCES support_groups(group_id) ON DELETE CASCADE;