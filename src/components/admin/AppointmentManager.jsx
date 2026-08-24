import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Search, Download, List, CalendarDays, X,
  ChevronLeft, ChevronRight, Calendar as CalendarIcon
} from 'lucide-react';
import { STATUS_LABELS } from '../../utils/constants';
import { api } from '../../services/api';
import AppointmentList from './AppointmentList';
import Button from '../ui/Button';
import Input from '../ui/Input';

const AppointmentManager = ({ userRole, business, setError, fetchStats }) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [appointmentsView, setAppointmentsView] = useState('list');
  const searchTimeoutRef = useRef(null);
  const [calendarWeekStart, setCalendarWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay() || 7;
    const diff = now.getDate() - day + 1;
    return new Date(now.getFullYear(), now.getMonth(), diff);
  });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [appointmentForm, setAppointmentForm] = useState({
    appointment_date: '',
    appointment_time: '',
    duration_minutes: 30,
    client_message: '',
    status: 'pending',
  });
  const [appointmentSaving, setAppointmentSaving] = useState(false);
  const [profitMessage, setProfitMessage] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (selectedDate) params.set('date', selectedDate);
      if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
      const url = `/admin/appointments${params.toString() ? `?${params.toString()}` : ''}`;
      const data = await api.get(url);
      setAppointments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, debouncedSearch, setError]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setClientSearch(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(value);
    }, 300);
  };

  const handleDeleteAppointment = async (id) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDeleteAppointment = async () => {
    if (!itemToDelete) return;
    try {
      setError(null);
      await api.delete(`/appointments/${itemToDelete}`);
      await fetchAppointments();
      await fetchStats();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleStatusChange = async (id, newStatus, cancelledReason = null) => {
    try {
      setError(null);
      const response = await api.patch(`/appointments/${id}/status`, {
        status: newStatus,
        cancelled_reason: cancelledReason,
      });
      await fetchAppointments();
      await fetchStats();

      if (newStatus === 'confirmed' && response.appointment) {
        const price = response.appointment.price_cents || 0;
        const formatted = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);
        setProfitMessage(`Cita confirmada - Ganancia esperada: ${formatted}`);
        setTimeout(() => setProfitMessage(''), 4000);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setAppointmentForm({
      appointment_date: appointment.appointment_date || '',
      appointment_time: appointment.appointment_time || '',
      duration_minutes: appointment.duration_minutes || 30,
      client_message: appointment.client_message || '',
      status: appointment.status || 'pending',
    });
  };

  const handleUpdateAppointment = async (e) => {
    e.preventDefault();
    setAppointmentSaving(true);
    setError(null);
    try {
      await api.patch(`/admin/appointments/${editingAppointment.id}`, appointmentForm);
      setEditingAppointment(null);
      await fetchAppointments();
      await fetchStats();
    } catch (err) {
      setError(err.message);
    } finally {
      setAppointmentSaving(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Fecha', 'Hora', 'Cliente', 'Telefono', 'Servicio', 'Barbero/Estacion', 'Estado', 'Precio (COP)'];
    const rows = appointments.map((apt) => [
      formatDate(apt.appointment_date),
      apt.appointment_time,
      apt.client_name,
      apt.client_phone,
      apt.service_name,
      [apt.barber_name, apt.workstation_name].filter(Boolean).join(' / ') || '—',
      getStatusText(apt.status),
      Math.round(apt.price_cents || 0),
    ]);

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `citas_${selectedDate || 'todas'}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getWeekDates = (startDate) => {
    const dates = [];
    const current = new Date(startDate);
    for (let i = 0; i < 7; i++) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const formatWeekdayName = (date) => {
    return date.toLocaleDateString('es-CO', { weekday: 'short' });
  };

  const formatDayNumber = (date) => {
    return date.getDate();
  };

  const isSameDay = (d1, d2) => {
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  };

  const filteredAppointments = statusFilter === 'all'
    ? (appointments || [])
    : (appointments || []).filter((apt) => apt.status === statusFilter);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-status-green text-status-green.deep';
      case 'cancelled': return 'bg-status-red text-status-red.deep';
      case 'completed': return 'bg-status-blue text-status-blue.deep';
      case 'no-show': return 'bg-stone-faint/30 text-stone';
      default: return 'bg-status-amber text-status-amber.deep';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'cancelled': return 'Cancelada';
      case 'completed': return 'Completada';
      case 'no-show': return 'No se presento';
      default: return 'Pendiente';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" key="appointments">
      <div className="section-header">
        <div>
          <nav className="flex items-center gap-2 text-xs text-stone mb-2">
            <span className="text-ink-soft font-medium">Citas</span>
          </nav>
          <h2 className="section-title">Gestion de Citas</h2>
          <p className="text-sm text-stone mt-1">Administra las reservas y estados</p>
        </div>
      </div>

      {profitMessage && (
        <div className="bg-status-green/10 border border-status-green/20 text-status-green.deep px-4 py-3 rounded-xl text-sm animate-fade-in flex items-center justify-between">
          <span>{profitMessage}</span>
          <button onClick={() => setProfitMessage('')} className="text-current hover:opacity-70 ml-4" aria-label="Cerrar">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="card-premium p-4 sm:p-5">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-5">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'Todas', count: appointments.length },
              { id: 'pending', label: 'Pendientes', count: appointments.filter(a => a.status === 'pending').length },
              { id: 'confirmed', label: 'Confirmadas', count: appointments.filter(a => a.status === 'confirmed').length },
              { id: 'completed', label: 'Completadas', count: appointments.filter(a => a.status === 'completed').length },
              { id: 'cancelled', label: 'Canceladas', count: appointments.filter(a => a.status === 'cancelled').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={[
                  'filter-tab',
                  statusFilter === tab.id ? 'filter-tab-active' : 'filter-tab-inactive',
                ].join(' ')}
              >
                {tab.label}
                <span className="ml-1.5 text-xs opacity-70">({tab.count})</span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-faint" />
              <input
                type="text"
                value={clientSearch}
                onChange={handleSearchChange}
                placeholder="Buscar cliente..."
                className="pl-9 pr-4 py-2.5 border border-cream-line rounded-xl text-sm bg-white focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all duration-200 text-ink-soft placeholder:text-stone-faint"
              />
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2.5 border border-cream-line rounded-xl text-sm bg-white focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all duration-200 text-ink-soft"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="text-sm text-gold-deep hover:underline font-medium"
              >
                Limpiar
              </button>
            )}
            <div className="flex rounded-xl overflow-hidden border border-cream-line bg-white">
              <button
                onClick={() => setAppointmentsView('list')}
                className={[
                  'px-3 py-2.5 transition-all duration-200',
                  appointmentsView === 'list'
                    ? 'bg-gold text-ink shadow-sm'
                    : 'text-stone hover:text-ink-soft',
                ].join(' ')}
                title="Vista lista"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setAppointmentsView('calendar')}
                className={[
                  'px-3 py-2.5 transition-all duration-200',
                  appointmentsView === 'calendar'
                    ? 'bg-gold text-ink shadow-sm'
                    : 'text-stone hover:text-ink-soft',
                ].join(' ')}
                title="Vista calendario semanal"
              >
                <CalendarDays className="h-4 w-4" />
              </button>
            </div>
            <Button variant="secondary" onClick={exportToCSV} size="sm">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
          </div>
        </div>

        {appointmentsView === 'list' ? (
          <div className="bg-cream/50 rounded-xl border border-cream-line overflow-hidden">
            <div className="px-4 sm:px-6 py-4 bg-white border-b border-cream-line">
              <h3 className="font-serif text-lg sm:text-xl text-ink-soft flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-gold" />
                Citas Agendadas
                <span className="text-sm font-sans font-normal text-stone">({filteredAppointments.length})</span>
              </h3>
            </div>
            <AppointmentList
              appointments={filteredAppointments}
              onConfirm={handleStatusChange}
              onCancel={handleStatusChange}
              onComplete={handleStatusChange}
              onNoShow={handleStatusChange}
              onDelete={handleDeleteAppointment}
              onEdit={handleEditAppointment}
              formatDate={formatDate}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
              loading={loading}
            />
          </div>
        ) : (
          <div className="bg-cream/50 rounded-xl border border-cream-line overflow-hidden">
            <div className="px-4 sm:px-6 py-4 bg-white border-b border-cream-line flex items-center justify-between">
              <h3 className="font-serif text-lg sm:text-xl text-ink-soft flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-gold" />
                Calendario Semanal
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const newStart = new Date(calendarWeekStart);
                    newStart.setDate(newStart.getDate() - 7);
                    setCalendarWeekStart(newStart);
                  }}
                  className="px-3 py-1.5 border border-cream-line rounded-xl text-sm hover:border-gold/60 transition-all duration-200 bg-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    const newStart = new Date(calendarWeekStart);
                    newStart.setDate(newStart.getDate() + 7);
                    setCalendarWeekStart(newStart);
                  }}
                  className="px-3 py-1.5 border border-cream-line rounded-xl text-sm hover:border-gold/60 transition-all duration-200 bg-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCalendarWeekStart(new Date())}
                  className="px-3 py-1.5 bg-gold text-ink rounded-xl text-sm font-semibold hover:bg-gold-light transition-all duration-200 btn-press shadow-sm"
                >
                  Hoy
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 divide-x divide-cream-line">
              {getWeekDates(calendarWeekStart).map((date, idx) => {
                const dayAppointments = appointments.filter((apt) => {
                  const aptDate = new Date(apt.appointment_date + 'T00:00:00');
                  return isSameDay(aptDate, date);
                });
                const isToday = isSameDay(date, new Date());
                return (
                  <div key={idx} className={`flex flex-col ${isToday ? 'bg-gold/5' : 'bg-white'}`}>
                    <div className={`px-2 py-3 text-center border-b border-cream-line ${isToday ? 'bg-gold/10' : 'bg-cream/30'}`}>
                      <p className="text-xs font-medium text-stone uppercase tracking-wide">{formatWeekdayName(date)}</p>
                      <p className={`text-lg font-serif mt-0.5 ${isToday ? 'text-gold font-bold' : 'text-ink-soft'}`}>{formatDayNumber(date)}</p>
                    </div>
                    <div className="flex-1 p-2 min-h-[200px] space-y-2">
                      {dayAppointments.length === 0 ? (
                        <p className="text-xs text-stone-faint text-center py-4">Sin citas</p>
                      ) : (
                        dayAppointments.map((apt) => (
                          <div key={apt.id} className={`p-2.5 rounded-xl border text-xs transition-all duration-200 hover:shadow-sm ${getStatusColor(apt.status)}`}>
                            <p className="font-semibold text-ink-soft">{apt.appointment_time}</p>
                            <p className="truncate font-medium text-ink-soft/80">{apt.client_name}</p>
                            <p className="truncate text-stone">{apt.service_name}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {editingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setEditingAppointment(null)}
          />
          <div className="relative bg-white border border-cream-line rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-cream-line">
              <h3 className="font-serif text-lg sm:text-xl text-ink-soft">Editar Cita</h3>
              <button
                onClick={() => setEditingAppointment(null)}
                className="p-1.5 text-stone hover:text-ink-soft hover:bg-cream rounded-xl transition-colors"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateAppointment} className="overflow-y-auto px-5 sm:px-6 py-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Fecha"
                  name="appointment_date"
                  type="date"
                  value={appointmentForm.appointment_date}
                  onChange={e => setAppointmentForm({ ...appointmentForm, appointment_date: e.target.value })}
                  required
                />
                <Input
                  label="Hora"
                  name="appointment_time"
                  type="time"
                  value={appointmentForm.appointment_time}
                  onChange={e => setAppointmentForm({ ...appointmentForm, appointment_time: e.target.value })}
                  required
                />
                <Input
                  label="Duracion (min)"
                  name="duration_minutes"
                  type="number"
                  value={appointmentForm.duration_minutes}
                  onChange={e => setAppointmentForm({ ...appointmentForm, duration_minutes: Number(e.target.value) })}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-stone mb-1.5">Estado</label>
                  <select className="w-full px-3 py-2.5 border border-cream-line rounded-xl text-sm bg-white focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all duration-200 text-ink-soft" value={appointmentForm.status} onChange={e => setAppointmentForm({ ...appointmentForm, status: e.target.value })}>
                    <option value="pending">Pendiente</option>
                    <option value="confirmed">Confirmada</option>
                    <option value="completed">Completada</option>
                    <option value="cancelled">Cancelada</option>
                    <option value="no-show">No se presento</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone mb-1.5">Mensaje del cliente</label>
                <textarea
                  className="w-full px-3 py-2.5 border border-cream-line rounded-xl text-sm bg-white focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all duration-200 resize-none text-ink-soft"
                  rows="3"
                  value={appointmentForm.client_message}
                  onChange={e => setAppointmentForm({ ...appointmentForm, client_message: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingAppointment(null)} className="btn-secondary">
                  Cancelar
                </button>
                <Button type="submit" loading={appointmentSaving} size="sm">
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setItemToDelete(null); }}
        title="Eliminar cita"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-stone">Esta accion eliminara la cita permanentemente. No se puede deshacer.</p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setDeleteModalOpen(false); setItemToDelete(null); }}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button type="button" onClick={confirmDeleteAppointment} className="bg-status-red text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-all">
              Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AppointmentManager;
