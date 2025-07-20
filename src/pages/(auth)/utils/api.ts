// utils/api.js
import { authUtils } from './auth';
import { AUTH_CONSTANTS } from '../constants/auth';

// ========================================
// API CONFIGURATION
// ========================================

const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// ========================================
// API UTILITY CLASS
// ========================================

class ApiClient {
  baseURL: string;
  timeout: number;

  constructor(baseURL = API_CONFIG.BASE_URL) {
    this.baseURL = baseURL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  /**
   * Create request configuration with auth headers
   */
  createConfig(options: { headers?: Record<string, string> } = {}) {
    const config = {
      ...options,
      headers: {
        ...API_CONFIG.HEADERS,
        ...authUtils.getAuthHeaders(),
        ...options.headers
      }
    };

    return config;
  }

  /**
   * Handle API response
   */
  async handleResponse(response: Response) {
    // Handle different response types
    const contentType = response.headers.get('content-type');
    
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // Handle different error types
      const error: any = new Error(data.message || `HTTP Error: ${response.status}`);
      error.status = response.status;
      error.data = data;
      
      // Handle specific error cases
      if (response.status === 401) {
        // Token expired or invalid
        authUtils.clearAuthData();
        window.location.href = AUTH_CONSTANTS.ROUTES.LOGIN;
      }
      
      throw error;
    }

    return data;
  }

  /**
   * Generic request method
   */
  async request(endpoint: string, options: { method?: string; headers?: Record<string, string>; body?: any } = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = this.createConfig(options);

    try {
      // Check if token needs refresh before making request
      const token = authUtils.getToken();
      if (token && authUtils.shouldRefreshToken(token)) {
        // Attempt to refresh token
        try {
          await this.refreshToken();
        } catch (refreshError) {
          // If refresh fails, clear auth data
          authUtils.clearAuthData();
          throw new Error(AUTH_CONSTANTS.ERRORS.TOKEN_EXPIRED);
        }
      }

      const response = await fetch(url, config);
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`API Request Error [${options.method || 'GET'}] ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get(endpoint: string, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post(endpoint: string, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * PUT request
   */
  async put(endpoint: string, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  /**
   * PATCH request
   */
  async patch(endpoint: string, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  /**
   * Upload file
   */
  async upload(endpoint: string, file: File, additionalData: Record<string, any> = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it
        ...authUtils.getAuthHeaders()
      }
    });
  }

  /**
   * Refresh authentication token
   */
  async refreshToken() {
    const token = authUtils.getToken();
    if (!token) throw new Error('No token to refresh');

    try {
      const response = await fetch(`${this.baseURL}${AUTH_CONSTANTS.ENDPOINTS.REFRESH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      authUtils.setToken(data.token);
      
      if (data.user) {
        authUtils.setUser(data.user);
      }

      return data;
    } catch (error) {
      authUtils.clearAuthData();
      throw error;
    }
  }
}

// ========================================
// API CLIENT INSTANCE
// ========================================

export const apiClient = new ApiClient();

// ========================================
// CONVENIENCE METHODS
// ========================================

/**
 * Auth-specific API calls
 */
export const authApi = {
  login: (credentials) => apiClient.post(AUTH_CONSTANTS.ENDPOINTS.LOGIN, credentials),
  signup: (userData) => apiClient.post(AUTH_CONSTANTS.ENDPOINTS.SIGNUP, userData),
  logout: () => apiClient.post(AUTH_CONSTANTS.ENDPOINTS.LOGOUT),
  refreshToken: () => apiClient.refreshToken(),
  verifyToken: () => apiClient.get(AUTH_CONSTANTS.ENDPOINTS.VERIFY)
};

/**
 * Generic API methods (use these in your services)
 */
export const api = {
  get: (endpoint, params) => apiClient.get(endpoint, params),
  post: (endpoint, data) => apiClient.post(endpoint, data),
  put: (endpoint, data) => apiClient.put(endpoint, data),
  patch: (endpoint, data) => apiClient.patch(endpoint, data),
  delete: (endpoint) => apiClient.delete(endpoint),
  upload: (endpoint, file, data) => apiClient.upload(endpoint, file, data)
};

// ========================================
// REQUEST INTERCEPTORS (Advanced)
// ========================================

/**
 * Add request interceptor for debugging
 */
export const addRequestInterceptor = (interceptor) => {
  const originalRequest = apiClient.request;
  
  apiClient.request = async function(endpoint, options) {
    const modifiedOptions = interceptor(endpoint, options);
    return originalRequest.call(this, endpoint, modifiedOptions);
  };
};

/**
 * Add response interceptor for global error handling
 */
export const addResponseInterceptor = (interceptor) => {
  const originalHandleResponse = apiClient.handleResponse;
  
  apiClient.handleResponse = async function(response) {
    try {
      const data = await originalHandleResponse.call(this, response);
      return interceptor(null, data, response);
    } catch (error) {
      return interceptor(error, null, response);
    }
  };
};

// ========================================
// ERROR HANDLING UTILITIES
// ========================================

export const apiErrorHandler = {
  /**
   * Handle API errors consistently
   */
  handleError(error) {
    if (error.status === 401) {
      return AUTH_CONSTANTS.ERRORS.UNAUTHORIZED;
    } else if (error.status === 403) {
      return 'Access forbidden';
    } else if (error.status >= 500) {
      return AUTH_CONSTANTS.ERRORS.NETWORK_ERROR;
    } else {
      return error.message || 'An error occurred';
    }
  },

  /**
   * Check if error is authentication related
   */
  isAuthError(error) {
    return error.status === 401 || error.status === 403;
  },

  /**
   * Check if error is network related
   */
  isNetworkError(error) {
    return error.status >= 500 || error.message.includes('Network');
  }
};

export default apiClient;