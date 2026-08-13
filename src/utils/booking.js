// src/utils/booking.js
//
// Punto único para abrir el modal de reserva (BookingForm) desde
// cualquier componente: Navbar, HeroSection, ServicesSection, ServiceCard, etc.
// Antes cada uno tenía su propia forma de hacerlo (evento vs. prop),
// esto lo deja en un solo lugar para evitar lógica duplicada.

export const BOOKING_EVENT = 'openBooking';

/**
 * Abre el modal de reserva. Si se pasa un servicio, el formulario
 * arranca con ese servicio ya seleccionado (salta el paso 1).
 */
export function openBooking(service = null) {
  window.dispatchEvent(new CustomEvent(BOOKING_EVENT, { detail: { service } }));
}

/**
 * Se suscribe a las solicitudes de apertura del modal.
 * Úsalo una sola vez, en el componente que controla el estado del modal (App.jsx).
 * Devuelve una función para des-suscribirse.
 */
export function onBookingRequested(callback) {
  const handler = (event) => callback(event.detail?.service ?? null);
  window.addEventListener(BOOKING_EVENT, handler);
  return () => window.removeEventListener(BOOKING_EVENT, handler);
}