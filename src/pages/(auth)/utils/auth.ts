import { AUTH_CONSTANTS } from '../constants/auth';

export const authUtils = {
  // ========================================
  // TOKEN STORAGE OPERATIONS
  // ========================================
  
  /**
   * Store JWT token in localStorage
   */
  setToken(token: string) {
    if (token) {
      localStorage.setItem(AUTH_CONSTANTS.TOKEN_KEY, token);
    }
  },

  /**
   * Retrieve JWT token from localStorage
   */
  getToken() {
    return localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY);
  },

  /**
   * Remove JWT token from localStorage
   */
  removeToken() {
    localStorage.removeItem(AUTH_CONSTANTS.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONSTANTS.USER_KEY);
  },

  /**
   * Store user data in localStorage
   */
  setUser(userData: any) {
    if (userData) {
      localStorage.setItem(AUTH_CONSTANTS.USER_KEY, JSON.stringify(userData));
    }
  },

  /**
   * Retrieve user data from localStorage
   */
  getUser() {
    try {
      const userData = localStorage.getItem(AUTH_CONSTANTS.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  // ========================================
  // TOKEN VALIDATION & DECODING
  // ========================================

  /**
   * Decode JWT token payload (without verification)
   */
  decodeToken(token: string) {
    try {
      if (!token) return null;
      
      const payload = token.split('.')[1];
      if (!payload) return null;
      
      const decodedPayload = JSON.parse(atob(payload));
      return decodedPayload;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },

  /**
   * Check if token is expired
   */
  isTokenExpired(token:string) {
    try {
      const payload = this.decodeToken(token);
      if (!payload || !payload.exp) return true;
      
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  },

  /**
   * Check if token needs refresh (expires within buffer time)
   */
  shouldRefreshToken(token:string) {
    try {
      const payload = this.decodeToken(token);
      if (!payload || !payload.exp) return false;
      
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = payload.exp - currentTime;
      const bufferTime = AUTH_CONSTANTS.JWT.REFRESH_THRESHOLD / 1000;
      
      return timeUntilExpiry <= bufferTime;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get token expiration time in milliseconds
   */
  getTokenExpiration(token:string) {
    const payload = this.decodeToken(token);
    return payload?.exp ? payload.exp * 1000 : null;
  },

  // ========================================
  // AUTHENTICATION STATE CHECKS
  // ========================================

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;
    
    return !this.isTokenExpired(token);
  },

  /**
   * Get current user from token or localStorage
   */
  getCurrentUser() {
    const token = this.getToken();
    if (!token || this.isTokenExpired(token)) {
      return null;
    }
    
    // Try to get from localStorage first
    const storedUser = this.getUser();
    if (storedUser) return storedUser;
    
    // Fallback to token payload
    const payload = this.decodeToken(token);
    return payload ? {
      id: payload.userId,
      email: payload.email,
      role: payload.role
    } : null;
  },

  /**
   * Check if user has specific role
   */
  hasRole(requiredRole) {
    const user = this.getCurrentUser();
    return user && user.role === requiredRole;
  },

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles) {
    const user = this.getCurrentUser();
    return user && roles.includes(user.role);
  },

  // ========================================
  // CLEANUP & INITIALIZATION
  // ========================================

  /**
   * Clear all authentication data
   */
  clearAuthData() {
    this.removeToken();
    // Clear any other auth-related data
  },

  /**
   * Initialize authentication on app start
   */
  initializeAuth() {
    const token = this.getToken();
    
    if (token && this.isTokenExpired(token)) {
      this.clearAuthData();
      return { isAuthenticated: false, user: null };
    }
    
    if (token) {
      const user = this.getCurrentUser();
      return { isAuthenticated: true, user };
    }
    
    return { isAuthenticated: false, user: null };
  },

  // ========================================
  // UTILITY HELPERS
  // ========================================

  /**
   * Format auth header for API requests
   */
  getAuthHeader() {
    const token = this.getToken();
    return token ? `Bearer ${token}` : null;
  },

  /**
   * Create auth headers object for fetch requests
   */
  getAuthHeaders() {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  },

  /**
   * Validate email format
   */
  isValidEmail(email:string) {
    return AUTH_CONSTANTS.VALIDATION.EMAIL_REGEX.test(email);
  },

  /**
   * Validate password strength
   */
  isValidPassword(password:string) {
    return password.length >= AUTH_CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH;
  }
};

// Export individual functions for convenience
export const {
  setToken,
  getToken,
  removeToken,
  isTokenExpired,
  isAuthenticated,
  getCurrentUser,
  hasRole,
  getAuthHeader,
  clearAuthData
} = authUtils;