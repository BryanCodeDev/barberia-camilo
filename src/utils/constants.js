// src/utils/constants.js

// Información del negocio
export const BUSINESS_INFO = {
  name: "Barber Trebol",
  owner: "Barber Trebol",
  title: "Master Barber",
  phone: "+57 300 123 4567",
  whatsapp: "573001234567",
  email: "contacto@barbertrebol.com",
  address: {
    street: "CALLE 3 #4 - 77 EDIFICIO INFINITO LOCAL 01",
    city: "Mosquera",
    state: "Cundinamarca",
    country: "Colombia",
    full: "CALLE 3 #4 - 77 EDIFICIO INFINITO LOCAL 01, Mosquera, Cundinamarca"
  },
  socialMedia: {
    instagram: "@barbertrebol",
    facebook: "Barber Trebol",
    tiktok: "@barbertrebol"
  }
};

// Horarios de trabajo
export const BUSINESS_HOURS = {
  monday: { open: "08:00", close: "19:00", isOpen: true },
  tuesday: { open: "08:00", close: "19:00", isOpen: true },
  wednesday: { open: "08:00", close: "19:00", isOpen: true },
  thursday: { open: "08:00", close: "19:00", isOpen: true },
  friday: { open: "08:00", close: "19:00", isOpen: true },
  saturday: { open: "08:00", close: "18:00", isOpen: true },
  sunday: { open: "09:00", close: "16:00", isOpen: true }
};

// Horarios disponibles para citas
export const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00'
];

// Horarios para fines de semana (diferentes horarios)
export const weekendTimeSlots = {
  saturday: [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00'
  ],
  sunday: [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00'
  ]
};

// Estados de las citas
export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  NO_SHOW: 'no-show'
};

// Textos de estado
export const STATUS_LABELS = {
  [APPOINTMENT_STATUS.PENDING]: 'Pendiente',
  [APPOINTMENT_STATUS.CONFIRMED]: 'Confirmada',
  [APPOINTMENT_STATUS.CANCELLED]: 'Cancelada',
  [APPOINTMENT_STATUS.COMPLETED]: 'Completada',
  [APPOINTMENT_STATUS.NO_SHOW]: 'No se presentó'
};

// Colores para estados
export const STATUS_COLORS = {
  [APPOINTMENT_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
  [APPOINTMENT_STATUS.CONFIRMED]: 'bg-green-100 text-green-800',
  [APPOINTMENT_STATUS.CANCELLED]: 'bg-red-100 text-red-800',
  [APPOINTMENT_STATUS.COMPLETED]: 'bg-blue-100 text-blue-800',
  [APPOINTMENT_STATUS.NO_SHOW]: 'bg-gray-100 text-gray-800'
};

// Configuración de la aplicación
export const APP_CONFIG = {
  maxAdvanceBookingDays: 30,
  minAdvanceBookingHours: 2,
  appointmentsPerPage: 10,
  autoRefreshInterval: 30000,
  apiBaseUrl: 'http://localhost:3001/api',
};

// Mensajes de la aplicación
export const MESSAGES = {
  success: {
    appointmentBooked: '¡Cita agendada exitosamente! Te contactaremos pronto para confirmar.',
    appointmentCancelled: 'Cita cancelada exitosamente.',
    appointmentUpdated: 'Cita actualizada exitosamente.'
  },
  error: {
    requiredFields: 'Por favor completa todos los campos obligatorios.',
    invalidPhone: 'Ingresa un número de teléfono válido (10 dígitos).',
    invalidEmail: 'Ingresa un email válido.',
    pastDate: 'La fecha no puede ser anterior a hoy.',
    timeNotAvailable: 'Este horario no está disponible. Selecciona otro.',
    networkError: 'Error de conexión. Inténtalo nuevamente.',
    adminPasswordIncorrect: 'Contraseña incorrecta.'
  },
  confirmation: {
    deleteAppointment: '¿Estás seguro de que quieres eliminar esta cita?',
    cancelAppointment: '¿Estás seguro de que quieres cancelar esta cita?'
  }
};

// Configuración de validaciones
export const VALIDATION_RULES = {
  name: {
    minLength: 2,
    maxLength: 50,
    required: true
  },
  phone: {
    pattern: /^\d{10}$/,
    required: true
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    required: false
  },
  message: {
    maxLength: 500,
    required: false
  }
};

// Utilidades para fechas
export const dateUtils = {
  formatDate: (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },
  
  formatTime: (timeString) => {
    return timeString;
  },
  
  isToday: (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  },
  
  isFutureDate: (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  },
  
  getDayOfWeek: (dateString) => {
    const date = new Date(dateString);
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    return days[date.getDay()];
  }
};

// Utilidades para precios
export const priceUtils = {
  formatPrice: (price) => {
    return price.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    });
  },
  
  formatPriceSimple: (price) => {
    return `$${price.toLocaleString('es-CO')}`;
  }
};

// Utilidades para validación
export const validators = {
  isValidPhone: (phone) => {
    return VALIDATION_RULES.phone.pattern.test(phone.replace(/\s/g, ''));
  },
  
  isValidEmail: (email) => {
    return !email || VALIDATION_RULES.email.pattern.test(email);
  },
  
  isValidName: (name) => {
    return name && 
           name.length >= VALIDATION_RULES.name.minLength && 
           name.length <= VALIDATION_RULES.name.maxLength;
  }
};

// Crear el objeto de constantes antes de exportarlo
const constants = {
  BUSINESS_INFO,
  BUSINESS_HOURS,
  timeSlots,
  weekendTimeSlots,
  APPOINTMENT_STATUS,
  STATUS_LABELS,
  STATUS_COLORS,
  APP_CONFIG,
  MESSAGES,
  VALIDATION_RULES,
  dateUtils,
  priceUtils,
  validators
};

export default constants;