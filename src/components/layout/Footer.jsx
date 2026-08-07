// src/components/layout/Footer.jsx
import React, { useState, useEffect } from 'react';
import { Scissors, Phone, MapPin, Instagram, Facebook, Clock } from 'lucide-react';

const defaultBusinessInfo = {
  name: "Barber Trebol",
  phone: "+57 300 123 4567",
  whatsapp: "573001234567",
  email: "contacto@barbertrebol.com",
  address: {
    street: "CALLE 3 #4 - 77 EDIFICIO INFINITO LOCAL 01",
    city: "Mosquera",
    state: "Cundinamarca",
    country: "Colombia",
    full: "CALLE 3 #4 - 77 EDIFICIO INFINITO LOCAL 01, Mosquera, Cundinamarca"
  },
  socialMedia: {
    instagram: "@barbertrebol",
    facebook: "Barber Trebol",
    tiktok: "@barbertrebol"
  }
};

const Footer = ({ business }) => {
  const [businessInfo, setBusinessInfo] = useState(defaultBusinessInfo);

  useEffect(() => {
    if (business) {
      setBusinessInfo({
        name: business.name || defaultBusinessInfo.name,
        phone: business.phone || defaultBusinessInfo.phone,
        whatsapp: business.whatsapp || defaultBusinessInfo.whatsapp,
        email: business.email || defaultBusinessInfo.email,
        address: {
          street: business.address || defaultBusinessInfo.address.street,
          city: "Mosquera",
          state: "Cundinamarca",
          country: "Colombia",
          full: business.address || defaultBusinessInfo.address.full
        },
        socialMedia: {
          instagram: business.instagram || defaultBusinessInfo.socialMedia.instagram,
          facebook: business.facebook || defaultBusinessInfo.socialMedia.facebook,
          tiktok: business.tiktok || defaultBusinessInfo.socialMedia.tiktok
        }
      });
    }
  }, [business]);

  const currentYear = new Date().getFullYear();

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
              Master Barber — experiencia VIP en barbería masculina, con más de 10 años
              ofreciendo cortes precisos y servicio premium en Mosquera, Cundinamarca.
            </p>
            <div className="flex space-x-4">
              <a
                href={`https://instagram.com/${businessInfo.socialMedia.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-[#2A2723] text-[#9A9488] hover:text-[#C9A860] hover:border-[#A9812E]/60 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={`https://facebook.com/${businessInfo.socialMedia.facebook.replace(/\s+/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-[#2A2723] text-[#9A9488] hover:text-[#C9A860] hover:border-[#A9812E]/60 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C9A860] mb-5">Contacto</h3>
            <div className="space-y-3.5">
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-[#6E6A61] mr-3 flex-shrink-0" />
                <a
                  href={`tel:${businessInfo.phone}`}
                  className="text-[#D8D3C7] hover:text-[#C9A860] transition-colors text-sm"
                >
                  {businessInfo.phone}
                </a>
              </div>
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
              Barbería de autor en Mosquera, Cundinamarca
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
