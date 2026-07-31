// src/components/layout/Footer.jsx
import React from 'react';
import { Scissors, Phone, MapPin, Instagram, Facebook, Clock } from 'lucide-react';
import { BUSINESS_INFO } from '../../utils/constants';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Información de la Empresa */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Scissors className="h-6 w-6 md:h-8 md:w-8 text-amber-400" />
              <span className="font-bold text-lg md:text-xl">Barber Trebol</span>
            </div>
            <p className="text-gray-400 mb-4 text-sm md:text-base leading-relaxed">
              Master Barber - Experiencia VIP en barbería masculina con más de 10 años de experiencia 
              ofreciendo servicios de calidad premium en Mosquera, Cundinamarca.
            </p>
            <div className="flex space-x-4">
              <a 
                href={`https://instagram.com/${BUSINESS_INFO.socialMedia.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-amber-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5 md:h-6 md:w-6" />
              </a>
              <a 
                href={`https://facebook.com/${BUSINESS_INFO.socialMedia.facebook.replace(/\s+/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-amber-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5 md:h-6 md:w-6" />
              </a>
            </div>
          </div>

          {/* Información de Contacto */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-amber-400">Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                <a 
                  href={`tel:${BUSINESS_INFO.phone}`}
                  className="text-gray-300 hover:text-amber-400 transition-colors text-sm md:text-base"
                >
                  {BUSINESS_INFO.phone}
                </a>
              </div>
              <div className="flex items-start">
                <MapPin className="h-4 w-4 text-gray-400 mr-3 mt-1 flex-shrink-0" />
                <div className="text-gray-300 text-sm md:text-base">
                  <p>{BUSINESS_INFO.address.street}</p>
                  <p>{BUSINESS_INFO.address.city}, {BUSINESS_INFO.address.state}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Horarios de Atención */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-amber-400">Horarios de Atención</h3>
            <div className="space-y-2 text-gray-300 text-sm md:text-base">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                <div>
                  <div className="font-medium">Lunes - Viernes</div>
                  <div className="text-xs md:text-sm text-gray-400">8:00 AM - 7:00 PM</div>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                <div>
                  <div className="font-medium">Sábados</div>
                  <div className="text-xs md:text-sm text-gray-400">8:00 AM - 6:00 PM</div>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                <div>
                  <div className="font-medium">Domingos</div>
                  <div className="text-xs md:text-sm text-gray-400">9:00 AM - 4:00 PM</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Separador y Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-6 md:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-xs md:text-sm text-center md:text-left">
              © {currentYear} Barber Trebol. Todos los derechos reservados.
            </p>
            <p className="text-gray-400 text-xs md:text-sm text-center md:text-right">
              Desarrollado con ❤️ para la mejor experiencia de barbería
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;