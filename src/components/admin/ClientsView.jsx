import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Search, User, Phone, Calendar, Users, Pencil, Trash2, Plus } from 'lucide-react';
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
    if (!window.confirm('¿Eliminar este cliente? Esta acción no se puede deshacer.')) return;
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
        <h2 className="font-serif text-xl sm:text-2xl text-[#1C1A16]">Clientes</h2>
        {userRole === 'admin' && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 bg-[#A9812E] text-[#121113] px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#C9A860] transition-all duration-200 btn-press shadow-sm"
          >
            <Plus className="h-4 w-4" /> Nuevo Cliente
          </button>
        )}
      </div>

      {error && <div className="bg-[#FBEAEA] border border-[#E3B8B8] text-[#8B2E2E] px-4 py-3 rounded-lg text-sm animate-fade-in">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-[#E4DCC9] rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
          <p className="text-sm text-[#6B6459]">Nuevos este mes</p>
          <p className="text-2xl font-serif text-[#1C1A16]">{summaryLoading ? '...' : summary?.new_clients ?? 0}</p>
        </div>
        <div className="bg-white border border-[#E4DCC9] rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
          <p className="text-sm text-[#6B6459]">Recurrentes este mes</p>
          <p className="text-2xl font-serif text-[#1C1A16]">{summaryLoading ? '...' : summary?.returning_clients ?? 0}</p>
        </div>
      </div>

      <div className="bg-white border border-[#E4DCC9] rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#9A9488]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o teléfono..."
              className="w-full pl-9 pr-4 py-2.5 border border-[#E4DCC9] rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#A9812E]/40 focus:border-[#A9812E] outline-none transition-all"
            />
          </div>
          <div className="flex rounded-lg overflow-hidden border border-[#E4DCC9]">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium transition-all ${filter === 'all' ? 'bg-[#A9812E] text-[#121113]' : 'bg-white text-[#6B6459] hover:text-[#1C1A16]'}`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('inactive')}
              className={`px-4 py-2 text-sm font-medium transition-all ${filter === 'inactive' ? 'bg-[#A9812E] text-[#121113]' : 'bg-white text-[#6B6459] hover:text-[#1C1A16]'}`}
            >
              Inactivos
            </button>
          </div>
        </div>

        {filter === 'inactive' && (
          <div className="bg-[#FBF3E4] border border-[#EAD9AE] text-[#8B6A22] px-4 py-3 rounded-lg text-sm mb-4 animate-fade-in">
            Clientes sin visitas hace más de {CLIENTS_INACTIVE_DAYS} días.
          </div>
        )}

        {loading && filter === 'all' ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#A9812E]" />
          </div>
        ) : inactiveLoading && filter === 'inactive' ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#A9812E]" />
          </div>
        ) : (
          <div className="divide-y divide-[#E4DCC9]">
            {(filter === 'all' ? clients : inactiveClients).length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-[#D8D3C7] mx-auto mb-4" />
                <p className="text-sm text-[#6B6459]">
                  {filter === 'all' ? 'No se encontraron clientes.' : 'No hay clientes inactivos en este período.'}
                </p>
              </div>
            )}
            {(filter === 'all' ? clients : inactiveClients).map((client) => (
              <div key={client.id} className="p-4 hover:bg-[#F6F2EA]/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-[#A9812E]/10 p-2 rounded-full flex-shrink-0">
                      <User className="h-4 w-4 text-[#8B6A22]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1C1A16]">{client.name}</h4>
                      <div className="flex items-center text-sm text-[#6B6459] mt-1">
                        <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span>{client.phone}</span>
                      </div>
                      {client.email && (
                        <p className="text-xs text-[#9A9488] mt-1">{client.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-[#6B6459]">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{client.total_appointments || client.total_visits || 0} visitas</span>
                    </div>
                    <div className="text-xs">
                      Última: {formatDate(filter === 'inactive' ? client.last_visit : (client.last_appointment_date || client.last_visit))}
                    </div>
                    {filter === 'inactive' && client.days_since_last_visit && (
                      <span className="text-xs text-[#8B2E2E] font-medium">Hace {client.days_since_last_visit} días</span>
                    )}
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEditModal(client)} className="p-2 text-[#3B5B8C] hover:bg-[#EEF3FB] rounded-lg transition-colors" title="Editar">
                        <Pencil className="h-4 w-4" />
                      </button>
                      {userRole === 'admin' && (
                        <button onClick={() => handleDelete(client.id)} className="p-2 text-[#8B2E2E] hover:bg-[#FBEAEA] rounded-lg transition-colors" title="Eliminar">
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <Input
              label="Nombre completo"
              name="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="Ej. María García"
            />
            <Input
              label="Teléfono"
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
              <label className="block text-sm font-medium text-[#6B6459] mb-1.5">Notas</label>
              <textarea
                className="w-full px-3 py-2.5 border border-[#E4DCC9] rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#A9812E]/40 focus:border-[#A9812E] outline-none transition-all resize-none"
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
              className="px-5 py-2.5 border border-[#E4DCC9] rounded-lg text-sm font-medium hover:bg-[#F6F2EA] transition-colors"
            >
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 bg-[#A9812E] text-[#121113] px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#C9A860] transition-all duration-200 disabled:opacity-50 btn-press shadow-sm">
              {saving ? 'Guardando...' : (editingClient ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClientsView;
