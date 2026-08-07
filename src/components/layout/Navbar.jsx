// src/components/layout/Navbar.jsx
import React, { useState } from 'react';
import { Scissors, Menu, X, User } from 'lucide-react';

const Navbar = ({ onBookingClick, onServicesClick, onAdminClick, business, loading }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const businessName = business?.name || 'Barber Trebol';
  const businessTitle = business?.title || 'Master Barber';

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleServicesClick = () => {
    onServicesClick();
    setIsMenuOpen(false);
  };

  const handleBookingClick = () => {
    onBookingClick();
    setIsMenuOpen(false);
  };

  const handleAdminClick = () => {
    onAdminClick();
    setIsMenuOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-[#121113] text-[#F6F2EA] sticky top-0 z-50 border-b border-[#2A2723]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-[4.5rem]">
          {/* Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={scrollToTop}
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-full border border-[#A9812E]/60 text-[#C9A860] group-hover:border-[#A9812E] transition-colors">
              <Scissors className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <span className="font-serif text-lg md:text-xl tracking-wide">{businessName}</span>
              <span className="hidden sm:block text-[10px] uppercase tracking-[0.25em] text-[#C9A860]/80">
                {businessTitle}
              </span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              <button
                onClick={scrollToTop}
                className="text-sm uppercase tracking-wide text-[#D8D3C7] hover:text-[#C9A860] transition-colors"
              >
                Inicio
              </button>
              <button
                onClick={handleServicesClick}
                className="text-sm uppercase tracking-wide text-[#D8D3C7] hover:text-[#C9A860] transition-colors"
              >
                Servicios
              </button>
              <button
                onClick={handleBookingClick}
                className="bg-[#A9812E] text-[#121113] px-5 py-2.5 rounded-sm font-semibold text-sm tracking-wide hover:bg-[#C9A860] transition-colors"
              >
                Agendar Cita
              </button>
              <button
                onClick={handleAdminClick}
                className="flex items-center text-sm text-[#9A9488] hover:text-[#C9A860] transition-colors border-l border-[#2A2723] pl-6"
                title="Iniciar Sesión"
              >
                <User className="h-4 w-4 mr-2" />
                Iniciar Sesión
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-[#F6F2EA] hover:text-[#C9A860] transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-[#2A2723]">
            <div className="px-2 pt-3 pb-4 space-y-1">
              <button
                onClick={scrollToTop}
                className="block px-3 py-2.5 text-sm uppercase tracking-wide text-[#D8D3C7] hover:text-[#C9A860] transition-colors w-full text-left"
              >
                Inicio
              </button>
              <button
                onClick={handleServicesClick}
                className="block px-3 py-2.5 text-sm uppercase tracking-wide text-[#D8D3C7] hover:text-[#C9A860] transition-colors w-full text-left"
              >
                Servicios
              </button>
              <button
                onClick={handleBookingClick}
                className="block w-full text-left px-3 py-2.5 bg-[#A9812E] text-[#121113] rounded-sm font-semibold text-sm tracking-wide hover:bg-[#C9A860] transition-colors mt-2"
              >
                Agendar Cita
              </button>
              <button
                onClick={handleAdminClick}
                className="flex items-center px-3 py-2.5 text-sm text-[#9A9488] hover:text-[#C9A860] transition-colors w-full border-t border-[#2A2723] mt-2 pt-3"
              >
                <User className="h-4 w-4 mr-2" />
                Iniciar Sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
