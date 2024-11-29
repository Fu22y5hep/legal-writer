"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { setTokens, clearTokens, getAccessToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated on mount
    const accessToken = getAccessToken();
    if (accessToken) {
      setIsAuthenticated(true);
      // You might want to fetch user details here
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await api.login(username, password);
      setTokens(response.access, response.refresh);
      setIsAuthenticated(true);
      router.push('/projects'); // Redirect to projects page after login
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    clearTokens();
    setIsAuthenticated(false);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
