import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuthContext } from '../context/AuthContext';

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
  const ctx = useAuthContext();

  if (role === 'admin') {
    return {
      token: ctx.adminToken,
      isAuthenticated: ctx.isAdminAuthenticated,
      user: ctx.adminUser,
      login: ctx.loginAdmin,
      logout: ctx.logoutAdmin,
      verifySession: async () => {
        const stored = ctx.adminToken;
        if (!stored) return false;
        try {
          await api.get('/auth/verify', false);
          return true;
        } catch {
          ctx.logoutAdmin();
          return false;
        }
      },
    };
  }

  if (role === 'client') {
    return {
      token: ctx.clientToken,
      isAuthenticated: ctx.isClientAuthenticated,
      user: ctx.clientUser,
      login: ctx.loginClient,
      logout: ctx.logoutClient,
      verifySession: async () => {
        const stored = ctx.clientToken;
        if (!stored) return false;
        try {
          await api.get('/auth/verify', true);
          return true;
        } catch {
          ctx.logoutClient();
          return false;
        }
      },
    };
  }

  return {
    token: ctx.adminToken || ctx.clientToken,
    isAuthenticated: ctx.isAuthenticated,
    user: ctx.adminUser || ctx.clientUser,
    login: (newToken) => {
      ctx.loginAdmin(newToken);
      ctx.loginClient(newToken);
    },
    logout: async () => {
      await ctx.logoutAdmin();
      await ctx.logoutClient();
    },
    verifySession: async () => {
      const stored = ctx.adminToken || ctx.clientToken;
      if (!stored) return false;
      try {
        await api.get('/auth/verify', !ctx.adminToken);
        return true;
      } catch {
        await ctx.logoutAdmin();
        await ctx.logoutClient();
        return false;
      }
    },
  };
};

export default useAuth;
