const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

let cachedServices = null;
let servicesCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000;

function transformService(backendService) {
  if (!backendService) return null;
  const minutes = backendService.duration_minutes || 30;
  let duration = `${minutes} min`;
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    duration = mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  }
  return {
    id: backendService.id,
    name: backendService.name,
    duration: duration,
    price: backendService.price_cents || 0,
    category: backendService.category,
    description: backendService.description || '',
    popular: Boolean(backendService.is_popular),
  };
}

export async function fetchServices() {
  const now = Date.now();
  if (cachedServices && now - servicesCacheTime < CACHE_DURATION) {
    return cachedServices;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/services`);
    if (!response.ok) throw new Error('Error al cargar servicios');
    const data = await response.json();
    const transformed = data.map(transformService).filter(Boolean);
    cachedServices = transformed;
    servicesCacheTime = now;
    return transformed;
  } catch (err) {
    console.error('Error fetching services:', err);
    return getFallbackServices();
  }
}

function getFallbackServices() {
  return [
    { id: 1, name: "Corte Básico", duration: "35 min", price: 30000, category: "corte", description: "Tu corte básico con el trato que mereces.", popular: true },
    { id: 2, name: "Perfilación de Barba", duration: "25 min", price: 30000, category: "barba", description: "Definición precisa de la barba con máquina y navaja.", popular: true },
    { id: 3, name: "Corte y Cejas", duration: "40 min", price: 36000, category: "combo", description: "Corte profesional y diseño de cejas.", popular: true },
    { id: 4, name: "Perfilación de Cejas", duration: "10 min", price: 10000, category: "cejas", description: "Diseño y perfilado de cejas." },
    { id: 5, name: "Corte y Rasurada", duration: "40 min", price: 40000, category: "combo", description: "Corte a medida y rasurada clásica." },
    { id: 6, name: "Corte y Barba (Perfilada)", duration: "45 min", price: 50000, category: "combo", description: "Corte personalizado y perfilado de barba." },
    { id: 7, name: "Corte Premium", duration: "60 min", price: 55000, category: "premium", description: "Corte con estilo y tratamiento premium." },
    { id: 8, name: "Corte Premium Completo", duration: "60 min", price: 65000, category: "premium", description: "Servicio completo de corte premium." },
    { id: 9, name: "Corte y Barba a Vapor", duration: "60 min", price: 75000, category: "premium", description: "Corte y barba con tratamiento a vapor." },
    { id: 10, name: "Corte y Barba + Exfoliación", duration: "80 min", price: 95000, category: "luxury", description: "Corte impecable con exfoliación facial." },
    { id: 11, name: "Experiencia Luxury Completa", duration: "90 min", price: 120000, category: "luxury", description: "Servicio integral de alto nivel." },
  ];
}

export const serviceCategories = {
  corte: { name: "Cortes", color: "blue", icon: "✂️" },
  barba: { name: "Barba", color: "orange", icon: "🧔" },
  cejas: { name: "Cejas", color: "green", icon: "👁️" },
  combo: { name: "Combos", color: "purple", icon: "💫" },
  premium: { name: "Premium", color: "amber", icon: "⭐" },
  luxury: { name: "Luxury", color: "gold", icon: "👑" },
};

export const getServicesByCategory = (category) => {
  return getFallbackServices().filter((s) => s.category === category);
};

export const getPopularServices = () => {
  return getFallbackServices().filter((s) => s.popular);
};

export const formatPrice = (price) => {
  return price.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  });
};

export default getFallbackServices;
