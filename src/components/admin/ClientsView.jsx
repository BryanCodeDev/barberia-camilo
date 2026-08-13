import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Search, User, Phone, Calendar, Users, Pencil, Trash2 } from 'lucide-react';
import { api } from '../../services/api';

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
      setForm({ name: '', phone: '', email: '', notes: '' });
      setEditingClient(null);
      fetchClients();
      fetchInactive();
      fetchSummary();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (client) => {
    setForm({ name: client.name, phone: client.phone, email: client.email || '', notes: client.notes || '' });
    setEditingClient(client);
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
      <h2 className="font-serif text-xl sm:text-2xl text-[#1C1A16]">Clientes</h2>

      {error && <div className="bg-[#FBEAEA] border border-[#E3B8B8] text-[#8B2E2E] px-4 py-3 rounded-sm text-sm">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-[#E4DCC9] rounded-sm p-4">
          <p className="text-sm text-[#6B6459]">Nuevos este mes</p>
          <p className="text-2xl font-serif text-[#1C1A16]">{summaryLoading ? '...' : summary?.new_clients ?? 0}</p>
        </div>
        <div className="bg-white border border-[#E4DCC9] rounded-sm p-4">
          <p className="text-sm text-[#6B6459]">Recurrentes este mes</p>
          <p className="text-2xl font-serif text-[#1C1A16]">{summaryLoading ? '...' : summary?.returning_clients ?? 0}</p>
        </div>
      </div>

      <div className="bg-white border border-[#E4DCC9] rounded-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#9A9488]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o teléfono..."
              className="w-full pl-9 pr-4 py-2 border border-[#E4DCC9] rounded-sm text-sm bg-white focus:ring-2 focus:ring-[#A9812E]/40 focus:border-[#A9812E] outline-none"
            />
          </div>
          <div className="flex rounded-sm overflow-hidden border border-[#E4DCC9]">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${filter === 'all' ? 'bg-[#A9812E] text-[#121113]' : 'bg-white text-[#6B6459] hover:text-[#1C1A16]'}`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('inactive')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${filter === 'inactive' ? 'bg-[#A9812E] text-[#121113]' : 'bg-white text-[#6B6459] hover:text-[#1C1A16]'}`}
            >
              Inactivos
            </button>
          </div>
        </div>

        {filter === 'inactive' && (
          <div className="bg-[#FBF3E4] border border-[#EAD9AE] text-[#8B6A22] px-4 py-3 rounded-sm text-sm mb-4">
            Clientes sin visitas hace más de {CLIENTS_INACTIVE_DAYS} días.
          </div>
        )}

        <form onSubmit={handleSubmit} className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 ${userRole !== 'admin' ? 'hidden' : ''}`}>
          <input className="px-3 py-2 border border-[#E4DCC9] rounded-sm text-sm bg-white" placeholder="Nombre" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <input className="px-3 py-2 border border-[#E4DCC9] rounded-sm text-sm bg-white" placeholder="Teléfono" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
          <input className="px-3 py-2 border border-[#E4DCC9] rounded-sm text-sm bg-white" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <input className="px-3 py-2 border border-[#E4DCC9] rounded-sm text-sm bg-white" placeholder="Notas" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          <button type="submit" disabled={saving} className="bg-[#A9812E] text-[#121113] px-4 py-2 rounded-sm font-semibold text-sm hover:bg-[#C9A860] transition-colors disabled:opacity-50">
            {editingClient ? 'Guardar' : 'Crear'}
          </button>
        </form>

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
                  <div className="flex items-center gap-6 text-sm text-[#6B6459]">
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
                      <button onClick={() => handleEdit(client)} className="text-[#3B5B8C] hover:bg-[#EEF3FB] p-2 rounded-sm transition-colors" title="Editar">
                        <Pencil className="h-4 w-4" />
                      </button>
                      {userRole === 'admin' && (
                        <button onClick={() => handleDelete(client.id)} className="text-[#8B2E2E] hover:bg-[#FBEAEA] p-2 rounded-sm transition-colors" title="Eliminar">
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
    </div>
  );
};

export default ClientsView;
