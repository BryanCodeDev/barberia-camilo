import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export const useAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAppointments = useCallback(async (date) => {
    try {
      setLoading(true);
      setError(null);
      const url = date ? `/admin/appointments?date=${date}` : `/admin/appointments`;
      const data = await api.get(url);
      setAppointments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addAppointment = useCallback(async (appointmentData) => {
    try {
      setError(null);
      const data = await api.post('/appointments', appointmentData);
      await fetchAppointments();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchAppointments]);

  const removeAppointment = useCallback(async (appointmentId) => {
    try {
      setError(null);
      await api.delete(`/appointments/${appointmentId}`);
      await fetchAppointments();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchAppointments]);

  const updateAppointmentStatus = useCallback(async (appointmentId, newStatus, cancelledReason = null) => {
    try {
      setError(null);
      await api.patch(`/appointments/${appointmentId}/status`, {
        status: newStatus,
        cancelled_reason: cancelledReason,
      });
      await fetchAppointments();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchAppointments]);

  const getOccupiedTimeSlots = useCallback(async (date) => {
    try {
      const data = await api.get(`/appointments/occupied-slots?date=${date}`);
      return data.occupied_slots || data.slots || [];
    } catch (err) {
      console.error('Error fetching occupied slots:', err);
      return [];
    }
  }, []);

  const getAppointmentsByDate = useCallback(async (date) => {
    try {
      const data = await api.get(`/admin/appointments?date=${date}`);
      return data;
    } catch (err) {
      console.error('Error fetching by date:', err);
      return [];
    }
  }, []);

  const getStats = useCallback(async () => {
    try {
      const data = await api.get('/admin/stats');
      return data;
    } catch (err) {
      console.error('Error fetching stats:', err);
      return { total: 0, pending: 0, confirmed: 0, cancelled: 0, today: 0 };
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    appointments,
    addAppointment,
    removeAppointment,
    updateAppointmentStatus,
    getOccupiedTimeSlots,
    getAppointmentsByDate,
    getStats,
    loading,
    error,
  };
};

export default useAppointments;
