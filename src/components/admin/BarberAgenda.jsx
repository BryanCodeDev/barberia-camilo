import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, Users, Scissors, DollarSign, Filter } from 'lucide-react';
import { api } from '../../services/api';
import { APPOINTMENT_STATUS, STATUS_LABELS } from '../../utils/constants';

const STATUS_COLORS = {
  pending: 'bg-status-amber/10 text-status-amber.deep border-status-amber/20',
  confirmed: 'bg-status-green/10 text-status-green.deep border-status-green/20',
  completed: 'bg-status-blue/10 text-status-blue.deep border-status-blue/20',
  cancelled: 'bg-status-red/10 text-status-red.deep border-status-red/20',
  'no-show': 'bg-stone-faint/20 text-stone border-stone-faint/30',
};

const formatCOP = (cents) => {
  if (cents === null || cents === undefined) return '$0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents);
};

const formatTime = (time) => {
  if (!time) return '--:--';
  return time;
};

const BarberAgenda = ({ userRole }) => {
  const [agenda, setAgenda] = useState({ date: '', agenda: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });

  const fetchAgenda = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get(`/admin/barbers/agenda?date=${selectedDate}`);
      setAgenda(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchAgenda();
  }, [fetchAgenda]);

  const allAppointments = agenda.agenda?.flatMap((barber) =>
    barber.appointments.map((apt) => ({ ...apt, barber_name: barber.barber_name }))
  ) || [];

  const todayTotal = allAppointments.reduce((sum, apt) => sum + (apt.price_cents || 0), 0);

  if (loading) {
    return (
      <div className="card-premium p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-stone">Cargando agenda de barberos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl text-ink-soft">Agenda de Barberos</h3>
          <p className="text-sm text-stone mt-1">
            Visualiza la agenda de cada barbero para el dia seleccionado
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-faint" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-9 pr-4 py-2.5 border border-cream-line rounded-xl text-sm bg-white focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all duration-200 text-ink-soft"
            />
          </div>
          {todayTotal > 0 && (
            <div className="px-3 py-2 bg-gold/10 border border-gold/20 rounded-xl">
              <p className="text-xs text-gold-deep font-medium">Total esperado</p>
              <p className="text-sm font-serif text-gold-deep font-semibold">{formatCOP(todayTotal)}</p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-status-red/10 border border-status-red/20 text-status-red.deep px-4 py-3 rounded-xl text-sm animate-fade-in">
          {error}
        </div>
      )}

      {!agenda.agenda || agenda.agenda.length === 0 ? (
        <div className="card-premium p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-cream flex items-center justify-center border border-cream-line">
            <Calendar className="h-8 w-8 text-stone-faint" />
          </div>
          <p className="text-stone text-sm mb-1">No hay barberos registrados.</p>
          <p className="text-stone-faint text-xs">
            Los barberos activos apareceran aqui con su agenda del dia.
          </p>
        </div>
      ) : (
        <div className="card-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream/50 border-b border-cream-line">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone uppercase tracking-wider">
                    Barbero
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone uppercase tracking-wider">
                    Hora
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone uppercase tracking-wider">
                    Duracion
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone uppercase tracking-wider">
                    Servicio
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-stone uppercase tracking-wider">
                    Ganancia
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-line">
                {agenda.agenda.map((barber) => {
                  if (!barber.appointments || barber.appointments.length === 0) {
                    return (
                      <tr key={barber.barber_id} className="hover:bg-cream/30 transition-colors">
                        <td className="px-4 py-4 font-medium text-ink-soft">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold/15 to-gold/5 flex items-center justify-center border border-gold/20 flex-shrink-0">
                              <Users className="h-4 w-4 text-gold" />
                            </div>
                            {barber.barber_name}
                          </div>
                        </td>
                        <td colSpan={6} className="px-4 py-4 text-stone-faint italic">
                          Sin citas agendadas
                        </td>
                      </tr>
                    );
                  }

                  return barber.appointments.map((apt, idx) => (
                    <tr
                      key={apt.id}
                      className={`hover:bg-cream/30 transition-colors ${idx === 0 ? '' : ''}`}
                    >
                      {idx === 0 && (
                        <td
                          className="px-4 py-4 font-medium text-ink-soft align-top"
                          rowSpan={barber.appointments.length}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold/15 to-gold/5 flex items-center justify-center border border-gold/20 flex-shrink-0">
                              <Users className="h-4 w-4 text-gold" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate">{barber.barber_name}</p>
                              <p className="text-xs text-stone-faint">
                                {barber.appointments.length} cita{barber.appointments.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-ink-soft">
                          <Clock className="h-3.5 w-3.5 text-stone-faint flex-shrink-0" />
                          {formatTime(apt.appointment_time)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-stone">
                        {apt.duration_minutes} min
                      </td>
                      <td className="px-4 py-3">
                        <div className="min-w-0">
                          <p className="font-medium text-ink-soft truncate max-w-[160px]">
                            {apt.client_name || 'Sin cliente'}
                          </p>
                          {apt.client_phone && (
                            <p className="text-xs text-stone-faint truncate max-w-[160px]">
                              {apt.client_phone}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-stone">
                          <Scissors className="h-3.5 w-3.5 text-stone-faint flex-shrink-0" />
                          <span className="truncate max-w-[140px]">{apt.service_name || '--'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium border ${STATUS_COLORS[apt.status] || STATUS_COLORS.pending}`}
                        >
                          {STATUS_LABELS[apt.status] || apt.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-medium text-ink-soft">
                          {formatCOP(apt.price_cents)}
                        </span>
                      </td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarberAgenda;
