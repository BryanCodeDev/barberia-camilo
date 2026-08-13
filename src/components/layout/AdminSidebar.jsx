import React from 'react';
import { Users, LogOut, X, Menu, LayoutDashboard, Calendar, Scissors, Users2, Settings, BarChart3 } from 'lucide-react';

const AdminSidebar = ({ tabs, activeTab, setActiveTab, onLogout, onClose, businessName, mobileOpen, setMobileOpen, onSettingsClick }) => {
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
        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
          isActive && !isSettings
            ? 'bg-[#A9812E]/15 text-[#C9A860] shadow-sm'
            : isSettings
              ? 'text-[#9A9488] hover:text-[#D8D3C7] hover:bg-[#1B1A1B]'
              : 'text-[#9A9488] hover:text-[#D8D3C7] hover:bg-[#1B1A1B]'
        }`}
      >
        <item.icon className={`h-5 w-5 flex-shrink-0 transition-colors ${isActive && !isSettings ? 'text-[#C9A860]' : ''}`} />
        <span className="truncate">{item.label}</span>
      </button>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 sm:p-6">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full border border-[#A9812E]/60 flex items-center justify-center mr-3 shadow-sm">
            <Users className="h-5 w-5 text-[#C9A860]" />
          </div>
          <div>
            <h1 className="font-serif text-lg sm:text-xl text-[#F6F2EA] leading-tight">Panel de Admin</h1>
            <p className="text-xs text-[#9A9488] truncate">{businessName}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 sm:px-4 py-2 space-y-1.5 overflow-y-auto custom-scrollbar">
        {tabs.map((item) => (
          <NavItem key={item.id} item={item} />
        ))}
      </nav>
      <div className="p-3 sm:p-4 border-t border-[#2A2723] space-y-2">
        {onSettingsClick && (
          <button onClick={onSettingsClick} className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-[#9A9488] hover:text-[#D8D3C7] hover:bg-[#1B1A1B] transition-all duration-200">
            <Settings className="h-4 w-4 flex-shrink-0" />
            <span>Configuración</span>
          </button>
        )}
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-[#9A9488] hover:text-[#D8D3C7] hover:bg-[#1B1A1B] transition-all duration-200">
          <LogOut className="h-4 w-4 flex-shrink-0" />
          <span>Cerrar Sesión</span>
        </button>
        {onClose && (
          <button onClick={onClose} className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-[#9A9488] hover:text-[#D8D3C7] hover:bg-[#1B1A1B] transition-all duration-200">
            <X className="h-4 w-4 flex-shrink-0" />
            <span>Cerrar Panel</span>
          </button>
        )}
      </div>
    </div>
  );

  const primaryTabs = tabs.filter(t => ['dashboard','appointments','services','clients','settings'].includes(t.id));
  const secondaryTabs = tabs.filter(t => !['dashboard','appointments','services','clients','settings'].includes(t.id));

  const iconMap = {
    dashboard: LayoutDashboard,
    appointments: Calendar,
    services: Scissors,
    clients: Users2,
    settings: Settings,
    barbers: Users,
    workstations: Scissors,
    performance: BarChart3,
    notifications: () => <span className="h-5 w-5 flex items-center justify-center text-[10px] font-bold">!</span>,
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-[#121113] border-b border-[#2A2723] px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center">
          <div className="w-9 h-9 rounded-full border border-[#A9812E]/60 flex items-center justify-center mr-3">
            <Users className="h-4 w-4 text-[#C9A860]" />
          </div>
          <div>
            <h1 className="font-serif text-lg text-[#F6F2EA] leading-tight">Panel de Admin</h1>
            <p className="text-xs text-[#9A9488] truncate">{businessName}</p>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2.5 text-[#9A9488] hover:text-[#F6F2EA] hover:bg-[#1B1A1B] rounded-lg transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 bg-[#121113] border-r border-[#2A2723] z-40">
        <SidebarContent />
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
                className={`admin-bottom-nav-item ${isActive ? 'active' : ''}`}
              >
                {Icon && <Icon className={`h-5 w-5 mb-0.5 ${isActive ? 'text-[#C9A860]' : 'text-[#6E6A61]'}`} />}
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
          <button
            onClick={onSettingsClick}
            className="admin-bottom-nav-item text-[#6E6A61]"
            aria-label="Configuración"
          >
            <Settings className="h-5 w-5 mb-0.5" />
            <span>Ajustes</span>
          </button>
          <button
            onClick={() => setMobileOpen(true)}
            className="admin-bottom-nav-item text-[#6E6A61]"
            aria-label="Más opciones"
          >
            <Menu className="h-5 w-5 mb-0.5" />
            <span>Más</span>
          </button>
        </div>
      </nav>

      {/* Mobile Slide-out Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-[#121113] border-r border-[#2A2723] shadow-2xl transform transition-transform duration-300 ease-out">
            <div className="flex items-center justify-between p-4 border-b border-[#2A2723]">
              <span className="font-serif text-lg text-[#F6F2EA]">Menú</span>
              <button onClick={() => setMobileOpen(false)} className="p-2 text-[#9A9488] hover:text-[#F6F2EA] hover:bg-[#1B1A1B] rounded-lg transition-colors">
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
