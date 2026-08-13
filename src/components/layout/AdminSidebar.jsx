import React from 'react';
import { Users, LogOut, X, Menu } from 'lucide-react';

const AdminSidebar = ({ tabs, activeTab, setActiveTab, onLogout, onClose, businessName, mobileOpen, setMobileOpen }) => {
  const NavItem = ({ item }) => {
    const isActive = activeTab === item.id;
    return (
      <button
        onClick={() => {
          setActiveTab(item.id);
          setMobileOpen(false);
        }}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors ${
          isActive
            ? 'bg-[#A9812E]/10 text-[#C9A860]'
            : 'text-[#9A9488] hover:text-[#D8D3C7] hover:bg-[#2A2723]'
        }`}
      >
        <item.icon className="h-4 w-4 flex-shrink-0" />
        <span>{item.label}</span>
      </button>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 sm:p-6">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full border border-[#A9812E]/60 flex items-center justify-center mr-3">
            <Users className="h-5 w-5 text-[#C9A860]" />
          </div>
          <div>
            <h1 className="font-serif text-lg sm:text-xl text-[#F6F2EA] leading-tight">Panel de Admin</h1>
            <p className="text-xs text-[#9A9488] truncate">{businessName}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 sm:px-4 py-2 space-y-1 overflow-y-auto">
        {tabs.map((item) => (
          <NavItem key={item.id} item={item} />
        ))}
      </nav>
      <div className="p-3 sm:p-4 border-t border-[#2A2723] space-y-2">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium text-[#9A9488] hover:text-[#D8D3C7] hover:bg-[#2A2723] transition-colors">
          <LogOut className="h-4 w-4 flex-shrink-0" />
          <span>Cerrar Sesión</span>
        </button>
        {onClose && (
          <button onClick={onClose} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium text-[#9A9488] hover:text-[#D8D3C7] hover:bg-[#2A2723] transition-colors">
            <X className="h-4 w-4 flex-shrink-0" />
            <span>Cerrar Panel</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="md:hidden bg-[#121113] border-b border-[#2A2723] px-4 py-3 flex items-center justify-between">
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
          className="p-2 text-[#9A9488] hover:text-[#F6F2EA] hover:bg-[#1B1A1B] rounded-sm transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 bg-[#121113] border-r border-[#2A2723] z-40">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-[#121113] border-r border-[#2A2723] shadow-xl transform transition-transform">
            <div className="flex items-center justify-between p-4 border-b border-[#2A2723]">
              <span className="font-serif text-lg text-[#F6F2EA]">Menú</span>
              <button onClick={() => setMobileOpen(false)} className="p-2 text-[#9A9488] hover:text-[#F6F2EA] hover:bg-[#1B1A1B] rounded-sm transition-colors">
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
