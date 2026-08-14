import React from 'react';
import { MessageCircle, CalendarDays } from 'lucide-react';
import { openBooking } from '../../utils/booking';

const MobileStickyCTA = ({ business }) => {
  const whatsappNumber = business?.whatsapp || '3015667129';
  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#121113]/95 backdrop-blur-md border-t border-[#2A2723] px-4 py-3 safe-area-inset-bottom">
      <div className="flex items-center gap-3">
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-[#A9812E] text-[#121113] px-4 py-3 rounded-xl font-semibold text-sm uppercase tracking-wide hover:bg-[#C9A860] transition-colors btn-press"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </a>
        <button
          onClick={() => openBooking()}
          className="flex-1 flex items-center justify-center gap-2 border border-[#C9A860] text-[#C9A860] px-4 py-3 rounded-xl font-semibold text-sm uppercase tracking-wide hover:bg-[#C9A860] hover:text-[#121113] transition-colors btn-press"
        >
          <CalendarDays className="h-4 w-4" />
          Agendar
        </button>
      </div>
    </div>
  );
};

export default MobileStickyCTA;
