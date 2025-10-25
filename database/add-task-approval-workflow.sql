-- Add approval workflow fields to tasks table if they don't exist
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(16) DEFAULT 'pending' COMMENT 'pending | approved | rejected',
ADD COLUMN IF NOT EXISTS approved_at DATETIME NULL,
ADD COLUMN IF NOT EXISTS approved_by_id VARCHAR(191) NULL,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL;

-- Add indexes for approval workflow
CREATE INDEX IF NOT EXISTS idx_tasks_approval_status ON tasks(approval_status);
CREATE INDEX IF NOT EXISTS idx_tasks_approved_by ON tasks(approved_by_id);

-- Add foreign key constraint for approved_by_id if it doesn't exist
ALTER TABLE tasks 
ADD CONSTRAINT IF NOT EXISTS fk_tasks_approved_by 
FOREIGN KEY (approved_by_id) REFERENCES users(id) ON DELETE SET NULL;
