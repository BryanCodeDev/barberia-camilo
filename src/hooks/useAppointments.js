import { useState, useEffect, useCallback } from 'react';
import { APP_CONFIG } from '../../utils/constants';

const apiBaseUrl = APP_CONFIG.apiBaseUrl;

export const useAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAppointments = useCallback(async (date) => {
    try {
      setLoading(true);
      setError(null);
      const url = date ? `${apiBaseUrl}/admin/appointments?date=${date}` : `${apiBaseUrl}/admin/appointments`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Error al cargar las citas');
      const data = await response.json();
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
      const response = await fetch(`${apiBaseUrl}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al crear la cita');
      }
      const data = await response.json();
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
      const response = await fetch(`${apiBaseUrl}/appointments/${appointmentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error al eliminar la cita');
      await fetchAppointments();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchAppointments]);

  const updateAppointmentStatus = useCallback(async (appointmentId, newStatus, cancelledReason = null) => {
    try {
      setError(null);
      const response = await fetch(`${apiBaseUrl}/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, cancelled_reason: cancelledReason }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al actualizar la cita');
      }
      await fetchAppointments();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchAppointments]);

  const getOccupiedTimeSlots = useCallback(async (date) => {
    try {
      const response = await fetch(`${apiBaseUrl}/appointments/occupied-slots?date=${date}`);
      if (!response.ok) throw new Error('Error al cargar horarios ocupados');
      const data = await response.json();
      return data.slots || [];
    } catch (err) {
      console.error('Error fetching occupied slots:', err);
      return [];
    }
  }, []);

  const getAppointmentsByDate = useCallback(async (date) => {
    try {
      const response = await fetch(`${apiBaseUrl}/admin/appointments?date=${date}`);
      if (!response.ok) throw new Error('Error al cargar citas');
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error fetching by date:', err);
      return [];
    }
  }, []);

  const getStats = useCallback(async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/admin/stats`);
      if (!response.ok) throw new Error('Error al cargar estadísticas');
      const data = await response.json();
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