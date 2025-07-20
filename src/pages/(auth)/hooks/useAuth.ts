// hooks/useAuth.js
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { authService } from '../services/authService';
import { authUtils } from '../utils/auth';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { user, setUser, isAuthenticated, setIsAuthenticated, loading, setLoading } = context;

  const login = async (credentials: {email: string; password: string}) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      
      setUser(response.user);
      setIsAuthenticated(true);
      
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const checkAuth = async () => {
    const { isAuthenticated: authStatus, user: userData } = authUtils.initializeAuth();
    
    setIsAuthenticated(authStatus);
    setUser(userData);
    setLoading(false);
  };

  return {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    checkAuth,
    // Expose utility functions
    hasRole: authUtils.hasRole,
    hasAnyRole: authUtils.hasAnyRole
  };
};