import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, ShieldCheck, Crown, LogOut, Pencil, Lock,
  ArrowLeft, Loader2, AlertCircle
} from 'lucide-react';
import useAuth from '../hooks/useAuth';

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth('admin');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', email: '' });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    const timer = setTimeout(() => {
      setLoading(false);
      if (user) {
        setEditForm({
          username: user.username || '',
          email: user.email || '',
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (user) {
      setEditForm({
        username: user.username || '',
        email: user.email || '',
      });
    }
    setIsEditing(false);
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

  const roleLabel = user?.role === 'admin' ? 'Administrador' : user?.role === 'barber' ? 'Barbero' : 'Usuario';

  return (
    <div className="min-h-screen bg-[#050505]">
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
              <p className="text-sm text-[#A3A3A3] mt-1">Gestiona tu información personal</p>
            </div>
          </div>

          <div className="bg-[#101010] border border-[rgba(201,168,96,0.12)] rounded-2xl p-6 sm:p-8 mb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#C9A860] flex items-center justify-center shadow-lg shadow-black/40">
                  <span className="text-[#0A0A0A] font-serif font-bold text-3xl sm:text-4xl">{initials}</span>
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

              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-[#A3A3A3] hover:text-white hover:bg-[#151515] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(201,168,96,0.20)] transition-all duration-200"
              >
                <Pencil className="h-4 w-4" />
                <span className="hidden sm:inline">Editar perfil</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-[#101010] border border-[rgba(201,168,96,0.12)] rounded-2xl p-6">
              <h3 className="font-serif text-lg text-white mb-5 flex items-center gap-2">
                <User className="h-5 w-5 text-[#C9A860]" />
                Informacion Personal
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#151515] border border-[rgba(255,255,255,0.05)]">
                    <User className="h-4 w-4 text-[#A3A3A3]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#666666] uppercase tracking-wider mb-1">Nombre de usuario</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.username}
                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                        className="w-full px-3 py-2 bg-[#151515] border border-[rgba(201,168,96,0.20)] rounded-lg text-sm text-white focus:outline-none focus:border-[#C9A860] transition-colors"
                      />
                    ) : (
                      <p className="text-sm text-white truncate">{user?.username || 'No disponible'}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#151515] border border-[rgba(255,255,255,0.05)]">
                    <Mail className="h-4 w-4 text-[#A3A3A3]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#666666] uppercase tracking-wider mb-1">Correo electronico</p>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full px-3 py-2 bg-[#151515] border border-[rgba(201,168,96,0.20)] rounded-lg text-sm text-white focus:outline-none focus:border-[#C9A860] transition-colors"
                      />
                    ) : (
                      <p className="text-sm text-white truncate">{user?.email || 'No disponible'}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#151515] border border-[rgba(255,255,255,0.05)]">
                    <ShieldCheck className="h-4 w-4 text-[#A3A3A3]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#666666] uppercase tracking-wider mb-1">Rol</p>
                    <p className="text-sm text-white">{roleLabel}</p>
                  </div>
                </div>

                {user?.role === 'client' && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#151515] border border-[rgba(255,255,255,0.05)]">
                      <Phone className="h-4 w-4 text-[#A3A3A3]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#666666] uppercase tracking-wider mb-1">Telefono</p>
                      <p className="text-sm text-white">{localStorage.getItem('client_phone') || 'No disponible'}</p>
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
                <div className="flex items-center gap-3 p-4 rounded-xl bg-[#151515] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(201,168,96,0.20)] transition-all duration-200 cursor-pointer">
                  <Lock className="h-5 w-5 text-[#A3A3A3]" />
                  <div className="flex-1">
                    <p className="text-sm text-white">Cambiar contrasena</p>
                    <p className="text-xs text-[#666666]">Actualiza tu clave de acceso</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl bg-[#151515] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(201,168,96,0.20)] transition-all duration-200 cursor-pointer">
                  <ShieldCheck className="h-5 w-5 text-[#A3A3A3]" />
                  <div className="flex-1">
                    <p className="text-sm text-white">Sesiones activas</p>
                    <p className="text-xs text-[#666666]">Gestiona tus dispositivos conectados</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex items-center justify-end gap-3 mb-6">
              <button
                onClick={handleCancel}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#A3A3A3] hover:text-white hover:bg-[#151515] border border-[rgba(255,255,255,0.05)] transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#C9A860] text-[#0A0A0A] hover:bg-[#E0C47A] transition-all duration-200 btn-press"
              >
                Guardar cambios
              </button>
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
    </div>
  );
};

export default Profile;
