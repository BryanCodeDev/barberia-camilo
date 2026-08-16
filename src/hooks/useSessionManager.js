import { useEffect, useRef, useCallback, useState } from 'react';
import useAuth from './useAuth';
import { api } from '../services/api';

const SESSION_DURATION_MS = 60 * 60 * 1000;
const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000;
const SESSION_KEY = 'admin_session_meta';

function getSessionMeta() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setSessionMeta(meta) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(meta));
}

function clearSessionMeta() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function useSessionManager(role = 'admin') {
  const { isAuthenticated, user, logout, login } = useAuth(role);
  const heartbeatRef = useRef(null);
  const expiryRef = useRef(null);
  const [sessionReplaced, setSessionReplaced] = useState(false);
  const sessionReplacementHandled = useRef(false);

  const checkSessionExpiry = useCallback(() => {
    const meta = getSessionMeta();
    if (!meta || !isAuthenticated) return true;

    const elapsed = Date.now() - meta.loginAt;
    if (elapsed >= SESSION_DURATION_MS) {
      logout();
      clearSessionMeta();
      return false;
    }
    return true;
  }, [isAuthenticated, logout]);

  const startHeartbeat = useCallback(async () => {
    if (!isAuthenticated) return;

    heartbeatRef.current = setInterval(async () => {
      if (!checkSessionExpiry()) {
        stopHeartbeat();
        return;
      }

      try {
        await api.get('/auth/verify', role === 'client');
      } catch (err) {
        if (err.message === 'SESSION_REPLACED' || (err.data && err.data.error === 'SESSION_REPLACED')) {
          if (!sessionReplacementHandled.current) {
            sessionReplacementHandled.current = true;
            setSessionReplaced(true);
          }
        }
        logout();
        clearSessionMeta();
        stopHeartbeat();
      }
    }, HEARTBEAT_INTERVAL_MS);

    expiryRef.current = setTimeout(() => {
      logout();
      clearSessionMeta();
      stopHeartbeat();
    }, SESSION_DURATION_MS);
  }, [isAuthenticated, role, checkSessionExpiry, logout]);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    if (expiryRef.current) clearTimeout(expiryRef.current);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const meta = getSessionMeta();
      if (meta) {
        if (!checkSessionExpiry()) return;
        startHeartbeat();
      }
    } else {
      stopHeartbeat();
      clearSessionMeta();
    }

    return () => stopHeartbeat();
  }, [isAuthenticated, startHeartbeat, stopHeartbeat, checkSessionExpiry]);

  return {
    isAuthenticated,
    user,
    login: (token) => {
      const meta = {
        loginAt: Date.now(),
        sessionId: crypto.randomUUID(),
        userAgent: navigator.userAgent,
      };
      setSessionMeta(meta);
      sessionReplacementHandled.current = false;
      setSessionReplaced(false);
      login(token);
    },
    logout,
    refreshSession: () => {
      const meta = getSessionMeta();
      if (meta) {
        setSessionMeta({ ...meta, loginAt: Date.now() });
        if (expiryRef.current) clearTimeout(expiryRef.current);
        expiryRef.current = setTimeout(() => {
          logout();
          clearSessionMeta();
          stopHeartbeat();
        }, SESSION_DURATION_MS);
      }
    },
    checkSessionExpiry,
    sessionReplaced,
    setSessionReplaced,
  };
}
