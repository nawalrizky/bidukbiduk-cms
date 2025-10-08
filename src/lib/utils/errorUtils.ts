import { AxiosError } from 'axios';

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    // Handle validation errors first (your API format)
    if (error.response?.data?.errors && typeof error.response.data.errors === 'object') {
      const errors = error.response.data.errors;
      const errorMessages = Object.entries(errors)
        .map(([field, messages]) => {
          const messageArray = Array.isArray(messages) ? messages : [messages];
          // Capitalize field name for better readability
          const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
          return `${fieldName}: ${messageArray.join(', ')}`;
        })
        .join('\n');
      return errorMessages;
    }
    
    // Handle main error message
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    
    // Handle field-specific errors (Django style) - fallback
    if (error.response?.data && typeof error.response.data === 'object') {
      const data = error.response.data as Record<string, unknown>;
      const fieldErrors: string[] = [];
      
      Object.entries(data).forEach(([field, messages]) => {
        // Skip known non-field keys
        if (field === 'success' || field === 'message' || field === 'errors') {
          return;
        }
        
        if (Array.isArray(messages)) {
          fieldErrors.push(`${field}: ${messages.join(', ')}`);
        } else if (typeof messages === 'string') {
          fieldErrors.push(`${field}: ${messages}`);
        }
      });
      
      if (fieldErrors.length > 0) {
        return fieldErrors.join('; ');
      }
    }
    
    // Default Axios error message
    return error.message || 'Request failed';
  }
  
  // Handle regular errors
  if (error instanceof Error) {
    return error.message;
  }
  
  // Fallback for unknown error types
  return 'An unexpected error occurred';
};

export const getErrorTitle = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    switch (status) {
      case 400:
        return 'Validation Error';
      case 401:
        return 'Authentication Required';
      case 403:
        return 'Access Denied';
      case 404:
        return 'Not Found';
      case 500:
        return 'Server Error';
      default:
        return 'Request Failed';
    }
  }
  
  return 'Error';
};
