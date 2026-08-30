import React, { useState, useEffect } from 'react';
import { Plus, Loader2, Pencil, Trash2, Monitor, User as UserIcon } from 'lucide-react';
import { api } from '../../services/api';
import Modal from '../ui/Modal';
import Input from '../ui/Input';

const WorkstationManager = ({ userRole }) => {
  const [workstations, setWorkstations] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWorkstation, setEditingWorkstation] = useState(null);
  const [form, setForm] = useState({ name: '', barber_id: '', is_active: true });
  const [saving, setSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchWorkstations = async () => {
    try {
      setLoading(true);
      const data = await api.get('/admin/workstations');
      setWorkstations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBarbers = async () => {
    try {
      const data = await api.get('/admin/barbers');
      setBarbers(data);
    } catch (err) {
      console.error('Error fetching barbers:', err);
    }
  };

  useEffect(() => { fetchWorkstations(); fetchBarbers(); }, []);

  const openCreateModal = () => {
    setEditingWorkstation(null);
    setForm({ name: '', barber_id: '', is_active: true });
    setModalOpen(true);
  };

  const openEditModal = (ws) => {
    setEditingWorkstation(ws);
    setForm({ name: ws.name, barber_id: ws.barber_id || '', is_active: !!ws.is_active });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        barber_id: form.barber_id ? Number(form.barber_id) : null,
        is_active: form.is_active,
      };
      if (editingWorkstation) {
        await api.patch(`/admin/workstations/${editingWorkstation.id}`, payload);
      } else {
        await api.post('/admin/workstations', payload);
      }
      setModalOpen(false);
      fetchWorkstations();
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
      await api.delete(`/admin/workstations/${itemToDelete}`);
      fetchWorkstations();
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
          <h3 className="font-serif text-xl text-ink-soft">Estaciones de Trabajo</h3>
          <p className="text-sm text-stone mt-1">Administra las estaciones y asignaciones</p>
        </div>
        {userRole === 'admin' && (
          <button
            onClick={openCreateModal}
            className="btn-primary"
          >
            <Plus className="h-4 w-4" /> Nueva Estacion
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
        {workstations.length === 0 && !loading && (
          <div className="col-span-full text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-cream flex items-center justify-center border border-cream-line">
              <Monitor className="h-8 w-8 text-stone-faint" />
            </div>
            <p className="text-stone text-sm">No hay estaciones registradas.</p>
          </div>
        )}
        {workstations.map(ws => (
          <div key={ws.id} className="card-premium p-5 group">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-status-blue/15 to-status-blue/5 flex items-center justify-center border border-status-blue/20 flex-shrink-0">
                  <Monitor className="h-5 w-5 text-status-blue.deep" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-ink-soft truncate">{ws.name}</h4>
                  <span className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-lg text-xs font-medium ${ws.is_active ? 'bg-status-green/10 text-status-green.deep border border-status-green/20' : 'bg-status-red/10 text-status-red.deep border border-status-red/20'}`}>
                    {ws.is_active ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
              </div>
              {userRole === 'admin' && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEditModal(ws)}
                    className="action-btn action-btn-edit"
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(ws.id)}
                    className="action-btn action-btn-delete"
                    title="Desactivar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-stone">
              <UserIcon className="h-3.5 w-3.5 text-stone-faint flex-shrink-0" />
              <span className={ws.barber_name ? '' : 'text-stone-faint italic'}>
                {ws.barber_name || 'Sin barbero asignado'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingWorkstation ? 'Editar Estacion' : 'Nueva Estacion'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <Input
              label="Nombre de la estacion"
              name="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="Ej. Estacion 1"
            />
            <div>
              <label className="block text-sm font-medium text-stone mb-1.5">Barbero asignado</label>
              <select
                className="w-full px-3 py-2.5 border border-cream-line rounded-xl text-sm bg-white focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all duration-200 text-ink-soft"
                value={form.barber_id}
                onChange={(e) => setForm({ ...form, barber_id: e.target.value })}
              >
                <option value="">Sin barbero</option>
                {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2.5 text-sm text-stone cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-4 h-4 rounded border-cream-line text-gold focus:ring-gold/40"
              />
              <span>Estacion activa</span>
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
              {saving ? 'Guardando...' : (editingWorkstation ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setItemToDelete(null); }}
        title="Eliminar estacion"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-stone">Esta accion desactivara la estacion permanentemente. No se puede deshacer.</p>
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

export default WorkstationManager;
