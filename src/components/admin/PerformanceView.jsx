import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Users, Scissors, Clock, Calendar, TrendingUp } from 'lucide-react';
import { api } from '../../services/api';

const WEEKDAYS = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

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
    }).format(cents);
  };

  const SimpleBarChart = ({ items, valueKey, labelKey, color, icon: Icon }) => {
    if (!items || items.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-cream flex items-center justify-center border border-cream-line">
            <TrendingUp className="h-6 w-6 text-stone-faint" />
          </div>
          <p className="text-sm text-stone">Sin datos para este periodo.</p>
        </div>
      );
    }
    const max = Math.max(...items.map((d) => d[valueKey] || 0), 1);
    return (
      <div className="space-y-3">
        {items.map((item, idx) => {
          const pct = ((item[valueKey] || 0) / max) * 100;
          return (
            <div key={idx} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-ink-soft truncate max-w-[140px]">{item[labelKey]}</span>
                <span className="text-sm font-semibold text-ink-soft">{item[valueKey] || 0}</span>
              </div>
              <div className="h-2.5 bg-cream rounded-full overflow-hidden border border-cream-line">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${color}`}
                  style={{ width: `${pct.toFixed(1)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-gold mx-auto mb-3" />
          <p className="text-sm text-stone">Cargando metricas de desempeno...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="section-title">Desempeno</h2>
          <p className="text-sm text-stone mt-1">Analisis de rendimiento y tendencias</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2.5 border border-cream-line rounded-xl text-sm bg-white focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all duration-200 text-ink-soft"
        >
          <option value="today">Hoy</option>
          <option value="week">Esta semana</option>
          <option value="month">Este mes</option>
        </select>
      </div>

      {error && (
        <div className="bg-status-red/10 border border-status-red/20 text-status-red.deep px-4 py-3 rounded-xl text-sm animate-fade-in">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card-premium p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-xl bg-status-green/10">
              <Users className="h-5 w-5 text-status-green.deep" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-ink-soft">Por barbero</h3>
              <p className="text-xs text-stone">Ingresos y citas por profesional</p>
            </div>
          </div>
      {data?.by_barber?.length === 0 ? (
        <p className="text-sm text-stone">Sin datos.</p>
      ) : (
        <div className="divide-y divide-cream-line">
          {data?.by_barber?.map((item) => {
            const completedItem = data?.by_barber_completed?.find(c => c.barber_id === item.barber_id);
            return (
              <div key={item.barber_id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-ink-soft">{item.barber_name || 'Sin asignar'}</p>
                  <p className="text-xs text-stone">{item.appointments} citas (confirmadas + completadas)</p>
                  {completedItem && completedItem.revenue_cents !== item.revenue_cents && (
                    <p className="text-xs text-status-green.deep">{completedItem.appointments} completadas - {formatCOP(completedItem.revenue_cents)}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-serif text-ink-soft">{formatCOP(item.revenue_cents)}</p>
                  {completedItem && completedItem.revenue_cents !== item.revenue_cents && (
                    <p className="text-xs text-stone-faint">Esperado: {formatCOP(item.revenue_cents - completedItem.revenue_cents)}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
        </div>

        <div className="card-premium p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-xl bg-status-blue/10">
              <Scissors className="h-5 w-5 text-status-blue.deep" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-ink-soft">Por servicio</h3>
              <p className="text-xs text-stone">Servicios mas populares</p>
            </div>
          </div>
      {data?.by_service?.length === 0 ? (
        <p className="text-sm text-stone">Sin datos.</p>
      ) : (
        <div className="divide-y divide-cream-line">
          {data?.by_service?.map((item) => {
            const completedItem = data?.by_service_completed?.find(c => c.service_id === item.service_id);
            return (
              <div key={item.service_id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-ink-soft">{item.service_name}</p>
                  <p className="text-xs text-stone">{item.appointments} vendidos (confirmados + completados)</p>
                  {completedItem && completedItem.revenue_cents !== item.revenue_cents && (
                    <p className="text-xs text-status-green.deep">{completedItem.appointments} completados - {formatCOP(completedItem.revenue_cents)}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-serif text-ink-soft">{formatCOP(item.revenue_cents)}</p>
                  {completedItem && completedItem.revenue_cents !== item.revenue_cents && (
                    <p className="text-xs text-stone-faint">Esperado: {formatCOP(item.revenue_cents - completedItem.revenue_cents)}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card-premium p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-xl bg-status-amber/10">
              <Clock className="h-5 w-5 text-status-amber.deep" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-ink-soft">Horas pico</h3>
              <p className="text-xs text-stone">Distribucion por hora del dia</p>
            </div>
          </div>
          <SimpleBarChart
            items={data?.by_hour?.map((h) => ({ ...h, label: `${String(h.hour).padStart(2, '0')}:00` }))}
            valueKey="appointments"
            labelKey="label"
            color="bg-gradient-to-r from-gold to-gold-light"
          />
        </div>

        <div className="card-premium p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-xl bg-status-blue/10">
              <Calendar className="h-5 w-5 text-status-blue.deep" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-ink-soft">Dias pico</h3>
              <p className="text-xs text-stone">Distribucion por dia de la semana</p>
            </div>
          </div>
          <SimpleBarChart
            items={data?.by_weekday?.map((w) => ({ ...w, label: WEEKDAYS[w.weekday - 1] || '' }))}
            valueKey="appointments"
            labelKey="label"
            color="bg-gradient-to-r from-status-blue to-status-blue.deep"
          />
        </div>
      </div>
    </div>
  );
};

export default PerformanceView;
