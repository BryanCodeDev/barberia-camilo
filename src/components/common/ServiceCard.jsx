// src/components/common/ServiceCard.jsx
import React from 'react';
import { Clock, Scissors, ArrowRight } from 'lucide-react';
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
    <div className="relative group bg-[#704214] rounded-sm p-6 border border-[#8B6240] hover:border-[#C9A860]/60 hover:-translate-y-1 transition-all duration-200 shadow-sm hover:shadow-md">
      {/* Popular tag */}
      {service.popular && (
        <div className="absolute -top-2.5 right-5 bg-[#C9A860] text-[#0A0A0A] text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-sm">
          Popular
        </div>
      )}

      {/* Header */}
      <div className="flex items-start mb-4">
        <div className="bg-[#C9A860]/10 p-2 rounded-sm mr-3 group-hover:bg-[#C9A860]/20 transition-colors">
          <Scissors className="h-4 w-4 text-[#C9A860]" />
        </div>
        <h3 className="font-serif text-lg text-[#F6F2EA] leading-snug pt-1">
          {service.name}
        </h3>
      </div>

      {/* Duration and Price */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#8B6240]">
        <div className="flex items-center text-[#D4C5B0]">
          <Clock className="h-3.5 w-3.5 mr-1.5" />
          <span className="text-xs font-medium">{service.duration}</span>
        </div>
        <div className="text-xl font-semibold text-[#E0C47A]">
          {formatPrice(service.price)}
        </div>
      </div>

      {/* Description */}
      <p className="text-[#D4C5B0] text-sm leading-relaxed mb-5 line-clamp-3">
        {service.description}
      </p>

      {/* Action Button */}
      <button
        onClick={handleBookingClick}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-sm font-semibold text-sm uppercase tracking-wide border border-[#C9A860] text-[#C9A860] hover:bg-[#C9A860] hover:text-[#0A0A0A] transition-colors"
      >
        Agendar este servicio
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default ServiceCard;