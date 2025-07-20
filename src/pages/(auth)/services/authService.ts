// services/authService.js
import { authApi } from '../utils/api';
import { authUtils } from '../utils/auth';
import { AUTH_CONSTANTS } from '../constants/auth';

type LoginResponse = {
    // token: string;
    // user: any; // Replace 'any' with your actual user type/interface
    email: string;
    password: string;
};

type SignupCredentials = {
    email: string;
    name: string;
    password: string;
}
export const authService = {
  async login(credentials: LoginResponse) {
    try {
      const response = await authApi.login(credentials);
      
      // Use auth utils to store token and user
      authUtils.setToken(response.token);
      authUtils.setUser(response.user);
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  async signup(userData: SignupCredentials) {
    try {
      const response = await authApi.signup(userData);
      
      authUtils.setToken(response.token);
      authUtils.setUser(response.user);
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  async logout() {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      authUtils.clearAuthData();
    }
  },

  async verifyToken() {
    const token = authUtils.getToken();
    if (!token || authUtils.isTokenExpired(token)) {
      throw new Error('No valid token');
    }
    
    return await authApi.verifyToken();
  }
};