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
      className="relative group bg-white rounded-md p-6 border border-[#EADFC6] hover:border-[#C9A860] hover:-translate-y-2 transition-all duration-300 ease-out shadow-[0_4px_16px_rgba(112,66,20,0.08)] hover:shadow-[0_25px_45px_rgba(112,66,20,0.18)] overflow-hidden"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Línea negra superior animada */}
      <div className="absolute top-0 left-0 h-[3px] w-0 bg-gradient-to-r from-black via-[#2A2A2A] to-black group-hover:w-full transition-all duration-500 ease-out" />

      {/* Marca de agua / ícono decorativo de fondo */}
      <Scissors className="absolute -right-4 -bottom-4 h-28 w-28 text-black/[0.04] rotate-12 group-hover:rotate-[24deg] group-hover:scale-110 transition-transform duration-500 pointer-events-none" />

      {/* Popular tag */}
      {service.popular && (
        <div className="absolute -top-2.5 right-5 flex items-center gap-1 bg-black text-[#E0C47A] text-[10px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-sm shadow-md">
          <Sparkles className="h-2.5 w-2.5" />
          Popular
        </div>
      )}

      {/* Header */}
      <div className="relative flex items-start mb-4">
        <div className="bg-black p-2.5 rounded-sm mr-3 group-hover:bg-[#1A1A1A] group-hover:shadow-[0_0_14px_rgba(0,0,0,0.25)] transition-all duration-300">
          <Scissors className="h-4 w-4 text-[#E0C47A]" />
        </div>
        <h3 className="font-serif text-lg text-black leading-snug pt-1.5">
          {service.name}
        </h3>
      </div>

      {/* Duration and Price */}
      <div className="relative flex items-center justify-between mb-4 pb-4 border-b border-[#EADFC6]">
        <div className="flex items-center text-black/55">
          <Clock className="h-3.5 w-3.5 mr-1.5" />
          <span className="text-xs font-medium uppercase tracking-wide">{service.duration}</span>
        </div>
        <div className="text-xl font-bold text-[#8B6240]">
          {formatPrice(service.price)}
        </div>
      </div>

      {/* Description */}
      <p className="relative text-black/55 text-sm leading-relaxed mb-5 line-clamp-3">
        {service.description}
      </p>

      {/* Action Button */}
      <button
        onClick={handleBookingClick}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-sm font-semibold text-sm uppercase tracking-wide bg-[#C9A860] text-[#0A0A0A] hover:bg-[#E0C47A] transition-colors"
      >
        Agendar este servicio
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default ServiceCard;