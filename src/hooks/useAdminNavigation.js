import { useState, useCallback } from 'react';

const ADMIN_TAB_KEY = 'admin_active_tab';
const ALLOWED_TABS = [
  'dashboard',
  'appointments',
  'barbers',
  'workstations',
  'services',
  'clients',
  'performance',
  'notifications',
  'help',
];

export function useAdminNavigation() {
  const [activeTab, setActiveTabState] = useState(() => {
    const stored = sessionStorage.getItem(ADMIN_TAB_KEY);
    return stored && ALLOWED_TABS.includes(stored) ? stored : 'dashboard';
  });

  const setActiveTab = useCallback((tab) => {
    if (ALLOWED_TABS.includes(tab)) {
      setActiveTabState(tab);
      sessionStorage.setItem(ADMIN_TAB_KEY, tab);
    }
  }, []);

  return { activeTab, setActiveTab };
}
