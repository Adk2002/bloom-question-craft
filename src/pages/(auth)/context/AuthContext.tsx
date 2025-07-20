// context/AuthContext.js
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { AUTH_CONSTANTS } from '../constants/auth';
import { useNavigate } from 'react-router-dom';

// 1. Define the context type
type AuthContextType = {
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  logout: () => void;
};

// 2. Create the context with a default value (null or a default object)
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Type the provider props
type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY);

      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.exp * 1000 > Date.now()) {
            setIsAuthenticated(true);
            // Optionally set user here
          } else {
            localStorage.removeItem(AUTH_CONSTANTS.TOKEN_KEY);
          }
        } catch (error) {
          localStorage.removeItem(AUTH_CONSTANTS.TOKEN_KEY);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // The error happens because "navigate" is not defined in this function.
  // You need to call the useNavigate() hook to get the navigate function.
  const navigate = useNavigate();
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_CONSTANTS.TOKEN_KEY);
    navigate("/");
  };
  const contextValue: AuthContextType = {
    user,
    setUser,
    isAuthenticated,
    setIsAuthenticated,
    loading,
    setLoading,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};