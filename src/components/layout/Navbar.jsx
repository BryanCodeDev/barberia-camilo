// src/components/layout/Navbar.jsx
import React, { useState } from 'react';
import { Scissors, Menu, X, User, ShieldCheck, CalendarDays } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { openBooking } from '../../utils/booking';

const Navbar = ({ business }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isAdminRoute = location.pathname === '/admin';
  const isClientRoute = location.pathname === '/cliente';

  const businessName = business?.name || 'BARBERÍA EL BRONX';
  const businessTitle = business?.title || 'EL BRONX';

  const isActive = (path) => location.pathname === path;

  const closeMenu = () => setIsMenuOpen(false);

  // Lleva a Servicios sin importar en qué ruta esté el usuario.
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

          {isAdminRoute ? (
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="text-xs uppercase tracking-wide text-[#6E6A61] hover:text-[#C9A860] transition-colors flex items-center gap-1.5"
              >
                <span>Volver al Inicio</span>
              </Link>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-7">
              <Link to="/" className={navLinkClass(isActive('/'))}>
                Inicio
              </Link>
              <a href="/#servicios" onClick={goToServices} className={navLinkClass(false)}>
                Servicios
              </a>
              <Link to="/cliente" className={navLinkClass(isActive('/cliente'))}>
                Mi Cuenta
              </Link>

              <button
                onClick={handleOpenBooking}
                className="flex items-center gap-2 bg-[#A9812E] text-[#121113] px-5 py-2.5 rounded-lg font-semibold text-sm tracking-wide hover:bg-[#C9A860] transition-colors btn-press"
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

          {!isAdminRoute && (
            <div className="md:hidden">
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
                className={`block px-3 py-2.5 text-sm uppercase tracking-wide transition-colors ${isActive('/') ? 'text-[#C9A860]' : 'text-[#D8D3C7] hover:text-[#C9A860]'}`}
              >
                Inicio
              </Link>
              <a
                href="/#servicios"
                onClick={goToServices}
                className="block px-3 py-2.5 text-sm uppercase tracking-wide text-[#D8D3C7] hover:text-[#C9A860] transition-colors"
              >
                Servicios
              </a>
              <Link
                to="/cliente"
                onClick={closeMenu}
                className={`flex items-center px-3 py-2.5 text-sm uppercase tracking-wide transition-colors ${isActive('/cliente') ? 'text-[#C9A860]' : 'text-[#D8D3C7] hover:text-[#C9A860]'}`}
              >
                <User className="h-4 w-4 mr-2" />
                Mi Cuenta
              </Link>

              <button
                onClick={handleOpenBooking}
                className="flex items-center justify-center gap-2 w-full text-left px-3 py-2.5 bg-[#A9812E] text-[#121113] rounded-lg font-semibold text-sm tracking-wide hover:bg-[#C9A860] transition-colors mt-2 btn-press"
              >
                <CalendarDays className="h-4 w-4" />
                Agendar Cita
              </button>

              <Link
                to="/admin"
                onClick={closeMenu}
                className={`flex items-center px-3 py-2.5 text-xs uppercase tracking-wide transition-colors w-full border-t border-[#2A2723] mt-2 pt-3 ${isActive('/admin') ? 'text-[#C9A860]' : 'text-[#6E6A61] hover:text-[#C9A860]'}`}
              >
                <ShieldCheck className="h-4 w-4 mr-2" />
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