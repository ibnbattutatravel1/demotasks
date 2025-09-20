-- Add status column to subtasks and backfill from completed flag

ALTER TABLE subtasks ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'todo';

-- Optional backfill: if completed = 1, set status to 'done'
UPDATE subtasks SET status = 'done' WHERE completed = 1;

-- Index to help status filtering
CREATE INDEX IF NOT EXISTS idx_subtasks_status ON subtasks(status);
