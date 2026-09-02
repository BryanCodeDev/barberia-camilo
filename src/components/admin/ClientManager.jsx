import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Loader2, Pencil, Trash2, User, Phone, Mail, Search } from 'lucide-react';
import { api } from '../../services/api';
import Modal from '../ui/Modal';
import Input from '../ui/Input';

const ClientManager = ({ userRole }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const canEdit = userRole === 'admin';

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get(`/admin/clients?search=${encodeURIComponent(search)}`);
      setClients(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const openCreateModal = () => {
    setEditingClient(null);
    setForm({ name: '', phone: '', email: '', notes: '' });
    setModalOpen(true);
  };

  const openEditModal = (client) => {
    setEditingClient(client);
    setForm({ name: client.name, phone: client.phone, email: client.email || '', notes: client.notes || '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingClient) {
        await api.patch(`/admin/clients/${editingClient.id}`, form);
      } else {
        await api.post('/admin/clients', form);
      }
      setModalOpen(false);
      fetchClients();
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
      await api.delete(`/admin/clients/${itemToDelete}`);
      fetchClients();
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
          <h3 className="font-serif text-xl text-ink-soft">Clientes</h3>
          <p className="text-sm text-stone mt-1">Gestiona los clientes del negocio</p>
        </div>
        {canEdit && (
          <button onClick={openCreateModal} className="btn-primary">
            <Plus className="h-4 w-4" /> Nuevo Cliente
          </button>
        )}
      </div>

      {error && (
        <div className="bg-status-red/10 border border-status-red/20 text-status-red.deep px-4 py-3 rounded-xl text-sm animate-fade-in">
          {error}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-faint" />
        <input
          type="text"
          placeholder="Buscar cliente por nombre o telefono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-4 py-2.5 border border-cream-line rounded-xl text-sm bg-white focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all duration-200 text-ink-soft w-full"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && (
          <div className="col-span-full flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        )}
        {clients.length === 0 && !loading && (
          <div className="col-span-full text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-cream flex items-center justify-center border border-cream-line">
              <User className="h-8 w-8 text-stone-faint" />
            </div>
            <p className="text-stone text-sm">No hay clientes registrados.</p>
          </div>
        )}
        {clients.map((client) => (
          <div key={client.id} className="card-premium p-5 group">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gold/15 to-gold/5 flex items-center justify-center border border-gold/20 flex-shrink-0">
                  <User className="h-5 w-5 text-gold" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-ink-soft truncate">{client.name}</h4>
                  <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-lg text-xs font-medium bg-status-blue/10 text-status-blue.deep border border-status-blue/20">
                    {client.total_visits || 0} visitas
                  </span>
                </div>
              </div>
              {canEdit && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => openEditModal(client)} className="action-btn action-btn-edit" title="Editar">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(client.id)} className="action-btn action-btn-delete" title="Eliminar">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="mt-4 space-y-2">
              {client.phone && (
                <div className="flex items-center gap-2 text-sm text-stone">
                  <Phone className="h-3.5 w-3.5 text-stone-faint flex-shrink-0" />
                  <span className="truncate">{client.phone}</span>
                </div>
              )}
              {client.email && (
                <div className="flex items-center gap-2 text-sm text-stone">
                  <Mail className="h-3.5 w-3.5 text-stone-faint flex-shrink-0" />
                  <span className="truncate">{client.email}</span>
                </div>
              )}
              {!client.phone && !client.email && (
                <p className="text-sm text-stone-faint">Sin informacion de contacto</p>
              )}
              {client.last_visit && (
                <p className="text-xs text-stone-faint">Ultima visita: {(() => {
                  const str = String(client.last_visit);
                  const match = str.match(/(\d{4})-(\d{2})-(\d{2})/);
                  if (!match) return str;
                  const [, year, month, day] = match;
                  const date = new Date(Number(year), Number(month) - 1, Number(day));
                  return date.toLocaleDateString('es-CO');
                })()}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingClient ? 'Editar Cliente' : 'Nuevo Cliente'} size="md">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <Input label="Nombre completo" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Ej. Juan Perez" />
            <Input label="Telefono" name="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required placeholder="3001234567" />
            <Input label="Email" name="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="correo@ejemplo.com" />
            <div>
              <label className="block text-sm font-medium text-[#1C1A16] mb-2">Notas</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Observaciones adicionales..."
                className="w-full px-4 py-3 border border-[#E4DCC9] rounded-lg focus:ring-2 focus:ring-[#A9812E]/40 focus:border-[#A9812E] outline-none transition-all text-sm"
                rows="3"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? 'Guardando...' : (editingClient ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setItemToDelete(null); }}
        title="Eliminar cliente"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-stone">Esta accion eliminara el cliente permanentemente. No se puede deshacer.</p>
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

export default ClientManager;
