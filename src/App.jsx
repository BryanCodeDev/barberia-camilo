import React, { useState, useMemo } from 'react';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HeroSection from './components/sections/HeroSection';
import ServicesSection from './components/sections/ServicesSection';
import BookingForm from './components/sections/BookingForm';
import AdminPanel from './components/admin/AdminPanel';
import { useBusinessSettings } from './hooks/useBusinessSettings';

const App = () => {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [preselectedService, setPreselectedService] = useState(null);
  const { settings, loading: settingsLoading } = useBusinessSettings();

  const handleBookingSuccess = () => {
    setShowBookingForm(false);
    setPreselectedService(null);
  };

  const handleCloseBooking = () => {
    setShowBookingForm(false);
    setPreselectedService(null);
  };

  const handleNavbarBooking = () => {
    setPreselectedService(null);
    setShowBookingForm(true);
  };

  const handleHeroBooking = () => {
    setPreselectedService(null);
    setShowBookingForm(true);
  };

  const handleServiceBooking = (service = null) => {
    setPreselectedService(service);
    setShowBookingForm(true);
  };

  const scrollToServices = () => {
    const servicesSection = document.getElementById('servicios');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const businessInfo = useMemo(() => settings ? {
    name: settings.business_name || 'Barber Trebol',
    title: settings.barber_name || 'Master Barber',
    address: settings.address || 'Mosquera, Cundinamarca',
    phone: settings.phone || '+57 300 123 4567',
    whatsapp: settings.whatsapp_number || '573001234567',
    email: settings.email || 'contacto@barbertrebol.com',
  } : null, [settings]);

  if (showAdminPanel) {
    return (
      <AdminPanel onClose={() => setShowAdminPanel(false)} business={businessInfo} />
    );
  }

  return (
    <div className="min-h-screen bg-white">
        <Navbar
          onBookingClick={handleNavbarBooking}
          onServicesClick={scrollToServices}
          onAdminClick={() => setShowAdminPanel(true)}
          business={businessInfo}
        />

        {!showBookingForm && (
          <>
            <HeroSection onBookingClick={handleHeroBooking} business={businessInfo} />
            <div id="servicios">
              <ServicesSection onBookingClick={handleServiceBooking} />
            </div>
          </>
        )}

        {showBookingForm && (
          <BookingForm
            onClose={handleCloseBooking}
            onSuccess={handleBookingSuccess}
            preselectedService={preselectedService}
            business={businessInfo}
          />
        )}

        <Footer business={businessInfo} />
      </div>
  );
};

export default App;
