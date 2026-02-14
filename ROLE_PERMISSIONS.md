# Role-Based Permissions Guide

## Overview
The admin dashboard now has a hierarchical permission system with two levels of admin access:

### Role Hierarchy

1. **Super Admin** (`studyinbengalurub2b@gmail.com`)
   - Can create both **admin** and **user** accounts
   - Can delete both **admin** and **user** accounts
   - Cannot be deleted by anyone
   - Shows yellow "Super Admin" badge

2. **Admin** (any other admin)
   - Can create **user** accounts only
   - Can delete **user** accounts only
   - Cannot create or delete other admins
   - Shows purple "admin" badge

3. **User** (regular users)
   - No creation or deletion permissions
   - Shows blue "user" badge

## Features Implemented

### ✅ Super Admin Protections
- Hardcoded super admin email: `studyinbengalurub2b@gmail.com`
- Cannot be deleted by anyone (no delete button shown)
- Yellow "Super Admin" badge displayed
- Full permissions to manage all users

### ✅ Permission Checks

#### User Creation
- **Super Admin**: Can select "Admin" or "User" role in the modal
- **Regular Admin**: Can only select "User" role (admin option hidden)
- Server-side validation prevents regular admins from creating admins

#### User Deletion
- **Super Admin**: Can delete any user except themselves
- **Regular Admin**: Can delete users only, not other admins
- Client-side: Delete button hidden for admins when logged in as regular admin
- Server-side: Validation prevents regular admins from deleting admins

## How It Works

### Backend (Server Actions)

**`src/app/actions/users.ts`**:
```typescript
// Permission check for user creation
if (input.role === 'admin' && input.createdBy !== SUPER_ADMIN_EMAIL) {
    return { success: false, error: 'Only super admin can create admin accounts' };
}

// Permission check for user deletion
if (userToDelete?.role === 'admin' && deletedBy !== SUPER_ADMIN_EMAIL) {
    return { success: false, error: 'Only super admin can delete admin accounts' };
}
```

### Frontend (UI Components)

**`src/components/CreateUserModal.tsx`**:
- Accepts `isSuperAdmin` prop
- Conditionally shows admin role option:
  ```tsx
  <option value="user">User</option>
  {isSuperAdmin && <option value="admin">Admin</option>}
  ```
- Shows helper text for regular admins

**`src/components/UserManagementClient.tsx`**:
- Accepts `currentUserEmail` and `isSuperAdmin` props
- Checks permissions before showing delete button:
  ```tsx
  {!isCurrentUser && !isSuperAdminUser && (
    <button onClick={() => handleDeleteUser(...)}>Delete</button>
  )}
  ```
- Client-side validation before deletion

**`src/app/page.tsx`**:
- Fetches current user's profile from `user_profiles`
- Determines if user is super admin
- Passes permissions to `UserManagementClient`

## Testing Guide

### Test as Super Admin

1. **Login** as `studyinbengalurub2b@gmail.com`
2. **Create Admin**:
   - Click "Create New User"
   - Select "Admin" role (should be visible)
   - Create the user
   - ✅ Should succeed
3. **Delete Admin**:
   - Find an admin user in the list
   - Click "Delete"
   - ✅ Should succeed
4. **Try to delete yourself**:
   - Your account should have NO delete button
   - ✅ Cannot delete super admin

### Test as Regular Admin

1. **Create a regular admin** account (as super admin)
2. **Logout** and **login** as the regular admin
3. **Try to create admin**:
   - Click "Create New User"
   - "Admin" option should be HIDDEN
   - Only "User" option available
   - ✅ Cannot create admins
4. **Create User**:
   - Select "User" role
   - Create the user
   - ✅ Should succeed
5. **Try to delete admin**:
   - Admin users should have NO delete button
   - ✅ Cannot delete admins
6. **Delete User**:
   - User accounts should have delete button
   - Click "Delete"
   - ✅ Should succeed

## Error Messages

Users will see these error messages when attempting unauthorized actions:

- **Creating admin as regular admin**: "Only super admin can create admin accounts"
- **Deleting admin as regular admin**: "Only super admin can delete admin accounts"
- **Deleting super admin**: "Cannot delete super admin account"

## Security

✅ **Multi-layer protection**:
1. **UI Layer**: Buttons/options hidden based on permissions
2. **Client Layer**: JavaScript validation before API calls
3. **Server Layer**: Final validation in server actions

This ensures security even if someone bypasses the UI.

## Visual Indicators

- **Super Admin**: Yellow "Super Admin" badge + Purple "admin" badge
- **Admin**: Purple "admin" badge
- **User**: Blue "user" badge
- **Current User**: Green "You" badge

## Quick Reference

| Action | Super Admin | Admin | User |
|--------|-------------|-------|------|
| Create User | ✅ | ✅ | ❌ |
| Create Admin | ✅ | ❌ | ❌ |
| Delete User | ✅ | ✅ | ❌ |
| Delete Admin | ✅ | ❌ | ❌ |
| Delete Super Admin | ❌ | ❌ | ❌ |
| Delete Self | ❌ | ❌ | ❌ |

## Files Modified

- `src/app/actions/users.ts` - Added permission checks
- `src/components/CreateUserModal.tsx` - Conditional role options
- `src/components/UserManagementClient.tsx` - Role-based delete logic
- `src/app/page.tsx` - Super admin detection and prop passing
