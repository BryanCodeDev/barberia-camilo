import React, { useState, useEffect } from 'react';
import { Plus, Loader2, Pencil, Trash2 } from 'lucide-react';
import { api } from '../../services/api';

const WorkstationManager = ({ userRole }) => {
  const [workstations, setWorkstations] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', barber_id: '', is_active: true });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

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
      if (editingId) {
        await api.patch(`/admin/workstations/${editingId}`, payload);
      } else {
        await api.post('/admin/workstations', payload);
      }
      setForm({ name: '', barber_id: '', is_active: true });
      setEditingId(null);
      fetchWorkstations();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (ws) => {
    setForm({ name: ws.name, barber_id: ws.barber_id || '', is_active: !!ws.is_active });
    setEditingId(ws.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Desactivar esta estación?')) return;
    try {
      await api.delete(`/admin/workstations/${id}`);
      fetchWorkstations();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white border border-[#E4DCC9] rounded-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-serif text-xl text-[#1C1A16]">Estaciones de Trabajo</h3>
        {userRole === 'admin' && (
          <button
            onClick={() => { setForm({ name: '', barber_id: '', is_active: true }); setEditingId(null); }}
            className="bg-[#A9812E] text-[#121113] px-4 py-2 rounded-sm font-semibold text-sm hover:bg-[#C9A860] transition-colors"
          >
            <Plus className="h-4 w-4 mr-2 inline" /> Nueva Estación
          </button>
        )}
      </div>
      {error && <div className="bg-[#FBEAEA] border border-[#E3B8B8] text-[#8B2E2E] px-4 py-3 rounded-sm text-sm mb-4">{error}</div>}
      {userRole === 'admin' && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <input className="px-3 py-2 border border-[#E4DCC9] rounded-sm text-sm bg-white" placeholder="Nombre estación" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <select className="px-3 py-2 border border-[#E4DCC9] rounded-sm text-sm bg-white" value={form.barber_id} onChange={e => setForm({ ...form, barber_id: e.target.value })}>
            <option value="">Sin barbero</option>
            {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm text-[#6B6459]">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
            Activa
          </label>
          <button type="submit" disabled={saving} className="bg-[#A9812E] text-[#121113] px-4 py-2 rounded-sm font-semibold text-sm hover:bg-[#C9A860] transition-colors disabled:opacity-50">
            {editingId ? 'Guardar' : 'Crear'}
          </button>
        </form>
      )}
      <div className="space-y-3">
        {loading && <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#A9812E]" /></div>}
        {workstations.length === 0 && !loading && <p className="text-[#6B6459] text-sm text-center py-8">No hay estaciones registradas.</p>}
        {workstations.map(ws => (
          <div key={ws.id} className="border border-[#E4DCC9] rounded-sm p-4 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-[#1C1A16]">{ws.name}</h4>
              <p className="text-sm text-[#6B6459]">Barbero: {ws.barber_name || 'Sin asignar'}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-sm text-xs font-medium ${ws.is_active ? 'bg-[#EEF5EE] text-[#3E6B3E]' : 'bg-[#FBEAEA] text-[#8B2E2E]'}`}>{ws.is_active ? 'Activa' : 'Inactiva'}</span>
            </div>
            {userRole === 'admin' && (
              <div className="flex items-center gap-2">
                <button onClick={() => handleEdit(ws)} className="text-[#3B5B8C] hover:bg-[#EEF3FB] p-2 rounded-sm transition-colors" title="Editar">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(ws.id)} className="text-[#8B2E2E] hover:bg-[#FBEAEA] p-2 rounded-sm transition-colors" title="Desactivar">
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

export default WorkstationManager;
