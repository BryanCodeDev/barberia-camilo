import React from 'react';
import { Clock, Scissors, ArrowRight, Sparkles } from 'lucide-react';
import { openBooking } from '../../utils/booking';

const ServiceCard = ({ service, index }) => {
  const formatPrice = (price) => {
    return price.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    });
  };

  const handleBookingClick = () => {
    openBooking(service);
  };

  return (
    <div
      className="relative group bg-[#FBF6EA] rounded-sm p-6 border border-[#EADFC6] hover:border-[#C9A860] hover:-translate-y-1.5 transition-all duration-300 ease-out shadow-[0_4px_16px_rgba(112,66,20,0.08)] hover:shadow-[0_22px_40px_-14px_rgba(112,66,20,0.28)] overflow-hidden"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Línea superior de acento — se completa al pasar el cursor */}
      <div className="absolute top-0 left-0 h-[3px] w-0 bg-gradient-to-r from-black via-[#2A2A2A] to-black group-hover:w-full transition-all duration-500 ease-out" />

      {/* Marca de agua / ícono decorativo de fondo */}
      <Scissors className="absolute -right-4 -bottom-4 h-28 w-28 text-black/[0.045] rotate-12 group-hover:rotate-[22deg] group-hover:scale-110 transition-transform duration-500 pointer-events-none" />

      {/* Etiqueta de servicio popular */}
      {service.popular && (
        <div className="absolute -top-2.5 right-5 flex items-center gap-1 bg-black text-[#E0C47A] text-[10px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-sm shadow-md">
          <Sparkles className="h-2.5 w-2.5" />
          Popular
        </div>
      )}

      {/* Encabezado */}
      <div className="relative flex items-start mb-4">
        <div className="bg-gradient-to-b from-[#D8BA76] to-[#A9812E] p-2.5 rounded-sm mr-3 shadow-[0_2px_8px_-2px_rgba(169,129,46,0.5)] group-hover:scale-105 transition-transform duration-300">
          <Scissors className="h-4 w-4 text-[#0A0A0A]" />
        </div>
        <h3 className="font-serif text-lg text-black leading-snug pt-1.5">
          {service.name}
        </h3>
      </div>

      {/* Duración y precio — separados por una perforación tipo ticket */}
      <div
        className="relative flex items-center justify-between mb-4 pb-4"
        style={{
          borderBottom: '1.5px dashed #D9C79E',
        }}
      >
        <span className="absolute -left-9 bottom-0 translate-y-1/2 w-4 h-4 rounded-full bg-[#F3E9D6]" />
        <span className="absolute -right-9 bottom-0 translate-y-1/2 w-4 h-4 rounded-full bg-[#F3E9D6]" />
        <div className="flex items-center text-black/55">
          <Clock className="h-3.5 w-3.5 mr-1.5" />
          <span className="text-xs font-medium uppercase tracking-wide">{service.duration}</span>
        </div>
        <div className="text-xl font-bold text-[#8B6240]">
          {formatPrice(service.price)}
        </div>
      </div>

      {/* Descripción */}
      <p className="relative text-black/55 text-sm leading-relaxed mb-5 line-clamp-3">
        {service.description}
      </p>

      {/* Botón de acción */}
      <button
        onClick={handleBookingClick}
        className="relative w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-sm font-semibold text-sm uppercase tracking-wide bg-gradient-to-b from-[#C9A860] to-[#A9812E] text-[#0A0A0A] shadow-[0_2px_0_rgba(0,0,0,0.12)] hover:from-[#D8BA76] hover:to-[#BC9440] active:translate-y-px active:shadow-none transition-all duration-200"
      >
        Agendar este servicio
        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
      </button>
    </div>
  );
};

export default ServiceCard;