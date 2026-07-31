// src/utils/constants.js

const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const APP_CONFIG = {
  apiBaseUrl: apiBaseUrl,
  maxAdvanceBookingDays: 30,
  minAdvanceBookingHours: 2,
  appointmentsPerPage: 10,
  autoRefreshInterval: 30000,
};

export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  NO_SHOW: 'no-show'
};

export const STATUS_LABELS = {
  [APPOINTMENT_STATUS.PENDING]: 'Pendiente',
  [APPOINTMENT_STATUS.CONFIRMED]: 'Confirmada',
  [APPOINTMENT_STATUS.CANCELLED]: 'Cancelada',
  [APPOINTMENT_STATUS.COMPLETED]: 'Completada',
  [APPOINTMENT_STATUS.NO_SHOW]: 'No se presentó'
};

export const STATUS_COLORS = {
  [APPOINTMENT_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
  [APPOINTMENT_STATUS.CONFIRMED]: 'bg-green-100 text-green-800',
  [APPOINTMENT_STATUS.CANCELLED]: 'bg-red-100 text-red-800',
  [APPOINTMENT_STATUS.COMPLETED]: 'bg-blue-100 text-blue-800',
  [APPOINTMENT_STATUS.NO_SHOW]: 'bg-gray-100 text-gray-800'
};

const config = { APP_CONFIG, APPOINTMENT_STATUS, STATUS_LABELS, STATUS_COLORS };
export default config;