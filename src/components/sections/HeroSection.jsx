// src/components/sections/HeroSection.jsx
import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Star, Award, Users, ChevronDown, Scissors } from 'lucide-react';
import { openBooking } from '../../utils/booking';

const defaultBusiness = {
  name: "BARBERÍA EL BRONX",
  title: "EL BRONX",
  address: "Mosquera, Cundinamarca"
};

// Ajusta estos indicadores con las cifras reales del negocio.
const stats = [
  { icon: Star, value: '4.9/5', label: 'Valoración de clientes' },
  { icon: Users, value: '+2.500', label: 'Cortes realizados' },
  { icon: Award, value: '+10 años', label: 'De trayectoria' },
];

const HeroSection = ({ business }) => {
  const [localBusiness, setLocalBusiness] = useState(defaultBusiness);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (business) {
      setLocalBusiness({
        name: business.name || defaultBusiness.name,
        title: business.title || defaultBusiness.title,
        address: business.address || defaultBusiness.address,
        phone: business.phone || '+301 566 7129',
      });
    }
  }, [business]);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(timer);
  }, []);

  const scrollToServices = () => {
    const servicesSection = document.getElementById('servicios');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Ayudante de animación de entrada escalonada — una única secuencia orquestada
  const reveal = () =>
    `transition-all duration-700 ease-out ${
      mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
    }`;
  const revealStyle = (delayMs) => ({ transitionDelay: `${delayMs}ms` });

  return (
    <section className="relative bg-[#121113] text-[#F6F2EA] py-24 md:py-32 overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/assets/img/herosection.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div className="absolute inset-0 bg-[#121113]/85 z-[1]" />
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(201,168,96,0.14) 0%, transparent 60%)' }}
      />
      <style>{`
        @keyframes bronx-bounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(6px); opacity: 1; }
        }
        @keyframes bronx-shimmer {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(220%); }
        }
        .bronx-shine::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.35) 35%, transparent 55%);
          transform: translateX(-120%);
          pointer-events: none;
        }
        .bronx-shine:hover::after {
          animation: bronx-shimmer 1.1s ease forwards;
        }
      `}</style>

      {/* Texturas laterales — estáticas, sutiles, sin movimiento en bucle */}
      <div
        className="absolute inset-y-0 right-0 w-24 md:w-40 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, #C9A860 0px, #C9A860 2px, transparent 2px, transparent 18px)',
        }}
      />
      <div
        className="absolute inset-y-0 left-0 w-24 md:w-40 opacity-[0.045] pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, #8B2E2E 0px, #8B2E2E 2px, transparent 2px, transparent 18px)',
        }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <div
            className={`inline-flex items-center justify-center gap-3 mb-6 ${reveal()}`}
            style={revealStyle(0)}
          >
            <span className="h-px w-8 bg-[#3A362F]" />
            <span className="relative text-xs uppercase tracking-[0.35em] text-[#C9A860]">
              {localBusiness.title} · Barbería de autor en {localBusiness.address.split(',')[0]}
              <span className="absolute -bottom-1.5 left-0 h-px w-full bg-gradient-to-r from-transparent via-[#C9A860] to-transparent" />
            </span>
            <span className="h-px w-8 bg-[#3A362F]" />
          </div>

          <h1
            className={`font-serif font-medium mb-4 tracking-tight leading-[1.05] ${reveal()}`}
            style={{ ...revealStyle(120), fontSize: 'clamp(2.75rem, 6vw, 4.75rem)' }}
          >
            {localBusiness.name}
          </h1>

          <p
            className={`text-sm md:text-base uppercase tracking-[0.25em] text-[#C9A860] mb-8 ${reveal()}`}
            style={revealStyle(200)}
          >
            Precisión, oficio y estilo — en cada cita
          </p>

          <p
            className={`text-base md:text-lg text-[#B7B1A3] max-w-2xl mx-auto leading-relaxed mb-10 px-4 ${reveal()}`}
            style={revealStyle(280)}
          >
            Cortes de precisión, diseño de barba y una experiencia de barbería cuidada
            hasta el último detalle, en {localBusiness.address}.
          </p>

          <div
            className={`flex flex-col items-center gap-5 mb-14 px-4 ${reveal()}`}
            style={revealStyle(360)}
          >
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => openBooking()}
                className="bronx-shine relative overflow-hidden flex items-center justify-center gap-2 bg-gradient-to-b from-[#C9A860] to-[#A9812E] text-[#121113] px-8 py-3.5 rounded-sm font-semibold text-sm md:text-base uppercase tracking-wide hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-10px_rgba(169,129,46,0.6)] transition-all duration-300 shadow-[0_2px_0_rgba(0,0,0,0.25),0_10px_24px_-10px_rgba(169,129,46,0.5)]"
              >
                <Scissors className="h-4 w-4" />
                Reservar Cita
              </button>
              <button
                onClick={scrollToServices}
                className="group flex items-center justify-center gap-2 border border-[#3A362F] text-[#F6F2EA] px-8 py-3.5 rounded-sm font-semibold text-sm md:text-base uppercase tracking-wide hover:border-[#A9812E] hover:text-[#C9A860] hover:-translate-y-0.5 transition-all duration-300"
              >
                Ver Servicios
                <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
              </button>
            </div>

            {/* Ticket de confianza — refuerza la idea de reserva sin fricción */}
            <div className="inline-flex items-center gap-2.5 text-[11px] uppercase tracking-[0.2em] text-[#8A8579] border border-dashed border-[#3A362F] rounded-sm px-4 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5FAE68]" />
              Confirmación inmediata al reservar en línea
            </div>
          </div>

          {/* Indicadores de confianza */}
          <div
            className={`grid grid-cols-3 gap-4 sm:gap-8 max-w-xl mx-auto mb-14 px-2 ${reveal()}`}
            style={revealStyle(440)}
          >
            {stats.map(({ icon: Icon, value, label }, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center gap-1.5 border-t border-[#3A362F] pt-4"
              >
                <Icon className="h-4 w-4 text-[#C9A860] mb-1" />
                <div className="font-serif text-xl sm:text-2xl text-[#F6F2EA]">{value}</div>
                <div className="text-[10px] sm:text-xs uppercase tracking-wide text-[#8A8579] text-center leading-tight">
                  {label}
                </div>
              </div>
            ))}
          </div>

          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-[#8A8579] text-sm px-4 ${reveal()}`}
            style={revealStyle(500)}
          >
            <div className="flex items-center">
              <Phone className="h-4 w-4 text-[#C9A860] mr-2" />
              {localBusiness.phone || '+301 566 7129'}
            </div>
            <div className="hidden sm:block w-1 h-1 bg-[#3A362F] rounded-full" />
            <div className="flex items-center">
              <MapPin className="h-4 w-4 text-[#C9A860] mr-2" />
              {localBusiness.address}
            </div>
          </div>
        </div>
      </div>

      {/* Indicador de scroll */}
      <button
        onClick={scrollToServices}
        aria-label="Ir a servicios"
        className="hidden sm:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-1 text-[#8A8579] hover:text-[#C9A860] transition-colors"
      >
        <span className="text-[10px] uppercase tracking-[0.3em]">Descubre más</span>
        <ChevronDown className="h-4 w-4" style={{ animation: 'bronx-bounce 1.8s ease-in-out infinite' }} />
      </button>
    </section>
  );
};

export default HeroSection;