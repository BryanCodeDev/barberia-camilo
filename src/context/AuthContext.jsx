import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../services/api';

// WARNING: This decodes a JWT without verifying its signature.
// It is ONLY safe for reading non-sensitive claims from tokens that were
// previously validated by the backend. Never use decoded payload data
// for authorization decisions.
function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16')).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('admin_token'));
  const [clientToken, setClientToken] = useState(() => localStorage.getItem('client_token'));

  const [adminUser, setAdminUser] = useState(() => {
    const t = localStorage.getItem('admin_token');
    return t ? decodeToken(t) : null;
  });

  const [clientUser, setClientUser] = useState(() => {
    const t = localStorage.getItem('client_token');
    return t ? decodeToken(t) : null;
  });

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'admin_token') {
        if (e.newValue) {
          setAdminToken(e.newValue);
          setAdminUser(decodeToken(e.newValue));
        } else {
          setAdminToken(null);
          setAdminUser(null);
        }
      }
      if (e.key === 'client_token') {
        if (e.newValue) {
          setClientToken(e.newValue);
          setClientUser(decodeToken(e.newValue));
        } else {
          setClientToken(null);
          setClientUser(null);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const verifyAdminToken = useCallback(async (token) => {
    if (!token) return false;
    try {
      await api.get('/auth/verify', false);
      return true;
    } catch {
      logoutAdmin();
      return false;
    }
  }, [logoutAdmin]);

  const verifyClientToken = useCallback(async (token) => {
    if (!token) return false;
    try {
      await api.get('/auth/verify', true);
      return true;
    } catch {
      logoutClient();
      return false;
    }
  }, [logoutClient]);

  useEffect(() => {
    if (adminToken) {
      verifyAdminToken(adminToken);
    }
  }, [adminToken, verifyAdminToken]);

  useEffect(() => {
    if (clientToken) {
      verifyClientToken(clientToken);
    }
  }, [clientToken, verifyClientToken]);

  const loginAdmin = useCallback((token) => {
    localStorage.setItem('admin_token', token);
    setAdminToken(token);
    setAdminUser(decodeToken(token));
  }, []);

  const loginClient = useCallback((token) => {
    localStorage.setItem('client_token', token);
    setClientToken(token);
    setClientUser(decodeToken(token));
  }, []);

  const logoutAdmin = useCallback(async () => {
    const token = adminToken;
    if (token) {
      try {
        await api.post('/auth/logout', {}, false);
      } catch {
        // noop: logout local debe seguir funcionando incluso si el backend falla
      }
    }
    localStorage.removeItem('admin_token');
    setAdminToken(null);
    setAdminUser(null);
  }, [adminToken]);

  const logoutClient = useCallback(async () => {
    const token = clientToken;
    if (token) {
      try {
        await api.post('/auth/logout', {}, true);
      } catch {
        // noop: logout local debe seguir funcionando incluso si el backend falla
      }
    }
    localStorage.removeItem('client_token');
    setClientToken(null);
    setClientUser(null);
  }, [clientToken]);

  const value = {
    adminToken,
    clientToken,
    adminUser,
    clientUser,
    isAdminAuthenticated: !!adminToken,
    isClientAuthenticated: !!clientToken,
    isAuthenticated: !!adminToken || !!clientToken,
    loginAdmin,
    loginClient,
    logoutAdmin,
    logoutClient,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return ctx;
}
