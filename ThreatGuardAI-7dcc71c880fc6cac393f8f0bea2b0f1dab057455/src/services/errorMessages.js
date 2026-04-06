/**
 * Firebase Error Messages Mapping
 * Converts Firebase error codes to user-friendly messages
 */

export const firebaseErrorMessages = {
  // Authentication Errors
  'auth/user-not-found': {
    message: 'No account found with this email address. Please check and try again or sign up for a new account.',
    title: 'Account Not Found'
  },
  'auth/wrong-password': {
    message: 'The password you entered is incorrect. Please try again or use the forgot password option.',
    title: 'Invalid Password'
  },
  'auth/email-already-in-use': {
    message: 'This email address is already registered. Please sign in with your existing account or use a different email.',
    title: 'Email Already Registered'
  },
  'auth/weak-password': {
    message: 'Your password is too weak. Please use at least 8 characters including uppercase letters, numbers, and special characters.',
    title: 'Weak Password'
  },
  'auth/invalid-email': {
    message: 'Please enter a valid email address.',
    title: 'Invalid Email'
  },
  'auth/user-disabled': {
    message: 'This account has been disabled. Please contact support for assistance.',
    title: 'Account Disabled'
  },
  'auth/too-many-requests': {
    message: 'Too many login attempts. Please try again later or use the forgot password option.',
    title: 'Too Many Attempts'
  },
  'auth/operation-not-allowed': {
    message: 'This operation is not allowed. Please contact support.',
    title: 'Operation Not Allowed'
  },
  'auth/requires-recent-login': {
    message: 'Please sign in again to perform this action.',
    title: 'Recent Login Required'
  },
  'auth/invalid-credential': {
    message: 'The email or password is incorrect. Please try again.',
    title: 'Invalid Credentials'
  },
  'auth/invalid-auth-event': {
    message: 'Authentication failed. Please try again.',
    title: 'Authentication Failed'
  },
  'auth/network-request-failed': {
    message: 'Network error. Please check your internet connection and try again.',
    title: 'Connection Error'
  },

  // Firestore Errors
  'firestore/permission-denied': {
    message: 'You do not have permission to access this resource.',
    title: 'Access Denied'
  },
  'firestore/not-found': {
    message: 'The requested resource was not found.',
    title: 'Not Found'
  },
  'firestore/unavailable': {
    message: 'The service is temporarily unavailable. Please try again in a moment.',
    title: 'Service Unavailable'
  },
  'firestore/unauthenticated': {
    message: 'Please sign in to perform this action.',
    title: 'Authentication Required'
  },

  // Generic/Default Errors
  'default': {
    message: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
    title: 'Error'
  }
};

/**
 * Get user-friendly error message from Firebase error code
 * @param {Error|string} error - The error object or error code
 * @returns {Object} - { message, title } object
 */
export function getErrorMessage(error) {
  let code = 'default';
  let originalMessage = '';

  if (typeof error === 'string') {
    code = error;
  } else if (error?.code) {
    code = error.code;
    originalMessage = error.message || '';
  } else if (error?.message) {
    originalMessage = error.message;
  }

  // Try exact match first
  if (firebaseErrorMessages[code]) {
    return firebaseErrorMessages[code];
  }

  // Try partial match (for codes like "ERROR_USER_NOT_FOUND" style errors)
  const normalizedCode = code.toLowerCase();
  for (const [errorCode, errorMsg] of Object.entries(firebaseErrorMessages)) {
    if (normalizedCode.includes(errorCode.split('/')[1])) {
      return errorMsg;
    }
  }

  // If no match found, return default with original error message appended
  return {
    message: firebaseErrorMessages['default'].message,
    title: firebaseErrorMessages['default'].title
  };
}

/**
 * Success Messages
 */
export const successMessages = {
  register: {
    message: 'Your account has been created successfully! Welcome to ThreatGuardAI.',
    title: 'Account Created 🎉'
  },
  login: (name) => ({
    message: `Welcome back, ${name}! You're now signed in.`,
    title: 'Signed In 👋'
  }),
  logout: {
    message: 'You have been signed out successfully.',
    title: 'Signed Out'
  },
  profileUpdated: {
    message: 'Your profile information has been updated successfully.',
    title: 'Profile Updated ✓'
  },
  passwordChanged: {
    message: 'Your password has been changed successfully.',
    title: 'Password Changed ✓'
  },
  passwordResetSent: {
    message: 'Password reset instructions have been sent to your email. Please check your inbox and follow the link.',
    title: 'Check Your Email'
  },
  detectionCompleted: {
    message: 'Detection analysis completed successfully.',
    title: 'Analysis Complete ✓'
  },
  batchAnalysisCompleted: (count) => ({
    message: `Analysis of ${count.toLocaleString()} records completed successfully.`,
    title: 'Batch Analysis Complete ✓'
  }),
  csvLoaded: (count, filename) => ({
    message: `Successfully loaded ${count.toLocaleString()} records from "${filename}".`,
    title: 'CSV Loaded ✓'
  }),
  historyCleared: {
    message: 'Your scan history has been cleared successfully.',
    title: 'History Cleared ✓'
  },
  userRoleUpdated: {
    message: 'User role has been updated successfully.',
    title: 'Role Updated ✓'
  },
  userDeleted: {
    message: 'User has been deleted successfully.',
    title: 'User Deleted ✓'
  },
  dataExported: {
    message: 'Your data has been exported successfully.',
    title: 'Export Complete ✓'
  }
};

/**
 * Validation Error Messages
 */
export const validationMessages = {
  requiredField: 'This field is required.',
  emailRequired: 'Please enter a valid email address.',
  passwordTooShort: 'Password must be at least 6 characters long.',
  passwordMismatch: 'The passwords do not match. Please try again.',
  fillAllFields: 'Please fill in all required fields.',
  termsRequired: 'You must agree to the terms and conditions to continue.',
  acceptTerms: 'You must agree to the terms to continue.',
  csvFileRequired: 'Please select a CSV file to upload.',
  csvLoadFailed: 'Failed to parse the CSV file. Please check the format and try again.',
  noRecords: 'No records found in the file. Please check and try again.',
  invalidJSON: 'Invalid JSON format. Please check your input and try again.'
};

/**
 * Info Messages
 */
export const infoMessages = {
  formReset: 'All fields have been reset to default values.',
  fieldCleared: 'Field cleared.',
  notificationsUpdated: (setting, enabled) => ({
    message: `${setting} notifications have been ${enabled ? 'enabled' : 'disabled'}.`,
    title: 'Preferences Updated'
  }),
  scanning: 'Scanning in progress... Please wait.',
  loadingData: 'Loading your data... Please wait.',
  processingChart: 'Processing chart data...'
};

/**
 * Warning Messages
 */
export const warningMessages = {
  offline: 'You appear to be offline. Some features may not work properly.',
  unsavedChanges: 'You have unsaved changes. Are you sure you want to leave?',
  expiredSession: 'Your session has expired. Please sign in again.',
  confirmDelete: 'This action cannot be undone. Are you sure?',
  limitExceeded: 'You have exceeded the allowed limit. Please try again later.',
  slowConnection: 'Your connection is slow. This may take longer than usual.'
};
