import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Scissors, Clock, DollarSign } from 'lucide-react';
import { api } from '../../services/api';
import Modal from '../ui/Modal';
import Input from '../ui/Input';

const CATEGORIES = [
  { value: 'corte', label: 'Corte', color: 'bg-status-blue/10 text-status-blue.deep border-status-blue/20' },
  { value: 'barba', label: 'Barba', color: 'bg-status-amber/10 text-status-amber.deep border-status-amber/20' },
  { value: 'cejas', label: 'Cejas', color: 'bg-status-green/10 text-status-green.deep border-status-green/20' },
  { value: 'combo', label: 'Combo', color: 'bg-status-red/10 text-status-red.deep border-status-red/20' },
  { value: 'premium', label: 'Premium', color: 'bg-gold/10 text-gold-deep border-gold/20' },
  { value: 'luxury', label: 'Luxury', color: 'bg-ink-soft/5 text-ink-soft border-ink-soft/10' },
];

const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.value, c]));

const SkeletonServiceCard = () => (
  <div className="card-premium p-5">
    <div className="h-4 w-40 skeleton-pulse rounded-lg mb-3" />
    <div className="flex items-center gap-3">
      <div className="h-3 w-16 skeleton-pulse rounded-lg" />
      <div className="h-3 w-20 skeleton-pulse rounded-lg" />
    </div>
  </div>
);

const ServiceManager = ({ userRole }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form, setForm] = useState({ name: '', category: 'corte', duration_minutes: 30, price_cents: 0, description: '', is_popular: false });
  const [saving, setSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

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
    setForm({ name: '', category: 'corte', duration_minutes: 30, price_cents: 0, description: '', is_popular: false });
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
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await api.delete(`/admin/services/${itemToDelete}`);
      fetchServices();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const formatCOP = (cents) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(cents);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-serif text-xl text-ink-soft">Servicios</h3>
          <p className="text-sm text-stone mt-1">Catalogo de servicios disponibles</p>
        </div>
        {userRole === 'admin' && (
          <button
            onClick={openCreateModal}
            className="btn-primary"
          >
            <Plus className="h-4 w-4" /> Nuevo Servicio
          </button>
        )}
      </div>

      {error && (
        <div className="bg-status-red/10 border border-status-red/20 text-status-red.deep px-4 py-3 rounded-xl text-sm animate-fade-in">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading && (
          <>
            <SkeletonServiceCard />
            <SkeletonServiceCard />
          </>
        )}
        {services.length === 0 && !loading && (
          <div className="col-span-full text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-cream flex items-center justify-center border border-cream-line">
              <Scissors className="h-8 w-8 text-stone-faint" />
            </div>
            <p className="text-stone text-sm">No hay servicios registrados.</p>
          </div>
        )}
        {!loading && services.map((service, idx) => {
          const cat = CATEGORY_MAP[service.category];
          return (
            <div
              key={service.id}
              className="card-premium p-5 group hover:-translate-y-0.5 transition-all duration-200 animate-fade-in"
              style={{ animationDelay: `${Math.min(idx, 8) * 40}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h4 className="font-semibold text-ink-soft truncate">{service.name}</h4>
                    {cat && (
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-medium border ${cat.color}`}>
                        {cat.label}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-stone">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-stone-faint" />
                      {service.duration_minutes} min
                    </span>
                    <span className="flex items-center gap-1.5 font-medium text-ink-soft">
                      <DollarSign className="h-3.5 w-3.5 text-gold" />
                      {formatCOP(service.price_cents)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    {service.is_popular && (
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-gold/10 text-gold-deep border border-gold/20">
                        Popular
                      </span>
                    )}
                  </div>
                </div>
                {userRole === 'admin' && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEditModal(service)}
                      className="action-btn action-btn-edit"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="action-btn action-btn-delete"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
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
              <label className="block text-sm font-medium text-stone mb-1.5">Categoria</label>
              <select
                className="w-full px-3 py-2.5 border border-cream-line rounded-xl text-sm bg-white focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all duration-200 text-ink-soft"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <Input
              label="Duracion (min)"
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
              <label className="block text-sm font-medium text-stone mb-1.5">Descripcion</label>
              <textarea
                className="w-full px-3 py-2.5 border border-cream-line rounded-xl text-sm bg-white focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all duration-200 resize-none text-ink-soft"
                rows="3"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Descripcion opcional del servicio..."
              />
            </div>
            <div className="sm:col-span-2 flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2.5 text-sm text-stone cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_popular}
                  onChange={(e) => setForm({ ...form, is_popular: e.target.checked })}
                  className="w-4 h-4 rounded border-cream-line text-gold focus:ring-gold/40"
                />
                <span>Servicio popular</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? 'Guardando...' : (editingService ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setItemToDelete(null); }}
        title="Eliminar servicio"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-stone">Esta accion eliminara el servicio permanentemente. No se puede deshacer.</p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setDeleteModalOpen(false); setItemToDelete(null); }}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button type="button" onClick={confirmDelete} className="bg-status-red text-black px-4 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-all">
              Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ServiceManager;