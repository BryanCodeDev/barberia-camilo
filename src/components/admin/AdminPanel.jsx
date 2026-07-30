import React, { useState, useEffect } from 'react';
import {
  User, Phone, Calendar, Clock, MessageSquare, Trash2,
  Eye, EyeOff, LogOut, Shield, Users, X, Check,
  AlertTriangle, Loader2
} from 'lucide-react';
import { APP_CONFIG, STATUS_LABELS } from '../../utils/constants';

const apiBaseUrl = APP_CONFIG.apiBaseUrl;

const AdminPanel = ({ onClose }) => {
  const [adminCredentials, setAdminCredentials] = useState({ username: '', password: '' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!adminCredentials.username.trim()) newErrors.username = 'El usuario es requerido';
    if (!adminCredentials.password.trim()) newErrors.password = 'La contraseña es requerida';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setError(null);
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: adminCredentials.username,
          password: adminCredentials.password,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Credenciales incorrectas');
      }
      const data = await response.json();
      setToken(data.token);
      setIsAuthenticated(true);
      setAdminCredentials({ username: '', password: '' });
      setErrors({});
    } catch (err) {
      setErrors({ general: err.message });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setToken(null);
    setAdminCredentials({ username: '', password: '' });
    setErrors({});
    setAppointments([]);
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = selectedDate
        ? `${apiBaseUrl}/admin/appointments?date=${selectedDate}`
        : `${apiBaseUrl}/admin/appointments`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Error al cargar las citas');
      const data = await response.json();
      setAppointments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta cita?')) return;
    try {
      setError(null);
      const response = await fetch(`${apiBaseUrl}/appointments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Error al eliminar la cita');
      await fetchAppointments();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (id, newStatus, cancelledReason = null) => {
    try {
      setError(null);
      const response = await fetch(`${apiBaseUrl}/appointments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus, cancelled_reason: cancelledReason }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al actualizar el estado');
      }
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
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'no_show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
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
      <div className="min-h-screen bg-gray-50">
        <div className="w-full min-h-screen bg-white">
          <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex flex-col">
            <div className="bg-white shadow-sm border-b border-gray-200 p-4 sm:p-6 lg:p-8">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <div className="flex items-center mb-4 sm:mb-0">
                  <div className="bg-amber-100 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mr-4">
                    <Shield className="h-6 w-6 sm:h-7 sm:w-7 text-amber-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Panel de Administración</h1>
                    <p className="text-sm sm:text-base text-gray-600">Iniciar sesión para gestionar tu barbería</p>
                  </div>
                </div>
                <button onClick={onClose} className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0 text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-lg">
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
              <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-200">
                  <div className="text-center mb-8">
                    <div className="bg-amber-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Administrativo</h2>
                    <p className="text-gray-600">Ingresa tus credenciales para continuar</p>
                  </div>
                  <form onSubmit={handleLogin} className="space-y-6">
                    {errors.general && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{errors.general}</div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
                      <input
                        type="text" name="username" value={adminCredentials.username} onChange={handleInputChange}
                        className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Ingresa tu usuario"
                      />
                      {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'} name="password" value={adminCredentials.password} onChange={handleInputChange}
                          className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent pr-12 transition-colors ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="Ingresa tu contraseña"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1">
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                    </div>
                    <button type="submit" className="w-full bg-amber-500 text-white px-4 py-3 rounded-lg font-bold hover:bg-amber-600 transition-colors flex items-center justify-center text-base shadow-lg">
                      <Shield className="h-5 w-5 mr-2" /> Acceder al Panel
                    </button>
                  </form>
                  <div className="text-center text-sm text-gray-500 mt-6 p-4 bg-gray-50 rounded-lg">
                    <p><strong>Credenciales de prueba:</strong></p>
                    <p className="mt-1">Usuario: <code className="bg-white px-2 py-1 rounded text-xs">camilo</code></p>
                    <p className="mt-1">Contraseña: <code className="bg-white px-2 py-1 rounded text-xs">camilo123</code></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full min-h-screen bg-white">
        <div className="bg-gradient-to-r from-amber-400 to-amber-500 shadow-lg">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <div className="flex items-center text-black mb-4 sm:mb-0">
                <Users className="h-6 w-6 sm:h-7 sm:w-7 mr-3" />
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Panel de Administración</h1>
                  <p className="text-sm sm:text-base opacity-80">Gestiona las citas de tu barbería</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={handleLogout} className="bg-black bg-opacity-20 text-black px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors flex items-center text-sm font-medium">
                  <LogOut className="h-4 w-4 mr-2" /> <span className="hidden sm:inline">Cerrar Sesión</span>
                </button>
                <button onClick={onClose} className="bg-black bg-opacity-20 text-black p-2 rounded-lg hover:bg-opacity-30 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4 flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600"><X className="h-4 w-4" /></button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {[
              { label: 'Total Citas', value: appointments.length, color: 'blue', icon: Calendar },
              { label: 'Pendientes', value: appointments.filter((a) => a.status === 'pending').length, color: 'yellow', icon: Clock },
              { label: 'Confirmadas', value: appointments.filter((a) => a.status === 'confirmed').length, color: 'green', icon: Check },
              { label: 'Hoy', value: appointments.filter((a) => a.appointment_date === new Date().toISOString().split('T')[0]).length, color: 'amber', icon: User },
            ].map((stat, index) => (
              <div key={index} className={`bg-white bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100 p-4 sm:p-6 rounded-xl border border-${stat.color}-200 hover:shadow-lg transition-shadow`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-${stat.color}-600 text-sm font-medium mb-1`}>{stat.label}</p>
                    <p className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-${stat.color}-900`}>{stat.value}</p>
                  </div>
                  <div className={`bg-${stat.color}-500 p-3 rounded-full`}>
                    <stat.icon className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex space-x-2">
              {['all', 'pending', 'confirmed', 'cancelled', 'completed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    activeTab === tab ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              {selectedDate && (
                <button onClick={() => setSelectedDate('')} className="ml-2 text-sm text-amber-600 hover:underline">Limpiar</button>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 mr-2" /> Citas Agendadas ({appointments.length})
              </h3>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              </div>
            ) : appointments.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start sm:items-center space-x-3">
                          <div className="bg-amber-100 p-2 rounded-full flex-shrink-0">
                            <User className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-base sm:text-lg truncate">{appointment.client_name}</h4>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{appointment.client_phone}</span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div className="font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                            <span className="text-gray-600">Servicio: </span>{appointment.service_name}
                          </div>
                          <div className="flex items-center text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                            <Calendar className="h-3 w-3 mr-2 flex-shrink-0" />
                            <span className="truncate">{formatDate(appointment.appointment_date)} - {appointment.appointment_time}</span>
                          </div>
                        </div>
                        {appointment.client_message && (
                          <div className="flex items-start text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                            <MessageSquare className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-blue-500" />
                            <span className="break-words">{appointment.client_message}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between sm:justify-end space-x-3 flex-shrink-0">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                        </span>
                        <div className="flex items-center space-x-2">
                          {appointment.status === 'pending' && (
                            <button onClick={() => handleStatusChange(appointment.id, 'confirmed')} className="text-green-600 hover:text-green-800 hover:bg-green-50 p-2 rounded-lg transition-colors" title="Confirmar cita">
                              <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                          )}
                          {appointment.status === 'pending' && (
                            <button onClick={() => {
                              const reason = window.prompt('Motivo de cancelación:');
                              if (reason !== null) handleStatusChange(appointment.id, 'cancelled', reason);
                            }} className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Cancelar cita">
                              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                          )}
                          <button onClick={() => handleDeleteAppointment(appointment.id)} className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Eliminar cita">
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
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">No hay citas agendadas</h3>
                <p className="text-gray-500 max-w-md mx-auto">Las citas aparecerán aquí cuando los clientes las agenden.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;