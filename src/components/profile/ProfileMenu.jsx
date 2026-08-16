import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, User, LayoutDashboard, LogOut, Crown, Shield } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const menuRef = useRef(null);
  const { user, logout } = useAuth('admin');

  const initials = user?.username
    ? user.username.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'US';

  const closeMenu = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 200);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        closeMenu();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') closeMenu();
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, closeMenu]);

  const handleLogout = () => {
    closeMenu();
    setTimeout(() => logout(), 300);
  };

  const menuItemClass = (isDanger = false) =>
    `flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200 cursor-pointer ${
      isDanger
        ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
        : 'text-stone-light hover:text-cream hover:bg-ink-panel'
    }`;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-ink-panel/50 border border-ink-line hover:border-gold/30 transition-all duration-200 group"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-lg shadow-gold/20">
            <span className="text-ink font-serif font-bold text-xs">{initials}</span>
          </div>
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-ink-panel rounded-full flex items-center justify-center border border-ink-line">
            <Crown className="h-2 w-2 text-gold" />
          </div>
        </div>

        <div className="hidden sm:flex flex-col items-start">
          <span className="text-xs font-medium text-cream group-hover:text-gold-light transition-colors">
            {user?.username || 'Usuario'}
          </span>
          <span className="text-[10px] text-gold uppercase tracking-wider">VIP</span>
        </div>

        <ChevronDown
          className={`h-4 w-4 text-stone-dim transition-all duration-300 ${
            isOpen ? 'rotate-180 text-gold' : 'group-hover:text-cream'
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`
            absolute right-0 top-full mt-2 w-72 origin-top-right
            bg-ink-elevated border border-ink-line rounded-2xl shadow-2xl shadow-black/40
            backdrop-blur-xl z-50 overflow-hidden
            transition-all duration-200 ease-out
            ${isClosing ? 'opacity-0 scale-95 translate-y-1' : 'opacity-100 scale-100 translate-y-0'}
          `}
          role="menu"
          aria-orientation="vertical"
        >
          <div className="px-5 py-4 border-b border-ink-line bg-gradient-to-r from-ink to-ink-elevated">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-lg shadow-gold/20 ring-2 ring-gold/30">
                  <span className="text-ink font-serif font-bold text-lg">{initials}</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-ink-elevated rounded-full flex items-center justify-center border border-ink-line">
                  <Crown className="h-2.5 w-2.5 text-gold" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-cream truncate">
                  {user?.username || 'Usuario VIP'}
                </p>
                <p className="text-xs text-stone-dim truncate mt-0.5">
                  {user?.email || 'admin@barberia.com'}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gold/10 border border-gold/20 text-[10px] font-semibold text-gold uppercase tracking-wider">
                    <Shield className="h-3 w-3" />
                    {user?.role === 'admin' ? 'Administrador' : 'Barbero'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-2 space-y-0.5">
            <div className={menuItemClass()}>
              <User className="h-4 w-4 text-gold/70" />
              <span>Perfil</span>
            </div>
            <div className={menuItemClass()}>
              <LayoutDashboard className="h-4 w-4 text-gold/70" />
              <span>Dashboard</span>
            </div>
          </div>

          <div className="px-2 py-1.5 border-t border-ink-line my-1">
            <div className="h-px bg-gradient-to-r from-transparent via-ink-line to-transparent" />
          </div>

          <div className="p-2">
            <button
              onClick={handleLogout}
              className={menuItemClass(true)}
              role="menuitem"
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
