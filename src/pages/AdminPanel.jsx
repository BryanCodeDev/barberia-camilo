import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Shield, Users, Scissors, LayoutDashboard, Calendar,
  BarChart3, MessageSquare, Settings, BookOpen, Menu
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { invalidateBusinessSettingsCache } from '../hooks/useBusinessSettings';
import { useSessionManager } from '../hooks/useSessionManager';
import { useAdminNavigation } from '../hooks/useAdminNavigation';
import useWebSocket from '../hooks/useWebSocket';
import AdminSidebar from '../components/layout/AdminSidebar';
import LoginForm from '../components/auth/LoginForm';
import ErrorBanner from '../components/ui/ErrorBanner';
import Modal from '../components/ui/Modal';
import DashboardView from '../components/admin/DashboardView';
import AppointmentManager from '../components/admin/AppointmentManager';
import BarberManager from '../components/admin/BarberManager';
import WorkstationManager from '../components/admin/WorkstationManager';
import ServiceManager from '../components/admin/ServiceManager';
import ClientManager from '../components/admin/ClientManager';
import PerformanceView from '../components/admin/PerformanceView';
import NotificationsCenter from '../components/admin/NotificationsCenter';
import SettingsEditor from '../components/admin/SettingsEditor';
import Help from '../components/admin/Help';
import ProfileMenu from '../components/profile/ProfileMenu';
import SessionReplacedModal from '../components/common/SessionReplacedModal';

const defaultBusiness = { name: 'BARBERÍA EL BRONX', title: 'EL BRONX' };

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard, roles: ['admin', 'barber'] },
  { id: 'appointments', label: 'Citas', icon: Calendar, roles: ['admin', 'barber'] },
  { id: 'barbers', label: 'Barberos', icon: Users, roles: ['admin'] },
  { id: 'workstations', label: 'Estaciones', icon: Scissors, roles: ['admin', 'barber'] },
  { id: 'services', label: 'Servicios', icon: Scissors, roles: ['admin', 'barber'] },
  { id: 'clients', label: 'Clientes', icon: Users, roles: ['admin', 'barber'] },
  { id: 'performance', label: 'Desempeno', icon: BarChart3, roles: ['admin', 'barber'] },
  { id: 'notifications', label: 'Notificaciones', icon: MessageSquare, roles: ['admin', 'barber'] },
  { id: 'help', label: 'Ayuda', icon: BookOpen, roles: ['admin'] },
];

const TAB_META = {
  dashboard: { label: 'Resumen', breadcrumb: ['Resumen'] },
  appointments: { label: 'Citas', breadcrumb: ['Citas'] },
  barbers: { label: 'Barberos', breadcrumb: ['Gestion', 'Barberos'] },
  workstations: { label: 'Estaciones', breadcrumb: ['Gestion', 'Estaciones'] },
  services: { label: 'Servicios', breadcrumb: ['Gestion', 'Servicios'] },
  clients: { label: 'Clientes', breadcrumb: ['Gestion', 'Clientes'] },
  performance: { label: 'Desempeno', breadcrumb: ['Analisis', 'Desempeno'] },
  notifications: { label: 'Notificaciones', breadcrumb: ['Sistema', 'Notificaciones'] },
  help: { label: 'Ayuda', breadcrumb: ['Sistema', 'Ayuda'] },
};

const AdminPanel = ({ onClose, business }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login: authLogin, logout: authLogout, user, sessionReplaced, setSessionReplaced } = useSessionManager('admin');
  const { activeTab, setActiveTab } = useAdminNavigation();
  const [showSessionReplacedModal, setShowSessionReplacedModal] = useState(false);
  const userRole = user?.role || 'guest';
  const visibleNavItems = useMemo(() => NAV_ITEMS.filter(item => item.roles.includes(userRole)), [userRole]);
  const adminToken = user?.role === 'admin' || user?.role === 'barber' ? localStorage.getItem('admin_token') : null;

  const { connectionState: wsState, subscribe: wsSubscribe, disconnect: wsDisconnect } = useWebSocket(adminToken);

  const handleLogout = useCallback(() => {
    wsDisconnect();
    authLogout();
    navigate('/');
    setLoginError(null);
    setStats({ total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0, no_show: 0, today: 0, confirmed_revenue_cents: 0, completed_revenue_cents: 0, today_revenue_cents: 0 });
  }, [wsDisconnect, authLogout, navigate]);

  const onSettingsClick = useCallback(() => {
    setSettingsModalOpen(true);
  }, []);

  useEffect(() => {
    if (wsState === 'connected') {
      wsSubscribe('session:replaced', () => {
        setSessionReplaced(true);
      });
    }
    return () => {
      // cleanup handled by hook internals
    };
  }, [wsState, wsSubscribe, setSessionReplaced]);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0, no_show: 0, today: 0, confirmed_revenue_cents: 0, completed_revenue_cents: 0, today_revenue_cents: 0 });
  const [statsLoading, setStatsLoading] = useState(false);
  const [revenuePeriod, setRevenuePeriod] = useState('total');
  const [revenueData, setRevenueData] = useState(null);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [error, setError] = useState(null);
  const [loginError, setLoginError] = useState(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const formatCOP = (cents) => {
    if (cents === null || cents === undefined) return '$0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents);
  };

  const formatPeriodLabel = (period) => {
    switch (period) {
      case 'today': return 'Hoy';
      case 'week': return 'Esta semana';
      case 'month': return 'Este mes';
      case 'total': return 'Total';
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
      navigate(location.pathname || '/admin', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setLoginError(err.message);
    }
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

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchStats(), fetchRevenue()]);
  }, [fetchStats, fetchRevenue]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshAll();
    }
  }, [isAuthenticated, refreshAll]);

  const currentView = useMemo(() => {
    switch (activeTab) {
       case 'dashboard':
         return (
           <DashboardView
             key="dashboard"
             userRole={userRole}
             username={user?.username}
             stats={stats}
             statsLoading={statsLoading}
             revenuePeriod={revenuePeriod}
             setRevenuePeriod={setRevenuePeriod}
             revenueData={revenueData}
             revenueLoading={revenueLoading}
             formatCOP={formatCOP}
             formatPeriodLabel={formatPeriodLabel}
             onRefresh={refreshAll}
           />
         );
      case 'appointments':
        return (
          <AppointmentManager
            key="appointments"
            userRole={userRole}
            business={businessInfo}
            setError={setError}
            fetchStats={refreshAll}
          />
        );
      case 'barbers':
        return <BarberManager key="barbers" business={businessInfo} userRole={userRole} />;
      case 'workstations':
        return <WorkstationManager key="workstations" business={businessInfo} userRole={userRole} />;
      case 'services':
        return <ServiceManager key="services" business={businessInfo} userRole={userRole} />;
      case 'clients':
        return <ClientManager key="clients" userRole={userRole} />;
      case 'performance':
        return <PerformanceView key="performance" userRole={userRole} />;
      case 'notifications':
        return <NotificationsCenter key="notifications" business={businessInfo} userRole={userRole} />;
      case 'help':
        return <Help key="help" />;
      default:
        return null;
    }
  }, [
    activeTab,
    userRole,
    user?.username,
    stats,
    statsLoading,
    revenuePeriod,
    revenueData,
    revenueLoading,
    businessInfo,
    refreshAll,
    formatCOP,
    formatPeriodLabel,
    setError,
  ]);

  const primaryTabIds = useMemo(() => {
    if (userRole === 'barber') {
      return ['dashboard', 'appointments', 'workstations', 'performance'];
    }
    return ['dashboard', 'appointments', 'services', 'clients'];
  }, [userRole]);

  const primaryTabs = useMemo(() => visibleNavItems.filter(t => primaryTabIds.includes(t.id)), [visibleNavItems, primaryTabIds]);
  const secondaryTabs = useMemo(() => visibleNavItems.filter(t => !primaryTabIds.includes(t.id)), [visibleNavItems, primaryTabIds]);

  const iconMap = {
    dashboard: LayoutDashboard,
    appointments: Calendar,
    services: Scissors,
    clients: Users,
    settings: Settings,
    barbers: Users,
    workstations: Scissors,
    performance: BarChart3,
    notifications: MessageSquare,
    help: BookOpen,
  };

  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage: "url('/assets/img/herosection.webp')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
        <div className="absolute inset-0 -z-10 bg-ink/85" />
        <LoginForm
          fields={[
            { name: 'username', label: 'Usuario', type: 'text', placeholder: 'Ingresa tu usuario', required: true },
            { name: 'password', label: 'Contrasena', type: 'password', placeholder: 'Ingresa tu contrasena', required: true },
          ]}
          onSubmit={handleLogin}
          loading={false}
          error={loginError}
          submitLabel="Acceder al Panel"
          headerIcon={Shield}
          headerTitle="Acceso Administrativo"
          headerSubtitle="Barberia El Bronx - Panel de Control"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Mobile Header */}
      <div className="md:hidden bg-[#090909]/95 border-b border-[rgba(255,255,255,0.05)] px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#C9A860] flex items-center justify-center overflow-hidden">
            <img src="/assets/img/logo.webp" alt="Logo" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <h1 className="font-serif text-lg text-white leading-tight">{userRole === 'barber' ? 'Mi Panel' : 'Panel Admin'}</h1>
            <p className="text-xs text-[#A3A3A3] truncate">{businessInfo.name}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          className="p-2.5 text-[#A3A3A3] hover:text-white hover:bg-[#151515] rounded-xl transition-all duration-200"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <AdminSidebar
        tabs={visibleNavItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onClose={onClose}
        businessName={businessInfo.name}
        mobileOpen={mobileNavOpen}
        setMobileOpen={setMobileNavOpen}
        onSettingsClick={onSettingsClick}
        userRole={userRole}
        navigate={navigate}
      />

      {/* Main Content */}
      <div className="md:ml-64 pb-24 md:pb-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {error && (
            <ErrorBanner message={error} onDismiss={() => setError(null)} className="mb-6" />
          )}

          <SessionReplacedModal
            isOpen={showSessionReplacedModal}
            onClose={handleSessionReplacedClose}
          />

          <div className="animate-fade-in">
            {currentView}
          </div>

          <Modal
            isOpen={settingsModalOpen}
            onClose={() => setSettingsModalOpen(false)}
            title="Configuracion del Negocio"
            size="lg"
          >
            <SettingsEditor
              business={businessInfo}
              onUpdate={() => {
                invalidateBusinessSettingsCache();
                fetchStats();
                setSettingsModalOpen(false);
              }}
              userRole={userRole}
            />
          </Modal>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="admin-bottom-nav md:hidden fixed bottom-0 left-0 right-0 z-40">
        <div className="flex items-center justify-around">
          {primaryTabs.map((tab) => {
            const Icon = iconMap[tab.id];
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => { setActiveTab(tab.id); }}
                className={[
                  'admin-bottom-nav-item flex-1',
                  isActive ? 'active' : ''
                ].join(' ')}
              >
                {Icon && <Icon className="h-5 w-5 mb-0.5" />}
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
          {secondaryTabs.length > 0 && (
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="admin-bottom-nav-item text-[#666666] flex-1"
              aria-label="Mas opciones"
            >
              <Menu className="h-5 w-5 mb-0.5" />
              <span>Mas</span>
            </button>
          )}
        </div>
      </nav>
    </div>
  );
};

export default AdminPanel;
