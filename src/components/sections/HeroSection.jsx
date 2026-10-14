// src/components/sections/HeroSection.jsx
import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Phone,
  Scissors,
  ArrowUpRight,
  ChevronDown,
  Sparkles,
  Star,
  Users,
  Award,
} from 'lucide-react';
import { openBooking } from '../../utils/booking';

const DEFAULT_BUSINESS = {
  name: 'MUSTACHE BARBERSHOP',
  title: 'MUSTACHE',
  address: 'Mosquera, Cundinamarca',
  phone: '+301 566 7129',
};

// Ajusta estos indicadores con las cifras reales del negocio.
const STATS = [
  { icon: Star, value: '4.9/5', label: 'Valoración' },
  { icon: Users, value: '+2.500', label: 'Cortes realizados' },
  { icon: Award, value: '+10 años', label: 'De trayectoria' },
];

const HeroSection = ({ business }) => {
  const [mounted, setMounted] = useState(false);

  const localBusiness = { ...DEFAULT_BUSINESS, ...business };
  const city = localBusiness.address.split(',')[0];

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
      className="relative isolate min-h-[480px] overflow-hidden bg-black text-[#F6F2EA] lg:min-h-[540px]"
    >
      {/* Textura decorativa (escritorio) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-[1] hidden w-[42%] opacity-[0.07] lg:block"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, #C9A860 0px, #C9A860 1px, transparent 1px, transparent 34px)',
          maskImage: 'linear-gradient(to right, black, transparent 85%)',
          WebkitMaskImage: 'linear-gradient(to right, black, transparent 85%)',
        }}
      />

      {/* La imagen es el fondo de toda la sección, en móvil y en escritorio */}
      <div className="mx-auto max-w-[1600px]">
        {/* Contenido */}
        <div className="relative z-10 flex min-h-[480px] flex-col justify-end px-5 pb-8 pt-20 sm:px-10 md:px-14 lg:min-h-[540px] lg:max-w-[56%] lg:justify-center lg:px-16 lg:pb-12 lg:pt-24 xl:px-20">
          <div style={reveal(100)} className="mb-4 flex items-center gap-3 lg:mb-5">
            <span className="h-px w-10 bg-[#A9812E]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#C9A860] sm:text-xs">
              {localBusiness.title} · Barbería premium
            </span>
          </div>

          <h1
            id="hero-title"
            style={reveal(200)}
            className="max-w-2xl font-serif text-[clamp(2.75rem,10vw,3.75rem)] font-medium leading-[0.98] tracking-[-0.04em] drop-shadow-[0_2px_16px_rgba(0,0,0,0.6)] lg:text-[clamp(3rem,6.3vw,6rem)] lg:drop-shadow-none"
          >
            Tu estilo.
            <br />
            <span className="text-[#C9A860]">Tu identidad.</span>
            <br />
            <span className="text-white">Nuestro oficio.</span>
          </h1>

          <div
            aria-hidden="true"
            style={reveal(280)}
            className="my-4 flex items-center gap-3 lg:my-5"
          >
            <span className="h-[2px] w-12 bg-[#A9812E]" />
            <Scissors className="h-4 w-4 text-[#C9A860]" />
            <span className="h-px w-8 bg-[#3A362F]" />
          </div>

          <p
            style={reveal(340)}
            className="max-w-lg text-sm leading-7 text-[#D2CCBD] sm:text-base sm:leading-8 lg:text-[#B7B1A3]"
          >
            Cortes con carácter, barba impecable y atención al detalle en {city}.
            Descubre una experiencia de barbería donde cada acabado habla por ti.
          </p>

          {/* Acciones */}
          <div
            style={reveal(420)}
            className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
          >
            <button
              type="button"
              onClick={() => openBooking()}
              className="group relative inline-flex min-h-[54px] items-center justify-center gap-3 overflow-hidden rounded-sm bg-gradient-to-r from-[#A9812E] to-[#C9A860] px-7 py-4 text-xs font-bold uppercase tracking-[0.13em] text-black shadow-[0_8px_30px_rgba(169,129,46,0.2)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_36px_rgba(169,129,46,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A860] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <Scissors className="h-4 w-4 transition-transform duration-300 group-hover:rotate-[-12deg]" />
              Reservar cita
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
              />
            </button>

            <button
              type="button"
              onClick={scrollToServices}
              className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-sm border border-[#4A453C] bg-black/30 px-7 py-4 text-xs font-semibold uppercase tracking-[0.13em] text-[#F6F2EA] backdrop-blur-sm transition duration-300 hover:border-[#C9A860] hover:bg-white/[0.04] hover:text-[#C9A860] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A860] lg:bg-transparent lg:backdrop-blur-none"
            >
              Explorar servicios
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          {/* Confianza */}
          <div
            style={reveal(470)}
            className="mt-5 hidden w-fit items-center gap-2.5 rounded-sm sm:inline-flex border border-dashed border-[#4A453C] bg-black/30 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-[#A8A295] backdrop-blur-sm sm:text-[11px] lg:bg-transparent lg:backdrop-blur-none"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#5FAE68]" />
            Confirmación inmediata al reservar en línea
          </div>

          {/* Estadísticas */}
          <div
            style={reveal(520)}
            className="mt-5 hidden max-w-md grid-cols-3 gap-4 sm:grid sm:gap-8"
          >
            {STATS.map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="flex flex-col gap-1 border-t border-[#3A362F] pt-3"
              >
                <Icon className="mb-1 h-4 w-4 text-[#C9A860]" />
                <div className="font-serif text-xl text-[#F6F2EA] sm:text-2xl">
                  {value}
                </div>
                <div className="text-[9px] uppercase leading-tight tracking-wide text-[#9A9488] sm:text-[10px]">
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* Ubicación y contacto */}
          <div
            style={reveal(580)}
            className="mt-6 flex flex-col gap-3 border-t border-[#2A2723] pt-5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-7"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#A9812E]/30 bg-[#A9812E]/10">
                <MapPin className="h-4 w-4 text-[#C9A860]" />
              </span>
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-[#9A9488]">
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
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#3A362F] transition-colors group-hover:border-[#A9812E]/60">
                  <Phone className="h-4 w-4 text-[#C9A860]" />
                </span>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-[#9A9488]">
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

        {/* Imagen de fondo */}
        <div
          className="absolute inset-0 z-0 overflow-hidden"
          style={reveal(180)}
        >
          <img
            src="/assets/img/herosection.webp"
            alt="Ambiente de barbería premium en Mustache Barbershop"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover object-[60%_center] lg:object-[70%_center]"
          />

          {/* Móvil: oscurece de abajo hacia arriba para que el texto se lea */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 lg:hidden"
            style={{
              background:
                'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.78) 45%, rgba(0,0,0,0.45) 75%, rgba(0,0,0,0.6) 100%), radial-gradient(ellipse at 50% 0%, rgba(201,168,96,0.14), transparent 60%)',
            }}
          />

          {/* Escritorio: texto sobre zona oscura a la izquierda, foto visible a la derecha */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden lg:block"
            style={{
              background:
                'linear-gradient(to right, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.82) 30%, rgba(0,0,0,0.4) 58%, rgba(0,0,0,0.1) 100%), linear-gradient(to top, rgba(0,0,0,0.6), transparent 30%), linear-gradient(to bottom, rgba(0,0,0,0.35), transparent 22%), radial-gradient(ellipse at 15% 45%, rgba(169,129,46,0.12), transparent 45%)',
            }}
          />

          {/* Marco dorado (escritorio) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-10 hidden border border-[#C9A860]/25 lg:block"
          />
          <span
            aria-hidden="true"
            className="absolute left-10 top-10 hidden h-8 w-8 border-l border-t border-[#C9A860] lg:block"
          />
          <span
            aria-hidden="true"
            className="absolute bottom-10 right-10 hidden h-8 w-8 border-b border-r border-[#C9A860] lg:block"
          />
          <div
            aria-hidden="true"
            className="absolute bottom-16 right-16 hidden items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-[#F6F2EA]/80 lg:flex"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#C9A860]" />
            Detalles que marcan la diferencia
          </div>
        </div>
      </div>

      {/* Indicador de scroll */}
      <button
        type="button"
        onClick={scrollToServices}
        aria-label="Desplazarse a los servicios"
        className="absolute bottom-5 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-1 text-[9px] uppercase tracking-[0.3em] text-[#9A9488] transition-colors hover:text-[#C9A860] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A860] sm:flex lg:bottom-7"
      >
        Descubre más
        <ChevronDown
          className="h-3.5 w-3.5"
          style={{ animation: 'hero-bounce 1.8s ease-in-out infinite' }}
        />
      </button>

      <style>{`
        @keyframes hero-bounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(5px); opacity: 1; }
        }
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