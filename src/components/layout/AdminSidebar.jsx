import React, { useState } from 'react';
import {
  LayoutDashboard, Calendar, Users, Scissors, BarChart3,
  MessageSquare, Settings, LogOut, X, Menu,
  ChevronDown, ChevronRight, BookOpen
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    id: 'principal',
    label: 'Principal',
    items: [
      { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
      { id: 'appointments', label: 'Citas', icon: Calendar },
    ],
  },
  {
    id: 'gestion',
    label: 'Gestion',
    items: [
      { id: 'barbers', label: 'Barberos', icon: Users },
      { id: 'workstations', label: 'Estaciones', icon: Scissors },
      { id: 'services', label: 'Servicios', icon: Scissors },
      { id: 'clients', label: 'Clientes', icon: Users },
    ],
  },
  {
    id: 'analisis',
    label: 'Analisis',
    items: [
      { id: 'performance', label: 'Desempeno', icon: BarChart3 },
    ],
  },
  {
    id: 'sistema',
    label: 'Sistema',
    items: [
      { id: 'notifications', label: 'Notificaciones', icon: MessageSquare },
      { id: 'help', label: 'Ayuda', icon: BookOpen },
    ],
  },
];

const AdminSidebar = ({ tabs, activeTab, setActiveTab, onLogout, onClose, businessName, mobileOpen, setMobileOpen, onSettingsClick, userRole }) => {
  const [sectionsExpanded, setSectionsExpanded] = useState({
    principal: true,
    gestion: true,
    analisis: true,
    sistema: true,
  });

  const toggleSection = (sectionId) => {
    setSectionsExpanded(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const NavItem = ({ item }) => {
    const isActive = activeTab === item.id;
    const isSettings = item.id === 'settings';
    return (
      <button
        onClick={() => {
          if (isSettings && onSettingsClick) {
            onSettingsClick();
          } else {
            setActiveTab(item.id);
          }
          setMobileOpen(false);
        }}
        className={[
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group',
          isActive && !isSettings
            ? 'bg-gold/15 text-gold-light shadow-sm'
            : isSettings
              ? 'text-stone-light hover:text-cream hover:bg-ink-panel'
              : 'text-stone-light hover:text-cream hover:bg-ink-panel',
        ].join(' ')}
      >
        {isActive && !isSettings && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gold rounded-r-full" />
        )}
        <item.icon className={[
          'h-5 w-5 flex-shrink-0 transition-colors',
          isActive && !isSettings ? 'text-gold-light' : 'text-stone-dim group-hover:text-cream',
        ].join(' ')} />
        <span className="truncate">{item.label}</span>
      </button>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 sm:p-6">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center mr-3 shadow-lg shadow-gold/20">
            <span className="text-ink font-serif font-bold text-lg">EB</span>
          </div>
          <div className="min-w-0">
            <h1 className="font-serif text-lg sm:text-xl text-cream leading-tight truncate">Panel Admin</h1>
            <p className="text-xs text-stone-light truncate">{businessName}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 sm:px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar">
        {NAV_SECTIONS.map((section) => {
          const sectionItems = section.items.filter(item =>
            tabs.some(t => t.id === item.id)
          );
          if (sectionItems.length === 0) return null;

          const isExpanded = sectionsExpanded[section.id];
          return (
            <div key={section.id} className="mb-2">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-stone-faint uppercase tracking-wider hover:text-stone-light transition-colors"
              >
                <span>{section.label}</span>
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </button>
              {isExpanded && (
                <div className="space-y-1 animate-slide-down">
                  {sectionItems.map((item) => (
                    <NavItem key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {onSettingsClick && (
          <div className="mt-4 pt-4 border-t border-ink-line">
            <NavItem item={{ id: 'settings', label: 'Configuracion', icon: Settings }} />
          </div>
        )}
      </nav>

      <div className="p-3 sm:p-4 border-t border-ink-line space-y-1">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-light hover:text-status-red hover:bg-status-red/10 transition-all duration-200"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          <span>Cerrar Sesion</span>
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-light hover:text-cream hover:bg-ink-panel transition-all duration-200"
          >
            <X className="h-4 w-4 flex-shrink-0" />
            <span>Cerrar Panel</span>
          </button>
        )}
      </div>
    </div>
  );

  const isBarber = tabs.some(t => t.id === 'help') === false && tabs.some(t => t.id === 'barbers') === false && tabs.some(t => t.id === 'clients') !== false;
  
  const primaryTabIds = isBarber
    ? ['dashboard', 'appointments', 'workstations', 'performance']
    : ['dashboard', 'appointments', 'services', 'clients', 'settings'];
  
  const primaryTabs = tabs.filter(t => primaryTabIds.includes(t.id));
  const secondaryTabs = tabs.filter(t => !primaryTabIds.includes(t.id));

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

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-ink/95 border-b border-ink-line px-4 py-3 flex items-center justify-between sticky top-0 z-40 backdrop-blur-lg">
        <div className="flex items-center">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center mr-3 shadow-lg shadow-gold/20">
            <span className="text-ink font-serif font-bold text-sm">EB</span>
          </div>
          <div>
            <h1 className="font-serif text-lg text-cream leading-tight">{userRole === 'barber' ? 'Mi Panel' : 'Panel Admin'}</h1>
            <p className="text-xs text-stone-light truncate">{businessName}</p>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2.5 text-stone-light hover:text-cream hover:bg-ink-panel rounded-xl transition-all duration-200"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 bg-ink border-r border-ink-line z-40 shadow-2xl h-screen overflow-hidden">
        <div className="w-full h-full overflow-y-auto custom-scrollbar">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="admin-bottom-nav md:hidden">
        <div className="flex items-center justify-around">
          {primaryTabs.map((tab) => {
            const Icon = iconMap[tab.id];
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
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
              onClick={() => setMobileOpen(true)}
              className="admin-bottom-nav-item text-stone-dim flex-1"
              aria-label="Mas opciones"
            >
              <Menu className="h-5 w-5 mb-0.5" />
              <span>Mas</span>
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Slide-out Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 bg-ink border-r border-ink-line shadow-2xl transform transition-transform duration-300 ease-out animate-slide-right">
            <div className="flex items-center justify-between p-4 border-b border-ink-line">
              <span className="font-serif text-lg text-cream">Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 text-stone-light hover:text-cream hover:bg-ink-panel rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;
