import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Phone, Calendar, Clock, MessageSquare, LogIn, Send, RefreshCw, ArrowLeft } from 'lucide-react';
import { api, setClientToken } from '../services/api';
import useAuth from '../hooks/useAuth';
import { useSessionManager } from '../hooks/useSessionManager';
import useWebSocket from '../hooks/useWebSocket';
import LoginForm from '../components/auth/LoginForm';
import Button from '../components/ui/Button';
import ErrorBanner from '../components/ui/ErrorBanner';
import Loader from '../components/ui/Loader';
import SessionReplacedModal from '../components/common/SessionReplacedModal';
import { useNavigate } from 'react-router-dom';

const ClientPortal = ({ business }) => {
  const navigate = useNavigate();
  const { isAuthenticated: adminAuth } = useAuth('admin');
  const { isAuthenticated: clientAuth, login: clientLogin, logout: clientLogout, user: clientUser } = useAuth('client');
  const {
    isAuthenticated: sessionOk,
    login: sessionLogin,
    logout: sessionLogout,
    user: sessionUser,
    sessionReplaced,
    setSessionReplaced,
  } = useSessionManager('client');
  const isLoggedIn = clientAuth && sessionOk;
  const effectiveUser = sessionUser || clientUser;
  const [loginStep, setLoginStep] = useState('phone');
  const [clientPhone, setClientPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientId, setClientId] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState(null);
  const [showSessionReplacedModal, setShowSessionReplacedModal] = useState(false);
  const cooldownIntervalRef = useRef(null);
  const clientToken = isLoggedIn ? localStorage.getItem('client_token') : null;
  const { subscribe, disconnect: wsDisconnect } = useWebSocket(clientToken);

  useEffect(() => {
    if (!isLoggedIn || !clientId) return;
    const unsubs = [
      subscribe('appointment:status-changed', () => fetchMyAppointments(clientId)),
      subscribe('appointment:cancelled', () => fetchMyAppointments(clientId)),
      subscribe('appointment:updated', () => fetchMyAppointments(clientId)),
    ];
    return () => unsubs.forEach((u) => u && u());
  }, [isLoggedIn, clientId, subscribe]);

  useEffect(() => {
    if (sessionReplaced) {
      setShowSessionReplacedModal(true);
    }
  }, [sessionReplaced]);

  const handleSessionReplacedClose = useCallback(() => {
    setShowSessionReplacedModal(false);
    setSessionReplaced(false);
  }, [setSessionReplaced]);

  useEffect(() => {
    const storedId = localStorage.getItem('client_id');
    const storedPhone = localStorage.getItem('client_phone');
    if (storedId && storedPhone && !isLoggedIn) {
      setClientId(storedId);
      setClientPhone(storedPhone);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
    };
  }, []);

  const startCooldown = (seconds) => {
    setResendCooldown(seconds);
    cooldownIntervalRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const fetchMyAppointments = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get(`/clients/${id}`);
      setClientName(data.name);
      setAppointments(data.appointments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (values) => {
    setError(null);
    const phone = values.phone.trim();
    if (!phone || !/^\d{10}$/.test(phone)) {
      setError('Ingresa un número de teléfono válido de 10 dígitos');
      return;
    }
    try {
      setLoading(true);
      await api.post('/auth/client/request-otp', { phone });
      setClientPhone(phone);
      setLoginStep('otp');
      setOtpCode('');
      setRemainingAttempts(null);
      startCooldown(60);
    } catch (err) {
      if (err.data?.error) {
        setError(err.data.error);
      } else {
        setError(err.message || 'Error al solicitar el código de verificación');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (values) => {
    setError(null);
    const code = values.code.trim();
    if (!code || !/^\d{6}$/.test(code)) {
      setError('Ingresa el código de 6 dígitos que recibiste por WhatsApp');
      return;
    }
    try {
      setLoading(true);
      const data = await api.post('/auth/client/verify-otp', {
        phone: clientPhone,
        code: code,
      });

      if (data.token) {
        setClientToken(data.token);
        sessionLogin(data.token);
      }
      localStorage.setItem('client_id', data.id);
      localStorage.setItem('client_phone', clientPhone);
      setClientId(data.id);
      setClientName(data.name);
      setLoginStep('logged_in');
      fetchMyAppointments(data.id);
    } catch (err) {
      if (err.data?.error) {
        setError(err.data.error);
        if (err.data.remaining_attempts !== undefined) {
          setRemainingAttempts(err.data.remaining_attempts);
        }
      } else {
        setError(err.message || 'Error al verificar el código');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError(null);
    setOtpCode('');
    setRemainingAttempts(null);
    try {
      setLoading(true);
      await api.post('/auth/client/request-otp', { phone: clientPhone });
      startCooldown(60);
    } catch (err) {
      if (err.data?.error) {
        setError(err.data.error);
      } else {
        setError(err.message || 'Error al reenviar el código');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    wsDisconnect();
    try {
      const token = localStorage.getItem('client_token');
      if (token) {
        await api.post('/auth/logout', {}, true);
      }
    } catch {
      // noop
    } finally {
      sessionLogout();
      clientLogout();
      setClientId(null);
      setClientPhone('');
      setClientName('');
      setAppointments([]);
      setLoginStep('phone');
      setOtpCode('');
      setRemainingAttempts(null);
      if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
      setResendCooldown(0);
      localStorage.removeItem('client_id');
      localStorage.removeItem('client_phone');
      navigate('/');
    }
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

  return (
    <div className="relative min-h-screen">
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: "url('/assets/img/herosection.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div className="absolute inset-0 -z-10 bg-[#121113]/85" />
      <SessionReplacedModal
        isOpen={showSessionReplacedModal}
        onClose={handleSessionReplacedClose}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-[#A9812E] text-[#C9A860] overflow-hidden">
              <img src="/assets/img/logo.webp" alt="Logo" className="w-6 h-6 object-contain" />
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl text-white mb-3">Portal del Cliente</h1>
          <p className="text-[#A3A3A3]">Accede para ver tu historial de citas</p>
        </div>

        {!isLoggedIn ? (
          <div>
            {loginStep === 'phone' && (
              <LoginForm
                fields={[
                  { name: 'phone', label: 'Teléfono', type: 'tel', placeholder: '3101234567', required: true, maxLength: 10 },
                ]}
                onSubmit={handleRequestOtp}
                loading={loading}
                error={error}
                submitLabel={
                  <span className="flex items-center justify-center gap-2">
                    <Send className="h-5 w-5" /> Enviar Código
                  </span>
                }
                headerIcon={User}
                headerTitle="Iniciar Sesión"
                headerSubtitle="Ingresa tu número de teléfono y te enviaremos un código de verificación por WhatsApp"
              />
            )}

            {loginStep === 'otp' && (
              <>
                <LoginForm
                  fields={[
                    { name: 'code', label: 'Código', type: 'text', placeholder: '______', required: true, maxLength: 6, inputMode: 'numeric', autoComplete: 'one-time-code', className: 'text-center text-2xl tracking-[0.5em] font-mono' },
                  ]}
                  onSubmit={handleVerifyOtp}
                  loading={loading}
                  error={error}
                  submitLabel={
                    <span className="flex items-center justify-center gap-2">
                      <LogIn className="h-5 w-5" /> Verificar Código
                    </span>
                  }
                  headerIcon={Phone}
                  headerTitle="Código de Verificación"
                  headerSubtitle={`Ingresa el código de 6 dígitos que recibiste por WhatsApp en <strong>${clientPhone}</strong>`}
                />
                {remainingAttempts !== null && (
                  <p className="mt-2 text-xs text-[#8B2E2E] text-center">{remainingAttempts} intento(s) restante(s)</p>
                )}
                <div className="mt-4 text-center">
                  {resendCooldown > 0 ? (
                    <p className="text-sm text-[#6B6459]">Reenviar código en <strong>{resendCooldown}</strong>s</p>
                  ) : (
                    <button
                      onClick={handleResendCode}
                      disabled={loading}
                      className="text-sm text-[#8B6A22] hover:underline disabled:opacity-50 flex items-center justify-center mx-auto"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" /> Reenviar código
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white border border-[#E4DCC9] rounded-sm shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate('/')}
                    className="p-2 hover:bg-[#F6F2EA] rounded-xl transition-colors"
                    title="Volver al inicio"
                  >
                    <ArrowLeft className="h-5 w-5 text-[#6B6459]" />
                  </button>
                  <div>
                    <h2 className="font-serif text-xl text-[#1C1A16]">Bienvenido, {clientName || 'Cliente'}</h2>
                    <p className="text-sm text-[#6B6459] mt-1">Teléfono: {clientPhone}</p>
                  </div>
                </div>
                <Button variant="secondary" onClick={handleLogout} size="sm">
                  Cerrar Sesión
                </Button>
              </div>
              {appointments.length > 0 && (
                <p className="text-xs text-[#8B6A22] mt-3 font-medium ml-12">
                  Llevas {appointments.filter(a => a.status === 'completed').length} cita(s) completada(s)
                </p>
              )}
            </div>
            <div className="bg-white border border-[#E4DCC9] rounded-sm shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-[#F6F2EA] border-b border-[#E4DCC9]">
                <h3 className="font-serif text-lg text-[#1C1A16] flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-[#A9812E]" /> Mis Citas
                </h3>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader size="lg" />
                </div>
              ) : appointments.length > 0 ? (
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
                          {apt.barber_name && (
                            <p className="text-sm text-[#6B6459]">Barbero: {apt.barber_name}</p>
                          )}
                          {apt.workstation_name && (
                            <p className="text-sm text-[#6B6459]">Estación: {apt.workstation_name}</p>
                          )}
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
