import React, { useState } from 'react';

// Import components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HeroSection from './components/sections/HeroSection';
import ServicesSection from './components/sections/ServicesSection';
import BookingForm from './components/sections/BookingForm';
import AdminPanel from './components/admin/AdminPanel';

const App = () => {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [preselectedService, setPreselectedService] = useState(null);

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

  if (showAdminPanel) {
    return (
      <AdminPanel onClose={() => setShowAdminPanel(false)} />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar
        onBookingClick={handleNavbarBooking}
        onServicesClick={scrollToServices}
        onAdminClick={() => setShowAdminPanel(true)}
      />

      {!showBookingForm && (
        <>
          <HeroSection onBookingClick={handleHeroBooking} />
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
        />
      )}

      <Footer />
    </div>
  );
};

export default App;