import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Search, User, Phone, Calendar, Users, Pencil, Trash2, Plus, UserPlus, UserCheck } from 'lucide-react';
import { api } from '../../services/api';
import Modal from '../ui/Modal';
import Input from '../ui/Input';

const CLIENTS_INACTIVE_DAYS = 40;

const ClientsView = ({ userRole }) => {
  const [clients, setClients] = useState([]);
  const [inactiveClients, setInactiveClients] = useState([]);
  const [summary, setSummary] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [inactiveLoading, setInactiveLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' });
  const [saving, setSaving] = useState(false);

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

  const fetchInactive = useCallback(async () => {
    try {
      setInactiveLoading(true);
      const data = await api.get(`/admin/clients/inactive?days=${CLIENTS_INACTIVE_DAYS}`);
      setInactiveClients(data);
    } catch (err) {
      console.error('Error fetching inactive clients:', err);
    } finally {
      setInactiveLoading(false);
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const data = await api.get('/admin/clients/summary?period=month');
      setSummary(data);
    } catch (err) {
      console.error('Error fetching clients summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    fetchInactive();
    fetchSummary();
  }, [fetchInactive, fetchSummary]);

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
      fetchInactive();
      fetchSummary();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Eliminar este cliente? Esta accion no se puede deshacer.')) return;
    try {
      await api.delete(`/admin/clients/${id}`);
      fetchClients();
      fetchInactive();
      fetchSummary();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="section-title">Clientes</h2>
          <p className="text-sm text-stone mt-1">Gestiona la base de clientes</p>
        </div>
        {userRole === 'admin' && (
          <button
            onClick={openCreateModal}
            className="btn-primary"
          >
            <Plus className="h-4 w-4" /> Nuevo Cliente
          </button>
        )}
      </div>

      {error && (
        <div className="bg-status-red/10 border border-status-red/20 text-status-red.deep px-4 py-3 rounded-xl text-sm animate-fade-in">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="kpi-card bg-gradient-to-br from-status-green/10 to-status-green/5 border-status-green/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-status-green/15 text-status-green.deep">
              <UserPlus className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-stone">Nuevos este mes</p>
          </div>
          <p className="text-2xl font-serif text-ink-soft">{summaryLoading ? '...' : summary?.new_clients ?? 0}</p>
        </div>
        <div className="kpi-card bg-gradient-to-br from-status-blue/10 to-status-blue/5 border-status-blue/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-status-blue/15 text-status-blue.deep">
              <UserCheck className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-stone">Recurrentes este mes</p>
          </div>
          <p className="text-2xl font-serif text-ink-soft">{summaryLoading ? '...' : summary?.returning_clients ?? 0}</p>
        </div>
      </div>

      <div className="card-premium p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-faint" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o telefono..."
              className="w-full pl-9 pr-4 py-2.5 border border-cream-line rounded-xl text-sm bg-white focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all duration-200 text-ink-soft placeholder:text-stone-faint"
            />
          </div>
          <div className="flex rounded-xl overflow-hidden border border-cream-line bg-white">
            <button
              onClick={() => setFilter('all')}
              className={[
                'px-4 py-2 text-sm font-medium transition-all duration-200',
                filter === 'all' ? 'bg-gold text-ink shadow-sm' : 'text-stone hover:text-ink-soft',
              ].join(' ')}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('inactive')}
              className={[
                'px-4 py-2 text-sm font-medium transition-all duration-200',
                filter === 'inactive' ? 'bg-gold text-ink shadow-sm' : 'text-stone hover:text-ink-soft',
              ].join(' ')}
            >
              Inactivos
            </button>
          </div>
        </div>

        {filter === 'inactive' && (
          <div className="bg-status-amber/10 border border-status-amber/20 text-status-amber.deep px-4 py-3 rounded-xl text-sm mb-4 animate-fade-in">
            Clientes sin visitas hace mas de {CLIENTS_INACTIVE_DAYS} dias.
          </div>
        )}

        {loading && filter === 'all' ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : inactiveLoading && filter === 'inactive' ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : (
          <div className="divide-y divide-cream-line">
            {(filter === 'all' ? clients : inactiveClients).length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-cream flex items-center justify-center border border-cream-line">
                  <Users className="h-8 w-8 text-stone-faint" />
                </div>
                <p className="text-sm text-stone">
                  {filter === 'all' ? 'No se encontraron clientes.' : 'No hay clientes inactivos en este periodo.'}
                </p>
              </div>
            )}
            {(filter === 'all' ? clients : inactiveClients).map((client) => (
              <div key={client.id} className="p-4 hover:bg-cream/50 transition-colors duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold/15 to-gold/5 flex items-center justify-center flex-shrink-0 border border-gold/20">
                      <User className="h-5 w-5 text-gold" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-ink-soft">{client.name}</h4>
                      <div className="flex items-center text-sm text-stone mt-1">
                        <Phone className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-stone-faint" />
                        <span>{client.phone}</span>
                      </div>
                      {client.email && (
                        <p className="text-xs text-stone-faint mt-1">{client.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-stone">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-stone-faint" />
                      <span>{client.total_appointments || client.total_visits || 0} visitas</span>
                    </div>
                    <div className="text-xs">
                      Ultima: {formatDate(filter === 'inactive' ? client.last_visit : (client.last_appointment_date || client.last_visit))}
                    </div>
                    {filter === 'inactive' && client.days_since_last_visit && (
                      <span className="text-xs text-status-red.deep font-medium">Hace {client.days_since_last_visit} dias</span>
                    )}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(client)}
                        className="action-btn action-btn-edit"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {userRole === 'admin' && (
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="action-btn action-btn-delete"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
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
              placeholder="Ej. Maria Garcia"
            />
            <Input
              label="Telefono"
              name="phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
              placeholder="+57 300 123 4567"
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="correo@ejemplo.com"
            />
            <div>
              <label className="block text-sm font-medium text-stone mb-1.5">Notas</label>
              <textarea
                className="w-full px-3 py-2.5 border border-cream-line rounded-xl text-sm bg-white focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all duration-200 resize-none text-ink-soft"
                rows="3"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Notas adicionales sobre el cliente..."
              />
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
              {saving ? 'Guardando...' : (editingClient ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClientsView;
