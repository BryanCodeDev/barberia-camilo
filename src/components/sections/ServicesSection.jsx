// src/components/sections/ServicesSection.jsx
import React, { useState, useEffect } from 'react';
import ServiceCard from '../common/ServiceCard';
import { fetchServices } from '../../data/services';

const ServicesSection = ({ onBookingClick }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices().then((data) => {
      setServices(data);
      setLoading(false);
    });
  }, []);

  const handleGeneralBooking = () => {
    onBookingClick();
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse flex space-x-4 justify-center">
              <div className="h-4 bg-gray-200 rounded w-48"></div>
            </div>
            <p className="mt-4 text-gray-500">Cargando servicios...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Nuestros Servicios
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Servicios premium para el hombre moderno. Cada servicio está diseñado 
            para brindarte la mejor experiencia y resultados excepcionales.
          </p>
          <div className="mt-6 w-24 h-1 bg-amber-400 mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onBookingClick={onBookingClick}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={handleGeneralBooking}
            className="bg-amber-400 text-black px-8 py-3 rounded-lg font-bold text-lg hover:bg-amber-500 transition-colors shadow-lg hover:shadow-amber-400/25"
          >
            ✂️ Agendar Cita
          </button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;