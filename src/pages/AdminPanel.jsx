import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield, Users, Scissors, LayoutDashboard, Calendar,
  BarChart3, MessageSquare, Settings, ChevronRight, BookOpen
} from 'lucide-react';
import { api } from '../services/api';
import { invalidateBusinessSettingsCache } from '../hooks/useBusinessSettings';
import useAuth from '../hooks/useAuth';
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
  const { isAuthenticated, login: authLogin, logout: authLogout, user } = useAuth('admin');
  const userRole = user?.role || 'guest';
  const visibleNavItems = NAV_ITEMS.filter(item => item.roles.includes(userRole));

  const [activeTab, setActiveTab] = useState(visibleNavItems[0]?.id || 'dashboard');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, cancelled: 0, today: 0, confirmed_revenue_cents: 0, completed_revenue_cents: 0, today_revenue_cents: 0 });
  const [statsLoading, setStatsLoading] = useState(false);
  const [revenuePeriod, setRevenuePeriod] = useState('today');
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
    } catch (err) {
      console.error('Login error:', err);
      setLoginError(err.message);
    }
  };

  const handleLogout = () => {
    authLogout();
    setLoginError(null);
    setStats({ total: 0, pending: 0, confirmed: 0, cancelled: 0, today: 0, confirmed_revenue_cents: 0, completed_revenue_cents: 0, today_revenue_cents: 0 });
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center p-4 sm:p-6 lg:p-8">
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

  const meta = TAB_META[activeTab] || { label: '', breadcrumb: [] };

  return (
    <div className="min-h-screen bg-cream flex">
      <AdminSidebar
        tabs={visibleNavItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onClose={onClose}
        businessName={businessInfo.name}
        mobileOpen={mobileNavOpen}
        setMobileOpen={setMobileNavOpen}
        onSettingsClick={() => setSettingsModalOpen(true)}
        userRole={userRole}
      />

      <div className="flex-1 md:ml-64 pb-24 md:pb-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {error && (
            <ErrorBanner message={error} onDismiss={() => setError(null)} className="mb-6" />
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
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
              onSettingsClick={() => setSettingsModalOpen(true)}
              onRefresh={refreshAll}
            />
          )}

          {activeTab === 'appointments' && (
            <AppointmentManager
              userRole={userRole}
              business={businessInfo}
              setError={setError}
              fetchStats={refreshAll}
            />
          )}

          {activeTab === 'barbers' && (
            <section className="animate-fade-in">
              <div className="section-header">
                <div>
                  <nav className="flex items-center gap-2 text-xs text-stone mb-2">
                    {meta.breadcrumb.map((crumb, i) => (
                      <span key={i} className="flex items-center gap-2">
                        {i > 0 && <ChevronRight className="h-3 w-3 text-stone-faint" />}
                        <span className={i === meta.breadcrumb.length - 1 ? 'text-ink-soft font-medium' : 'text-stone'}>{crumb}</span>
                      </span>
                    ))}
                  </nav>
                  <h2 className="section-title">Barberos</h2>
                </div>
              </div>
              <div className="animate-fade-in" key="barbers">
                <BarberManager business={businessInfo} userRole={userRole} />
              </div>
            </section>
          )}

          {activeTab === 'workstations' && (
            <section className="animate-fade-in">
              <div className="section-header">
                <div>
                  <nav className="flex items-center gap-2 text-xs text-stone mb-2">
                    {meta.breadcrumb.map((crumb, i) => (
                      <span key={i} className="flex items-center gap-2">
                        {i > 0 && <ChevronRight className="h-3 w-3 text-stone-faint" />}
                        <span className={i === meta.breadcrumb.length - 1 ? 'text-ink-soft font-medium' : 'text-stone'}>{crumb}</span>
                      </span>
                    ))}
                  </nav>
                  <h2 className="section-title">Estaciones de Trabajo</h2>
                </div>
              </div>
              <div className="animate-fade-in" key="workstations">
                <WorkstationManager business={businessInfo} userRole={userRole} />
              </div>
            </section>
          )}

          {activeTab === 'services' && (
            <section className="animate-fade-in">
              <div className="section-header">
                <div>
                  <nav className="flex items-center gap-2 text-xs text-stone mb-2">
                    {meta.breadcrumb.map((crumb, i) => (
                      <span key={i} className="flex items-center gap-2">
                        {i > 0 && <ChevronRight className="h-3 w-3 text-stone-faint" />}
                        <span className={i === meta.breadcrumb.length - 1 ? 'text-ink-soft font-medium' : 'text-stone'}>{crumb}</span>
                      </span>
                    ))}
                  </nav>
                  <h2 className="section-title">Servicios</h2>
                </div>
              </div>
              <div className="animate-fade-in" key="services">
                <ServiceManager business={businessInfo} userRole={userRole} />
              </div>
            </section>
          )}

          {activeTab === 'clients' && (
            <section className="animate-fade-in">
              <div className="section-header">
                <div>
                  <nav className="flex items-center gap-2 text-xs text-stone mb-2">
                    {meta.breadcrumb.map((crumb, i) => (
                      <span key={i} className="flex items-center gap-2">
                        {i > 0 && <ChevronRight className="h-3 w-3 text-stone-faint" />}
                        <span className={i === meta.breadcrumb.length - 1 ? 'text-ink-soft font-medium' : 'text-stone'}>{crumb}</span>
                      </span>
                    ))}
                  </nav>
                  <h2 className="section-title">Clientes</h2>
                </div>
              </div>
              <div className="animate-fade-in" key="clients">
                <ClientManager userRole={userRole} />
              </div>
            </section>
          )}

          {activeTab === 'performance' && (
            <section className="animate-fade-in">
              <div className="section-header">
                <div>
                  <nav className="flex items-center gap-2 text-xs text-stone mb-2">
                    {meta.breadcrumb.map((crumb, i) => (
                      <span key={i} className="flex items-center gap-2">
                        {i > 0 && <ChevronRight className="h-3 w-3 text-stone-faint" />}
                        <span className={i === meta.breadcrumb.length - 1 ? 'text-ink-soft font-medium' : 'text-stone'}>{crumb}</span>
                      </span>
                    ))}
                  </nav>
                  <h2 className="section-title">Desempeno</h2>
                </div>
              </div>
              <div className="animate-fade-in" key="performance">
                <PerformanceView userRole={userRole} />
              </div>
            </section>
          )}

          {activeTab === 'notifications' && (
            <section className="animate-fade-in">
              <div className="section-header">
                <div>
                  <nav className="flex items-center gap-2 text-xs text-stone mb-2">
                    {meta.breadcrumb.map((crumb, i) => (
                      <span key={i} className="flex items-center gap-2">
                        {i > 0 && <ChevronRight className="h-3 w-3 text-stone-faint" />}
                        <span className={i === meta.breadcrumb.length - 1 ? 'text-ink-soft font-medium' : 'text-stone'}>{crumb}</span>
                      </span>
                    ))}
                  </nav>
                  <h2 className="section-title">Notificaciones</h2>
                </div>
              </div>
              <div className="animate-fade-in" key="notifications">
                <NotificationsCenter business={businessInfo} userRole={userRole} />
              </div>
            </section>
          )}

          {activeTab === 'help' && (
            <section className="animate-fade-in">
              <div className="section-header">
                <div>
                  <nav className="flex items-center gap-2 text-xs text-stone mb-2">
                    {meta.breadcrumb.map((crumb, i) => (
                      <span key={i} className="flex items-center gap-2">
                        {i > 0 && <ChevronRight className="h-3 w-3 text-stone-faint" />}
                        <span className={i === meta.breadcrumb.length - 1 ? 'text-ink-soft font-medium' : 'text-stone'}>{crumb}</span>
                      </span>
                    ))}
                  </nav>
                  <h2 className="section-title">Ayuda</h2>
                </div>
              </div>
              <div className="animate-fade-in" key="help">
                <Help />
              </div>
            </section>
          )}

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
    </div>
  );
};

export default AdminPanel;
