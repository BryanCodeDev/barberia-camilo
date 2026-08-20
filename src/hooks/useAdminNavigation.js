import { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ADMIN_TAB_KEY = 'admin_active_tab';

const TAB_ROUTES = {
  dashboard: '/admin',
  appointments: '/admin/citas',
  barbers: '/admin/barberos',
  workstations: '/admin/estaciones',
  services: '/admin/servicios',
  clients: '/admin/clientes',
  performance: '/admin/desempeno',
  notifications: '/admin/notificaciones',
  help: '/admin/ayuda',
};

const ROUTE_TABS = Object.fromEntries(
  Object.entries(TAB_ROUTES).map(([tab, route]) => [route, tab])
);

const ALLOWED_TABS = Object.keys(TAB_ROUTES);

export function useAdminNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTabState] = useState(() => {
    const stored = sessionStorage.getItem(ADMIN_TAB_KEY);
    if (stored && ALLOWED_TABS.includes(stored)) return stored;
    const matched = ROUTE_TABS[location.pathname];
    return matched || 'dashboard';
  });

  useEffect(() => {
    const matched = ROUTE_TABS[location.pathname];
    if (matched && matched !== activeTab) {
      setActiveTabState(matched);
      sessionStorage.setItem(ADMIN_TAB_KEY, matched);
    }
  }, [location.pathname, activeTab]);

  const setActiveTab = useCallback((tab) => {
    if (ALLOWED_TABS.includes(tab)) {
      setActiveTabState(tab);
      sessionStorage.setItem(ADMIN_TAB_KEY, tab);
      const route = TAB_ROUTES[tab];
      if (route) {
        navigate(route, { replace: true });
      }
    }
  }, [navigate]);

  return { activeTab, setActiveTab };
}

export function getAdminRoute(tab) {
  return TAB_ROUTES[tab] || '/admin';
}

export function getAdminTabFromRoute(pathname) {
  return ROUTE_TABS[pathname] || null;
}

export { ALLOWED_TABS };
