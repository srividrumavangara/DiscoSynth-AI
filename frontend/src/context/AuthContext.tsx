import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserLoginRequest, UserRegisterRequest, UpdateProfileRequest } from '../types';
import { apiClient } from '../api/client';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: UserLoginRequest) => Promise<void>;
  register: (data: UserRegisterRequest) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('discosynth_token'));
  const [user, setUser] = useState<UserProfile | null>(() => {
    const cached = localStorage.getItem('discosynth_user');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize and check current user if token is present
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('discosynth_token');
      if (storedToken) {
        try {
          const profile = await apiClient.getCurrentUser();
          setUser(profile);
          localStorage.setItem('discosynth_user', JSON.stringify(profile));
        } catch (err) {
          console.warn('Session expired or invalid token:', err);
          localStorage.removeItem('discosynth_token');
          localStorage.removeItem('discosynth_user');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: UserLoginRequest) => {
    const res = await apiClient.login(data);
    localStorage.setItem('discosynth_token', res.access_token);
    localStorage.setItem('discosynth_user', JSON.stringify(res.user));
    setToken(res.access_token);
    setUser(res.user);
  };

  const register = async (data: UserRegisterRequest) => {
    const res = await apiClient.register(data);
    localStorage.setItem('discosynth_token', res.access_token);
    localStorage.setItem('discosynth_user', JSON.stringify(res.user));
    setToken(res.access_token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('discosynth_token');
    localStorage.removeItem('discosynth_user');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data: UpdateProfileRequest) => {
    const updated = await apiClient.updateProfile(data);
    setUser(updated);
    localStorage.setItem('discosynth_user', JSON.stringify(updated));
  };

  const refreshProfile = async () => {
    try {
      const profile = await apiClient.getCurrentUser();
      setUser(profile);
      localStorage.setItem('discosynth_user', JSON.stringify(profile));
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
