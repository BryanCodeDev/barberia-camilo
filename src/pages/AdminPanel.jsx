import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  User, Phone, Calendar, Clock, MessageSquare, Trash2,
  Eye, EyeOff, LogOut, Shield, Users, X, Check,
  AlertTriangle, Loader2, Scissors, LayoutDashboard,
  BarChart3, Menu, Search, Download, List, CalendarDays
} from 'lucide-react';
import { STATUS_LABELS } from '../utils/constants';
import { api } from '../services/api';
import { invalidateBusinessSettingsCache } from '../hooks/useBusinessSettings';
import useAuth from '../hooks/useAuth';
import BarberManager from '../components/admin/BarberManager';
import WorkstationManager from '../components/admin/WorkstationManager';
import NotificationsCenter from '../components/admin/NotificationsCenter';
import SettingsEditor from '../components/admin/SettingsEditor';
import PerformanceView from '../components/admin/PerformanceView';
import ClientsView from '../components/admin/ClientsView';
import AdminSidebar from '../components/layout/AdminSidebar';
import StatsCards from '../components/admin/StatsCards';
import AppointmentList from '../components/admin/AppointmentList';
import LoginForm from '../components/auth/LoginForm';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ErrorBanner from '../components/ui/ErrorBanner';
import Loader from '../components/ui/Loader';

const defaultBusiness = { name: "Barber Trebol", title: "Master Barber" };

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
  { id: 'appointments', label: 'Citas', icon: Calendar },
  { id: 'barbers', label: 'Barberos', icon: Users },
  { id: 'workstations', label: 'Estaciones', icon: Scissors },
  { id: 'clients', label: 'Clientes', icon: Users },
  { id: 'performance', label: 'Desempeño', icon: BarChart3 },
  { id: 'notifications', label: 'Notificaciones', icon: MessageSquare },
  { id: 'settings', label: 'Configuración', icon: Shield },
];

const AdminPanel = ({ onClose, business }) => {
  const { isAuthenticated, login: authLogin, logout: authLogout } = useAuth('admin');
  const [adminCredentials, setAdminCredentials] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
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
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, cancelled: 0, today: 0 });
  const [statsLoading, setStatsLoading] = useState(false);
  const [revenuePeriod, setRevenuePeriod] = useState('today');
  const [revenueData, setRevenueData] = useState(null);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const formatCOP = (cents) => {
    if (cents === null || cents === undefined) return '$0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const formatPeriodLabel = (period) => {
    switch (period) {
      case 'today': return 'Hoy';
      case 'week': return 'Esta semana';
      case 'month': return 'Este mes';
      default: return period;
    }
  };

  const businessInfo = business || defaultBusiness;

  const handleLogin = async (values) => {
    try {
      setLoginError(null);
      const data = await api.post('/auth/login', {
        username: values.username,
        password: values.password,
      });
      authLogin(data.token);
      setAdminCredentials({ username: '', password: '' });
    } catch (err) {
      console.error('Login error:', err);
      setLoginError(err.message);
    }
  };

  const handleLogout = () => {
    authLogout();
    setAdminCredentials({ username: '', password: '' });
    setLoginError(null);
    setAppointments([]);
    setStats({ total: 0, pending: 0, confirmed: 0, cancelled: 0, today: 0 });
  };

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const data = await api.get('/admin/stats');
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

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
  }, [selectedDate, debouncedSearch]);

  const fetchRevenue = useCallback(async () => {
    try {
      setRevenueLoading(true);
      const data = await api.get(`/admin/revenue?period=${revenuePeriod}`);
      setRevenueData(data);
    } catch (err) {
      console.error('Error fetching revenue:', err);
    } finally {
      setRevenueLoading(false);
    }
  }, [revenuePeriod]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
      fetchAppointments();
      fetchRevenue();
    }
  }, [isAuthenticated, selectedDate, fetchStats, fetchAppointments, fetchRevenue]);

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta cita?')) return;
    try {
      setError(null);
      await api.delete(`/appointments/${id}`);
      await fetchAppointments();
      await fetchStats();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (id, newStatus, cancelledReason = null) => {
    try {
      setError(null);
      await api.patch(`/appointments/${id}/status`, {
        status: newStatus,
        cancelled_reason: cancelledReason,
      });
      await fetchAppointments();
      await fetchStats();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setClientSearch(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(value);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  const exportToCSV = () => {
    const headers = ['Fecha', 'Hora', 'Cliente', 'Teléfono', 'Servicio', 'Barbero/Estación', 'Estado', 'Precio (COP)'];
    const rows = appointments.map((apt) => [
      formatDate(apt.appointment_date),
      apt.appointment_time,
      apt.client_name,
      apt.client_phone,
      apt.service_name,
      [apt.barber_name, apt.workstation_name].filter(Boolean).join(' / ') || '—',
      getStatusText(apt.status),
      Math.round((apt.price_cents || 0) / 100),
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
    ? appointments
    : appointments.filter((apt) => apt.status === statusFilter);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-[#EEF5EE] text-[#3E6B3E]';
      case 'cancelled': return 'bg-[#FBEAEA] text-[#8B2E2E]';
      case 'completed': return 'bg-[#EEF3FB] text-[#3B5B8C]';
      case 'no-show': return 'bg-[#F1EFEB] text-[#6B6459]';
       default: return 'bg-[#FBF3E4] text-[#8B6A22]';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'cancelled': return 'Cancelada';
      case 'completed': return 'Completada';
      case 'no-show': return 'No se presentó';
       default: return 'Pendiente';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#121113]">
        <div className="min-h-screen flex flex-col">
          <div className="bg-black/30 backdrop-blur-sm border-b border-[#2A2723] p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <div className="flex items-center mb-4 sm:mb-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-[#A9812E]/60 flex items-center justify-center mr-4">
                  <Shield className="h-6 w-6 sm:h-7 sm:w-7 text-[#C9A860]" />
                </div>
                <div>
                  <h1 className="font-serif text-2xl sm:text-3xl text-[#F6F2EA]">Panel de Administración</h1>
                  <p className="text-sm text-[#9A9488]">{businessInfo.name} — gestiona tu barbería</p>
                </div>
              </div>
              {onClose && (
                <button onClick={onClose} className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0 text-[#9A9488] hover:text-[#F6F2EA] transition-colors p-2 hover:bg-[#1B1A1B] rounded-sm">
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <LoginForm
              fields={[
                { name: 'username', label: 'Usuario', type: 'text', placeholder: 'Ingresa tu usuario', required: true },
                { name: 'password', label: 'Contraseña', type: 'password', placeholder: 'Ingresa tu contraseña', required: true },
              ]}
              onSubmit={handleLogin}
              loading={false}
              error={loginError}
              submitLabel="Acceder al Panel"
              headerIcon={Shield}
              headerTitle="Acceso Administrativo"
              headerSubtitle="Ingresa tus credenciales para continuar"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F2EA]">
      <AdminSidebar
        tabs={NAV_ITEMS}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onClose={onClose}
        businessName={businessInfo.name}
        mobileOpen={mobileNavOpen}
        setMobileOpen={setMobileNavOpen}
      />

      <div className="md:ml-64">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {error && (
            <ErrorBanner message={error} onDismiss={() => setError(null)} className="mb-4" />
          )}

          {activeTab === 'dashboard' && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="font-serif text-xl sm:text-2xl text-[#1C1A16]">Resumen</h2>
                <div className="flex items-center gap-2">
                  <select
                    value={revenuePeriod}
                    onChange={(e) => setRevenuePeriod(e.target.value)}
                    className="px-3 py-2 border border-[#E4DCC9] rounded-sm text-sm bg-white focus:ring-2 focus:ring-[#A9812E]/40 focus:border-[#A9812E] outline-none"
                  >
                    <option value="today">Hoy</option>
                    <option value="week">Esta semana</option>
                    <option value="month">Este mes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-8">
                <div className="bg-white border border-[#E4DCC9] rounded-sm p-4 sm:p-6">
                  <p className="text-sm font-medium text-[#6B6459] mb-1">Ingresos {formatPeriodLabel(revenuePeriod)}</p>
                  <p className="text-2xl sm:text-3xl font-serif text-[#1C1A16]">
                    {revenueLoading ? '...' : formatCOP(revenueData?.current?.revenue_cents)}
                  </p>
                  {revenueData && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`text-sm font-medium ${revenueData.change_percent >= 0 ? 'text-[#3E6B3E]' : 'text-[#8B2E2E]'}`}>
                        {revenueData.change_percent >= 0 ? '↑' : '↓'} {Math.abs(revenueData.change_percent).toFixed(1)}%
                      </span>
                      <span className="text-xs text-[#B7B1A3]">vs. período anterior</span>
                    </div>
                  )}
                </div>
                <div className="bg-white border border-[#E4DCC9] rounded-sm p-4 sm:p-6">
                  <p className="text-sm font-medium text-[#6B6459] mb-1">Citas completadas</p>
                  <p className="text-2xl sm:text-3xl font-serif text-[#1C1A16]">
                    {revenueLoading ? '...' : (revenueData?.current?.appointments ?? 0)}
                  </p>
                </div>
                <div className="bg-white border border-[#E4DCC9] rounded-sm p-4 sm:p-6">
                  <p className="text-sm font-medium text-[#6B6459] mb-1">Ticket promedio</p>
                  <p className="text-2xl sm:text-3xl font-serif text-[#1C1A16]">
                    {revenueLoading ? '...' : formatCOP(revenueData?.current?.average_ticket_cents)}
                  </p>
                </div>
                <div className="bg-white border border-[#E4DCC9] rounded-sm p-4 sm:p-6">
                  <p className="text-sm font-medium text-[#6B6459] mb-1">Citas período anterior</p>
                  <p className="text-2xl sm:text-3xl font-serif text-[#1C1A16]">
                    {revenueLoading ? '...' : (revenueData?.previous?.appointments ?? 0)}
                  </p>
                </div>
              </div>

              <StatsCards stats={stats} loading={statsLoading} />
            </>
          )}

          {activeTab === 'appointments' && (
            <>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap gap-2">
                  {['all', 'pending', 'confirmed', 'cancelled', 'completed'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setStatusFilter(tab)}
                      className={`px-3 py-1.5 rounded-sm text-sm font-medium transition-colors ${
                        statusFilter === tab ? 'bg-[#A9812E] text-[#121113]' : 'bg-white text-[#6B6459] border border-[#E4DCC9] hover:border-[#A9812E]/60'
                      }`}
                    >
                      {tab === 'all' ? 'Todas' : STATUS_LABELS[tab] || tab}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#9A9488]" />
                     <input
                       type="text"
                       value={clientSearch}
                       onChange={handleSearchChange}
                       placeholder="Buscar cliente..."
                       className="pl-9 pr-4 py-2 border border-[#E4DCC9] rounded-sm text-sm bg-white focus:ring-2 focus:ring-[#A9812E]/40 focus:border-[#A9812E] outline-none"
                     />
                  </div>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-4 py-2 border border-[#E4DCC9] rounded-sm text-sm bg-white focus:ring-2 focus:ring-[#A9812E]/40 focus:border-[#A9812E] outline-none"
                  />
                  {selectedDate && (
                    <button onClick={() => setSelectedDate('')} className="text-sm text-[#8B6A22] hover:underline">Limpiar</button>
                  )}
                  <div className="flex rounded-sm overflow-hidden border border-[#E4DCC9]">
                    <button
                      onClick={() => setAppointmentsView('list')}
                      className={`px-3 py-2 transition-colors ${appointmentsView === 'list' ? 'bg-[#A9812E] text-[#121113]' : 'bg-white text-[#6B6459] hover:text-[#1C1A16]'}`}
                      title="Vista lista"
                    >
                      <List className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setAppointmentsView('calendar')}
                      className={`px-3 py-2 transition-colors ${appointmentsView === 'calendar' ? 'bg-[#A9812E] text-[#121113]' : 'bg-white text-[#6B6459] hover:text-[#1C1A16]'}`}
                      title="Vista calendario semanal"
                    >
                      <CalendarDays className="h-4 w-4" />
                    </button>
                  </div>
                  <Button variant="blue" onClick={exportToCSV} size="sm">
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Exportar</span>
                  </Button>
                </div>
              </div>

              {appointmentsView === 'list' ? (
                <div className="bg-white border border-[#E4DCC9] rounded-sm shadow-sm overflow-hidden">
                  <div className="px-4 sm:px-6 py-4 bg-[#F6F2EA] border-b border-[#E4DCC9]">
                    <h3 className="font-serif text-lg sm:text-xl text-[#1C1A16] flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-[#A9812E]" /> Citas Agendadas ({appointments.length})
                    </h3>
                  </div>
                  <AppointmentList
                    appointments={filteredAppointments}
                    onConfirm={handleStatusChange}
                    onCancel={handleStatusChange}
                    onComplete={handleStatusChange}
                    onNoShow={handleStatusChange}
                    onDelete={handleDeleteAppointment}
                    formatDate={formatDate}
                    getStatusColor={getStatusColor}
                    getStatusText={getStatusText}
                    loading={loading}
                  />
                </div>
              ) : (
                <div className="bg-white border border-[#E4DCC9] rounded-sm shadow-sm overflow-hidden">
                  <div className="px-4 sm:px-6 py-4 bg-[#F6F2EA] border-b border-[#E4DCC9] flex items-center justify-between">
                    <h3 className="font-serif text-lg sm:text-xl text-[#1C1A16] flex items-center">
                      <CalendarDays className="h-5 w-5 mr-2 text-[#A9812E]" /> Calendario Semanal
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const newStart = new Date(calendarWeekStart);
                          newStart.setDate(newStart.getDate() - 7);
                          setCalendarWeekStart(newStart);
                        }}
                        className="px-3 py-1.5 border border-[#E4DCC9] rounded-sm text-sm hover:border-[#A9812E]/60 transition-colors"
                      >
                        ← Anterior
                      </button>
                      <button
                        onClick={() => {
                          const newStart = new Date(calendarWeekStart);
                          newStart.setDate(newStart.getDate() + 7);
                          setCalendarWeekStart(newStart);
                        }}
                        className="px-3 py-1.5 border border-[#E4DCC9] rounded-sm text-sm hover:border-[#A9812E]/60 transition-colors"
                      >
                        Siguiente →
                      </button>
                      <button
                        onClick={() => setCalendarWeekStart(new Date())}
                        className="px-3 py-1.5 bg-[#A9812E] text-[#121113] rounded-sm text-sm font-medium hover:bg-[#C9A860] transition-colors"
                      >
                        Hoy
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 divide-x divide-[#E4DCC9]">
                    {getWeekDates(calendarWeekStart).map((date, idx) => {
                      const dayAppointments = appointments.filter((apt) => {
                        const aptDate = new Date(apt.appointment_date + 'T00:00:00');
                        return isSameDay(aptDate, date);
                      });
                      const isToday = isSameDay(date, new Date());
                      return (
                        <div key={idx} className={`flex flex-col ${isToday ? 'bg-[#A9812E]/5' : ''}`}>
                          <div className={`px-2 py-3 text-center border-b border-[#E4DCC9] ${isToday ? 'bg-[#A9812E]/10' : 'bg-[#F6F2EA]'}`}>
                            <p className="text-xs font-medium text-[#6B6459] uppercase">{formatWeekdayName(date)}</p>
                            <p className={`text-lg font-serif ${isToday ? 'text-[#A9812E] font-bold' : 'text-[#1C1A16]'}`}>{formatDayNumber(date)}</p>
                          </div>
                          <div className="flex-1 p-2 min-h-[200px] space-y-2">
                            {dayAppointments.length === 0 ? (
                              <p className="text-xs text-[#B7B1A3] text-center py-4">Sin citas</p>
                            ) : (
                              dayAppointments.map((apt) => (
                                <div key={apt.id} className={`p-2 rounded-sm border text-xs ${getStatusColor(apt.status)}`}>
                                  <p className="font-medium truncate">{apt.appointment_time}</p>
                                  <p className="truncate font-semibold">{apt.client_name}</p>
                                  <p className="truncate opacity-80">{apt.service_name}</p>
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
            </>
          )}

          {activeTab === 'barbers' && <BarberManager business={businessInfo} />}
          {activeTab === 'workstations' && <WorkstationManager business={businessInfo} />}
          {activeTab === 'notifications' && <NotificationsCenter business={businessInfo} />}
          {activeTab === 'settings' && <SettingsEditor business={businessInfo} onUpdate={() => { invalidateBusinessSettingsCache(); fetchStats(); fetchAppointments(); }} />}
          {activeTab === 'clients' && <ClientsView />}
          {activeTab === 'performance' && <PerformanceView />}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
