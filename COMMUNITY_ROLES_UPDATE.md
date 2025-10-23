# Community Roles & Permissions Update

## Changes Implemented

### 1. Public Communities - All Users as Contributors ✅
**Requirement**: In public communities, any website user should act as a contributor

**Implementation**:
- ✅ Any authenticated user can **create posts**
- ✅ Any authenticated user can **add comments**
- ✅ Any authenticated user can **upload files**
- No membership required for public communities
- Users are NOT added to the member list, but have full contributor access

**Files Already Updated**:
- `app/api/communities/[id]/posts/route.ts` (line 103)
- `app/api/communities/[id]/posts/[postId]/comments/route.ts` (line 77)
- `app/api/communities/[id]/files/route.ts` (line 77)

**Logic**:
```typescript
// Check community visibility
if (community.visibility === 'private') {
  // Check membership and roles for private communities
} else {
  // For public communities, any authenticated user can post/comment/upload
}
```

---

### 2. Private Communities - Default Role Changed to Contributor ✅
**Requirement**: When adding non-admin users to private communities, default role should be 'contributor' instead of 'viewer'

**Implementation**:
- Default role changed from `'viewer'` to `'contributor'`
- When admin adds a member, the role dropdown now defaults to "Contributor - Can post"
- Applies to all non-admin users added to private communities

**File Updated**:
- `components/community-members-manager.tsx`
  - Line 62: Initial state `useState('contributor')`
  - Line 121: Reset state after adding member

**Role Hierarchy**:
1. **Owner** - Full control (cannot be changed)
2. **Admin** - Full access (only owner can assign)
3. **Moderator** - Can moderate content
4. **Editor** - Can edit posts
5. **Contributor** - Can post and comment ⭐ **NEW DEFAULT**
6. **Viewer** - Can only view

---

## How It Works

### Public Community Flow

1. **User visits public community**
   - No membership check required
   - User sees all posts and content

2. **User wants to post/comment/upload**
   - System checks: Is user authenticated? ✅
   - System checks: Is community public? ✅
   - User can post/comment/upload immediately
   - No need to be added as member

3. **Member list**
   - Public communities still have an optional member list
   - Members in the list may have special roles (moderator, admin, etc.)
   - But non-members can still participate as contributors

---

### Private Community Flow

1. **Admin adds a new member**
   - Opens "Add Member" dialog
   - Selects a user from the list
   - Role dropdown **defaults to "Contributor"**
   - Can change to viewer/editor/moderator if needed
   - Clicks "Add Member"

2. **Member access**
   - Only members can access private communities
   - Members with "contributor" role can:
     - ✅ View all posts
     - ✅ Create posts
     - ✅ Add comments
     - ✅ Upload files
   - Members with "viewer" role can:
     - ✅ View all posts
     - ❌ Cannot create posts
     - ✅ Can add comments (if enabled)
     - ❌ Cannot upload files

---

## Testing Guide

### Test 1: Public Community - Any User Can Post ✅

1. **Setup**:
   - Create a public community as admin
   - Do NOT add User B as a member

2. **Login as User B** (non-member):
   - Navigate to the public community
   - Try to create a post → ✅ **Should work**
   - Try to add a comment → ✅ **Should work**
   - Try to upload a file → ✅ **Should work**

3. **Expected Result**: 
   - User B can fully participate without being a member
   - Acts as a contributor

---

### Test 2: Private Community - Default Role is Contributor ✅

1. **Login as Admin**:
   - Go to a private community settings
   - Click "Add Member"

2. **Add a New Member**:
   - Select a user from the list
   - Check the role dropdown → **Should default to "Contributor - Can post"**
   - Leave it as contributor and click "Add Member"

3. **Login as the New Member**:
   - Navigate to the private community
   - Try to create a post → ✅ **Should work**
   - Try to add a comment → ✅ **Should work**
   - Try to upload a file → ✅ **Should work**

4. **Expected Result**:
   - Member has contributor access by default
   - Can fully participate in the community

---

### Test 3: Private Community - Viewer Role Still Works ✅

1. **Login as Admin**:
   - Add a member with role explicitly set to "Viewer"

2. **Login as the Viewer**:
   - Navigate to the private community
   - Try to create a post → ❌ **Should fail** ("Viewers cannot create posts")
   - Try to upload a file → ❌ **Should fail** ("Viewers cannot upload files")
   - Try to comment → ✅ **Should work** (comments usually allowed)

3. **Expected Result**:
   - Viewer role still has restricted permissions
   - Can view and comment only

---

## Role Permissions Matrix

| Action | Public (Non-member) | Private (Contributor) | Private (Viewer) |
|--------|---------------------|----------------------|------------------|
| View Posts | ✅ | ✅ | ✅ |
| Create Posts | ✅ | ✅ | ❌ |
| Comment | ✅ | ✅ | ✅ |
| Upload Files | ✅ | ✅ | ❌ |
| Edit Own Posts | ✅ | ✅ | ❌ |
| Delete Own Posts | ✅ | ✅ | ❌ |

---

## Summary

✅ **Change 1**: Public communities now treat ALL authenticated users as contributors
- No membership needed
- Full posting/commenting/uploading access

✅ **Change 2**: Private communities default new members to "contributor" role
- Changed from "viewer" to "contributor"
- More permissive default for better collaboration

Both changes make communities more accessible and encourage participation! 🎉
