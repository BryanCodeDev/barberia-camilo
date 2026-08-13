import React, { useState, useEffect } from 'react';
import { Plus, Loader2, Pencil, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import Modal from '../ui/Modal';
import Input from '../ui/Input';

const CATEGORIES = [
  { value: 'corte', label: 'Corte' },
  { value: 'barba', label: 'Barba' },
  { value: 'cejas', label: 'Cejas' },
  { value: 'combo', label: 'Combo' },
  { value: 'premium', label: 'Premium' },
  { value: 'luxury', label: 'Luxury' },
];

const ServiceManager = ({ userRole }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form, setForm] = useState({ name: '', category: 'corte', duration_minutes: 30, price_cents: 0, description: '', is_popular: false, is_active: true });
  const [saving, setSaving] = useState(false);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await api.get('/admin/services');
      setServices(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const openCreateModal = () => {
    setEditingService(null);
    setForm({ name: '', category: 'corte', duration_minutes: 30, price_cents: 0, description: '', is_popular: false, is_active: true });
    setModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setForm({
      name: service.name,
      category: service.category,
      duration_minutes: service.duration_minutes,
      price_cents: service.price_cents,
      description: service.description || '',
      is_popular: !!service.is_popular,
      is_active: !!service.is_active,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingService) {
        await api.patch(`/admin/services/${editingService.id}`, form);
      } else {
        await api.post('/admin/services', form);
      }
      setModalOpen(false);
      fetchServices();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Desactivar este servicio?')) return;
    try {
      await api.delete(`/admin/services/${id}`);
      fetchServices();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatCOP = (cents) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(cents / 100);
  };

  return (
    <div className="bg-white border border-[#E4DCC9] rounded-lg shadow-sm p-4 sm:p-6 card-hover-lift">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h3 className="font-serif text-xl text-[#1C1A16]">Servicios</h3>
        {userRole === 'admin' && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 bg-[#A9812E] text-[#121113] px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#C9A860] transition-all duration-200 btn-press shadow-sm"
          >
            <Plus className="h-4 w-4" /> Nuevo Servicio
          </button>
        )}
      </div>
      {error && <div className="bg-[#FBEAEA] border border-[#E3B8B8] text-[#8B2E2E] px-4 py-3 rounded-lg text-sm mb-4 animate-fade-in">{error}</div>}
      <div className="space-y-3">
        {loading && <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-[#A9812E]" /></div>}
        {services.length === 0 && !loading && <p className="text-[#6B6459] text-sm text-center py-8">No hay servicios registrados.</p>}
        {services.map(service => (
          <div key={service.id} className="border border-[#E4DCC9] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#A9812E]/40 hover:shadow-md transition-all duration-200">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-[#1C1A16] truncate">{service.name}</h4>
              <p className="text-sm text-[#6B6459] mt-1">{service.category} — {service.duration_minutes} min — {formatCOP(service.price_cents)}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-medium ${service.is_active ? 'bg-[#EEF5EE] text-[#3E6B3E]' : 'bg-[#FBEAEA] text-[#8B2E2E]'}`}>{service.is_active ? 'Activo' : 'Inactivo'}</span>
                {service.is_popular && <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#FBF3E4] text-[#8B6A22]">Popular</span>}
              </div>
            </div>
            {userRole === 'admin' && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => openEditModal(service)} className="p-2.5 text-[#3B5B8C] hover:bg-[#EEF3FB] rounded-lg transition-colors" title="Editar">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(service.id)} className="p-2.5 text-[#8B2E2E] hover:bg-[#FBEAEA] rounded-lg transition-colors" title="Desactivar">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nombre"
              name="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="Ej. Corte de cabello"
            />
            <div>
              <label className="block text-sm font-medium text-[#6B6459] mb-1.5">Categoría</label>
              <select
                className="w-full px-3 py-2.5 border border-[#E4DCC9] rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#A9812E]/40 focus:border-[#A9812E] outline-none transition-all"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <Input
              label="Duración (min)"
              name="duration_minutes"
              type="number"
              value={form.duration_minutes}
              onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
              required
              min="1"
            />
            <Input
              label="Precio (COP)"
              name="price_cents"
              type="number"
              value={form.price_cents}
              onChange={(e) => setForm({ ...form, price_cents: Number(e.target.value) })}
              required
              min="0"
            />
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[#6B6459] mb-1.5">Descripción</label>
              <textarea
                className="w-full px-3 py-2.5 border border-[#E4DCC9] rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#A9812E]/40 focus:border-[#A9812E] outline-none transition-all resize-none"
                rows="3"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Descripción opcional del servicio..."
              />
            </div>
            <div className="sm:col-span-2 flex items-center gap-6">
              <label className="flex items-center gap-2.5 text-sm text-[#6B6459] cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_popular}
                  onChange={(e) => setForm({ ...form, is_popular: e.target.checked })}
                  className="w-4 h-4 rounded border-[#E4DCC9] text-[#A9812E] focus:ring-[#A9812E]"
                />
                <span>Servicio popular</span>
              </label>
              <label className="flex items-center gap-2.5 text-sm text-[#6B6459] cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-[#E4DCC9] text-[#A9812E] focus:ring-[#A9812E]"
                />
                <span>Activo</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-5 py-2.5 border border-[#E4DCC9] rounded-lg text-sm font-medium hover:bg-[#F6F2EA] transition-colors"
            >
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 bg-[#A9812E] text-[#121113] px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#C9A860] transition-all duration-200 disabled:opacity-50 btn-press shadow-sm">
              {saving ? 'Guardando...' : (editingService ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ServiceManager;
