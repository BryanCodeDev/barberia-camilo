import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, ShieldCheck, Crown, LogOut, Lock,
  ArrowLeft, Loader2, Calendar, Clock, MessageSquare, X,
  Edit3, Trash2, Monitor
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { api, setClientToken } from '../services/api';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import ErrorBanner from '../components/ui/ErrorBanner';

const Profile = () => {
  const navigate = useNavigate();
  const { isAuthenticated: isAdminAuth, user: adminUser, logout: adminLogout } = useAuth('admin');
  const { isAuthenticated: isClientAuth, user: clientUser, logout: clientLogout } = useAuth('client');

  const isAuthenticated = isAdminAuth || isClientAuth;
  const user = adminUser || clientUser;
  const authRole = isAdminAuth ? 'admin' : isClientAuth ? 'client' : null;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [clientData, setClientData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [clientPhone, setClientPhone] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [activeSessions, setActiveSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  const clientId = authRole === 'client' ? Number(clientUser?.id || clientUser?.clientId) : null;

  const fetchClientData = useCallback(async () => {
    if (authRole !== 'client' || !clientId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await api.get(`/clients/${clientId}`, true);
      setClientData(data);
      setAppointments(data.appointments || []);
      setForm({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
      });
      setClientPhone(localStorage.getItem('client_phone') || data.phone || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authRole, clientId]);

  const fetchActiveSessions = useCallback(async () => {
    if (authRole !== 'client' || !clientId) return;
    try {
      setSessionsLoading(true);
      const data = await api.get(`/clients/${clientId}/sessions`, true);
      setActiveSessions(data.sessions || []);
    } catch {
      setActiveSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  }, [authRole, clientId]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    if (authRole === 'client' && clientId) {
      fetchClientData();
      fetchActiveSessions();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, authRole, clientId, navigate, fetchClientData, fetchActiveSessions]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await api.patch(`/clients/${clientId}`, form, true);
      setClientData(updated);
      setClientPhone(updated.phone || '');
      localStorage.setItem('client_phone', updated.phone || '');
      setSuccess('Perfil actualizado exitosamente');
      setEditModalOpen(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    setCancelling(selectedAppointment.id);
    setError(null);
    try {
      await api.patch(`/clients/${clientId}/appointments/${selectedAppointment.id}`, {}, true);
      setAppointments(prev => prev.map(a =>
        a.id === selectedAppointment.id ? { ...a, status: 'cancelled' } : a
      ));
      setSuccess('Cita cancelada exitosamente');
      setCancelModalOpen(false);
      setSelectedAppointment(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelling(null);
    }
  };

  const handleLogout = async () => {
    if (authRole === 'admin') {
      adminLogout();
    } else if (authRole === 'client') {
      try {
        const token = localStorage.getItem('client_token');
        if (token) {
          await api.post('/auth/logout', {}, true);
        }
      } catch {
        // noop
      } finally {
        clientLogout();
        localStorage.removeItem('client_id');
        localStorage.removeItem('client_phone');
      }
    }
    navigate('/');
  };

  if (!isAuthenticated && !loading) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-[#C9A860] animate-spin" />
          <p className="text-sm text-[#A3A3A3]">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  const initials = user?.username
    ? user.username.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'US';

  const roleLabel = user?.role === 'admin' ? 'Administrador' : user?.role === 'barber' ? 'Barbero' : 'Cliente';

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const str = String(dateString);
    const match = str.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return dateString;
    const [, year, month, day] = match;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
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

  const canCancel = (apt) => {
    return authRole === 'client' && (apt.status === 'pending' || apt.status === 'confirmed');
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
      <div className="absolute inset-0 -z-10 bg-[#050505]/85" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="animate-fade-in">
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-[#A3A3A3] hover:text-white hover:bg-[#151515] rounded-xl transition-all duration-200"
              aria-label="Volver"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl text-white">Mi Perfil</h1>
              <p className="text-sm text-[#A3A3A3] mt-1">Gestiona tu informacion personal y citas</p>
            </div>
          </div>

          {error && (
            <ErrorBanner message={error} onDismiss={() => setError(null)} type="error" className="mb-6" />
          )}
          {success && (
            <ErrorBanner message={success} onDismiss={() => setSuccess(null)} type="success" className="mb-6" />
          )}

          <div className="bg-[#101010] border border-[rgba(201,168,96,0.12)] rounded-2xl p-6 sm:p-8 mb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#C9A860] flex items-center justify-center shadow-lg shadow-black/40 overflow-hidden">
                  <img src="/assets/img/logo.webp" alt="Logo" className="w-16 h-16 sm:w-20 sm:h-20 object-contain" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#101010] rounded-full flex items-center justify-center border border-[rgba(201,168,96,0.25)]">
                  <Crown className="h-3 w-3 text-[#C9A860]" />
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h2 className="font-serif text-xl sm:text-2xl text-white mb-1">
                  {user?.username || 'Usuario VIP'}
                </h2>
                <p className="text-sm text-[#A3A3A3] mb-3">
                  {user?.email || 'usuario@barberia.com'}
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[rgba(201,168,96,0.10)] border border-[rgba(201,168,96,0.25)] text-[10px] font-semibold text-[#C9A860] uppercase tracking-wider">
                    <Crown className="h-3 w-3" />
                    VIP
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[rgba(201,168,96,0.10)] border border-[rgba(201,168,96,0.25)] text-[10px] font-semibold text-[#C9A860] uppercase tracking-wider">
                    <ShieldCheck className="h-3 w-3" />
                    {roleLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-[#101010] border border-[rgba(201,168,96,0.12)] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-serif text-lg text-white flex items-center gap-2">
                  <User className="h-5 w-5 text-[#C9A860]" />
                  Informacion Personal
                </h3>
                {authRole === 'client' && (
                  <button
                    onClick={() => setEditModalOpen(true)}
                    className="p-2 text-[#A3A3A3] hover:text-[#C9A860] hover:bg-[#151515] rounded-lg transition-all duration-200"
                    title="Editar perfil"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#151515] border border-[rgba(255,255,255,0.05)]">
                    <User className="h-4 w-4 text-[#A3A3A3]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#666666] uppercase tracking-wider mb-1">Nombre</p>
                    <p className="text-sm text-white truncate">{clientData?.name || user?.username || 'No disponible'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#151515] border border-[rgba(255,255,255,0.05)]">
                    <Mail className="h-4 w-4 text-[#A3A3A3]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#666666] uppercase tracking-wider mb-1">Correo electronico</p>
                    <p className="text-sm text-white truncate">{clientData?.email || user?.email || 'No disponible'}</p>
                  </div>
                </div>

                {authRole === 'client' && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#151515] border border-[rgba(255,255,255,0.05)]">
                      <Phone className="h-4 w-4 text-[#A3A3A3]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#666666] uppercase tracking-wider mb-1">Telefono</p>
                      <p className="text-sm text-white">{clientPhone || clientData?.phone || 'No disponible'}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#151515] border border-[rgba(255,255,255,0.05)]">
                    <ShieldCheck className="h-4 w-4 text-[#A3A3A3]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#666666] uppercase tracking-wider mb-1">Rol</p>
                    <p className="text-sm text-white">{roleLabel}</p>
                  </div>
                </div>

                {authRole === 'client' && clientData && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#151515] border border-[rgba(255,255,255,0.05)]">
                      <Calendar className="h-4 w-4 text-[#A3A3A3]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#666666] uppercase tracking-wider mb-1">Citas completadas</p>
                      <p className="text-sm text-white">{appointments.filter(a => a.status === 'completed').length}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#101010] border border-[rgba(201,168,96,0.12)] rounded-2xl p-6">
              <h3 className="font-serif text-lg text-white mb-5 flex items-center gap-2">
                <Lock className="h-5 w-5 text-[#C9A860]" />
                Seguridad
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-[#151515] border border-[rgba(255,255,255,0.05)] opacity-60 cursor-not-allowed">
                  <Lock className="h-5 w-5 text-[#666666]" />
                  <div className="flex-1">
                    <p className="text-sm text-[#A3A3A3]">Cambiar contrasena</p>
                    <p className="text-xs text-[#666666]">Proximamente</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl bg-[#151515] border border-[rgba(255,255,255,0.05)]">
                  <Monitor className="h-5 w-5 text-[#666666]" />
                  <div className="flex-1">
                    <p className="text-sm text-[#A3A3A3]">Sesiones activas</p>
                    <p className="text-xs text-[#666666]">
                      {sessionsLoading ? 'Cargando...' : `${activeSessions.length} sesion(es) activa(s)`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {authRole === 'client' && (
            <div className="bg-[#101010] border border-[rgba(201,168,96,0.12)] rounded-2xl p-6 sm:p-8 mb-6">
              <h3 className="font-serif text-lg text-white mb-5 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#C9A860]" />
                Mis Citas
              </h3>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#C9A860]" />
                </div>
              ) : appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#151515] border border-[rgba(255,255,255,0.05)]">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(apt.status)}`}>
                            {getStatusText(apt.status)}
                          </span>
                          <span className="text-sm text-[#A3A3A3]">
                            {formatDate(apt.appointment_date)} - {apt.appointment_time}
                          </span>
                        </div>
                        <h4 className="font-semibold text-white mb-1">{apt.service_name}</h4>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-[#A3A3A3]">
                          {apt.service_duration && (
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-[#666666]" />
                              {apt.service_duration} min
                            </span>
                          )}
                          {apt.price_cents !== undefined && (
                            <span className="flex items-center gap-1.5 font-medium text-[#C9A860]">
                              ${(apt.price_cents / 100).toLocaleString('es-CO')}
                            </span>
                          )}
                          {apt.barber_name && <span>Barbero: {apt.barber_name}</span>}
                          {apt.workstation_name && <span>Estacion: {apt.workstation_name}</span>}
                        </div>
                        {apt.client_message && (
                          <div className="flex items-start text-sm text-[#D8D3C7] bg-[#121113] p-3 rounded-lg mt-3">
                            <MessageSquare className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-[#C9A860]" />
                            <span className="break-words">{apt.client_message}</span>
                          </div>
                        )}
                      </div>
                      {canCancel(apt) && (
                        <button
                          onClick={() => {
                            setSelectedAppointment(apt);
                            setCancelModalOpen(true);
                          }}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                          Cancelar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-[#666666] mx-auto mb-4" />
                  <h3 className="font-serif text-lg text-white mb-2">No tienes citas agendadas</h3>
                  <p className="text-sm text-[#A3A3A3]">Cuando agendes una cita con tu telefono, aparecera aqui.</p>
                </div>
              )}
            </div>
          )}

          <div className="bg-[#101010] border border-[rgba(239,68,68,0.12)] rounded-2xl p-6">
            <button
              onClick={handleLogout}
              className="group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#EF4444] hover:bg-[#EF4444]/10 transition-all duration-200 w-full"
            >
              <LogOut className="h-5 w-5" />
              <div className="text-left">
                <p className="text-sm font-medium">Cerrar Sesion</p>
                <p className="text-xs text-[#666666] group-hover:text-[#A3A3A3] transition-colors">
                  Finaliza tu sesion actual
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Editar Perfil"
        size="md"
      >
        <form onSubmit={handleUpdateProfile} className="space-y-5">
          <Input
            label="Nombre"
            name="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            placeholder="Tu nombre completo"
          />
          <Input
            label="Correo electronico"
            name="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="correo@ejemplo.com"
          />
          <Input
            label="Telefono"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="3101234567"
            maxLength={10}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setSelectedAppointment(null);
        }}
        title="Cancelar Cita"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#A3A3A3]">
            Esta seguro que desea cancelar la cita del <strong className="text-white">{selectedAppointment && formatDate(selectedAppointment.appointment_date)}</strong> a las <strong className="text-white">{selectedAppointment?.appointment_time}</strong>?
          </p>
          <p className="text-xs text-[#666666]">Esta accion no se puede deshacer.</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setCancelModalOpen(false);
                setSelectedAppointment(null);
              }}
            >
              No, mantener
            </Button>
            <Button
              variant="primary"
              onClick={handleCancelAppointment}
              loading={cancelling === selectedAppointment?.id}
            >
              Si, cancelar cita
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
