import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const TOKEN_KEYS = {
  admin: 'admin_token',
  client: 'client_token',
};

function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

const useAuth = (role) => {
  const tokenKey = TOKEN_KEYS[role] || `${role}_token`;

  const [token, setTokenState] = useState(() => localStorage.getItem(tokenKey));
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem(tokenKey));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(tokenKey);
    return stored ? decodeToken(stored) : null;
  });

  useEffect(() => {
    const stored = localStorage.getItem(tokenKey);
    setIsAuthenticated(!!stored);
    setTokenState(stored);
    setUser(stored ? decodeToken(stored) : null);
  }, [tokenKey]);

  const login = useCallback((newToken) => {
    localStorage.setItem(tokenKey, newToken);
    setTokenState(newToken);
    setIsAuthenticated(true);
    setUser(decodeToken(newToken));
  }, [tokenKey]);

  const logout = useCallback(() => {
    localStorage.removeItem(tokenKey);
    setTokenState(null);
    setIsAuthenticated(false);
    setUser(null);
  }, [tokenKey]);

  const verifySession = useCallback(async () => {
    const stored = localStorage.getItem(tokenKey);
    if (!stored) return false;
    try {
      await api.get('/auth/verify', role === 'client');
      return true;
    } catch {
      logout();
      return false;
    }
  }, [tokenKey, role, logout]);

  return { token, isAuthenticated, user, login, logout, verifySession };
};

export default useAuth;
