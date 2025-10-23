-- ============================================
-- Migration: Update Community Visibility from secret/public/private to public/private only
-- ============================================
-- This script:
-- 1. Updates any 'secret' communities to 'private'
-- 2. Modifies the ENUM to only allow 'public' and 'private'
-- ============================================

-- Step 1: Update all 'secret' communities to 'private'
UPDATE communities 
SET visibility = 'private' 
WHERE visibility = 'secret';

-- Step 2: Modify the visibility column ENUM to remove 'secret'
ALTER TABLE communities 
MODIFY COLUMN visibility ENUM('public', 'private') DEFAULT 'private';

-- ============================================
-- Verification Query (run after migration)
-- ============================================
-- SELECT visibility, COUNT(*) as count 
-- FROM communities 
-- GROUP BY visibility;

-- Expected result should only show 'public' and 'private'
-- ============================================
