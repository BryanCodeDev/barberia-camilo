
import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Phone,
  Scissors,
  ArrowUpRight,
  ChevronDown,
  Clock3,
  Sparkles,
} from 'lucide-react';
import { openBooking } from '../../utils/booking';

const DEFAULT_BUSINESS = {
  name: 'MUSTACHE BARBERSHOP',
  title: 'MUSTACHE',
  address: 'Mosquera, Cundinamarca',
  phone: '+301 566 7129',
};

const HeroSection = ({ business }) => {
  const [mounted, setMounted] = useState(false);

  const localBusiness = {
    ...DEFAULT_BUSINESS,
    ...business,
  };

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));

    return () => cancelAnimationFrame(frame);
  }, []);

  const scrollToServices = () => {
    document.getElementById('servicios')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const reveal = (delay = 0) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 700ms ease ${delay}ms, transform 700ms ease ${delay}ms`,
  });

  return (
    <section
      id="inicio"
      aria-labelledby="hero-title"
      className="relative isolate min-h-[720px] overflow-hidden bg-[#000000] text-white lg:min-h-[760px]"
    >
      {/* Fondo ambiental */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 15% 45%, rgba(169,129,46,0.12), transparent 45%), linear-gradient(135deg, #000000 0%, #0D0D0D 60%, #000000 100%)',
        }}
      />

      {/* Textura decorativa */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 hidden w-[42%] opacity-[0.07] lg:block"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, #C9A860 0px, #C9A860 1px, transparent 1px, transparent 34px)',
          maskImage:
            'linear-gradient(to right, black, transparent 85%)',
        }}
      />

      <div className="relative mx-auto grid min-h-[720px] max-w-[1600px] lg:min-h-[760px] lg:grid-cols-[0.88fr_1.12fr]">
        {/* Contenido principal */}
        <div className="relative z-10 flex flex-col justify-center px-6 pb-12 pt-28 sm:px-10 md:px-14 lg:px-16 lg:py-24 xl:px-20">
          {/* Identidad de marca */}
          <div
            style={reveal(100)}
            className="mb-8 flex items-center gap-3"
          >
            <span className="h-px w-10 bg-[#A9812E]" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#C9A860] sm:text-xs">
              Barbería premium
            </span>
          </div>

          {/* Título */}
          <h1
            id="hero-title"
            style={reveal(200)}
            className="max-w-2xl font-serif text-[clamp(3rem,6.3vw,6rem)] font-medium leading-[0.96] tracking-[-0.045em]"
          >
            Tu estilo.
            <br />

            <span className="text-[#C9A860]">
              Tu identidad.
            </span>

            <br />

            <span className="text-white">
              Nuestro oficio.
            </span>
          </h1>

          {/* Separador ornamental */}
          <div
            aria-hidden="true"
            style={reveal(280)}
            className="my-7 flex items-center gap-3"
          >
            <span className="h-[2px] w-12 bg-[#A9812E]" />
            <Scissors className="h-4 w-4 text-[#C9A860]" />
            <span className="h-px w-8 bg-[#2A2723]" />
          </div>

          {/* Descripción */}
          <p
            style={reveal(340)}
            className="max-w-lg text-sm leading-7 text-[#B7B1A3] sm:text-base sm:leading-8"
          >
            Cortes con carácter, barba impecable y atención al detalle.
            Descubre una experiencia de barbería donde cada acabado
            habla por ti.
          </p>

          {/* Acciones */}
          <div
            style={reveal(420)}
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
          >
            <button
              type="button"
              onClick={() => openBooking()}
              className="group relative inline-flex min-h-[54px] items-center justify-center gap-3 overflow-hidden rounded-sm bg-gradient-to-r from-[#A9812E] to-[#C9A860] px-7 py-4 text-xs font-bold uppercase tracking-[0.13em] text-black shadow-[0_8px_30px_rgba(169,129,46,0.16)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_36px_rgba(169,129,46,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A860] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <Scissors className="h-4 w-4 transition-transform duration-300 group-hover:rotate-[-12deg]" />

              Reservar cita

              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />

              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"
              />
            </button>

            <button
              type="button"
              onClick={scrollToServices}
              className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-sm border border-[#3A362F] px-7 py-4 text-xs font-semibold uppercase tracking-[0.13em] text-[#F6F2EA] transition duration-300 hover:border-[#C9A860] hover:bg-white/[0.04] hover:text-[#C9A860] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A860]"
            >
              Explorar servicios

              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          {/* Ubicación y atención */}
          <div
            style={reveal(500)}
            className="mt-10 flex flex-col gap-4 border-t border-[#2A2723] pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-7"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#A9812E]/30 bg-[#A9812E]/10">
                <MapPin className="h-4 w-4 text-[#C9A860]" />
              </span>

              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-[#8A8579]">
                  Encuéntranos en
                </p>

                <p className="mt-1 text-xs font-medium text-[#F6F2EA]">
                  {localBusiness.address}
                </p>
              </div>
            </div>

            {localBusiness.phone && (
              <a
                href={`tel:${localBusiness.phone.replace(/[^\d+]/g, '')}`}
                className="group flex items-center gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A860]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#2A2723] transition-colors group-hover:border-[#A9812E]/50">
                  <Phone className="h-4 w-4 text-[#C9A860]" />
                </span>

                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-[#8A8579]">
                    Contáctanos
                  </p>

                  <p className="mt-1 text-xs font-medium text-[#F6F2EA] transition-colors group-hover:text-[#C9A860]">
                    {localBusiness.phone}
                  </p>
                </div>
              </a>
            )}
          </div>
        </div>

        {/* Imagen protagonista */}
        <div
          className="relative min-h-[380px] overflow-hidden sm:min-h-[500px] lg:min-h-full"
          style={reveal(180)}
        >
          <img
            src="/assets/img/herosection.webp"
            alt="Identidad visual de Mustache Barber Shop en un ambiente de barbería premium"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />

          {/* Integración gradual con el fondo */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(to right, #000000 0%, rgba(0,0,0,0.62) 5%, transparent 36%), linear-gradient(to top, rgba(0,0,0,0.60), transparent 32%), linear-gradient(to bottom, rgba(0,0,0,0.14), transparent 25%)',
            }}
          />

          {/* Marco decorativo */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-5 border border-[#C9A860]/25 sm:inset-8 lg:inset-10"
          />

          <div
            aria-hidden="true"
            className="absolute bottom-10 right-10 hidden items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-[#F6F2EA]/80 sm:flex lg:bottom-16 lg:right-16"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#C9A860]" />
            Detalles que marcan la diferencia
          </div>

          {/* Esquinas doradas */}
          <span
            aria-hidden="true"
            className="absolute left-5 top-5 h-8 w-8 border-l border-t border-[#C9A860] sm:left-8 sm:top-8 lg:left-10 lg:top-10"
          />

          <span
            aria-hidden="true"
            className="absolute bottom-5 right-5 h-8 w-8 border-b border-r border-[#C9A860] sm:bottom-8 sm:right-8 lg:bottom-10 lg:right-10"
          />
        </div>
      </div>

      {/* Indicador de desplazamiento */}
      <button
        type="button"
        onClick={scrollToServices}
        aria-label="Desplazarse a los servicios"
        className="absolute bottom-5 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-[#9A9488] transition-colors hover:text-[#C9A860] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A860] sm:flex lg:bottom-7"
      >
        Descubre más

        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          #inicio *,
          #inicio *::before,
          #inicio *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
