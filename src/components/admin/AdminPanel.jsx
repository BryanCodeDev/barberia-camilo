import React, { useState, useEffect, useCallback } from 'react';
import {
  User, Phone, Calendar, Clock, MessageSquare, Trash2,
  Eye, EyeOff, LogOut, Shield, Users, X, Check,
  AlertTriangle, Loader2
} from 'lucide-react';
import { STATUS_LABELS } from '../../utils/constants';
import { api, setAuthToken, getAuthToken } from '../../services/api';

const defaultBusiness = { name: "Barber Trebol", title: "Master Barber" };

const STAT_STYLES = {
  blue: { card: 'bg-[#EEF3FB] border-[#C9D9F0]', label: 'text-[#3B5B8C]', value: 'text-[#1E3352]', icon: 'bg-[#3B5B8C]' },
  yellow: { card: 'bg-[#FBF3E4] border-[#EAD9AE]', label: 'text-[#8B6A22]', value: 'text-[#4A3812]', icon: 'bg-[#A9812E]' },
  green: { card: 'bg-[#EEF5EE] border-[#C7DEC7]', label: 'text-[#3E6B3E]', value: 'text-[#274627]', icon: 'bg-[#4E7A4E]' },
  amber: { card: 'bg-[#FBF3E4] border-[#EAD9AE]', label: 'text-[#8B6A22]', value: 'text-[#4A3812]', icon: 'bg-[#A9812E]' },
};

const AdminPanel = ({ onClose, business }) => {
  const [adminCredentials, setAdminCredentials] = useState({ username: '', password: '' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      setAuthToken(token);
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (business) {
      // Business info available from props
    }
  }, [business]);

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
      setAuthToken(data.token);
      setIsAuthenticated(true);
      setAdminCredentials({ username: '', password: '' });
      setErrors({});
    } catch (err) {
      console.error('Login error:', err);
      setErrors({ general: err.message });
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setIsAuthenticated(false);
    setAdminCredentials({ username: '', password: '' });
    setErrors({});
    setAppointments([]);
  };

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const url = selectedDate
        ? `/admin/appointments?date=${selectedDate}`
        : `/admin/appointments`;
      const data = await api.get(url);
      setAppointments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments();
    }
  }, [isAuthenticated, selectedDate, fetchAppointments]);

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta cita?')) return;
    try {
      setError(null);
      await api.delete(`/appointments/${id}`);
      await fetchAppointments();
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
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAdminCredentials((prev) => ({ ...prev, [name]: value }));
    if (errors[name] || errors.general) setErrors({});
  };

  const filteredAppointments = activeTab === 'all'
    ? appointments
    : appointments.filter((apt) => apt.status === activeTab);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-[#EEF5EE] text-[#3E6B3E]';
      case 'cancelled': return 'bg-[#FBEAEA] text-[#8B2E2E]';
      case 'completed': return 'bg-[#EEF3FB] text-[#3B5B8C]';
      case 'no_show': return 'bg-[#F1EFEB] text-[#6B6459]';
      default: return 'bg-[#FBF3E4] text-[#8B6A22]';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'cancelled': return 'Cancelada';
      case 'completed': return 'Completada';
      case 'no_show': return 'No se presentó';
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
              <button onClick={onClose} className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0 text-[#9A9488] hover:text-[#F6F2EA] transition-colors p-2 hover:bg-[#1B1A1B] rounded-sm">
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
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

  return (
    <div className="min-h-screen bg-[#F6F2EA]">
      <div className="bg-[#121113]">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div className="flex items-center text-[#F6F2EA] mb-4 sm:mb-0">
              <div className="w-11 h-11 rounded-full border border-[#A9812E]/60 flex items-center justify-center mr-3">
                <Users className="h-5 w-5 text-[#C9A860]" />
              </div>
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl">Panel de Administración</h1>
                <p className="text-sm text-[#9A9488]">Gestiona las citas de tu barbería</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={handleLogout} className="border border-[#2A2723] text-[#D8D3C7] px-4 py-2 rounded-sm hover:border-[#A9812E]/60 hover:text-[#C9A860] transition-colors flex items-center text-sm font-medium">
                <LogOut className="h-4 w-4 mr-2" /> <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
              <button onClick={onClose} className="border border-[#2A2723] text-[#D8D3C7] p-2 rounded-sm hover:border-[#A9812E]/60 hover:text-[#C9A860] transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {error && (
          <div className="bg-[#FBEAEA] border border-[#E3B8B8] text-[#8B2E2E] px-4 py-3 rounded-sm text-sm mb-4 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-[#8B2E2E] hover:opacity-70"><X className="h-4 w-4" /></button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-8">
          {[
            { label: 'Total Citas', value: appointments.length, color: 'blue', icon: Calendar },
            { label: 'Pendientes', value: appointments.filter((a) => a.status === 'pending').length, color: 'yellow', icon: Clock },
            { label: 'Confirmadas', value: appointments.filter((a) => a.status === 'confirmed').length, color: 'green', icon: Check },
            { label: 'Hoy', value: appointments.filter((a) => a.appointment_date === new Date().toISOString().split('T')[0]).length, color: 'amber', icon: User },
          ].map((stat, index) => {
            const style = STAT_STYLES[stat.color];
            return (
              <div key={index} className={`p-4 sm:p-6 rounded-sm border ${style.card}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium mb-1 ${style.label}`}>{stat.label}</p>
                    <p className={`text-2xl sm:text-3xl font-serif ${style.value}`}>{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${style.icon}`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'confirmed', 'cancelled', 'completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-sm text-sm font-medium transition-colors ${
                  activeTab === tab ? 'bg-[#A9812E] text-[#121113]' : 'bg-white text-[#6B6459] border border-[#E4DCC9] hover:border-[#A9812E]/60'
                }`}
              >
                {tab === 'all' ? 'Todas' : STATUS_LABELS[tab] || tab}
              </button>
            ))}
          </div>
          <div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-[#E4DCC9] rounded-sm text-sm bg-white focus:ring-2 focus:ring-[#A9812E]/40 focus:border-[#A9812E] outline-none"
            />
            {selectedDate && (
              <button onClick={() => setSelectedDate('')} className="ml-2 text-sm text-[#8B6A22] hover:underline">Limpiar</button>
            )}
          </div>
        </div>

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
                            if (reason !== null) handleStatusChange(appointment.id, 'cancelled', reason);
                          }} className="text-[#8B2E2E] hover:bg-[#FBEAEA] p-2 rounded-sm transition-colors" title="Cancelar cita">
                            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
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
      </div>
    </div>
  );
};

export default AdminPanel;
