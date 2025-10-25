# Default Contributor Role - Complete Update

## Summary

All locations where users are added to private communities now default to **'contributor'** role instead of 'viewer'.

---

## Changes Made

### 1. Community Creation (Initial Members) ✅
**File**: `app/api/communities/route.ts`
**Line**: 165

**Before**:
```typescript
VALUES (${newMemberId}, ${communityId}, ${memberId}, 'viewer', NOW())
```

**After**:
```typescript
VALUES (${newMemberId}, ${communityId}, ${memberId}, 'contributor', NOW())
```

**Impact**: When creating a new private community and selecting initial members, they are now added as contributors.

---

### 2. Add Member via API ✅
**File**: `app/api/communities/[id]/members/route.ts`
**Line**: 73

**Before**:
```typescript
const { user_id, role = 'viewer' } = body
```

**After**:
```typescript
const { user_id, role = 'contributor' } = body
```

**Impact**: When adding members through the API without specifying a role, they default to contributor.

---

### 3. Add Member UI Component ✅
**File**: `components/community-members-manager.tsx`
**Lines**: 62, 121

**Before**:
```typescript
const [selectedRole, setSelectedRole] = useState('viewer')
setSelectedRole('viewer')
```

**After**:
```typescript
const [selectedRole, setSelectedRole] = useState('contributor')
setSelectedRole('contributor')
```

**Impact**: When adding members through the UI, the role dropdown defaults to "Contributor - Can post".

---

## Complete Flow

### Scenario 1: Creating New Private Community

1. **Admin creates community**
   - Goes to `/admin/communities/new`
   - Fills in community details
   - Selects visibility: **Private**
   - Selects initial members (User A, User B, User C)
   - Clicks "Create Community"

2. **Backend Processing**
   - Creates community
   - Adds creator as 'owner'
   - Adds User A, B, C as **'contributor'** ✅

3. **Result**
   - User A, B, C can immediately:
     - ✅ View posts
     - ✅ Create posts
     - ✅ Add comments
     - ✅ Upload files

---

### Scenario 2: Adding Member to Existing Private Community

1. **Admin adds member**
   - Goes to community settings
   - Clicks "Add Member"
   - Selects User D from list
   - Role dropdown shows **"Contributor - Can post"** by default ✅
   - Clicks "Add Member"

2. **Backend Processing**
   - API receives request with `role = 'contributor'` (default)
   - Adds User D as contributor

3. **Result**
   - User D can immediately participate in the community

---

### Scenario 3: API Integration

If you're adding members programmatically:

```typescript
// Without specifying role - defaults to contributor
const response = await fetch(`/api/communities/${communityId}/members`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: 'user_123'
    // role not specified, will default to 'contributor' ✅
  })
})

// Explicitly setting role (still works)
const response = await fetch(`/api/communities/${communityId}/members`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: 'user_123',
    role: 'moderator' // Explicit role
  })
})
```

---

## Role Comparison

| Feature | Viewer | Contributor ⭐ | Editor | Moderator | Admin | Owner |
|---------|--------|----------------|--------|-----------|-------|-------|
| View Posts | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Posts | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit Own Posts | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Add Comments | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Upload Files | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit Others' Posts | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Moderate Content | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Manage Members | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Change Settings | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Delete Community | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Testing Checklist

### ✅ Test 1: Create New Private Community with Members

1. Login as Admin
2. Go to `/admin/communities/new`
3. Create a private community
4. Select 2-3 users from the member list
5. Click "Create Community"
6. Login as one of the selected users
7. Navigate to the community
8. Try to create a post → **Should work** ✅
9. Try to upload a file → **Should work** ✅

**Expected**: All selected users are contributors by default

---

### ✅ Test 2: Add Member to Existing Community

1. Login as Admin
2. Go to community settings
3. Click "Add Member"
4. Select a user
5. Check role dropdown → **Should default to "Contributor - Can post"** ✅
6. Click "Add Member" (without changing role)
7. Login as the added user
8. Try posting → **Should work** ✅

**Expected**: New member is added as contributor

---

### ✅ Test 3: Still Can Add as Viewer

1. Login as Admin
2. Add a member
3. **Change role dropdown to "Viewer - Can view only"**
4. Click "Add Member"
5. Login as the added user
6. Try to create post → **Should fail** ❌
7. Can still view posts → **Should work** ✅

**Expected**: Can still explicitly set viewer role if needed

---

### ✅ Test 4: Public Communities Not Affected

1. Create a public community
2. Don't add any members
3. Login as regular user (not a member)
4. Navigate to public community
5. Try posting → **Should work** ✅

**Expected**: Public communities still allow all users to participate

---

## Files Changed Summary

1. ✅ `app/api/communities/route.ts` - Initial members default to contributor
2. ✅ `app/api/communities/[id]/members/route.ts` - API default to contributor
3. ✅ `components/community-members-manager.tsx` - UI default to contributor

---

## Backward Compatibility

✅ **Fully backward compatible**
- Existing 'viewer' members remain as viewers
- Admin can still manually set role to 'viewer' if needed
- Only affects NEW member additions
- No database migration required

---

## Notes

- **Public communities**: Users still act as contributors without being added to member list
- **Private communities**: Default role is now contributor for better collaboration
- **Admin choice**: Admin can still select any role (viewer, editor, moderator, admin)
- **More permissive**: Encourages participation and content creation

---

## Conclusion

All three locations where users are added to communities now consistently default to **'contributor'** role:
1. ✅ During community creation
2. ✅ When added via API
3. ✅ When added via UI

This makes private communities more collaborative by default while still allowing admins to restrict users to 'viewer' role when needed.
