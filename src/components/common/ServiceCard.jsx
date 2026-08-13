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
    <div className="relative group bg-white rounded-sm p-6 border border-[#E4DCC9] hover:border-[#A9812E] hover:-translate-y-1 transition-all duration-200 shadow-sm hover:shadow-md">
      {/* Popular tag */}
      {service.popular && (
        <div className="absolute -top-2.5 right-5 bg-[#121113] text-[#C9A860] text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-sm">
          Popular
        </div>
      )}

      {/* Header */}
      <div className="flex items-start mb-4">
        <div className="bg-[#F6F2EA] p-2 rounded-sm mr-3 group-hover:bg-[#A9812E]/10 transition-colors">
          <Scissors className="h-4 w-4 text-[#A9812E]" />
        </div>
        <h3 className="font-serif text-lg text-[#1C1A16] leading-snug pt-1">
          {service.name}
        </h3>
      </div>

      {/* Duration and Price */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#E4DCC9]">
        <div className="flex items-center text-[#6B6459]">
          <Clock className="h-3.5 w-3.5 mr-1.5" />
          <span className="text-xs font-medium">{service.duration}</span>
        </div>
        <div className="text-xl font-semibold text-[#8B6A22]">
          {formatPrice(service.price)}
        </div>
      </div>

      {/* Description */}
      <p className="text-[#6B6459] text-sm leading-relaxed mb-5 line-clamp-3">
        {service.description}
      </p>

      {/* Action Button */}
      <button
        onClick={handleBookingClick}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-sm font-semibold text-sm uppercase tracking-wide border border-[#1C1A16] text-[#1C1A16] hover:bg-[#1C1A16] hover:text-[#F6F2EA] transition-colors"
      >
        Agendar este servicio
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default ServiceCard;