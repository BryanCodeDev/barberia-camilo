// src/components/layout/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Scissors, Menu, X, User, ShieldCheck, CalendarDays, MessageCircle, Home } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { openBooking } from '../../utils/booking';
import ProfileMenu from '../profile/ProfileMenu';
import useAuth from '../../hooks/useAuth';

const Navbar = ({ business }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { isAuthenticated: isAdminAuth } = useAuth('admin');
  const { isAuthenticated: isClientAuth } = useAuth('client');

  const isAuthenticated = isAdminAuth || isClientAuth;

  const businessName = business?.name || 'BARBERÍA EL BRONX';
  const businessTitle = business?.title || 'EL BRONX';
  const whatsappNumber = business?.whatsapp || '3015667129';
  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  const closeMenu = () => setIsMenuOpen(false);

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
    `relative text-sm uppercase tracking-wide transition-colors py-1 group ${
      active ? 'text-[#C9A860]' : 'text-[#D8D3C7] hover:text-[#C9A860]'
    }`;

  const underline = (active) => (
    <span
      className={`pointer-events-none absolute left-1/2 -bottom-0.5 h-px bg-[#A9812E] transition-all duration-300 ease-out -translate-x-1/2 ${
        active ? 'w-full' : 'w-0 group-hover:w-full'
      }`}
    />
  );

  return (
    <nav
      className={`bg-[#121113]/95 backdrop-blur-md text-[#F6F2EA] sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled ? 'border-[#2A2723] shadow-[0_8px_24px_-16px_rgba(0,0,0,0.6)]' : 'border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex justify-between items-center transition-all duration-300 ${
            scrolled ? 'h-14 md:h-16' : 'h-16 md:h-[4.5rem]'
          }`}
        >
          <Link to="/" className="flex items-center space-x-3 group" onClick={closeMenu}>
            <span className="flex items-center justify-center w-9 h-9 rounded-full border border-[#A9812E]/60 text-[#C9A860] group-hover:border-[#A9812E] group-hover:rotate-[18deg] transition-all duration-300 overflow-hidden flex-shrink-0">
              <img src="/assets/img/logo.webp" alt="Logo" className="w-6 h-6 object-contain" />
            </span>
            <div className="leading-tight">
              <span className="font-serif text-lg md:text-xl tracking-wide">{businessName}</span>
              {!isAuthenticated && (
                <span className="hidden sm:block text-[10px] uppercase tracking-[0.25em] text-[#C9A860]/80">
                  {businessTitle}
                </span>
              )}
            </div>
          </Link>

          {isAuthenticated ? (
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className={navLinkClass(isActive('/'))} aria-current={isActive('/') ? 'page' : undefined}>
                Inicio
                {underline(isActive('/'))}
              </Link>
              <a href="/#servicios" onClick={goToServices} className={navLinkClass(false)}>
                Servicios
                {underline(false)}
              </a>
              <ProfileMenu />
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className={navLinkClass(isActive('/'))}>
                Inicio
                {underline(isActive('/'))}
              </Link>
              <a href="/#servicios" onClick={goToServices} className={navLinkClass(false)}>
                Servicios
                {underline(false)}
              </a>
              <Link to="/cliente" className={navLinkClass(isActive('/cliente'))}>
                Mi Cuenta
                {underline(isActive('/cliente'))}
              </Link>

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
                className="relative overflow-hidden flex items-center gap-2 bg-gradient-to-b from-[#C9A860] to-[#A9812E] text-[#121113] px-5 py-2.5 rounded-sm font-semibold text-sm tracking-wide shadow-[0_2px_0_rgba(0,0,0,0.2)] hover:from-[#D8BA76] hover:to-[#BC9440] active:translate-y-px active:shadow-none transition-all duration-200"
              >
                <CalendarDays className="h-4 w-4" />
                Agendar Cita
              </button>

              <Link
                to="/admin"
                title="Administración"
                className={`flex items-center gap-1.5 text-xs uppercase tracking-wide transition-colors border-l border-[#2A2723] pl-5 ${
                  isActive('/admin') ? 'text-[#C9A860]' : 'text-[#6E6A61] hover:text-[#C9A860]'
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                Admin
              </Link>
            </div>
          )}

          {!isAuthenticated && (
            <div className="md:hidden flex items-center gap-1">
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
                aria-expanded={isMenuOpen}
                className="p-2 text-[#F6F2EA] hover:text-[#C9A860] transition-colors"
              >
                <div className="relative w-6 h-6">
                  <Menu className={`absolute inset-0 h-6 w-6 transition-all duration-200 ${isMenuOpen ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'}`} />
                  <X className={`absolute inset-0 h-6 w-6 transition-all duration-200 ${isMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'}`} />
                </div>
              </button>
            </div>
          )}

          {isAuthenticated && (
            <div className="md:hidden flex items-center gap-2">
              <ProfileMenu />
            </div>
          )}
        </div>

        {!isAuthenticated && (
          <div
            className={`md:hidden border-t border-[#2A2723] overflow-hidden transition-all duration-300 ease-out ${
              isMenuOpen ? 'max-h-[28rem] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="px-2 pt-3 pb-4 space-y-1">
              <Link
                to="/"
                onClick={closeMenu}
                className={`flex items-center px-3 py-3 text-sm uppercase tracking-wide transition-colors rounded-sm ${isActive('/') ? 'bg-[#A9812E]/15 text-[#C9A860] font-semibold' : 'text-[#D8D3C7] hover:text-[#C9A860] hover:bg-[#1C1A16]'}`}
              >
                <Home className="h-5 w-5 mr-2" />
                Inicio
              </Link>
              <a
                href="/#servicios"
                onClick={goToServices}
                className="flex items-center px-3 py-3 text-sm uppercase tracking-wide text-[#D8D3C7] hover:text-[#C9A860] hover:bg-[#1C1A16] transition-colors rounded-sm"
              >
                <Scissors className="h-5 w-5 mr-2" />
                Servicios
              </a>
              <Link
                to="/cliente"
                onClick={closeMenu}
                className={`flex items-center px-3 py-3 text-sm uppercase tracking-wide transition-colors rounded-sm ${isActive('/cliente') ? 'bg-[#A9812E]/15 text-[#C9A860] font-semibold' : 'text-[#D8D3C7] hover:text-[#C9A860] hover:bg-[#1C1A16]'}`}
              >
                <User className="h-5 w-5 mr-2" />
                Mi Cuenta
              </Link>

              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
                className="flex items-center px-3 py-3 text-sm uppercase tracking-wide text-[#C9A860] hover:bg-[#1C1A16] transition-colors rounded-sm"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                WhatsApp
              </a>

              <button
                onClick={handleOpenBooking}
                className="flex items-center justify-center gap-2 w-full text-left px-3 py-3 bg-gradient-to-b from-[#C9A860] to-[#A9812E] text-[#121113] rounded-sm font-semibold text-sm uppercase tracking-wide active:translate-y-px transition-all mt-2"
              >
                <CalendarDays className="h-5 w-5" />
                Agendar Cita
              </button>

              <Link
                to="/admin"
                onClick={closeMenu}
                className={`flex items-center px-3 py-3 text-xs uppercase tracking-wide transition-colors w-full border-t border-[#2A2723] mt-2 pt-3 ${isActive('/admin') ? 'text-[#C9A860]' : 'text-[#6E6A61] hover:text-[#C9A860]'}`}
              >
                <ShieldCheck className="h-5 w-5 mr-2" />
                Administración
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;