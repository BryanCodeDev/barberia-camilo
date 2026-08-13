import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  User, Phone, Calendar, Clock, MessageSquare, Trash2,
  Eye, EyeOff, LogOut, Shield, Users, X, Check,
  AlertTriangle, Loader2, Scissors, LayoutDashboard,
  BarChart3, Menu, Search, Download, List, CalendarDays
} from 'lucide-react';
import { STATUS_LABELS } from '../../utils/constants';
import { api, setAdminToken } from '../../services/api';
import { invalidateBusinessSettingsCache } from '../../hooks/useBusinessSettings';
import BarberManager from './BarberManager';
import WorkstationManager from './WorkstationManager';
import NotificationsCenter from './NotificationsCenter';
import SettingsEditor from './SettingsEditor';
import PerformanceView from './PerformanceView';
import ClientsView from './ClientsView';

const defaultBusiness = { name: "Barber Trebol", title: "Master Barber" };

const STAT_STYLES = {
  blue: { card: 'bg-[#EEF3FB] border-[#C9D9F0]', label: 'text-[#3B5B8C]', value: 'text-[#1E3352]', icon: 'bg-[#3B5B8C]' },
  yellow: { card: 'bg-[#FBF3E4] border-[#EAD9AE]', label: 'text-[#8B6A22]', value: 'text-[#4A3812]', icon: 'bg-[#A9812E]' },
  green: { card: 'bg-[#EEF5EE] border-[#C7DEC7]', label: 'text-[#3E6B3E]', value: 'text-[#274627]', icon: 'bg-[#4E7A4E]' },
  amber: { card: 'bg-[#FBF3E4] border-[#EAD9AE]', label: 'text-[#8B6A22]', value: 'text-[#4A3812]', icon: 'bg-[#A9812E]' },
};

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
  const [adminCredentials, setAdminCredentials] = useState({ username: '', password: '' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
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

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      setAdminToken(token);
      setIsAuthenticated(true);
    }
  }, []);

  const businessInfo = business || defaultBusiness;

  const handleLogin = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!adminCredentials.username.trim()) newErrors.username = 'El usuario es requerido';
    if (!adminCredentials.password.trim()) newErrors.password = 'La contraseña es requerida';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setError(null);
      const data = await api.post('/auth/login', {
        username: adminCredentials.username,
        password: adminCredentials.password,
      });
      setAdminToken(data.token);
      setIsAuthenticated(true);
      setAdminCredentials({ username: '', password: '' });
      setErrors({});
    } catch (err) {
      console.error('Login error:', err);
      setErrors({ general: err.message });
    }
  };

  const handleLogout = () => {
    setAdminToken(null);
    setIsAuthenticated(false);
    setAdminCredentials({ username: '', password: '' });
    setErrors({});
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAdminCredentials((prev) => ({ ...prev, [name]: value }));
    if (errors[name] || errors.general) setErrors({});
  };

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

  const NavItem = ({ item, isMobile = false }) => {
    const isActive = activeTab === item.id;
    return (
      <button
        onClick={() => {
          setActiveTab(item.id);
          if (isMobile) setMobileNavOpen(false);
        }}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors ${
          isActive
            ? 'bg-[#A9812E]/10 text-[#C9A860]'
            : 'text-[#9A9488] hover:text-[#D8D3C7] hover:bg-[#2A2723]'
        }`}
      >
        <item.icon className="h-4 w-4 flex-shrink-0" />
        <span>{item.label}</span>
      </button>
    );
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
            <div className="w-full max-w-md">
              <div className="bg-[#1B1A1B] rounded-sm shadow-xl p-6 sm:p-8 border border-[#2A2723]">
                <div className="text-center mb-8">
                  <div className="w-14 h-14 rounded-full border border-[#A9812E]/60 flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-6 w-6 text-[#C9A860]" />
                  </div>
                  <h2 className="font-serif text-xl text-[#F6F2EA] mb-2">Acceso Administrativo</h2>
                  <p className="text-sm text-[#9A9488]">Ingresa tus credenciales para continuar</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                  {errors.general && (
                    <div className="bg-[#3A1F1F] border border-[#5A2E2E] text-[#E3B8B8] px-4 py-3 rounded-sm text-sm">{errors.general}</div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-[#D8D3C7] mb-2">Usuario</label>
                    <input
                      type="text" name="username" value={adminCredentials.username} onChange={handleInputChange}
                      className={`w-full px-4 py-3 text-base border rounded-sm focus:ring-2 focus:ring-[#A9812E]/40 focus:border-[#A9812E] outline-none bg-[#121113] text-[#F6F2EA] placeholder-[#6E6A61] ${errors.username ? 'border-[#C25555]' : 'border-[#2A2723]'}`}
                      placeholder="Ingresa tu usuario"
                    />
                    {errors.username && <p className="mt-1 text-sm text-[#E3B8B8]">{errors.username}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#D8D3C7] mb-2">Contraseña</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'} name="password" value={adminCredentials.password} onChange={handleInputChange}
                        className={`w-full px-4 py-3 text-base border rounded-sm focus:ring-2 focus:ring-[#A9812E]/40 focus:border-[#A9812E] pr-12 outline-none bg-[#121113] text-[#F6F2EA] placeholder-[#6E6A61] ${errors.password ? 'border-[#C25555]' : 'border-[#2A2723]'}`}
                        placeholder="Ingresa tu contraseña"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6E6A61] hover:text-[#F6F2EA] p-1">
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.password && <p className="mt-1 text-sm text-[#E3B8B8]">{errors.password}</p>}
                  </div>
                  <button type="submit" className="w-full bg-[#A9812E] text-[#121113] px-4 py-3 rounded-sm font-semibold uppercase tracking-wide hover:bg-[#C9A860] transition-colors flex items-center justify-center text-sm">
                    <Shield className="h-4 w-4 mr-2" /> Acceder al Panel
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 sm:p-6">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full border border-[#A9812E]/60 flex items-center justify-center mr-3">
            <Users className="h-5 w-5 text-[#C9A860]" />
          </div>
          <div>
            <h1 className="font-serif text-lg sm:text-xl text-[#F6F2EA] leading-tight">Panel de Admin</h1>
            <p className="text-xs text-[#9A9488] truncate">{businessInfo.name}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 sm:px-4 py-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.id} item={item} />
        ))}
      </nav>
      <div className="p-3 sm:p-4 border-t border-[#2A2723] space-y-2">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium text-[#9A9488] hover:text-[#D8D3C7] hover:bg-[#2A2723] transition-colors">
          <LogOut className="h-4 w-4 flex-shrink-0" />
          <span>Cerrar Sesión</span>
        </button>
        {onClose && (
          <button onClick={onClose} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium text-[#9A9488] hover:text-[#D8D3C7] hover:bg-[#2A2723] transition-colors">
            <X className="h-4 w-4 flex-shrink-0" />
            <span>Cerrar Panel</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F6F2EA]">
      {/* Header mobile con hamburguesa */}
      <div className="md:hidden bg-[#121113] border-b border-[#2A2723] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-9 h-9 rounded-full border border-[#A9812E]/60 flex items-center justify-center mr-3">
            <Users className="h-4 w-4 text-[#C9A860]" />
          </div>
          <div>
            <h1 className="font-serif text-lg text-[#F6F2EA] leading-tight">Panel de Admin</h1>
            <p className="text-xs text-[#9A9488] truncate">{businessInfo.name}</p>
          </div>
        </div>
        <button
          onClick={() => setMobileNavOpen(true)}
          className="p-2 text-[#9A9488] hover:text-[#F6F2EA] hover:bg-[#1B1A1B] rounded-sm transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Sidebar desktop (fijo) */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 bg-[#121113] border-r border-[#2A2723] z-40">
        <SidebarContent />
      </aside>

      {/* Overlay + drawer mobile */}
      {mobileNavOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-[#121113] border-r border-[#2A2723] shadow-xl transform transition-transform">
            <div className="flex items-center justify-between p-4 border-b border-[#2A2723]">
              <span className="font-serif text-lg text-[#F6F2EA]">Menú</span>
              <button onClick={() => setMobileNavOpen(false)} className="p-2 text-[#9A9488] hover:text-[#F6F2EA] hover:bg-[#1B1A1B] rounded-sm transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="md:ml-64">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {error && (
            <div className="bg-[#FBEAEA] border border-[#E3B8B8] text-[#8B2E2E] px-4 py-3 rounded-sm text-sm mb-4 flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-[#8B2E2E] hover:opacity-70"><X className="h-4 w-4" /></button>
            </div>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5 mb-8">
                {[
                  { label: 'Total Citas', value: stats.total, color: 'blue', icon: Calendar },
                  { label: 'Pendientes', value: stats.pending, color: 'yellow', icon: Clock },
                  { label: 'Confirmadas', value: stats.confirmed, color: 'green', icon: Check },
                  { label: 'Canceladas', value: stats.cancelled, color: 'amber', icon: AlertTriangle },
                  { label: 'Hoy', value: stats.today, color: 'blue', icon: User },
                ].map((stat, index) => {
                  const style = STAT_STYLES[stat.color];
                  return (
                    <div key={index} className={`p-4 sm:p-6 rounded-sm border ${style.card}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-medium mb-1 ${style.label}`}>{stat.label}</p>
                          <p className={`text-2xl sm:text-3xl font-serif ${style.value}`}>{statsLoading ? '...' : stat.value}</p>
                        </div>
                        <div className={`p-3 rounded-full ${style.icon}`}>
                          <stat.icon className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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
                  <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-[#3B5B8C] text-white rounded-sm text-sm font-medium hover:bg-[#1E3352] transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Exportar</span>
                  </button>
                </div>
              </div>

              {appointmentsView === 'list' ? (
                <div className="bg-white border border-[#E4DCC9] rounded-sm shadow-sm overflow-hidden">
                  <div className="px-4 sm:px-6 py-4 bg-[#F6F2EA] border-b border-[#E4DCC9]">
                    <h3 className="font-serif text-lg sm:text-xl text-[#1C1A16] flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-[#A9812E]" /> Citas Agendadas ({appointments.length})
                    </h3>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="h-8 w-8 animate-spin text-[#A9812E]" />
                    </div>
                  ) : appointments.length > 0 ? (
                    <div className="divide-y divide-[#E4DCC9]">
                      {filteredAppointments.map((appointment) => (
                        <div key={appointment.id} className="p-4 sm:p-6 hover:bg-[#F6F2EA]/50 transition-colors">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-start sm:items-center space-x-3">
                                <div className="bg-[#A9812E]/10 p-2 rounded-full flex-shrink-0">
                                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-[#8B6A22]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-[#1C1A16] text-base sm:text-lg truncate">{appointment.client_name}</h4>
                                  <div className="flex items-center text-sm text-[#6B6459] mt-1">
                                    <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                                    <span className="truncate">{appointment.client_phone}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                <div className="font-medium text-[#1C1A16] bg-[#F6F2EA] px-3 py-2 rounded-sm">
                                  <span className="text-[#6B6459]">Servicio: </span>{appointment.service_name}
                                </div>
                                <div className="flex items-center text-[#6B6459] bg-[#F6F2EA] px-3 py-2 rounded-sm">
                                  <Calendar className="h-3 w-3 mr-2 flex-shrink-0" />
                                  <span className="truncate">{formatDate(appointment.appointment_date)} - {appointment.appointment_time}</span>
                                </div>
                              </div>
                              {appointment.client_message && (
                                <div className="flex items-start text-sm text-[#1C1A16] bg-[#EEF3FB] p-3 rounded-sm">
                                  <MessageSquare className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-[#3B5B8C]" />
                                  <span className="break-words">{appointment.client_message}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-between sm:justify-end space-x-3 flex-shrink-0">
                              <span className={`inline-flex items-center px-3 py-1 rounded-sm text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                {getStatusText(appointment.status)}
                              </span>
                              <div className="flex items-center space-x-1">
                                {appointment.status === 'pending' && (
                                  <button onClick={() => handleStatusChange(appointment.id, 'confirmed')} className="text-[#3E6B3E] hover:bg-[#EEF5EE] p-2 rounded-sm transition-colors" title="Confirmar cita">
                                    <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                                  </button>
                                )}
                                {appointment.status === 'pending' && (
                                  <button onClick={() => {
                                    const reason = window.prompt('Motivo de cancelación:');
                                    if (reason !== null && reason.trim().length > 0) handleStatusChange(appointment.id, 'cancelled', reason.trim());
                                  }} className="text-[#8B2E2E] hover:bg-[#FBEAEA] p-2 rounded-sm transition-colors" title="Cancelar cita">
                                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
                                  </button>
                                )}
                                {appointment.status === 'confirmed' && (
                                  <button onClick={() => handleStatusChange(appointment.id, 'completed')} className="text-[#3B5B8C] hover:bg-[#EEF3FB] p-2 rounded-sm transition-colors" title="Marcar como completada">
                                    <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                                  </button>
                                )}
                                {appointment.status === 'confirmed' && (
                                  <button onClick={() => handleStatusChange(appointment.id, 'no-show')} className="text-[#6B6459] hover:bg-[#F1EFEB] p-2 rounded-sm transition-colors" title="Marcar como no se presentó">
                                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                                  </button>
                                )}
                                <button onClick={() => handleDeleteAppointment(appointment.id)} className="text-[#8B2E2E] hover:bg-[#FBEAEA] p-2 rounded-sm transition-colors" title="Eliminar cita">
                                  <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 px-4">
                      <Calendar className="h-12 w-12 text-[#D8D3C7] mx-auto mb-4" />
                      <h3 className="font-serif text-lg text-[#1C1A16] mb-2">No hay citas agendadas</h3>
                      <p className="text-[#6B6459] max-w-md mx-auto text-sm">Las citas aparecerán aquí cuando los clientes las agenden.</p>
                    </div>
                  )}
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
