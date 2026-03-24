/**
 * Error Handling Utility for AIESEC Egypt CRM
 * 
 * Maps technical errors and HTTP status codes to student-friendly, 
 * actionable messages.
 */

export const ERROR_MESSAGES = {
  // Layer 1: API & Network Errors
  400: "Something's off with your input. Please review the highlighted fields and try again.",
  401: "Your session has expired. Please log in again to continue.",
  403: "You don't have permission to do this. Contact your Local Committee admin if you think this is a mistake.",
  404: "We couldn't find what you're looking for. It may have been moved or deleted.",
  408: "This is taking longer than expected. Check your connection and try again.",
  422: "We couldn't process this request. Please check your input and try again.",
  429: "You're moving fast! Please wait a moment before trying again.",
  500: "Something went wrong on our end. We're on it — please try again shortly.",
  503: "The server is temporarily overloaded. Please try again in a few minutes.",
  NETWORK_ERROR: "You appear to be offline. Please check your connection and try again.",
  GENERIC: "Something went wrong. Please try again or contact your LC admin if it persists.",
  
  // Layer 2: Form Validation
  REQUIRED: "This field is required.",
  INVALID_EMAIL: "Please enter a valid email address (e.g. name@aiesec.net).",
  INVALID_PHONE: "Please enter a valid Egyptian phone number (e.g. 01X XXXX XXXX).",
  PASSWORD_SHORT: "Password must be at least 8 characters.",
  DATE_PAST: "Please select a future date.",
  DUPLICATE: "This record already exists in the system.",
  LIMIT_EXCEEDED: (limit) => `You've reached the ${limit}-character limit.`,
  
  // Layer 4: File Uploads
  FILE_FORMAT: "Only PDF and image files are supported.",
  FILE_SIZE: (sizeMB) => `File size must be under ${sizeMB}MB.`,
  UPLOAD_FAILED: "Upload failed. Please try again or use a smaller file.",
};

/**
 * Intercepts an error and returns a friendly message.
 * @param {Error|Object} error - The caught error object (Axios error or generic)
 * @returns {string} - Friendly message
 */
export const getFriendlyErrorMessage = (error) => {
  if (!error) return ERROR_MESSAGES.GENERIC;

  // Handle Axios errors
  if (error.isAxiosError || error.response) {
    const status = error.response?.status;
    
    if (!status && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    
    if (status === 408 || error.code === 'ECONNABORTED') {
      return ERROR_MESSAGES[408];
    }

    return ERROR_MESSAGES[status] || error.response?.data?.message || ERROR_MESSAGES.GENERIC;
  }

  // Handle string errors
  if (typeof error === 'string') return error;

  // Fallback
  return error.message || ERROR_MESSAGES.GENERIC;
};

/**
 * Groups multiple validation errors for a top-level banner.
 * @param {number} count - Number of errors
 * @returns {string}
 */
export const getValidationSummary = (count) => {
  return `Please fix the ${count} issue${count > 1 ? 's' : ''} below before submitting.`;
};
