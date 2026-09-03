import React from 'react';
import { MessageCircle, CalendarDays } from 'lucide-react';
import { openBooking } from '../../utils/booking';

const MobileStickyCTA = ({ business }) => {
  const whatsappNumber = business?.whatsapp || '3015667129';
  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#121113]/95 backdrop-blur-md border-t border-[#2A2723] px-4 py-3 safe-area-inset-bottom shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-3">
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 border border-[#2A2723] text-[#D8D3C7] px-4 py-3 rounded-sm font-semibold text-sm uppercase tracking-wide hover:border-[#A9812E]/60 hover:text-[#C9A860] active:translate-y-px transition-all duration-150"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </a>
        <button
          onClick={() => openBooking()}
          className="flex-[1.3] flex items-center justify-center gap-2 bg-gradient-to-b from-[#C9A860] to-[#A9812E] text-[#121113] px-4 py-3 rounded-sm font-semibold text-sm uppercase tracking-wide shadow-[0_2px_0_rgba(0,0,0,0.2)] active:translate-y-px active:shadow-none transition-all duration-150"
        >
          <CalendarDays className="h-4 w-4" />
          Agendar
        </button>
      </div>
    </div>
  );
};

export default MobileStickyCTA;