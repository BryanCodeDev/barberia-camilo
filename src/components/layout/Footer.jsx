// src/components/layout/Footer.jsx
import React from 'react';
import { Scissors, Phone, MapPin, Instagram, Facebook, Clock, MessageCircle } from 'lucide-react';

const Footer = ({ business }) => {
  const businessInfo = {
    name: business?.name || "BARBERÍA EL BRONX",
    phone: business?.phone || "+301 566 7129",
    whatsapp: business?.whatsapp || "3015667129",
    email: business?.email || "",
    address: {
      street: business?.address || "CALLE 3 #4 - 77 EDIFICIO INFINITO LOCAL 01",
      city: "Mosquera",
      state: "Cundinamarca",
      country: "Colombia",
      full: business?.address || "CALLE 3 #4 - 77 EDIFICIO INFINITO LOCAL 01, Mosquera, Cundinamarca"
    },
    socialMedia: {
      instagram: business?.instagram || "",
      facebook: business?.facebook || "",
      tiktok: ""
    }
  };

  const currentYear = new Date().getFullYear();
  const whatsappLink = `https://wa.me/${businessInfo.whatsapp.replace(/[^0-9]/g, '')}`;

  return (
    <footer className="bg-[#121113] text-[#F6F2EA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <span className="flex items-center justify-center w-9 h-9 rounded-full border border-[#A9812E]/60 text-[#C9A860]">
                <Scissors className="h-4 w-4" />
              </span>
              <span className="font-serif text-lg md:text-xl tracking-wide">{businessInfo.name}</span>
            </div>
            <p className="text-[#9A9488] mb-5 text-sm leading-relaxed">
              Barbería clásica, masculina, elegante, urbana y profesional. Cortes de cabello, arreglo de barba y servicios de grooming masculino en Mosquera, Cundinamarca.
            </p>
            <div className="flex space-x-4">
              {businessInfo.socialMedia.instagram && (
                <a
                  href={`https://instagram.com/${businessInfo.socialMedia.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-[#2A2723] text-[#9A9488] hover:text-[#C9A860] hover:border-[#A9812E]/60 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {businessInfo.socialMedia.facebook && (
                <a
                  href={`https://facebook.com/${businessInfo.socialMedia.facebook.replace(/\s+/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-[#2A2723] text-[#9A9488] hover:text-[#C9A860] hover:border-[#A9812E]/60 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-[#2A2723] text-[#9A9488] hover:text-[#C9A860] hover:border-[#A9812E]/60 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C9A860] mb-5">Contacto</h3>
            <div className="space-y-3.5">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center text-[#D8D3C7] hover:text-[#C9A860] transition-colors text-sm">
                <Phone className="h-4 w-4 text-[#6E6A61] mr-3 flex-shrink-0" />
                {businessInfo.phone}
              </a>
              <div className="flex items-start">
                <MapPin className="h-4 w-4 text-[#6E6A61] mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-[#D8D3C7] text-sm leading-relaxed">
                  <p>{businessInfo.address.street}</p>
                  <p className="text-[#9A9488]">{businessInfo.address.city}, {businessInfo.address.state}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C9A860] mb-5">Horarios de Atención</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-[#221F1B] pb-2.5">
                <div className="flex items-center text-[#D8D3C7]">
                  <Clock className="h-3.5 w-3.5 text-[#6E6A61] mr-2.5 flex-shrink-0" />
                  Lunes – Viernes
                </div>
                <span className="text-[#9A9488]">8:00 AM – 7:00 PM</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#221F1B] pb-2.5">
                <div className="flex items-center text-[#D8D3C7]">
                  <Clock className="h-3.5 w-3.5 text-[#6E6A61] mr-2.5 flex-shrink-0" />
                  Sábados
                </div>
                <span className="text-[#9A9488]">8:00 AM – 6:00 PM</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-[#D8D3C7]">
                  <Clock className="h-3.5 w-3.5 text-[#6E6A61] mr-2.5 flex-shrink-0" />
                  Domingos
                </div>
                <span className="text-[#9A9488]">9:00 AM – 4:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#221F1B] mt-10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2">
            <p className="text-[#6E6A61] text-xs text-center md:text-left">
              © {currentYear} {businessInfo.name}. Todos los derechos reservados.
            </p>
            <p className="text-[#6E6A61] text-xs text-center md:text-right">
              <a href="https://mastercodecompany.com/" target="_blank" rel="noopener noreferrer" className="hover:text-[#C9A860] transition-colors">Barbería de autor por Mastercode Company</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
