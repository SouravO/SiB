# Error Handling Implementation Guide

This document describes the comprehensive error handling system implemented across the project.

## Overview

The project now has a centralized error handling system that provides:
- **User-friendly error messages** instead of technical jargon
- **Toast notifications** for immediate feedback
- **Form validation** with helpful error messages
- **Consistent error patterns** across all components

## Components

### 1. Error Handler Utility (`src/lib/error-handler.ts`)

Central utility for handling errors and validation:

```typescript
// Error handling
handleSupabaseError(error, context)
getErrorMessage(error, fallbackMessage)
successResult(data)
errorResult(message, errors)

// Validation
validateRequired(value, fieldName)
validateEmail(email)
validatePassword(password)
validatePhone(phone)
validateUrl(url)
validateFileSize(file, maxSizeMB)
validateFileType(file, allowedTypes)
validateImage(file, maxSizeMB)
validatePdf(file, maxSizeMB)
```

### 2. Toast Notification System (`src/components/Toast.tsx`)

Provides visual feedback for user actions:

```typescript
const { success, error, warning, info } = useToast();

// Usage examples:
showSuccess('City created successfully', 'Success');
showError('Failed to create city', 'Error');
showWarning('Image upload failed', 'Warning');
showInfo('Please fill all fields', 'Info');
```

### 3. Updated Server Actions

#### Users Actions (`src/app/actions/users.ts`)
- Email validation with helpful messages
- Password strength validation
- Duplicate user detection
- Permission checks with clear messages
- Specific error handling for auth errors

#### Colleges Actions (`src/app/actions/colleges.ts`)
- Name length validation (2-100 characters)
- Duplicate detection for states/cities
- File type and size validation
- Clear error messages for all operations

### 4. Updated UI Components

#### Login Page (`src/app/login/page.tsx`)
- Email format validation
- Password length validation
- Specific error messages for:
  - Invalid credentials
  - Unverified email
  - Network errors

#### CreateUserModal (`src/components/CreateUserModal.tsx`)
- Email validation
- Password strength check
- Role permission validation
- Success/error toast notifications

#### CityManagementClient (`src/components/CityManagementClient.tsx`)
- Required field validation
- File type validation (JPEG, PNG, WebP)
- File size validation (max 5MB)
- Image upload error handling
- Success/error notifications

#### CollegeManagementClient (`src/components/CollegeManagementClient.tsx`)
- State/University/City CRUD validation
- Name length validation
- Confirmation dialogs
- Toast notifications for all actions

#### UserManagementClient (`src/components/UserManagementClient.tsx`)
- Permission checks
- Self-deletion prevention
- Super admin protection
- Clear error messages

## Error Message Patterns

### Validation Errors
- "Field name is required"
- "Must be at least X characters"
- "Must be less than X characters"
- "Please enter a valid email address"
- "Password must be at least 6 characters"

### File Upload Errors
- "Please upload a JPEG, PNG, or WebP image"
- "Image size must be less than 5MB"
- "Please upload a PDF file"

### Permission Errors
- "Only super admin can create admin accounts"
- "Cannot delete super admin account"
- "You cannot delete your own account"

### Database Errors
- "A record with this name already exists"
- "This record is referenced by other data"
- "You do not have permission to perform this action"

### Network Errors
- "Unable to connect to the server. Please check your internet connection."
- "The request took too long. Please try again."

## Best Practices

### 1. Always Validate on Both Client and Server
```typescript
// Client-side validation
if (!email || !email.includes('@')) {
    showError('Please enter a valid email address');
    return;
}

// Server-side validation (in actions)
const emailError = validateEmail(input.email);
if (emailError) {
    return errorResult(emailError);
}
```

### 2. Use Specific Error Messages
```typescript
// ❌ Bad
showError('An error occurred');

// ✅ Good
showError('The email or password you entered is incorrect', 'Login Failed');
```

### 3. Provide Context in Titles
```typescript
showError('City name is required', 'Validation Error');
showSuccess('City created successfully', 'City Created');
```

### 4. Handle Partial Successes
```typescript
if (uploadResult.success) {
    showSuccess('City and image created successfully', 'Success');
} else {
    showSuccess('City created, but image upload failed', 'Partial Success');
    console.error('Image upload error:', uploadResult.error);
}
```

### 5. Log Errors for Debugging
```typescript
try {
    // operation
} catch (err) {
    console.error('Error creating city:', err);
    showError('An error occurred while creating the city', 'Error');
}
```

## Testing Error Handling

### Test Cases to Verify:
1. **Form Validation**
   - Submit empty forms
   - Enter invalid email formats
   - Use weak passwords
   - Upload wrong file types
   - Upload oversized files

2. **Permission Errors**
   - Try creating admin as non-super-admin
   - Try deleting super admin
   - Try deleting your own account

3. **Duplicate Detection**
   - Create duplicate states
   - Create duplicate cities in same state

4. **Network Errors**
   - Test with offline mode
   - Test with slow connection

## Future Improvements

1. **Error Logging Service**: Integrate with a service like Sentry for error tracking
2. **Retry Mechanism**: Add retry buttons for failed operations
3. **Error Boundaries**: Add React error boundaries for graceful failures
4. **Offline Support**: Queue operations when offline
5. **Progress Indicators**: Show upload/download progress

## Quick Reference

### Adding Error Handling to New Components:

```typescript
// 1. Import toast
import { useToast } from '@/components/Toast';

// 2. Initialize hook
const { success: showSuccess, error: showError } = useToast();

// 3. Validate inputs
if (!value) {
    showError('Field is required', 'Validation Error');
    return;
}

// 4. Call action and handle result
const result = await someAction(data);
if (result.success) {
    showSuccess('Operation successful', 'Success');
} else {
    showError(result.error || 'Operation failed', 'Error');
}
```

### Adding Validation to Server Actions:

```typescript
// 1. Import utilities
import { validateRequired, validateEmail, errorResult, successResult } from '@/lib/error-handler';

// 2. Validate inputs
const emailError = validateEmail(input.email);
if (emailError) {
    return errorResult(emailError);
}

// 3. Use handleSupabaseError for try-catch
try {
    // operation
    return successResult(data);
} catch (error) {
    return handleSupabaseError(error, 'operation context');
}
```
