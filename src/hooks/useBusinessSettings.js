import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

let cachedSettings = null;
let settingsCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000;

export const useBusinessSettings = () => {
  const [settings, setSettings] = useState(cachedSettings);
  const [loading, setLoading] = useState(!cachedSettings);
  const [error, setError] = useState(null);

  const fetchSettings = useCallback(async () => {
    const now = Date.now();
    if (cachedSettings && now - settingsCacheTime < CACHE_DURATION) {
      setSettings(cachedSettings);
      setLoading(false);
      return cachedSettings;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await api.get('/business-settings');
      cachedSettings = data;
      settingsCacheTime = now;
      setSettings(data);
      return data;
    } catch (err) {
      setError(err.message);
      return cachedSettings;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const getSetting = useCallback((key, fallback = '') => {
    if (!settings) return fallback;
    return settings[key] || fallback;
  }, [settings]);

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings,
    getSetting,
  };
};
