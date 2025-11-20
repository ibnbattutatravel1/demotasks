-- =====================================================
-- Meetings Management System - MySQL Migration Script
-- =====================================================
-- Run this script on your MySQL database to add meetings support

-- Step 1: Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id VARCHAR(191) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  meeting_link VARCHAR(1000) NOT NULL,
  meeting_type VARCHAR(32) NOT NULL DEFAULT 'zoom',
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  timezone VARCHAR(100) NOT NULL DEFAULT 'UTC',
  status VARCHAR(16) NOT NULL DEFAULT 'scheduled',
  created_by_id VARCHAR(191) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL,
  project_id VARCHAR(191) NULL,
  reminder_minutes INT DEFAULT 15,
  agenda TEXT NULL,
  notes TEXT NULL,
  recording_url VARCHAR(1000) NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
  recurrence_pattern VARCHAR(50) NULL,
  recurrence_end_date DATETIME NULL,
  
  -- Foreign Keys
  FOREIGN KEY (created_by_id) REFERENCES users(id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  
  -- Indexes for performance
  INDEX idx_meetings_start_time (start_time),
  INDEX idx_meetings_status (status),
  INDEX idx_meetings_created_by (created_by_id),
  INDEX idx_meetings_project (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 2: Create meeting_attendees table
CREATE TABLE IF NOT EXISTS meeting_attendees (
  id VARCHAR(191) PRIMARY KEY,
  meeting_id VARCHAR(191) NOT NULL,
  user_id VARCHAR(191) NOT NULL,
  role VARCHAR(16) NOT NULL DEFAULT 'attendee',
  status VARCHAR(16) NOT NULL DEFAULT 'pending',
  response_at DATETIME NULL,
  added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notification_sent BOOLEAN NOT NULL DEFAULT FALSE,
  reminder_sent BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Foreign Keys
  FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Indexes for performance
  INDEX idx_meeting_attendees_meeting (meeting_id),
  INDEX idx_meeting_attendees_user (user_id),
  INDEX idx_meeting_attendees_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 3: Update notifications table to support meetings (if column doesn't exist)
-- Check if related_type column exists and can handle 'meeting' value
ALTER TABLE notifications 
MODIFY COLUMN related_type VARCHAR(16) NULL 
COMMENT 'task | project | subtask | meeting';

-- Step 4: Update user_settings table to include meeting preferences (if columns don't exist)
-- Add meeting_reminders column if it doesn't exist
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS meeting_reminders BOOLEAN NOT NULL DEFAULT TRUE;

-- Add meeting_updates column if it doesn't exist
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS meeting_updates BOOLEAN NOT NULL DEFAULT TRUE;

-- =====================================================
-- Verification Queries
-- =====================================================

-- Verify meetings table was created
SELECT 'Meetings table created successfully' AS status
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_name = 'meetings';

-- Verify meeting_attendees table was created
SELECT 'Meeting attendees table created successfully' AS status
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_name = 'meeting_attendees';

-- Show table structures
DESCRIBE meetings;
DESCRIBE meeting_attendees;

-- =====================================================
-- Done! Your database is now ready for meetings
-- =====================================================
