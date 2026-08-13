import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, User, Phone, Mail, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

const BarberManager = () => {
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBarber, setEditingBarber] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', is_active: true });

  const fetchBarbers = async () => {
    try {
      setLoading(true);
      const data = await api.get('/admin/workstations');
      const barberMap = new Map();
      data.forEach(w => {
        if (w.barber_name) {
          if (!barberMap.has(w.barber_name)) {
            barberMap.set(w.barber_name, { id: w.barber_id, name: w.barber_name, workstations: [] });
          }
          barberMap.get(w.barber_name).workstations.push({ id: w.id, name: w.name });
        }
      });
      setBarbers(Array.from(barberMap.values()));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBarbers(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('La creación de barberos requiere soporte en el backend.');
  };

  const handleEdit = (barber) => {
    setEditingBarber(barber);
    setFormData({ name: barber.name, email: barber.email || '', phone: barber.phone || '', is_active: barber.is_active });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar barbero?')) return;
    setError('La eliminación de barberos requiere soporte en el backend.');
  };

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#A9812E]" /></div>;

  return (
    <div className="bg-white border border-[#E4DCC9] rounded-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-serif text-xl text-[#1C1A16]">Barberos</h3>
        <button onClick={() => { setShowForm(true); setEditingBarber(null); setFormData({ name: '', email: '', phone: '', is_active: true }); }} className="bg-[#A9812E] text-[#121113] px-4 py-2 rounded-sm font-semibold text-sm hover:bg-[#C9A860] transition-colors flex items-center">
          <Plus className="h-4 w-4 mr-2" /> Nuevo Barbero
        </button>
      </div>
      {error && <div className="bg-[#FBEAEA] border border-[#E3B8B8] text-[#8B2E2E] px-4 py-3 rounded-sm text-sm mb-4">{error}</div>}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-[#F6F2EA] rounded-sm border border-[#E4DCC9] space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1C1A16] mb-2">Nombre</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-[#E4DCC9] rounded-sm bg-white" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1C1A16] mb-2">Email</label>
            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 border border-[#E4DCC9] rounded-sm bg-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1C1A16] mb-2">Teléfono</label>
            <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 border border-[#E4DCC9] rounded-sm bg-white" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="active" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="h-4 w-4" />
            <label htmlFor="active" className="text-sm text-[#1C1A16]">Activo</label>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-[#A9812E] text-[#121113] px-4 py-2 rounded-sm font-semibold text-sm hover:bg-[#C9A860] transition-colors">
              {editingBarber ? 'Actualizar' : 'Crear'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="border border-[#E4DCC9] text-[#6B6459] px-4 py-2 rounded-sm text-sm hover:border-[#A9812E] transition-colors">Cancelar</button>
          </div>
        </form>
      )}
      <div className="space-y-3">
        {barbers.length === 0 && <p className="text-[#6B6459] text-sm text-center py-8">No hay barberos registrados en estaciones activas.</p>}
        {barbers.map(barber => (
          <div key={barber.id} className="border border-[#E4DCC9] rounded-sm p-4 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-[#1C1A16]">{barber.name}</h4>
              <p className="text-sm text-[#6B6459]">Estaciones: {barber.workstations.map(w => w.name).join(', ')}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(barber)} className="text-[#8B6A22] hover:bg-[#F6F2EA] p-2 rounded-sm transition-colors"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => handleDelete(barber.id)} className="text-[#8B2E2E] hover:bg-[#FBEAEA] p-2 rounded-sm transition-colors"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarberManager;
