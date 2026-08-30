import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Phone, Calendar, Clock, MessageSquare, LogIn, Send, RefreshCw, ArrowLeft, Mail, Lock } from 'lucide-react';
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
  const [loginMethod, setLoginMethod] = useState('email');
  const [clientEmail, setClientEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientId, setClientId] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState(null);
  const [showSessionReplacedModal, setShowSessionReplacedModal] = useState(false);
  const [requiresPasswordSetup, setRequiresPasswordSetup] = useState(false);
  const [passwordSetup, setPasswordSetup] = useState({ password: '', confirm: '' });
  const [passwordErrors, setPasswordErrors] = useState({});
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
    const storedEmail = localStorage.getItem('client_email');
    if (storedId && storedEmail && !isLoggedIn) {
      setClientId(storedId);
      setClientEmail(storedEmail);
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

  const validatePasswordSetup = () => {
    const errors = {};
    if (!passwordSetup.password || passwordSetup.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    if (passwordSetup.password !== passwordSetup.confirm) {
      errors.confirm = 'Las contraseñas no coinciden';
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRequestEmailOtp = async (values) => {
    setError(null);
    const email = values.email.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Ingresa un correo electrónico válido');
      return;
    }
    try {
      setLoading(true);
      await api.post('/auth/client/request-email-otp', { email });
      setClientEmail(email);
      setLoginMethod('otp');
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
      setError('Ingresa el código de 6 dígitos que recibiste por correo');
      return;
    }
    try {
      setLoading(true);
      const data = await api.post('/auth/client/verify-email-otp', {
        email: clientEmail,
        code: code,
      });

      if (data.has_password) {
        setLoginMethod('password');
        setOtpCode('');
        setError(null);
        return;
      }

      if (data.token) {
        setClientToken(data.token);
        sessionLogin(data.token);
      }
      localStorage.setItem('client_id', data.id);
      localStorage.setItem('client_email', clientEmail);
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

  const handlePasswordLogin = async (values) => {
    setError(null);
    const email = values.email.trim();
    const password = values.password;
    if (!email || !password) {
      setError('Ingresa tu correo y contraseña');
      return;
    }
    try {
      setLoading(true);
      const data = await api.post('/auth/client/login', { email, password });

      if (data.token) {
        setClientToken(data.token);
        sessionLogin(data.token);
      }
      localStorage.setItem('client_id', data.id);
      localStorage.setItem('client_email', email);
      setClientId(data.id);
      setClientName(data.name);
      setLoginStep('logged_in');
      fetchMyAppointments(data.id);
    } catch (err) {
      if (err.data?.error) {
        setError(err.data.error);
      } else {
        setError(err.message || 'Error al iniciar sesión');
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
      await api.post('/auth/client/request-email-otp', { email: clientEmail });
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
      setClientEmail('');
      setClientName('');
      setAppointments([]);
      setLoginMethod('email');
      setOtpCode('');
      setRemainingAttempts(null);
      setRequiresPasswordSetup(false);
      setPasswordSetup({ password: '', confirm: '' });
      setPasswordErrors({});
      if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
      setResendCooldown(0);
      localStorage.removeItem('client_id');
      localStorage.removeItem('client_email');
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
            {loginMethod === 'email' && (
              <div className="max-w-md mx-auto">
                <div className="bg-ink border border-ink-line rounded-2xl shadow-2xl overflow-hidden">
                  <div className="p-6 sm:p-8 text-center border-b border-ink-line">
                    <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center shadow-lg shadow-gold/20 overflow-hidden">
                      <img src="/assets/img/logo.webp" alt="Logo" className="w-12 h-12 object-contain" />
                    </div>
                    <h2 className="font-serif text-2xl text-cream mb-2">Iniciar Sesion</h2>
                    <p className="text-sm text-stone-light">Ingresa tu correo electronico para recibir un codigo de 6 digitos</p>
                  </div>
                  <div className="p-6 sm:p-8 space-y-4">
                    {error && <ErrorBanner message={error} className="mb-4" />}
                    <LoginForm
                      fields={[
                        { name: 'email', label: 'Correo electrónico', type: 'email', placeholder: 'tu@email.com', required: true },
                      ]}
                      onSubmit={handleRequestEmailOtp}
                      loading={loading}
                      error={error}
                      submitLabel={
                        <span className="flex items-center justify-center gap-2">
                          <Send className="h-5 w-5" /> Enviar Código
                        </span>
                      }
                      headerIcon={Mail}
                      headerTitle="Iniciar Sesion"
                      headerSubtitle="Ingresa tu correo electrónico y te enviaremos un código de verificación de 6 dígitos"
                    />

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-ink-line"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-ink text-stone-light">o inicia sesion con contraseña</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setLoginMethod('password')}
                      className="w-full text-sm text-[#8B6A22] hover:underline flex items-center justify-center"
                    >
                      <Lock className="h-4 w-4 mr-1" /> Ingresar con contraseña
                    </button>
                  </div>
                </div>
              </div>
            )}

            {loginMethod === 'otp' && (
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
                  headerIcon={Mail}
                  headerTitle="Código de Verificación"
                  headerSubtitle={`Ingresa el código de 6 dígitos que recibiste por correo en <strong>${clientEmail}</strong>`}
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
                <div className="mt-4 text-center">
                  <button
                    onClick={() => { setLoginMethod('email'); setError(null); }}
                    className="text-sm text-[#8B6A22] hover:underline"
                  >
                    Volver a ingresar correo
                  </button>
                </div>
              </>
            )}

            {loginMethod === 'password' && (
              <div className="max-w-md mx-auto">
                <div className="bg-ink border border-ink-line rounded-2xl shadow-2xl overflow-hidden">
                  <div className="p-6 sm:p-8 text-center border-b border-ink-line">
                    <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center shadow-lg shadow-gold/20 overflow-hidden">
                      <img src="/assets/img/logo.webp" alt="Logo" className="w-12 h-12 object-contain" />
                    </div>
                    <h2 className="font-serif text-2xl text-cream mb-2">Iniciar Sesion</h2>
                    <p className="text-sm text-stone-light">Ingresa tu correo y contraseña</p>
                  </div>
                  <div className="p-6 sm:p-8 space-y-4">
                    {error && <ErrorBanner message={error} className="mb-4" />}
                    <LoginForm
                      fields={[
                        { name: 'email', label: 'Correo electrónico', type: 'email', placeholder: 'tu@email.com', required: true },
                        { name: 'password', label: 'Contraseña', type: 'password', placeholder: 'Tu contraseña', required: true },
                      ]}
                      onSubmit={handlePasswordLogin}
                      loading={loading}
                      error={error}
                      submitLabel={
                        <span className="flex items-center justify-center gap-2">
                          <LogIn className="h-5 w-5" /> Ingresar
                        </span>
                      }
                      headerIcon={Lock}
                      headerTitle="Iniciar Sesion"
                      headerSubtitle="Ingresa tu correo y contraseña"
                    />

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-ink-line"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-ink text-stone-light">o ingresa con codigo</span>
                      </div>
                    </div>

                    <button
                      onClick={() => { setLoginMethod('email'); setError(null); }}
                      className="w-full text-sm text-[#8B6A22] hover:underline flex items-center justify-center"
                    >
                      <Mail className="h-4 w-4 mr-1" /> Ingresar con código por correo
                    </button>
                  </div>
                </div>
              </div>
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
                    <p className="text-sm text-[#6B6459] mt-1">Email: {clientEmail}</p>
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
                  <p className="text-[#6B6459] max-w-md mx-auto text-sm">Cuando agendes una cita, aparecerá aquí.</p>
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
