// src/components/common/ServiceCard.jsx
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
      className="relative group bg-black rounded-md p-6 border border-[#2A2A2A] hover:border-[#C9A860] hover:-translate-y-2 transition-all duration-300 ease-out shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.4)] overflow-hidden"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Línea dorada superior animada */}
      <div className="absolute top-0 left-0 h-[3px] w-0 bg-gradient-to-r from-[#C9A860] via-[#E0C47A] to-[#C9A860] group-hover:w-full transition-all duration-500 ease-out" />

      {/* Marca de agua / ícono decorativo de fondo */}
      <Scissors className="absolute -right-4 -bottom-4 h-28 w-28 text-white/[0.04] rotate-12 group-hover:rotate-[24deg] group-hover:scale-110 transition-transform duration-500 pointer-events-none" />

      {/* Popular tag */}
      {service.popular && (
        <div className="absolute -top-2.5 right-5 flex items-center gap-1 bg-[#C9A860] text-black text-[10px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-sm shadow-md">
          <Sparkles className="h-2.5 w-2.5" />
          Popular
        </div>
      )}

      {/* Header */}
      <div className="relative flex items-start mb-4">
        <div className="bg-[#C9A860] p-2.5 rounded-sm mr-3 group-hover:bg-white transition-colors duration-300">
          <Scissors className="h-4 w-4 text-black" />
        </div>
        <h3 className="font-serif text-lg text-white leading-snug pt-1.5">
          {service.name}
        </h3>
      </div>

      {/* Duration and Price */}
      <div className="relative flex items-center justify-between mb-4 pb-4 border-b border-[#2A2A2A]">
        <div className="flex items-center text-white/50">
          <Clock className="h-3.5 w-3.5 mr-1.5" />
          <span className="text-xs font-medium uppercase tracking-wide">{service.duration}</span>
        </div>
        <div className="text-xl font-bold text-[#E0C47A]">
          {formatPrice(service.price)}
        </div>
      </div>

      {/* Description */}
      <p className="relative text-white/50 text-sm leading-relaxed mb-5 line-clamp-3">
        {service.description}
      </p>

      {/* Action Button */}
      <button
        onClick={handleBookingClick}
        className="relative w-full flex items-center justify-center gap-2 py-3 px-4 rounded-sm font-semibold text-sm uppercase tracking-wide bg-[#C9A860] text-black hover:bg-white hover:text-black transition-all duration-300 group/btn overflow-hidden"
      >
        <span className="relative z-10">Agendar este servicio</span>
        <ArrowRight className="relative z-10 h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform duration-300" />
      </button>
    </div>
  );
};

export default ServiceCard;