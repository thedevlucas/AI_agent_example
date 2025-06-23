import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authAPI } from '../lib/api.js';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Memoize the auth check function to prevent unnecessary re-renders
  const checkAuthStatus = useCallback(async () => {
    if (initialized) return; // Prevent multiple calls
    
    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.data.user);
    } catch (error) {
      // Only log if it's not a 401 (which is expected when not logged in)
      if (error.response?.status !== 401) {
        console.error('Auth check error:', error);
      }
      setUser(null);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [initialized]);

  // Only run once on mount
  useEffect(() => {
    checkAuthStatus();
  }, []); // Empty dependency array - only run once

  const signUp = async (username, email, password) => {
    try {
      const response = await authAPI.register({ username, email, password });
      setUser(response.data.user);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        data: null, 
        error: { message: error.response?.data?.error || 'Registration failed' }
      };
    }
  };

  const signIn = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      setUser(response.data.user);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        data: null, 
        error: { message: error.response?.data?.error || 'Login failed' }
      };
    }
  };

  const signOut = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};