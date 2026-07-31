// src/components/layout/Navbar.jsx
import React, { useState } from 'react';
import { Scissors, Menu, X, User } from 'lucide-react';

const Navbar = ({ onBookingClick, onServicesClick, onAdminClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    <nav className="bg-black text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={scrollToTop}
          >
            <Scissors className="h-8 w-8 text-amber-400" />
            <span className="font-bold text-xl">Barber Trebol</span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              <button 
                onClick={scrollToTop}
                className="hover:text-amber-400 transition-colors"
              >
                Inicio
              </button>
              <button 
                onClick={handleServicesClick}
                className="hover:text-amber-400 transition-colors"
              >
                Servicios
              </button>
              <button 
                onClick={handleBookingClick}
                className="bg-amber-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-amber-500 transition-colors"
              >
                Agendar Cita
              </button>
              <button 
                onClick={handleAdminClick}
                className="flex items-center text-gray-300 hover:text-amber-400 transition-colors"
                title="Iniciar Sesión"
              >
                <User className="h-5 w-5 mr-1" />
                Iniciar Sesión
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-white hover:text-amber-400 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-900">
              <button
                onClick={scrollToTop}
                className="block px-3 py-2 text-base font-medium hover:text-amber-400 transition-colors w-full text-left"
              >
                Inicio
              </button>
              <button
                onClick={handleServicesClick}
                className="block px-3 py-2 text-base font-medium hover:text-amber-400 transition-colors w-full text-left"
              >
                Servicios
              </button>
              <button
                onClick={handleBookingClick}
                className="block w-full text-left px-3 py-2 bg-amber-400 text-black rounded-lg font-semibold hover:bg-amber-500 transition-colors mt-2"
              >
                Agendar Cita
              </button>
              <button
                onClick={handleAdminClick}
                className="flex items-center px-3 py-2 text-base font-medium text-gray-300 hover:text-amber-400 transition-colors w-full"
              >
                <User className="h-5 w-5 mr-2" />
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