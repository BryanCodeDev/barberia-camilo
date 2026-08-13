// src/components/layout/Navbar.jsx
import React, { useState } from 'react';
import { Scissors, Menu, X, User, ShieldCheck, CalendarDays } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = ({ business }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const businessName = business?.name || 'Barber Trebol';
  const businessTitle = business?.title || 'Master Barber';

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
      }, 100);
    }
  };

  const openBooking = () => {
    window.dispatchEvent(new CustomEvent('openBooking'));
    closeMenu();
  };

  const navLinkClass = (active) =>
    `text-sm uppercase tracking-wide transition-colors pb-1 border-b-2 ${
      active ? 'text-[#C9A860] border-[#A9812E]' : 'text-[#D8D3C7] border-transparent hover:text-[#C9A860]'
    }`;

  return (
    <nav className="bg-[#121113] text-[#F6F2EA] sticky top-0 z-50 border-b border-[#2A2723]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-[4.5rem]">
          <Link to="/" className="flex items-center space-x-3 group" onClick={closeMenu}>
            <span className="flex items-center justify-center w-9 h-9 rounded-full border border-[#A9812E]/60 text-[#C9A860] group-hover:border-[#A9812E] transition-colors">
              <Scissors className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <span className="font-serif text-lg md:text-xl tracking-wide">{businessName}</span>
              <span className="hidden sm:block text-[10px] uppercase tracking-[0.25em] text-[#C9A860]/80">
                {businessTitle}
              </span>
            </div>
          </Link>

          {/* Navegación principal — misma jerarquía visual para todos los links */}
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
              onClick={openBooking}
              className="flex items-center gap-2 bg-[#A9812E] text-[#121113] px-5 py-2.5 rounded-sm font-semibold text-sm tracking-wide hover:bg-[#C9A860] transition-colors"
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

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              className="text-[#F6F2EA] hover:text-[#C9A860] transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-[#2A2723]">
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
                onClick={openBooking}
                className="flex items-center justify-center gap-2 w-full text-left px-3 py-2.5 bg-[#A9812E] text-[#121113] rounded-sm font-semibold text-sm tracking-wide hover:bg-[#C9A860] transition-colors mt-2"
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