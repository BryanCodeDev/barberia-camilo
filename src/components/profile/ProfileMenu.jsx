import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, User, LayoutDashboard, LogOut, Crown, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const ProfileMenu = ({ onLogout: onLogoutProp }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const { isAuthenticated: isAdminAuth } = useAuth('admin');
  const { isAuthenticated: isClientAuth } = useAuth('client');
  const authRole = isAdminAuth ? 'admin' : isClientAuth ? 'client' : null;

  const { user: adminUser } = useAuth('admin');
  const { user: clientUser } = useAuth('client');
  const user = adminUser || clientUser;

  const { logout: adminLogout } = useAuth('admin');
  const { logout: clientLogout } = useAuth('client');

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
    setTimeout(() => {
      if (onLogoutProp) {
        onLogoutProp();
      } else {
        if (authRole === 'admin') {
          adminLogout();
        } else if (authRole === 'client') {
          clientLogout();
        }
        navigate('/');
      }
    }, 300);
  };

  const dashboardHref = authRole === 'admin' ? '/admin' : '/cliente';
  const roleLabel = user?.role === 'admin' ? 'Administrador' : user?.role === 'barber' ? 'Barbero' : 'Usuario';

  if (!authRole) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#0A0A0A] border border-[rgba(201,168,96,0.15)] hover:border-[rgba(201,168,96,0.35)] transition-all duration-200 group"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-lg bg-[#C9A860] flex items-center justify-center overflow-hidden">
            <img src="/assets/img/logo.webp" alt="Logo" className="w-5 h-5 object-contain" />
          </div>
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#0A0A0A] rounded-full flex items-center justify-center border border-[rgba(201,168,96,0.25)]">
            <Crown className="h-2 w-2 text-[#C9A860]" />
          </div>
        </div>

        <div className="hidden sm:flex flex-col items-start">
          <span className="text-xs font-medium text-white group-hover:text-[#E0C47A] transition-colors">
            {user?.username || 'Usuario'}
          </span>
          <span className="text-[10px] text-[#C9A860] uppercase tracking-wider font-medium">VIP</span>
        </div>

        <ChevronDown
          className={`h-4 w-4 text-[#6E6A61] transition-all duration-300 ${
            isOpen ? 'rotate-180 text-[#C9A860]' : 'group-hover:text-white'
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`
            absolute right-0 top-full mt-2 w-[280px] origin-top-right
            bg-[#101010] border border-[rgba(201,168,96,0.20)] rounded-2xl shadow-2xl shadow-black/60
            z-[9999] overflow-hidden
            transition-all duration-200 ease-out
            ProfileMenu-dropdown-enter
            ${isClosing ? 'ProfileMenu-dropdown-exit' : ''}
          `}
          role="menu"
          aria-orientation="vertical"
        >
          <div className="px-5 py-4 border-b border-[rgba(201,168,96,0.10)] bg-[#101010]">
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-[#C9A860] flex items-center justify-center overflow-hidden">
                  <img src="/assets/img/logo.webp" alt="Logo" className="w-8 h-8 object-contain" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#101010] rounded-full flex items-center justify-center border border-[rgba(201,168,96,0.25)]">
                  <Crown className="h-2.5 w-2.5 text-[#C9A860]" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.username || 'Usuario VIP'}
                </p>
                <p className="text-xs text-[#A3A3A3] truncate mt-0.5">
                  {user?.email || 'usuario@barberia.com'}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[rgba(201,168,96,0.10)] border border-[rgba(201,168,96,0.25)] text-[10px] font-semibold text-[#C9A860] uppercase tracking-wider">
                    <Shield className="h-3 w-3" />
                    {roleLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-2 space-y-0.5 bg-[#101010]">
            <Link
              to="/perfil"
              onClick={closeMenu}
              className="group flex items-center gap-3 px-4 py-2.5 text-sm text-[#A3A3A3] hover:text-white hover:bg-[rgba(201,168,96,0.08)] rounded-lg transition-all duration-200"
            >
              <User className="h-4 w-4 text-[#C9A860]/80 group-hover:text-[#C9A860] transition-colors" />
              <span>Perfil</span>
            </Link>
            <Link
              to={dashboardHref}
              onClick={closeMenu}
              className="group flex items-center gap-3 px-4 py-2.5 text-sm text-[#A3A3A3] hover:text-white hover:bg-[rgba(201,168,96,0.08)] rounded-lg transition-all duration-200"
            >
              <LayoutDashboard className="h-4 w-4 text-[#C9A860]/80 group-hover:text-[#C9A860] transition-colors" />
              <span>Dashboard</span>
            </Link>
          </div>

          <div className="px-2 py-1.5 border-t border-[rgba(201,168,96,0.10)] my-1 bg-[#101010]">
            <div className="h-px bg-gradient-to-r from-transparent via-[rgba(201,168,96,0.15)] to-transparent" />
          </div>

          <div className="p-2 bg-[#101010]">
            <button
              onClick={handleLogout}
              className="group flex items-center gap-3 px-4 py-2.5 text-sm text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-all duration-200 w-full"
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
