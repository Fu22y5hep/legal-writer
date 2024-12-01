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
  window.location.href = '/login'; // Redirect to login page when tokens are cleared
};

export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  
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
    console.error('No refresh token found in cookies');
    clearTokens();
    throw new Error('No refresh token available');
  }

  try {
    console.log('Attempting to refresh access token...');
    const response = await fetch('http://localhost:8000/api/token/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token refresh failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      clearTokens();
      throw new Error(`Failed to refresh token: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.access) {
      console.error('Invalid refresh response:', data);
      clearTokens();
      throw new Error('Invalid refresh token response');
    }

    console.log('Token refresh successful');
    localStorage.setItem('accessToken', data.access);
    return data.access;
  } catch (error) {
    console.error('Token refresh error:', error);
    clearTokens();
    throw error;
  }
};
