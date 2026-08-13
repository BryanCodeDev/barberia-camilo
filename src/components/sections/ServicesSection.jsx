// src/components/sections/ServicesSection.jsx
import React, { useState, useEffect } from 'react';
import ServiceCard from '../common/ServiceCard';
import { fetchServices } from '../../data/services';
import { openBooking } from '../../utils/booking';

const ServicesSection = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices().then((data) => {
      setServices(data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const handleGeneralBooking = () => {
    openBooking();
  };

  if (loading) {
    return (
      <section id="servicios" className="py-16 md:py-24 bg-[#F6F2EA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse flex space-x-4 justify-center">
              <div className="h-4 bg-[#E4DCC9] rounded w-48"></div>
            </div>
            <p className="mt-4 text-[#6B6459] text-sm">Cargando servicios...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="servicios" className="py-16 md:py-24 bg-[#F6F2EA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-xs uppercase tracking-[0.35em] text-[#A9812E]">
            Carta de servicios
          </span>
          <h2 className="font-serif text-3xl md:text-5xl text-[#1C1A16] mt-3 mb-4">
            Nuestros Servicios
          </h2>
          <p className="text-base md:text-lg text-[#6B6459] max-w-xl mx-auto">
            Servicios pensados para el hombre moderno, con resultados consistentes en
            cada visita.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
            />
          ))}
        </div>

        <div className="mt-14 text-center">
          <button
            onClick={handleGeneralBooking}
            className="bg-[#121113] text-[#F6F2EA] px-8 py-3.5 rounded-sm font-semibold text-sm uppercase tracking-wide hover:bg-[#A9812E] hover:text-[#121113] transition-colors"
          >
            Agendar Cita
          </button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;