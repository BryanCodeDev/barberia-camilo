// src/components/sections/HeroSection.jsx
import React, { useState, useEffect } from 'react';
import { Star, MapPin, Phone } from 'lucide-react';

const defaultBusiness = {
  name: "Barber Trebol",
  title: "Master Barber",
  address: "Mosquera, Cundinamarca"
};

const HeroSection = ({ onBookingClick }) => {
  const [business, setBusiness] = useState(defaultBusiness);
  const stats = [
    { number: "1+", label: "Años de Experiencia" },
    { number: "1000+", label: "Clientes Satisfechos" },
    { number: "5★", label: "Calificación Promedio" }
  ];

  useEffect(() => {
    const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    fetch(`${apiBaseUrl}/business-settings`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.business_name) {
          setBusiness({
            name: data.business_name,
            title: data.title || "Master Barber",
            address: data.address || "Mosquera, Cundinamarca"
          });
        }
      })
      .catch(() => {});
  }, []);

  const scrollToServices = () => {
    const servicesSection = document.getElementById('servicios');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative bg-gradient-to-r from-black via-gray-900 to-black text-white py-20 overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 border border-amber-400 rounded-full"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 border border-amber-400 rounded-full"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-amber-400 rounded-full blur-sm"></div>
        <div className="absolute bottom-40 left-20 w-20 h-20 bg-amber-400 rounded-full blur-sm"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent animate-pulse">
            {business.name}
          </h1>
          
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center">
              <Star className="h-6 w-6 text-amber-400 fill-current mr-2" />
              <h2 className="text-xl md:text-3xl lg:text-4xl font-semibold text-amber-400">
                {business.title}
              </h2>
              <Star className="h-6 w-6 text-amber-400 fill-current ml-2" />
            </div>
          </div>

          <p className="text-lg md:text-xl lg:text-2xl mb-8 max-w-4xl mx-auto text-gray-300 leading-relaxed px-4">
            Experiencia <span className="text-amber-400 font-semibold">VIP</span> en barbería masculina. 
            Cortes precisos, estilo impecable y el mejor servicio en {business.address}.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-10 max-w-3xl mx-auto px-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center py-4">
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-amber-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-300 font-medium text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10 px-4">
            <button 
              onClick={onBookingClick}
              className="group bg-amber-400 text-black px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold text-base md:text-lg hover:bg-amber-500 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-amber-400/25"
            >
              <span className="mr-2">✂️</span>
              Agendar Cita Ahora
            </button>
            <button 
              onClick={scrollToServices}
              className="border-2 border-amber-400 text-amber-400 px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold text-base md:text-lg hover:bg-amber-400 hover:text-black transition-all duration-300"
            >
              Ver Servicios
            </button>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 text-gray-300 px-4">
            <div className="flex items-center">
              <Phone className="h-4 w-4 md:h-5 md:w-5 text-amber-400 mr-2" />
              <span className="text-sm md:text-base">+57 300 123 4567</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-amber-400 rounded-full"></div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 md:h-5 md:w-5 text-amber-400 mr-2" />
              <span className="text-sm md:text-base">Mosquera, Cundinamarca</span>
            </div>
          </div>
        </div>
      </div>

      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/5 to-transparent animate-pulse"></div>
    </section>
  );
};

export default HeroSection;