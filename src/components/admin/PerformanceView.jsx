import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Users, Scissors, Clock, Calendar } from 'lucide-react';
import { api } from '../../services/api';

const WEEKDAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const PerformanceView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('week');

  const fetchPerformance = useCallback(async () => {
    try {
      setLoading(true);
      const result = await api.get(`/admin/performance?period=${period}`);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchPerformance();
  }, [fetchPerformance]);

  const formatCOP = (cents) => {
    if (cents === null || cents === undefined) return '$0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const SimpleBarChart = ({ items, valueKey, labelKey, color }) => {
    if (!items || items.length === 0) {
      return <p className="text-sm text-[#6B6459]">Sin datos para este período.</p>;
    }
    const max = Math.max(...items.map((d) => d[valueKey] || 0), 1);
    return (
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="w-20 text-xs text-[#6B6459] truncate">{item[labelKey]}</div>
            <div className="flex-1 bg-[#F6F2EA] rounded-full h-4 overflow-hidden">
              <div
                className={`h-full rounded-full ${color}`}
                style={{ width: `${(((item[valueKey] || 0) / max) * 100).toFixed(1)}%` }}
              />
            </div>
            <div className="w-14 text-xs text-right text-[#1C1A16] font-medium">{item[valueKey] || 0}</div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#A9812E]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl sm:text-2xl text-[#1C1A16]">Desempeño</h2>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-2 border border-[#E4DCC9] rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#A9812E]/40 focus:border-[#A9812E] outline-none transition-all"
        >
          <option value="today">Hoy</option>
          <option value="week">Esta semana</option>
          <option value="month">Este mes</option>
        </select>
      </div>

      {error && <div className="bg-[#FBEAEA] border border-[#E3B8B8] text-[#8B2E2E] px-4 py-3 rounded-lg text-sm animate-fade-in">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E4DCC9] rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
          <h3 className="font-serif text-lg text-[#1C1A16] mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-[#A9812E]" /> Por barbero
          </h3>
          {data?.by_barber?.length === 0 ? (
            <p className="text-sm text-[#6B6459]">Sin datos.</p>
          ) : (
            <div className="divide-y divide-[#E4DCC9]">
              {data?.by_barber?.map((item) => (
                <div key={item.barber_id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#1C1A16]">{item.barber_name || 'Sin asignar'}</p>
                    <p className="text-xs text-[#6B6459]">{item.appointments} citas completadas</p>
                  </div>
                  <p className="font-serif text-[#1C1A16]">{formatCOP(item.revenue_cents)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-[#E4DCC9] rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
          <h3 className="font-serif text-lg text-[#1C1A16] mb-4 flex items-center">
            <Scissors className="h-5 w-5 mr-2 text-[#A9812E]" /> Por servicio
          </h3>
          {data?.by_service?.length === 0 ? (
            <p className="text-sm text-[#6B6459]">Sin datos.</p>
          ) : (
            <div className="divide-y divide-[#E4DCC9]">
              {data?.by_service?.map((item) => (
                <div key={item.service_id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#1C1A16]">{item.service_name}</p>
                    <p className="text-xs text-[#6B6459]">{item.appointments} vendidos</p>
                  </div>
                  <p className="font-serif text-[#1C1A16]">{formatCOP(item.revenue_cents)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E4DCC9] rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
          <h3 className="font-serif text-lg text-[#1C1A16] mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-[#A9812E]" /> Horas pico
          </h3>
          <SimpleBarChart
            items={data?.by_hour?.map((h) => ({ ...h, label: `${String(h.hour).padStart(2, '0')}:00` }))}
            valueKey="appointments"
            labelKey="label"
            color="bg-[#A9812E]"
          />
        </div>

        <div className="bg-white border border-[#E4DCC9] rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
          <h3 className="font-serif text-lg text-[#1C1A16] mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-[#A9812E]" /> Días pico
          </h3>
          <SimpleBarChart
            items={data?.by_weekday?.map((w) => ({ ...w, label: WEEKDAYS[w.weekday - 1] || '' }))}
            valueKey="appointments"
            labelKey="label"
            color="bg-[#3B5B8C]"
          />
        </div>
      </div>
    </div>
  );
};

export default PerformanceView;
