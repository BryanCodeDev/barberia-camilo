// src/components/sections/ServicesSection.jsx
import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Gem, CalendarCheck, ArrowRight } from 'lucide-react';
import ServiceCard from '../common/ServiceCard';
import { fetchServices } from '../../data/services';
import { openBooking } from '../../utils/booking';

const trustPoints = [
  { icon: ShieldCheck, text: 'Barberos certificados' },
  { icon: Gem, text: 'Productos e insumos premium' },
  { icon: CalendarCheck, text: 'Reserva 100% online' },
];

const ServicesSection = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [headerInView, setHeaderInView] = useState(false);
  const [gridInView, setGridInView] = useState(false);
  const headerRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    fetchServices().then((data) => {
      setServices(data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const options = { threshold: 0.2 };

    const headerObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setHeaderInView(true);
        headerObserver.disconnect();
      }
    }, options);
    const gridObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setGridInView(true);
        gridObserver.disconnect();
      }
    }, options);

    if (headerRef.current) headerObserver.observe(headerRef.current);
    if (gridRef.current) gridObserver.observe(gridRef.current);

    return () => {
      headerObserver.disconnect();
      gridObserver.disconnect();
    };
  }, [loading]);

  const handleGeneralBooking = () => {
    openBooking();
  };

  if (loading) {
    return (
      <section id="servicios" className="py-16 md:py-24 bg-[#EDE9E0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse flex space-x-4 justify-center">
              <div className="h-4 bg-[#D4CFC6] rounded w-48"></div>
            </div>
            <p className="mt-4 text-[#6B6459] text-sm">Cargando servicios...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="servicios" className="py-16 md:py-24 bg-[#EDE9E0] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={headerRef}
          className={`text-center mb-10 transition-all duration-700 ease-out ${
            headerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <span className="relative inline-block text-xs uppercase tracking-[0.35em] text-[#8B6240]">
            Carta de servicios
            <span className="absolute -bottom-1.5 left-0 h-px w-full bg-gradient-to-r from-transparent via-[#8B6240] to-transparent" />
          </span>
          <h2 className="font-serif text-3xl md:text-5xl text-[#1C1A16] mt-4 mb-4">
            El estilo que te representa
          </h2>
          <p className="text-base md:text-lg text-[#6B6459] max-w-xl mx-auto">
            Servicios diseñados para el hombre moderno, ejecutados con la técnica y el
            criterio de un equipo que vive de los detalles.
          </p>
        </div>

        {/* Franja de confianza corporativa */}
        <div
          className={`flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mb-14 transition-all duration-700 ease-out delay-150 ${
            headerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {trustPoints.map(({ icon: Icon, text }, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm text-[#6B6459]">
              <Icon className="h-4 w-4 text-[#8B6240]" />
              {text}
            </div>
          ))}
        </div>

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
          {services.map((service, idx) => (
            <div
              key={service.id}
              className={`transition-all duration-700 ease-out hover:-translate-y-1.5 ${
                gridInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: gridInView ? `${idx * 90}ms` : '0ms' }}
            >
              <ServiceCard service={service} />
            </div>
          ))}
        </div>

        <div
          className={`mt-16 text-center transition-all duration-700 ease-out ${
            gridInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{ transitionDelay: gridInView ? `${services.length * 90 + 100}ms` : '0ms' }}
        >
          <button
            onClick={handleGeneralBooking}
            className="group inline-flex items-center gap-2 bg-[#704214] text-[#F6F2EA] px-8 py-3.5 rounded-sm font-semibold text-sm uppercase tracking-wide hover:bg-[#8B6240] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-10px_rgba(112,66,20,0.4)] transition-all duration-300"
          >
            Agendar Cita
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
          <p className="mt-3 text-xs text-[#6B6459] uppercase tracking-wide">
            Confirmación inmediata · Sin filas de espera
          </p>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;