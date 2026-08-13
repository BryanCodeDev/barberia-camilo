import React, { useState, useEffect } from 'react';
import { User, Phone, Calendar, Clock, MessageSquare, LogIn, Loader2 } from 'lucide-react';
import { api, setClientToken, getClientToken } from '../services/api';

const ClientPortal = ({ business }) => {
  const [clientPhone, setClientPhone] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientId, setClientId] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const storedId = localStorage.getItem('client_id');
    const storedPhone = localStorage.getItem('client_phone');
    if (storedId && storedPhone) {
      setClientId(storedId);
      setClientPhone(storedPhone);
      fetchMyAppointments(storedId);
      setIsLoggedIn(true);
    }
  }, []);

  const fetchMyAppointments = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get(`/clients/${id}`);
      setClientName(data.name);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    if (!clientPhone.trim() || !/^\d{10}$/.test(clientPhone.trim())) {
      setError('Ingresa un número de teléfono válido de 10 dígitos');
      return;
    }
    try {
      setLoading(true);
      const data = await api.post('/clients', { phone: clientPhone });
      const id = data.id || data.clientId;
      if (id) {
        setClientId(id);
        localStorage.setItem('client_id', id);
        localStorage.setItem('client_phone', clientPhone);
        setIsLoggedIn(true);
        fetchMyAppointments(id);
      }
    } catch (err) {
      if (err.data?.clientId) {
        const id = err.data.clientId;
        setClientId(id);
        localStorage.setItem('client_id', id);
        localStorage.setItem('client_phone', clientPhone);
        setIsLoggedIn(true);
        fetchMyAppointments(id);
      } else {
        setError(err.message || 'Error al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setClientId(null);
    setClientPhone('');
    setClientName('');
    setAppointments([]);
    localStorage.removeItem('client_id');
    localStorage.removeItem('client_phone');
  };

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

  return (
    <div className="min-h-screen bg-[#F6F2EA]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl md:text-4xl text-[#1C1A16] mb-3">Portal del Cliente</h1>
          <p className="text-[#6B6459]">Accede para ver tu historial de citas</p>
        </div>

        {!isLoggedIn ? (
          <div className="bg-white border border-[#E4DCC9] rounded-sm shadow-sm p-6 sm:p-8 max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-full border border-[#A9812E]/60 flex items-center justify-center mx-auto mb-4">
                <User className="h-6 w-6 text-[#8B6A22]" />
              </div>
              <h2 className="font-serif text-xl text-[#1C1A16] mb-2">Iniciar Sesión</h2>
              <p className="text-sm text-[#6B6459]">Ingresa tu número de teléfono para acceder a tus citas</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-[#FBEAEA] border border-[#E3B8B8] text-[#8B2E2E] px-4 py-3 rounded-sm text-sm">{error}</div>
              )}
              <div>
                <label className="flex items-center text-sm font-medium text-[#1C1A16] mb-2"><Phone className="h-4 w-4 mr-2 text-[#A9812E]" />Teléfono</label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E4DCC9] rounded-sm focus:ring-2 focus:ring-[#A9812E]/40 focus:border-[#A9812E] outline-none"
                  placeholder="3101234567"
                  maxLength={10}
                />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#A9812E] text-[#121113] py-3 rounded-sm font-semibold text-sm uppercase tracking-wide hover:bg-[#C9A860] transition-colors disabled:opacity-50 flex items-center justify-center">
                {loading ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Verificando...</> : <><LogIn className="h-5 w-5 mr-2" /> Acceder</>}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white border border-[#E4DCC9] rounded-sm p-6 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl text-[#1C1A16]">Bienvenido, {clientName || 'Cliente'}</h2>
                <p className="text-sm text-[#6B6459] mt-1">Teléfono: {clientPhone}</p>
              </div>
              <button onClick={handleLogout} className="border border-[#E4DCC9] text-[#6B6459] px-4 py-2 rounded-sm text-sm hover:border-[#A9812E] hover:text-[#8B6A22] transition-colors">
                Cerrar Sesión
              </button>
            </div>
            <div className="bg-white border border-[#E4DCC9] rounded-sm shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-[#F6F2EA] border-b border-[#E4DCC9]">
                <h3 className="font-serif text-lg text-[#1C1A16] flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-[#A9812E]" /> Mis Citas
                </h3>
              </div>
              {appointments.length > 0 ? (
                <div className="divide-y divide-[#E4DCC9]">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="p-4 sm:p-6 hover:bg-[#F6F2EA]/50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-sm text-xs font-medium ${getStatusColor(apt.status)}`}>
                              {getStatusText(apt.status)}
                            </span>
                            <span className="text-sm text-[#6B6459]">{formatDate(apt.appointment_date)} - {apt.appointment_time}</span>
                          </div>
                          <h4 className="font-semibold text-[#1C1A16]">{apt.service_name}</h4>
                          <p className="text-sm text-[#6B6459]">Duración: {apt.service_duration} min</p>
                          {apt.client_message && (
                            <div className="flex items-start text-sm text-[#1C1A16] bg-[#EEF3FB] p-3 rounded-sm mt-3">
                              <MessageSquare className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-[#3B5B8C]" />
                              <span className="break-words">{apt.client_message}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 px-4">
                  <Calendar className="h-12 w-12 text-[#D8D3C7] mx-auto mb-4" />
                  <h3 className="font-serif text-lg text-[#1C1A16] mb-2">No tienes citas agendadas</h3>
                  <p className="text-[#6B6459] max-w-md mx-auto text-sm">Cuando agendes una cita con tu teléfono, aparecerá aquí.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientPortal;
