import React, { useState, useEffect } from 'react';
import { Plus, Loader2, Pencil, Trash2 } from 'lucide-react';
import { api } from '../../services/api';

const BarberManager = ({ userRole }) => {
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', is_active: true });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        await api.patch(`/admin/barbers/${editingId}`, form);
      } else {
        await api.post('/admin/barbers', form);
      }
      setForm({ name: '', email: '', phone: '', is_active: true });
      setEditingId(null);
      fetchBarbers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (barber) => {
    setForm({ name: barber.name, email: barber.email || '', phone: barber.phone || '', is_active: !!barber.is_active });
    setEditingId(barber.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Desactivar este barbero?')) return;
    try {
      await api.delete(`/admin/barbers/${id}`);
      fetchBarbers();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white border border-[#E4DCC9] rounded-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-serif text-xl text-[#1C1A16]">Barberos</h3>
        {canEdit && (
          <button
            onClick={() => { setForm({ name: '', email: '', phone: '', is_active: true }); setEditingId(null); }}
            className="bg-[#A9812E] text-[#121113] px-4 py-2 rounded-sm font-semibold text-sm hover:bg-[#C9A860] transition-colors"
          >
            <Plus className="h-4 w-4 mr-2 inline" /> Nuevo Barbero
          </button>
        )}
      </div>
      {error && <div className="bg-[#FBEAEA] border border-[#E3B8B8] text-[#8B2E2E] px-4 py-3 rounded-sm text-sm mb-4">{error}</div>}
      {canEdit && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <input className="px-3 py-2 border border-[#E4DCC9] rounded-sm text-sm bg-white" placeholder="Nombre" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <input className="px-3 py-2 border border-[#E4DCC9] rounded-sm text-sm bg-white" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <input className="px-3 py-2 border border-[#E4DCC9] rounded-sm text-sm bg-white" placeholder="Teléfono" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <label className="flex items-center gap-2 text-sm text-[#6B6459]">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
            Activo
          </label>
          <button type="submit" disabled={saving} className="bg-[#A9812E] text-[#121113] px-4 py-2 rounded-sm font-semibold text-sm hover:bg-[#C9A860] transition-colors disabled:opacity-50">
            {editingId ? 'Guardar' : 'Crear'}
          </button>
        </form>
      )}
      <div className="space-y-3">
        {loading && <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#A9812E]" /></div>}
        {barbers.length === 0 && !loading && <p className="text-[#6B6459] text-sm text-center py-8">No hay barberos registrados.</p>}
        {barbers.map(barber => (
          <div key={barber.id} className="border border-[#E4DCC9] rounded-sm p-4 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-[#1C1A16]">{barber.name}</h4>
              <p className="text-sm text-[#6B6459]">{barber.email || 'Sin email'} — {barber.phone || 'Sin teléfono'}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-sm text-xs font-medium ${barber.is_active ? 'bg-[#EEF5EE] text-[#3E6B3E]' : 'bg-[#FBEAEA] text-[#8B2E2E]'}`}>{barber.is_active ? 'Activo' : 'Inactivo'}</span>
            </div>
            {canEdit && (
              <div className="flex items-center gap-2">
                <button onClick={() => handleEdit(barber)} className="text-[#3B5B8C] hover:bg-[#EEF3FB] p-2 rounded-sm transition-colors" title="Editar">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(barber.id)} className="text-[#8B2E2E] hover:bg-[#FBEAEA] p-2 rounded-sm transition-colors" title="Desactivar">
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

export default BarberManager;
