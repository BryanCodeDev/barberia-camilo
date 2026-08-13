import React, { useState, useEffect } from 'react';
import { Plus, Loader2, Pencil, Trash2 } from 'lucide-react';
import { api } from '../../services/api';

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
  const [form, setForm] = useState({ name: '', category: 'corte', duration_minutes: 30, price_cents: 0, description: '', is_popular: false, is_active: true });
  const [editingId, setEditingId] = useState(null);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        await api.patch(`/admin/services/${editingId}`, form);
      } else {
        await api.post('/admin/services', form);
      }
      setForm({ name: '', category: 'corte', duration_minutes: 30, price_cents: 0, description: '', is_popular: false, is_active: true });
      setEditingId(null);
      fetchServices();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (service) => {
    setForm({
      name: service.name,
      category: service.category,
      duration_minutes: service.duration_minutes,
      price_cents: service.price_cents,
      description: service.description || '',
      is_popular: !!service.is_popular,
      is_active: !!service.is_active,
    });
    setEditingId(service.id);
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
    <div className="bg-white border border-[#E4DCC9] rounded-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-serif text-xl text-[#1C1A16]">Servicios</h3>
        {userRole === 'admin' && (
          <button
            onClick={() => { setForm({ name: '', category: 'corte', duration_minutes: 30, price_cents: 0, description: '', is_popular: false, is_active: true }); setEditingId(null); }}
            className="bg-[#A9812E] text-[#121113] px-4 py-2 rounded-sm font-semibold text-sm hover:bg-[#C9A860] transition-colors"
          >
            <Plus className="h-4 w-4 mr-2 inline" /> Nuevo Servicio
          </button>
        )}
      </div>
      {error && <div className="bg-[#FBEAEA] border border-[#E3B8B8] text-[#8B2E2E] px-4 py-3 rounded-sm text-sm mb-4">{error}</div>}
      {userRole === 'admin' && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <input className="px-3 py-2 border border-[#E4DCC9] rounded-sm text-sm bg-white" placeholder="Nombre" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <select className="px-3 py-2 border border-[#E4DCC9] rounded-sm text-sm bg-white" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <input type="number" className="px-3 py-2 border border-[#E4DCC9] rounded-sm text-sm bg-white" placeholder="Duración (min)" value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: Number(e.target.value) })} required />
          <input type="number" className="px-3 py-2 border border-[#E4DCC9] rounded-sm text-sm bg-white" placeholder="Precio (cents)" value={form.price_cents} onChange={e => setForm({ ...form, price_cents: Number(e.target.value) })} required />
          <label className="flex items-center gap-2 text-sm text-[#6B6459]">
            <input type="checkbox" checked={form.is_popular} onChange={e => setForm({ ...form, is_popular: e.target.checked })} />
            Popular
          </label>
          <button type="submit" disabled={saving} className="bg-[#A9812E] text-[#121113] px-4 py-2 rounded-sm font-semibold text-sm hover:bg-[#C9A860] transition-colors disabled:opacity-50">
            {editingId ? 'Guardar' : 'Crear'}
          </button>
        </form>
      )}
      <div className="space-y-3">
        {loading && <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#A9812E]" /></div>}
        {services.length === 0 && !loading && <p className="text-[#6B6459] text-sm text-center py-8">No hay servicios registrados.</p>}
        {services.map(service => (
          <div key={service.id} className="border border-[#E4DCC9] rounded-sm p-4 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-[#1C1A16]">{service.name}</h4>
              <p className="text-sm text-[#6B6459]">{service.category} — {service.duration_minutes} min — {formatCOP(service.price_cents)}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-sm text-xs font-medium ${service.is_active ? 'bg-[#EEF5EE] text-[#3E6B3E]' : 'bg-[#FBEAEA] text-[#8B2E2E]'}`}>{service.is_active ? 'Activo' : 'Inactivo'}</span>
            </div>
            {userRole === 'admin' && (
              <div className="flex items-center gap-2">
                <button onClick={() => handleEdit(service)} className="text-[#3B5B8C] hover:bg-[#EEF3FB] p-2 rounded-sm transition-colors" title="Editar">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(service.id)} className="text-[#8B2E2E] hover:bg-[#FBEAEA] p-2 rounded-sm transition-colors" title="Desactivar">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceManager;
