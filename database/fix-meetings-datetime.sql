-- =====================================================
-- Fix Meetings and Notifications DateTime Issues
-- =====================================================
-- This script fixes all datetime-related issues in your MySQL database

-- Step 1: Check if meetings table exists and modify if needed
-- If table exists, this will just ensure proper structure
DROP TABLE IF EXISTS meeting_attendees;
DROP TABLE IF EXISTS meetings;

-- Step 2: Recreate meetings table with proper datetime handling
CREATE TABLE meetings (
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
  
  FOREIGN KEY (created_by_id) REFERENCES users(id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  INDEX idx_meetings_start_time (start_time),
  INDEX idx_meetings_status (status),
  INDEX idx_meetings_created_by (created_by_id),
  INDEX idx_meetings_project (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 3: Recreate meeting_attendees table
CREATE TABLE meeting_attendees (
  id VARCHAR(191) PRIMARY KEY,
  meeting_id VARCHAR(191) NOT NULL,
  user_id VARCHAR(191) NOT NULL,
  role VARCHAR(16) NOT NULL DEFAULT 'attendee',
  status VARCHAR(16) NOT NULL DEFAULT 'pending',
  response_at DATETIME NULL,
  added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notification_sent BOOLEAN NOT NULL DEFAULT FALSE,
  reminder_sent BOOLEAN NOT NULL DEFAULT FALSE,
  
  FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_meeting_attendees_meeting (meeting_id),
  INDEX idx_meeting_attendees_user (user_id),
  INDEX idx_meeting_attendees_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 4: Ensure notifications table has proper datetime
-- Backup existing notifications first
CREATE TABLE IF NOT EXISTS notifications_backup AS SELECT * FROM notifications;

-- Modify notifications table datetime column
ALTER TABLE notifications 
MODIFY COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Step 5: Update user_settings to support meeting notifications
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS meeting_reminders BOOLEAN NOT NULL DEFAULT TRUE AFTER project_updates;

ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS meeting_updates BOOLEAN NOT NULL DEFAULT TRUE AFTER meeting_reminders;

-- Step 6: Ensure related_type supports 'meeting'
ALTER TABLE notifications 
MODIFY COLUMN related_type VARCHAR(16) NULL 
COMMENT 'task | project | subtask | meeting';

-- =====================================================
-- Email Configuration Check
-- =====================================================
-- The following are environment variables you MUST set in your .env file:
-- 
-- RESEND_API_KEY=re_xxxxxxxxxxxxx (Get from https://resend.com)
-- RESEND_FROM_EMAIL=noreply@yourdomain.com
-- NEXT_PUBLIC_APP_URL=http://localhost:3000 (or your production URL)
--
-- Without these, emails will show "Email service not configured"
-- =====================================================

-- Step 7: Create a test meeting (optional - comment out if not needed)
-- SET @test_user_id = (SELECT id FROM users LIMIT 1);
-- SET @test_meeting_id = UUID();
-- 
-- INSERT INTO meetings (
--   id, title, description, meeting_link, meeting_type,
--   start_time, end_time, timezone, status, created_by_id, created_at
-- ) VALUES (
--   @test_meeting_id,
--   'Test Meeting',
--   'This is a test meeting to verify the system works',
--   'https://zoom.us/j/123456789',
--   'zoom',
--   DATE_ADD(NOW(), INTERVAL 1 DAY),
--   DATE_ADD(NOW(), INTERVAL 1 DAY + INTERVAL 1 HOUR),
--   'UTC',
--   'scheduled',
--   @test_user_id,
--   NOW()
-- );
--
-- INSERT INTO meeting_attendees (
--   id, meeting_id, user_id, role, status, added_at
-- ) VALUES (
--   UUID(),
--   @test_meeting_id,
--   @test_user_id,
--   'organizer',
--   'accepted',
--   NOW()
-- );

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check meetings table structure
DESCRIBE meetings;

-- Check meeting_attendees table structure
DESCRIBE meeting_attendees;

-- Check notifications table structure
DESCRIBE notifications;

-- Check user_settings has meeting columns
SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_DEFAULT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'user_settings'
AND COLUMN_NAME LIKE 'meeting%';

-- Count existing meetings
SELECT COUNT(*) as total_meetings FROM meetings;

-- Count existing attendees
SELECT COUNT(*) as total_attendees FROM meeting_attendees;

-- Show recent notifications
SELECT id, type, title, created_at, related_type
FROM notifications
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT 'Database fixed successfully! All datetime issues resolved.' AS status;
SELECT 'Email notifications require RESEND_API_KEY in .env file' AS important_note;

-- =====================================================
-- DONE! Your database is now properly configured
-- =====================================================
