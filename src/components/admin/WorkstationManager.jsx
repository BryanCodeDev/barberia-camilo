import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, Scissors } from 'lucide-react';
import { api } from '../../services/api';

const WorkstationManager = () => {
  const [workstations, setWorkstations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingWorkstation, setEditingWorkstation] = useState(null);
  const [formData, setFormData] = useState({ name: '', barber_id: '', is_active: true });

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

  useEffect(() => { fetchWorkstations(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('La gestión de estaciones requiere soporte en el backend.');
  };

  const handleEdit = (ws) => {
    setEditingWorkstation(ws);
    setFormData({ name: ws.name, barber_id: ws.barber_id || '', is_active: ws.is_active });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar estación de trabajo?')) return;
    setError('La eliminación de estaciones requiere soporte en el backend.');
  };

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#A9812E]" /></div>;

  return (
    <div className="bg-white border border-[#E4DCC9] rounded-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-serif text-xl text-[#1C1A16]">Estaciones de Trabajo</h3>
        <button onClick={() => { setShowForm(true); setEditingWorkstation(null); setFormData({ name: '', barber_id: '', is_active: true }); }} className="bg-[#A9812E] text-[#121113] px-4 py-2 rounded-sm font-semibold text-sm hover:bg-[#C9A860] transition-colors flex items-center">
          <Plus className="h-4 w-4 mr-2" /> Nueva Estación
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
            <label className="block text-sm font-medium text-[#1C1A16] mb-2">Barbero asignado</label>
            <select value={formData.barber_id} onChange={e => setFormData({...formData, barber_id: e.target.value})} className="w-full px-4 py-2 border border-[#E4DCC9] rounded-sm bg-white">
              <option value="">Sin asignar</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="active" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="h-4 w-4" />
            <label htmlFor="active" className="text-sm text-[#1C1A16]">Activa</label>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-[#A9812E] text-[#121113] px-4 py-2 rounded-sm font-semibold text-sm hover:bg-[#C9A860] transition-colors">
              {editingWorkstation ? 'Actualizar' : 'Crear'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="border border-[#E4DCC9] text-[#6B6459] px-4 py-2 rounded-sm text-sm hover:border-[#A9812E] transition-colors">Cancelar</button>
          </div>
        </form>
      )}
      <div className="space-y-3">
        {workstations.length === 0 && <p className="text-[#6B6459] text-sm text-center py-8">No hay estaciones registradas.</p>}
        {workstations.map(ws => (
          <div key={ws.id} className="border border-[#E4DCC9] rounded-sm p-4 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-[#1C1A16]">{ws.name}</h4>
              <p className="text-sm text-[#6B6459]">Barbero: {ws.barber_name || 'Sin asignar'}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-sm text-xs font-medium ${ws.is_active ? 'bg-[#EEF5EE] text-[#3E6B3E]' : 'bg-[#FBEAEA] text-[#8B2E2E]'}`}>{ws.is_active ? 'Activa' : 'Inactiva'}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(ws)} className="text-[#8B6A22] hover:bg-[#F6F2EA] p-2 rounded-sm transition-colors"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => handleDelete(ws.id)} className="text-[#8B2E2E] hover:bg-[#FBEAEA] p-2 rounded-sm transition-colors"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkstationManager;
