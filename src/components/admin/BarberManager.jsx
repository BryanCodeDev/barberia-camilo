import React, { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

const BarberManager = () => {
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#A9812E]" /></div>;

  return (
    <div className="bg-white border border-[#E4DCC9] rounded-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-serif text-xl text-[#1C1A16]">Barberos</h3>
        <button
          disabled
          title="Próximamente — requiere una función adicional en el servidor"
          className="bg-[#E4DCC9] text-[#B7B1A3] px-4 py-2 rounded-sm font-semibold text-sm flex items-center cursor-not-allowed"
        >
          <Plus className="h-4 w-4 mr-2" /> Nuevo Barbero
        </button>
      </div>
      {error && <div className="bg-[#FBEAEA] border border-[#E3B8B8] text-[#8B2E2E] px-4 py-3 rounded-sm text-sm mb-4">{error}</div>}
      <div className="bg-[#FBF3E4] border border-[#EAD9AE] text-[#8B6A22] px-4 py-3 rounded-sm text-sm mb-4">
        Por ahora esta sección solo muestra los barberos que ya tienen una estación asignada. Crear, editar o eliminar barberos estará disponible próximamente.
      </div>
      <div className="space-y-3">
        {barbers.length === 0 && <p className="text-[#6B6459] text-sm text-center py-8">No hay barberos registrados en estaciones activas.</p>}
        {barbers.map(barber => (
          <div key={barber.id} className="border border-[#E4DCC9] rounded-sm p-4 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-[#1C1A16]">{barber.name}</h4>
              <p className="text-sm text-[#6B6459]">Estaciones: {barber.workstations.map(w => w.name).join(', ')}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarberManager;