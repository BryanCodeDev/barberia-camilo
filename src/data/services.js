import { APP_CONFIG } from '../utils/constants';
import { api } from '../services/api';

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
    const data = await api.get('/services');
    const transformed = data.map(transformService).filter(Boolean);
    cachedServices = transformed;
    servicesCacheTime = now;
    return transformed;
  } catch (err) {
    throw new Error(err.message || 'Error al cargar servicios');
  }
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
  return (cachedServices || []).filter((s) => s.category === category);
};

export const getPopularServices = () => {
  return (cachedServices || []).filter((s) => s.popular);
};

export const formatPrice = (price) => {
  return price.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  });
};

export default fetchServices;
