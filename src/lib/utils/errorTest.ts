// Test the error utility with your specific error format

import { getErrorMessage, getErrorTitle } from './errorUtils';

// Simulate your API error response
const mockAxiosError = {
  response: {
    status: 400,
    data: {
      "success": false,
      "message": "Validation failed",
      "errors": {
        "name": [
          "Category with this name already exists."
        ]
      }
    }
  },
  message: 'Request failed with status code 400'
};

// Test the error message extraction
console.log('Error Title:', getErrorTitle(mockAxiosError));
console.log('Error Message:', getErrorMessage(mockAxiosError));

// Expected output:
// Error Title: Validation Error
// Error Message: name: Category with this name already exists.
