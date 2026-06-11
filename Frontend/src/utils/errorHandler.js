export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response
    
    switch (status) {
      case 400:
        return data.message || 'Bad request'
      case 401:
        return 'Unauthorized. Please login again.'
      case 403:
        return 'You do not have permission to perform this action.'
      case 404:
        return 'Resource not found.'
      case 409:
        return 'Conflict with existing resource.'
      case 422:
        return data.errors || 'Validation failed.'
      case 429:
        return 'Too many requests. Please try again later.'
      case 500:
        return 'Internal server error. Please try again later.'
      default:
        return data.message || 'An error occurred.'
    }
  } else if (error.request) {
    // Request was made but no response received
    return 'Network error. Please check your connection.'
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred.'
  }
}

export const logError = (error, context = {}) => {
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  })
}