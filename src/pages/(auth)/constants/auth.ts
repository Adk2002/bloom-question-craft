// constants/auth.js
export const AUTH_CONSTANTS = {
    // Local Storage Keys
    TOKEN_KEY: 'auth_token',
    USER_KEY: 'user_data',
    
    // API Endpoints
    ENDPOINTS: {
      LOGIN: '/auth/login',
      SIGNUP: '/auth/signup',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      VERIFY: '/auth/verify'
    },
    
    // JWT Configuration
    JWT: {
      EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutes buffer for token refresh
      REFRESH_THRESHOLD: 15 * 60 * 1000 // Refresh token 15 minutes before expiry
    },
    
    // User Roles
    ROLES: {
      ADMIN: 'admin',
      USER: 'user',
      MODERATOR: 'moderator'
    },
    
    // Error Messages
    ERRORS: {
      INVALID_CREDENTIALS: 'Invalid email or password',
      NETWORK_ERROR: 'Network error. Please try again.',
      TOKEN_EXPIRED: 'Session expired. Please login again.',
      UNAUTHORIZED: 'You are not authorized to access this resource'
    },
    
    // Validation Rules
    VALIDATION: {
      EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      PASSWORD_MIN_LENGTH: 6,
      PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/
    },
    
    // Routes
    ROUTES: {
      LOGIN: '/auth/views/login-page',
      SIGNUP: '/auth/views/signup-pages',
      DASHBOARD: '/dashboard',
      PROFILE: '/profile'
    }
  };
  
  // Export individual constants for convenience
  export const { TOKEN_KEY, USER_KEY } = AUTH_CONSTANTS;
  export const { ROLES } = AUTH_CONSTANTS;
  export const { ERRORS } = AUTH_CONSTANTS;