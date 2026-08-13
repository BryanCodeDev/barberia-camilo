import { useState, useEffect, useCallback } from 'react';

const TOKEN_KEYS = {
  admin: 'admin_token',
  client: 'client_token',
};

const useAuth = (role) => {
  const tokenKey = TOKEN_KEYS[role] || `${role}_token`;

  const [token, setTokenState] = useState(() => localStorage.getItem(tokenKey));
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem(tokenKey));

  useEffect(() => {
    const stored = localStorage.getItem(tokenKey);
    setIsAuthenticated(!!stored);
    setTokenState(stored);
  }, [tokenKey]);

  const login = useCallback((newToken) => {
    localStorage.setItem(tokenKey, newToken);
    setTokenState(newToken);
    setIsAuthenticated(true);
  }, [tokenKey]);

  const logout = useCallback(() => {
    localStorage.removeItem(tokenKey);
    setTokenState(null);
    setIsAuthenticated(false);
  }, [tokenKey]);

  return { token, isAuthenticated, login, logout };
};

export default useAuth;
