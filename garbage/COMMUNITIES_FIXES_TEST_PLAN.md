# Communities System - Fixes Test Plan

## Changes Implemented

### 1. Admin Panel Navigation Fix
**Issue**: Clicking on a community in `/admin/communities` was navigating to `/admin/communities/[id]`  
**Fix**: Updated navigation to go to `/communities/[id]` instead

### 2. Visibility Types Simplified
**Issue**: Had three visibility types: public, private, secret  
**Fix**: Reduced to only two types:
- **Public**: Any authenticated user can share and write
- **Private**: Only chosen members (added via settings) can participate

---

## Test Plan

### ✅ Test 1: Admin Navigation Fix

1. **Login as Admin**
   - Go to `http://localhost:3000/admin/communities`

2. **Click on Any Community Card**
   - Should navigate to `/communities/[id]` (not `/admin/communities/[id]`)
   - Verify the URL in the browser

3. **Test Dropdown Menu "View" Option**
   - Hover over a community card
   - Click the three dots menu (⋮)
   - Click "View"
   - Should navigate to `/communities/[id]`

**Expected Result**: ✅ All navigation goes to `/communities/[id]`

---

### ✅ Test 2: Create Community - Visibility Options

1. **Login as Admin**
   - Go to `http://localhost:3000/admin/communities`
   - Click "Create Community" button

2. **Check Visibility Options**
   - Should see only 2 options:
     - ✅ **Public** - "Any user can share and write"
     - ✅ **Private** - "Only chosen members can participate"
   - Should NOT see "Secret" option

3. **Create a Public Community**
   - Name: "Test Public Community"
   - Select "Public" visibility
   - Add some members (optional for public)
   - Click "Create Community"

4. **Create a Private Community**
   - Name: "Test Private Community"
   - Select "Private" visibility
   - Add specific members
   - Click "Create Community"

**Expected Result**: ✅ Only two visibility options available

---

### ✅ Test 3: Edit Community - Visibility Options

1. **Login as Admin**
   - Go to `/admin/communities`
   - Click on a community
   - Click "Settings" (or go to Settings via dropdown menu)

2. **Check Visibility Dropdown**
   - Should show only 2 options:
     - ✅ Public - Any user can share and write
     - ✅ Private - Only chosen members can participate

3. **Change Visibility**
   - Try changing from Public to Private and save
   - Try changing from Private to Public and save
   - Verify changes are saved

**Expected Result**: ✅ Only two visibility options in settings

---

### ✅ Test 4: Public Community Access - Any User Can Post

1. **Create a Public Community** (as Admin)
   - Visibility: Public
   - Do NOT add User B as a member

2. **Login as User B** (regular user, not a member)
   - Navigate to the public community
   - Try to create a post
   - Try to add a comment
   - Try to upload a file

**Expected Result**: ✅ User B can create posts, comments, and upload files even without being a member

---

### ✅ Test 5: Private Community Access - Members Only

1. **Create a Private Community** (as Admin)
   - Visibility: Private
   - Add User C as a member (role: contributor or editor)
   - Do NOT add User D

2. **Login as User C** (member)
   - Navigate to the private community
   - Try to create a post ✅ Should work
   - Try to add a comment ✅ Should work
   - Try to upload a file ✅ Should work

3. **Login as User D** (not a member)
   - Try to navigate to the private community
   - Try to create a post ❌ Should fail with "Only members can post"
   - Try to add a comment ❌ Should fail with "Only members can comment"
   - Try to upload a file ❌ Should fail with "Only members can upload"

**Expected Result**: 
- ✅ Members can participate
- ❌ Non-members cannot participate in private communities

---

### ✅ Test 6: Viewer Role in Private Community

1. **Create a Private Community** (as Admin)
   - Add User E as a member with role: "viewer"

2. **Login as User E**
   - Navigate to the private community
   - Try to create a post ❌ Should fail with "Viewers cannot create posts"
   - Try to upload a file ❌ Should fail with "Viewers cannot upload files"

**Expected Result**: ✅ Viewers have read-only access

---

### ✅ Test 7: Database Migration (If Needed)

1. **Run the Migration Script**
   ```bash
   # From MySQL or phpMyAdmin
   mysql -u your_username -p your_database < database/migrate-visibility-to-public-private.sql
   ```

2. **Verify Data**
   ```sql
   SELECT visibility, COUNT(*) as count 
   FROM communities 
   GROUP BY visibility;
   ```
   - Should only show 'public' and 'private'
   - All previously 'secret' communities should now be 'private'

**Expected Result**: ✅ No 'secret' communities exist in database

---

## Summary Checklist

- [ ] **Fix 1**: Admin panel navigates to `/communities/[id]` ✅
- [ ] **Fix 2**: Only 2 visibility options (public/private) in forms ✅
- [ ] **Public Communities**: Any user can post/comment/upload ✅
- [ ] **Private Communities**: Only members can post/comment/upload ✅
- [ ] **Viewer Role**: Cannot post or upload (read-only) ✅
- [ ] **Database**: No 'secret' visibility values remain ✅

---

## Rollback Plan (If Issues Found)

If you encounter critical issues, you can temporarily rollback:

1. **Revert navigation changes** in:
   - `app/admin/communities/page.tsx` (lines 255, 274)

2. **Revert visibility options** in:
   - `app/admin/communities/new/page.tsx` (line 43, lines 225-251)
   - `app/admin/communities/[id]/settings/page.tsx` (lines 35, 55, 302-315)

3. **Revert API permission logic** in:
   - `app/api/communities/[id]/posts/route.ts` (lines 81-103)
   - `app/api/communities/[id]/posts/[postId]/comments/route.ts` (lines 60-77)
   - `app/api/communities/[id]/files/route.ts` (lines 56-77)

---

## Notes

- All changes are backward compatible
- Existing communities will work as expected
- The migration script is safe to run multiple times (idempotent)
- Admin users have full access to all communities regardless of visibility
