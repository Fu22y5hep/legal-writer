import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

const REFRESH_TOKEN_COOKIE = 'refreshToken';
const TOKEN_EXPIRY_MARGIN = 60; // seconds before expiry to refresh

interface JWTPayload {
  exp: number;
  iat: number;
  jti: string;
  token_type: string;
  user_id: number;
}

export const setTokens = (accessToken: string, refreshToken: string) => {
  // Store access token in memory
  localStorage.setItem('accessToken', accessToken);
  
  // Store refresh token in HTTP-only cookie
  Cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    secure: true,
    sameSite: 'strict',
    expires: 1 // 1 day
  });
};

export const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};

export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  Cookies.remove(REFRESH_TOKEN_COOKIE);
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp <= currentTime + TOKEN_EXPIRY_MARGIN;
  } catch {
    return true;
  }
};

export const refreshAccessToken = async () => {
  const refreshToken = Cookies.get(REFRESH_TOKEN_COOKIE);
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await fetch('http://localhost:8000/api/token/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    localStorage.setItem('accessToken', data.access);
    return data.access;
  } catch (error) {
    clearTokens();
    throw error;
  }
};
