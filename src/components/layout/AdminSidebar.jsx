import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [isDrawerClosing, setIsDrawerClosing] = useState(false);
  const drawerRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousActiveElement = useRef(null);

  const toggleSection = (sectionId) => {
    setSectionsExpanded(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const isAdmin = userRole === 'admin';
  const isBarber = userRole === 'barber';
  const visibleTabIds = tabs.map(t => t.id);

  const primaryTabIds = isBarber
    ? ['dashboard', 'appointments', 'workstations', 'performance']
    : ['dashboard', 'appointments', 'services', 'clients'];

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

  const closeDrawer = useCallback(() => {
    setIsDrawerClosing(true);
    setTimeout(() => {
      setMobileOpen(false);
      setIsDrawerClosing(false);
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }, 200);
  }, [setMobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;

    previousActiveElement.current = document.activeElement;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeDrawer();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [mobileOpen, closeDrawer]);

  useEffect(() => {
    if (mobileOpen && drawerRef.current) {
      drawerRef.current.focus();
    }
  }, [mobileOpen]);

  const NavItem = ({ item }) => {
    const isActive = activeTab === item.id;
    const isSettings = item.id === 'settings';
    return (
      <button
        type="button"
        onClick={() => {
          if (isSettings && onSettingsClick) {
            onSettingsClick();
          } else {
            setActiveTab(item.id);
          }
          closeDrawer();
        }}
        className={`
          w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium
          transition-all duration-200 relative group
          ${isActive && !isSettings
            ? 'bg-[#151515] text-white'
            : isSettings
              ? 'text-[#A3A3A3] hover:text-white hover:bg-[#151515]'
              : 'text-[#A3A3A3] hover:text-white hover:bg-[#151515]'
          }
        `}
      >
        {isActive && !isSettings && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] bg-[#C9A860] rounded-r-full" />
        )}
        <item.icon className={`
          h-[18px] w-[18px] flex-shrink-0 transition-all duration-200
          ${isActive && !isSettings
            ? 'text-[#C9A860]'
            : 'text-[#666666] group-hover:text-[#C9A860] group-hover:translate-x-[1px]'
          }
        `} />
        <span className="truncate">{item.label}</span>
      </button>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="w-[44px] h-[44px] rounded-xl bg-[#C9A860] flex items-center justify-center flex-shrink-0">
            <span className="text-[#0A0A0A] font-serif font-bold text-lg">EB</span>
          </div>
          <div className="min-w-0">
            <h1 className="font-serif text-lg text-white leading-tight truncate">Panel Admin</h1>
            <p className="text-xs text-[#A3A3A3] truncate mt-0.5">{businessName}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 sm:px-4 py-2 overflow-y-auto custom-scrollbar">
        {NAV_SECTIONS.map((section, sectionIndex) => {
          const sectionItems = section.items.filter(item =>
            visibleTabIds.includes(item.id)
          );
          if (sectionItems.length === 0) return null;

          const isExpanded = sectionsExpanded[section.id];
          return (
            <div key={section.id} className={sectionIndex > 0 ? 'mt-5' : ''}>
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-semibold text-[#666666] uppercase tracking-[0.15em] hover:text-[#A3A3A3] transition-colors"
              >
                <span>{section.label}</span>
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5 text-[#666666] transition-transform duration-200" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-[#666666] transition-transform duration-200" />
                )}
              </button>
              {isExpanded && (
                <div className="space-y-0.5 animate-slide-down">
                  {sectionItems.map((item) => (
                    <NavItem key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {isAdmin && onSettingsClick && (
          <div className="mt-5 pt-4 border-t border-[rgba(255,255,255,0.05)]">
            <NavItem item={{ id: 'settings', label: 'Configuracion', icon: Settings }} />
          </div>
        )}
      </nav>

      <div className="p-3 sm:p-4 border-t border-[rgba(255,255,255,0.05)] space-y-1">
        <button
          type="button"
          onClick={onLogout}
          className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium text-[#EF4444] hover:bg-[#EF4444]/10 transition-all duration-200"
        >
          <LogOut className="h-4 w-4 flex-shrink-0 transition-colors" />
          <span>Cerrar Sesion</span>
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium text-[#666666] hover:text-white hover:bg-[#151515] transition-all duration-200"
          >
            <X className="h-4 w-4 flex-shrink-0 transition-colors" />
            <span>Cerrar Panel</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-[#090909]/95 border-b border-[rgba(255,255,255,0.05)] px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#C9A860] flex items-center justify-center">
            <span className="text-[#0A0A0A] font-serif font-bold text-sm">EB</span>
          </div>
          <div>
            <h1 className="font-serif text-lg text-white leading-tight">{isBarber ? 'Mi Panel' : 'Panel Admin'}</h1>
            <p className="text-xs text-[#A3A3A3] truncate">{businessName}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="p-2.5 text-[#A3A3A3] hover:text-white hover:bg-[#151515] rounded-xl transition-all duration-200"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 bg-[#090909] border-r border-[rgba(255,255,255,0.05)] z-40 h-screen overflow-hidden">
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
              onClick={() => setMobileOpen(true)}
              className="admin-bottom-nav-item text-[#666666] flex-1"
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
        <div className="md:hidden fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={closeDrawer}
            aria-hidden="true"
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegacion"
            tabIndex={-1}
            className={`
              absolute inset-y-0 left-0 w-72 bg-[#090909] border-r border-[rgba(255,255,255,0.05)] shadow-2xl
              transform transition-transform duration-300 ease-out outline-none
              ${isDrawerClosing ? 'translate-x-[-100%]' : 'translate-x-0'}
            `}
          >
            <div className="flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.05)]">
              <span className="font-serif text-lg text-white">Menu</span>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeDrawer}
                className="p-2 text-[#A3A3A3] hover:text-white hover:bg-[#151515] rounded-lg transition-all duration-200"
                aria-label="Cerrar menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="h-full overflow-y-auto custom-scrollbar">
              <SidebarContent />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;
