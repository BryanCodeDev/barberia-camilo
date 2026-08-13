import React, { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

const WorkstationManager = () => {
  const [workstations, setWorkstations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#A9812E]" /></div>;

  return (
    <div className="bg-white border border-[#E4DCC9] rounded-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-serif text-xl text-[#1C1A16]">Estaciones de Trabajo</h3>
        <button
          disabled
          title="Próximamente — requiere una función adicional en el servidor"
          className="bg-[#E4DCC9] text-[#B7B1A3] px-4 py-2 rounded-sm font-semibold text-sm flex items-center cursor-not-allowed"
        >
          <Plus className="h-4 w-4 mr-2" /> Nueva Estación
        </button>
      </div>
      {error && <div className="bg-[#FBEAEA] border border-[#E3B8B8] text-[#8B2E2E] px-4 py-3 rounded-sm text-sm mb-4">{error}</div>}
      <div className="bg-[#FBF3E4] border border-[#EAD9AE] text-[#8B6A22] px-4 py-3 rounded-sm text-sm mb-4">
        Crear, editar o eliminar estaciones estará disponible próximamente. Por ahora puedes ver el estado de las estaciones existentes.
      </div>
      <div className="space-y-3">
        {workstations.length === 0 && <p className="text-[#6B6459] text-sm text-center py-8">No hay estaciones registradas.</p>}
        {workstations.map(ws => (
          <div key={ws.id} className="border border-[#E4DCC9] rounded-sm p-4 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-[#1C1A16]">{ws.name}</h4>
              <p className="text-sm text-[#6B6459]">Barbero: {ws.barber_name || 'Sin asignar'}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-sm text-xs font-medium ${ws.is_active ? 'bg-[#EEF5EE] text-[#3E6B3E]' : 'bg-[#FBEAEA] text-[#8B2E2E]'}`}>{ws.is_active ? 'Activa' : 'Inactiva'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkstationManager;