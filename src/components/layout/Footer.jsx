// src/components/layout/Footer.jsx
import React from 'react';
import { Phone, MapPin, Instagram, Facebook, Clock, MessageCircle, Youtube, Music, ArrowUpRight } from 'lucide-react';

const Footer = ({ business }) => {
  const businessInfo = {
    name: business?.name || "BARBERÍA EL BRONX",
    phone: business?.phone || "+301 566 7129",
    whatsapp: business?.whatsapp || "3015667129",
    email: business?.email || "elbronxofficial@gmail.com",
    address: {
      street: business?.address || "KR 3 # 13 - 12 MZ 2 IN L1 CENTRO COMERCIAL EL TREBOL",
      city: "Mosquera",
      state: "Cundinamarca",
      country: "Colombia",
      full: business?.address || "KR 3 # 13 - 12 MZ 2 IN L1 CENTRO COMERCIAL EL TREBOL, Mosquera, Cundinamarca"
    },
    socialMedia: {
      instagram: business?.instagram || "elbronx.official",
      facebook: business?.facebook || "elbronx.official",
      tiktok: business?.tiktok || "@elbronxbarber",
      youtube: business?.youtube || "@elbronxofficial"
    }
  };

  const currentYear = new Date().getFullYear();
  const whatsappLink = `https://wa.me/${businessInfo.whatsapp.replace(/[^0-9]/g, '')}`;

  const socialLinks = [
    businessInfo.socialMedia.instagram && {
      href: `https://www.instagram.com/${businessInfo.socialMedia.instagram.replace('@', '')}`,
      label: 'Instagram',
      Icon: Instagram,
    },
    businessInfo.socialMedia.facebook && {
      href: `https://www.facebook.com/${businessInfo.socialMedia.facebook.replace(/\s+/g, '')}`,
      label: 'Facebook',
      Icon: Facebook,
    },
    businessInfo.socialMedia.tiktok && {
      href: `https://www.tiktok.com/${businessInfo.socialMedia.tiktok.replace('@', '')}`,
      label: 'TikTok',
      Icon: Music,
    },
    businessInfo.socialMedia.youtube && {
      href: `https://www.youtube.com/${businessInfo.socialMedia.youtube.replace('@', '')}`,
      label: 'YouTube',
      Icon: Youtube,
    },
    { href: whatsappLink, label: 'WhatsApp', Icon: MessageCircle },
  ].filter(Boolean);

  return (
    <footer className="relative bg-[#121113] text-[#F6F2EA]">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#A9812E]/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <span className="flex items-center justify-center w-9 h-9 rounded-full border border-[#A9812E]/60 text-[#C9A860] overflow-hidden">
                <img src="/assets/img/logo.webp" alt="Logo" className="w-6 h-6 object-contain" />
              </span>
              <span className="font-serif text-lg md:text-xl tracking-wide">{businessInfo.name}</span>
            </div>
            <p className="text-[#9A9488] mb-5 text-sm leading-relaxed max-w-xs">
              Barbería clásica, masculina y urbana. Cortes de precisión, arreglo de barba
              y grooming en Mosquera, Cundinamarca.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-[#2A2723] text-[#9A9488] hover:text-[#121113] hover:bg-[#C9A860] hover:border-[#C9A860] hover:-translate-y-0.5 transition-all duration-200"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C9A860] mb-5">Contacto</h3>
            <div className="space-y-3.5">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center text-[#D8D3C7] hover:text-[#C9A860] transition-colors text-sm w-fit">
                <Phone className="h-4 w-4 text-[#6E6A61] mr-3 flex-shrink-0" />
                {businessInfo.phone}
              </a>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center text-[#D8D3C7] hover:text-[#C9A860] transition-colors text-sm w-fit">
                <MessageCircle className="h-4 w-4 text-[#6E6A61] mr-3 flex-shrink-0" />
                WhatsApp
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
                  Lunes – Sábado
                </div>
                <span className="text-[#9A9488]">9:00 AM – 9:00 PM</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-[#D8D3C7]">
                  <Clock className="h-3.5 w-3.5 text-[#6E6A61] mr-2.5 flex-shrink-0" />
                  Domingos
                </div>
                <span className="text-[#9A9488]">9:00 AM – 8:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#221F1B] mt-10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2">
            <p className="text-[#6E6A61] text-xs text-center md:text-left">
              © {currentYear} {businessInfo.name}. Todos los derechos reservados.
            </p>
            <a
              href="https://mastercodecompany.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-1 text-[#6E6A61] text-xs hover:text-[#C9A860] transition-colors"
            >
              Barbería de autor por Mastercode Company
              <ArrowUpRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;