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
  // During development, always set isAuthenticated to true
  const [isAuthenticated, setIsAuthenticated] = useState(true);
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

  // Bypass authentication checks during development
  const login = async (username: string, password: string) => {
    setIsAuthenticated(true);
    router.push('/projects');
  };

  const logout = () => {
    setIsAuthenticated(true); // Keep authenticated even after logout during development
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
