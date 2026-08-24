import React, { useState, useEffect } from 'react';
import { Plus, Loader2, Pencil, Trash2, User as UserIcon, Mail, Phone } from 'lucide-react';
import { api } from '../../services/api';
import Modal from '../ui/Modal';
import Input from '../ui/Input';

const BarberManager = ({ userRole }) => {
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', is_active: true });
  const [saving, setSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const canEdit = userRole === 'admin';

  const fetchBarbers = async () => {
    try {
      setLoading(true);
      const data = await api.get('/admin/barbers');
      setBarbers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBarbers(); }, []);

  const openCreateModal = () => {
    setEditingBarber(null);
    setForm({ name: '', email: '', phone: '', is_active: true });
    setModalOpen(true);
  };

  const openEditModal = (barber) => {
    setEditingBarber(barber);
    setForm({ name: barber.name, email: barber.email || '', phone: barber.phone || '', is_active: !!barber.is_active });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingBarber) {
        await api.patch(`/admin/barbers/${editingBarber.id}`, form);
      } else {
        await api.post('/admin/barbers', form);
      }
      setModalOpen(false);
      fetchBarbers();
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
      await api.delete(`/admin/barbers/${itemToDelete}`);
      fetchBarbers();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-serif text-xl text-ink-soft">Barberos</h3>
          <p className="text-sm text-stone mt-1">Gestiona el equipo de barberos</p>
        </div>
        {canEdit && (
          <button
            onClick={openCreateModal}
            className="btn-primary"
          >
            <Plus className="h-4 w-4" /> Nuevo Barbero
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
          <div className="col-span-full flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        )}
        {barbers.length === 0 && !loading && (
          <div className="col-span-full text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-cream flex items-center justify-center border border-cream-line">
              <UserIcon className="h-8 w-8 text-stone-faint" />
            </div>
            <p className="text-stone text-sm">No hay barberos registrados.</p>
          </div>
        )}
        {barbers.map(barber => (
          <div key={barber.id} className="card-premium p-5 group">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gold/15 to-gold/5 flex items-center justify-center border border-gold/20 flex-shrink-0">
                  <UserIcon className="h-5 w-5 text-gold" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-ink-soft truncate">{barber.name}</h4>
                  <span className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-lg text-xs font-medium ${barber.is_active ? 'bg-status-green/10 text-status-green.deep border border-status-green/20' : 'bg-status-red/10 text-status-red.deep border border-status-red/20'}`}>
                    {barber.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
              {canEdit && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEditModal(barber)}
                    className="action-btn action-btn-edit"
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(barber.id)}
                    className="action-btn action-btn-delete"
                    title="Desactivar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="mt-4 space-y-2">
              {barber.email && (
                <div className="flex items-center gap-2 text-sm text-stone">
                  <Mail className="h-3.5 w-3.5 text-stone-faint flex-shrink-0" />
                  <span className="truncate">{barber.email}</span>
                </div>
              )}
              {barber.phone && (
                <div className="flex items-center gap-2 text-sm text-stone">
                  <Phone className="h-3.5 w-3.5 text-stone-faint flex-shrink-0" />
                  <span className="truncate">{barber.phone}</span>
                </div>
              )}
              {!barber.email && !barber.phone && (
                <p className="text-sm text-stone-faint">Sin informacion de contacto</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBarber ? 'Editar Barbero' : 'Nuevo Barbero'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <Input
              label="Nombre completo"
              name="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="Ej. Juan Perez"
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="correo@ejemplo.com"
            />
            <Input
              label="Telefono"
              name="phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+301 566 7129"
            />
            <label className="flex items-center gap-2.5 text-sm text-stone cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-4 h-4 rounded border-cream-line text-gold focus:ring-gold/40"
              />
              <span>Barbero activo</span>
            </label>
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
              {saving ? 'Guardando...' : (editingBarber ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setItemToDelete(null); }}
        title="Eliminar barbero"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-stone">Esta accion desactivara el barbero permanentemente. No se puede deshacer.</p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setDeleteModalOpen(false); setItemToDelete(null); }}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button type="button" onClick={confirmDelete} className="bg-status-red text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-all">
              Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BarberManager;
