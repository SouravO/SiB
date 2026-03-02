/**
 * Error Handling Utilities
 * Centralized error handling for consistent error messages across the application
 */

export interface ApiError {
  message: string;
  code?: string;
  details?: string;
  field?: string;
}

export interface ApiResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: ApiError[];
}

/**
 * Supabase error codes and their user-friendly messages
 */
const SUPABASE_ERROR_MESSAGES: Record<string, string> = {
  // Authentication errors
  'Invalid login credentials': 'The email or password you entered is incorrect. Please check and try again.',
  'Email not confirmed': 'Please verify your email address before logging in.',
  'User already registered': 'An account with this email already exists.',
  'Weak password': 'Password must be at least 6 characters long.',
  'Phone not confirmed': 'Please verify your phone number before logging in.',
  
  // Database errors
  '23505': 'A record with this information already exists.',
  '23503': 'This record is referenced by other data and cannot be deleted.',
  '23502': 'Required information is missing. Please fill in all required fields.',
  '42501': 'You do not have permission to perform this action.',
  
  // Network errors
  'NetworkError': 'Unable to connect to the server. Please check your internet connection.',
  'timeout': 'The request took too long. Please try again.',
  
  // File upload errors
  'File too large': 'The file size exceeds the maximum allowed limit of 5MB.',
  'Invalid file type': 'The file type is not supported. Please upload a valid file.',
};

/**
 * Get a user-friendly error message from an error
 */
export function getErrorMessage(error: unknown, fallbackMessage = 'An unexpected error occurred'): string {
  if (typeof error === 'string') {
    return SUPABASE_ERROR_MESSAGES[error] || error;
  }
  
  if (error instanceof Error) {
    // Check for known error patterns
    const message = error.message;
    
    // Supabase auth errors
    if (message.includes('Invalid login credentials')) {
      return SUPABASE_ERROR_MESSAGES['Invalid login credentials'];
    }
    if (message.includes('Email not confirmed')) {
      return SUPABASE_ERROR_MESSAGES['Email not confirmed'];
    }
    if (message.includes('User already registered')) {
      return SUPABASE_ERROR_MESSAGES['User already registered'];
    }
    if (message.includes('Weak password')) {
      return SUPABASE_ERROR_MESSAGES['Weak password'];
    }
    
    // Database constraint errors
    if (message.includes('duplicate key')) {
      return SUPABASE_ERROR_MESSAGES['23505'];
    }
    if (message.includes('violates foreign key')) {
      return SUPABASE_ERROR_MESSAGES['23503'];
    }
    if (message.includes('null value')) {
      return SUPABASE_ERROR_MESSAGES['23502'];
    }
    
    // Permission errors
    if (message.includes('permission denied')) {
      return SUPABASE_ERROR_MESSAGES['42501'];
    }
    
    // Network errors
    if (message.includes('fetch') || message.includes('network')) {
      return SUPABASE_ERROR_MESSAGES['NetworkError'];
    }
    
    return message || fallbackMessage;
  }
  
  return fallbackMessage;
}

/**
 * Parse Supabase error and return formatted error result
 */
export function handleSupabaseError(error: any, context = 'operation'): ApiResult<never> {
  console.error(`Error during ${context}:`, error);
  
  const message = getErrorMessage(error, `Failed to ${context}. Please try again.`);
  
  return {
    success: false,
    error: message,
  };
}

/**
 * Validate required fields
 */
export function validateRequired(value: unknown, fieldName: string): string | null {
  if (value === null || value === undefined) {
    return `${fieldName} is required`;
  }
  if (typeof value === 'string' && value.trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): string | null {
  if (!email) return null; // Use validateRequired for that
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): string | null {
  if (!password) return null; // Use validateRequired for that
  
  if (password.length < 6) {
    return 'Password must be at least 6 characters long';
  }
  if (password.length > 100) {
    return 'Password must be less than 100 characters';
  }
  return null;
}

/**
 * Validate phone number (Indian format)
 */
export function validatePhone(phone: string): string | null {
  if (!phone) return null;
  
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return 'Please enter a valid 10-digit Indian phone number';
  }
  return null;
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): string | null {
  if (!url) return null;
  
  try {
    new URL(url);
    return null;
  } catch {
    return 'Please enter a valid URL (e.g., https://example.com)';
  }
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSizeMB: number): string | null {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `File size must be less than ${maxSizeMB}MB`;
  }
  return null;
}

/**
 * Validate file type
 */
export function validateFileType(file: File, allowedTypes: string[]): string | null {
  if (!allowedTypes.includes(file.type)) {
    return `File type must be one of: ${allowedTypes.join(', ')}`;
  }
  return null;
}

/**
 * Validate image file
 */
export function validateImage(file: File, maxSizeMB: number = 5): string | null {
  const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  
  const typeError = validateFileType(file, imageTypes);
  if (typeError) return typeError;
  
  const sizeError = validateFileSize(file, maxSizeMB);
  if (sizeError) return sizeError;
  
  return null;
}

/**
 * Validate PDF file
 */
export function validatePdf(file: File, maxSizeMB: number = 10): string | null {
  if (file.type !== 'application/pdf') {
    return 'Please upload a PDF file';
  }
  
  const sizeError = validateFileSize(file, maxSizeMB);
  if (sizeError) return sizeError;
  
  return null;
}

/**
 * Create a success result
 */
export function successResult<T>(data: T): ApiResult<T> {
  return { success: true, data };
}

/**
 * Create an error result
 */
export function errorResult(message: string, errors?: ApiError[]): ApiResult<never> {
  return { success: false, error: message, errors };
}
