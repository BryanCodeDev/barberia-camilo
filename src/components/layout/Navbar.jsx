// src/components/layout/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Scissors, Menu, X, User, ShieldCheck, CalendarDays, MessageCircle, LayoutDashboard, Home } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { openBooking } from '../../utils/booking';
import ProfileMenu from '../profile/ProfileMenu';
import useAuth from '../../hooks/useAuth';

const Navbar = ({ business }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [authTick, setAuthTick] = useState(0);

  const { isAuthenticated: isAdminAuth } = useAuth('admin');
  const { isAuthenticated: isClientAuth } = useAuth('client');

  const isAdminRoute = location.pathname === '/admin';
  const isClientRoute = location.pathname === '/cliente';

  const authMode = isAdminAuth ? 'admin' : isClientAuth ? 'client' : 'public';

  const businessName = business?.name || 'BARBERÍA EL BRONX';
  const businessTitle = business?.title || 'EL BRONX';
  const whatsappNumber = business?.whatsapp || '3015667129';
  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`;

  const isActive = (path) => location.pathname === path;

  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    const handleAuthChange = () => setAuthTick(t => t + 1);
    window.addEventListener('auth-login', handleAuthChange);
    window.addEventListener('auth-logout', handleAuthChange);
    return () => {
      window.removeEventListener('auth-login', handleAuthChange);
      window.removeEventListener('auth-logout', handleAuthChange);
    };
  }, []);

  const goToServices = (e) => {
    e.preventDefault();
    closeMenu();
    if (location.pathname === '/') {
      document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  };

  const handleOpenBooking = () => {
    openBooking();
    closeMenu();
  };

  const navLinkClass = (active) =>
    `text-sm uppercase tracking-wide transition-colors pb-1 border-b-2 ${
      active ? 'text-[#C9A860] border-[#A9812E]' : 'text-[#D8D3C7] border-transparent hover:text-[#C9A860]'
    }`;

  const dashboardClass = (active) => `
    flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm tracking-wide
    transition-all duration-200
    ${active
      ? 'text-[#C9A860] bg-[rgba(201,168,96,0.10)]'
      : 'text-[#C9A860] hover:bg-[rgba(201,168,96,0.10)]'
    }
  `;

  const dashboardHref = authMode === 'admin' ? '/admin' : authMode === 'client' ? '/cliente' : null;
  const isDashboardActive = dashboardHref ? isActive(dashboardHref) : false;

  return (
    <nav className={`${isAdminRoute ? 'bg-[#121113]/95 backdrop-blur-md' : 'bg-[#121113]'} text-[#F6F2EA] sticky top-0 z-50 border-b border-[#2A2723] transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-[4.5rem]">
          <Link to="/" className="flex items-center space-x-3 group" onClick={closeMenu}>
            <span className={`flex items-center justify-center w-9 h-9 rounded-full border transition-colors ${isAdminRoute ? 'border-[#A9812E]/30 text-[#A9812E]/70' : 'border-[#A9812E]/60 text-[#C9A860] group-hover:border-[#A9812E]'}`}>
              <span className="font-serif font-bold text-xs">EB</span>
            </span>
            <div className="leading-tight">
              <span className={`font-serif text-lg md:text-xl tracking-wide ${isAdminRoute ? 'text-[#9A9488]' : ''}`}>{businessName}</span>
              {!isAdminRoute && (
                <span className="hidden sm:block text-[10px] uppercase tracking-[0.25em] text-[#C9A860]/80">
                  {businessTitle}
                </span>
              )}
            </div>
          </Link>

          {isAdminRoute && isAdminAuth ? (
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-[#A3A3A3] hover:text-white transition-colors"
              >
                <Home className="h-3.5 w-3.5" />
                <span>Inicio</span>
              </Link>
              <ProfileMenu />
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-7">
              <Link to="/" className={navLinkClass(isActive('/'))} aria-current={isActive('/') ? 'page' : undefined}>
                Inicio
              </Link>
              <a href="/#servicios" onClick={goToServices} className={navLinkClass(false)}>
                Servicios
              </a>

              {authMode !== 'admin' && (
                <Link to="/cliente" className={navLinkClass(isActive('/cliente'))} aria-current={isActive('/cliente') ? 'page' : undefined}>
                  Mi Cuenta
                </Link>
              )}

              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#C9A860] hover:text-[#F6F2EA] transition-colors"
                title="WhatsApp"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm font-medium hidden lg:inline">WhatsApp</span>
              </a>

              <button
                onClick={handleOpenBooking}
                className="flex items-center gap-2 bg-[#A9812E] text-[#121113] px-5 py-2.5 rounded-lg font-semibold text-sm tracking-wide hover:bg-[#C9A860] transition-colors btn-press"
              >
                <CalendarDays className="h-4 w-4" />
                Agendar Cita
              </button>

              {dashboardHref && (
                <Link
                  to={dashboardHref}
                  className={dashboardClass(isDashboardActive)}
                  aria-current={isDashboardActive ? 'page' : undefined}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              )}
            </div>
          )}

          {!isAdminRoute && (
            <div className="md:hidden flex items-center gap-2">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-[#C9A860] hover:text-[#F6F2EA] transition-colors"
                title="WhatsApp"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                className="text-[#F6F2EA] hover:text-[#C9A860] transition-colors"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          )}
        </div>

        {!isAdminRoute && isMenuOpen && (
          <div className="md:hidden border-t border-[#2A2723] animate-slide-down">
            <div className="px-2 pt-3 pb-4 space-y-1">
              <Link
                to="/"
                onClick={closeMenu}
                className={`flex items-center px-3 py-3 text-sm uppercase tracking-wide transition-colors rounded-xl ${isActive('/') ? 'bg-[#A9812E]/15 text-[#C9A860] font-semibold' : 'text-[#D8D3C7] hover:text-[#C9A860] hover:bg-[#1C1A16]'}`}
              >
                <span className="w-8 text-center mr-2">🏠</span>
                Inicio
              </Link>
              <a
                href="/#servicios"
                onClick={goToServices}
                className="flex items-center px-3 py-3 text-sm uppercase tracking-wide text-[#D8D3C7] hover:text-[#C9A860] hover:bg-[#1C1A16] transition-colors rounded-xl"
              >
                <span className="w-8 text-center mr-2">✂️</span>
                Servicios
              </a>

              {authMode !== 'admin' && (
                <Link
                  to="/cliente"
                  onClick={closeMenu}
                  className={`flex items-center px-3 py-3 text-sm uppercase tracking-wide transition-colors rounded-xl ${isActive('/cliente') ? 'bg-[#A9812E]/15 text-[#C9A860] font-semibold' : 'text-[#D8D3C7] hover:text-[#C9A860] hover:bg-[#1C1A16]'}`}
                >
                  <User className="h-5 w-5 mr-2" />
                  Mi Cuenta
                </Link>
              )}

              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
                className="flex items-center px-3 py-3 text-sm uppercase tracking-wide text-[#C9A860] hover:bg-[#1C1A16] transition-colors rounded-xl"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                WhatsApp
              </a>

              <button
                onClick={handleOpenBooking}
                className="flex items-center justify-center gap-2 w-full text-left px-3 py-3 bg-[#A9812E] text-[#121113] rounded-xl font-semibold text-sm uppercase tracking-wide hover:bg-[#C9A860] transition-colors mt-2 btn-press"
              >
                <CalendarDays className="h-5 w-5" />
                Agendar Cita
              </button>

              {dashboardHref && (
                <Link
                  to={dashboardHref}
                  onClick={closeMenu}
                  className={`flex items-center px-3 py-3 text-xs uppercase tracking-wide transition-colors w-full border-t border-[#2A2723] mt-2 pt-3 ${isActive(dashboardHref) ? 'text-[#C9A860]' : 'text-[#6E6A61] hover:text-[#C9A860]'}`}
                >
                  <LayoutDashboard className="h-5 w-5 mr-2" />
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
