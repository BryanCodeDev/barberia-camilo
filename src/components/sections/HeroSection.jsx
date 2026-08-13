// src/components/sections/HeroSection.jsx
import React, { useState, useEffect } from 'react';
import { Star, MapPin, Phone } from 'lucide-react';
import { openBooking } from '../../utils/booking';

const defaultBusiness = {
  name: "Barber Trebol",
  title: "Master Barber",
  address: "Mosquera, Cundinamarca"
};

const stats = [
  { number: "1+", label: "Años de Experiencia" },
  { number: "1000+", label: "Clientes Satisfechos" },
  { number: "5.0", label: "Calificación Promedio" }
];

const HeroSection = ({ business }) => {
  const [localBusiness, setLocalBusiness] = useState(defaultBusiness);

  useEffect(() => {
    if (business) {
      setLocalBusiness({
        name: business.name || defaultBusiness.name,
        title: business.title || defaultBusiness.title,
        address: business.address || defaultBusiness.address,
        phone: business.phone || '+57 300 123 4567',
      });
    }
  }, [business]);

  const scrollToServices = () => {
    const servicesSection = document.getElementById('servicios');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative bg-[#121113] text-[#F6F2EA] py-20 md:py-28 overflow-hidden">
      <div
        className="absolute inset-y-0 right-0 w-24 md:w-40 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, #C9A860 0px, #C9A860 2px, transparent 2px, transparent 18px)'
        }}
      />
      <div
        className="absolute inset-y-0 left-0 w-24 md:w-40 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, #8B2E2E 0px, #8B2E2E 2px, transparent 2px, transparent 18px)'
        }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="h-px w-8 bg-[#3A362F]" />
            <span className="text-xs uppercase tracking-[0.35em] text-[#C9A860]">
              {localBusiness.title} · {localBusiness.address.split(',')[0]}
            </span>
            <span className="h-px w-8 bg-[#3A362F]" />
          </div>

          <h1 className="font-serif text-5xl md:text-7xl font-medium mb-6 tracking-tight">
            {localBusiness.name}
          </h1>

          <p className="text-base md:text-lg text-[#B7B1A3] max-w-2xl mx-auto leading-relaxed mb-12 px-4">
            Cortes precisos, arreglo de barba y una experiencia de barbería cuidada al
            detalle, en {localBusiness.address}.
          </p>

          <div className="flex items-center justify-center divide-x divide-[#2A2723] mb-12">
            {stats.map((stat, index) => (
              <div key={index} className="px-6 md:px-10 text-center">
                <div className="font-serif text-2xl md:text-3xl text-[#C9A860] mb-1">
                  {stat.number}
                </div>
                <div className="text-[#8A8579] text-[11px] md:text-xs uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12 px-4">
            <button
              onClick={() => openBooking()}
              className="bg-[#A9812E] text-[#121113] px-8 py-3.5 rounded-sm font-semibold text-sm md:text-base uppercase tracking-wide hover:bg-[#C9A860] transition-colors shadow-[0_8px_24px_-8px_rgba(169,129,46,0.5)]"
            >
              Agendar Cita
            </button>
            <button
              onClick={scrollToServices}
              className="border border-[#3A362F] text-[#F6F2EA] px-8 py-3.5 rounded-sm font-semibold text-sm md:text-base uppercase tracking-wide hover:border-[#A9812E] hover:text-[#C9A860] transition-colors"
            >
              Ver Servicios
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-[#8A8579] text-sm px-4">
            <div className="flex items-center">
              <Phone className="h-4 w-4 text-[#C9A860] mr-2" />
              {localBusiness.phone || '+57 300 123 4567'}
            </div>
            <div className="hidden sm:block w-1 h-1 bg-[#3A362F] rounded-full" />
            <div className="flex items-center">
              <MapPin className="h-4 w-4 text-[#C9A860] mr-2" />
              {localBusiness.address}
            </div>
            <div className="hidden sm:block w-1 h-1 bg-[#3A362F] rounded-full" />
            <div className="flex items-center">
              <Star className="h-4 w-4 text-[#C9A860] mr-2 fill-current" />
              5.0 de calificación
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;