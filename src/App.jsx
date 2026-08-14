import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HeroSection from './components/sections/HeroSection';
import ServicesSection from './components/sections/ServicesSection';
import BookingForm from './components/sections/BookingForm';
import AdminPanel from './pages/AdminPanel';
import ClientPortal from './pages/ClientPortal';
import { useBusinessSettings } from './hooks/useBusinessSettings';
import { onBookingRequested } from './utils/booking';
import ErrorBoundary from './components/common/ErrorBoundary';

const AppContent = () => {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [preselectedService, setPreselectedService] = useState(null);
  const { settings } = useBusinessSettings();

  useEffect(() => {
    const unsubscribe = onBookingRequested((service) => {
      setPreselectedService(service);
      setShowBookingForm(true);
    });
    return unsubscribe;
  }, []);

  const businessInfo = useMemo(() => ({
    name: settings?.business_name || 'BARBERÍA EL BRONX',
    title: settings?.barber_name || 'EL BRONX',
    address: settings?.address || 'Mosquera, Cundinamarca',
    address_line: settings?.address || 'CALLE 3 #4 - 77 EDIFICIO INFINITO LOCAL 01',
    phone: settings?.phone || '+301 566 7129',
    whatsapp: settings?.whatsapp_number || '3015667129',
    email: settings?.email || '',
    instagram: settings?.instagram || '',
    facebook: settings?.facebook || '',
  }), [settings]);

  const handleBookingSuccess = () => {
    setShowBookingForm(false);
    setPreselectedService(null);
  };

  const handleCloseBooking = () => {
    setShowBookingForm(false);
    setPreselectedService(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar
        business={businessInfo}
      />

      <Routes>
        <Route path="/" element={
          <>
            <HeroSection business={businessInfo} />
            <div id="servicios">
              <ServicesSection />
            </div>
          </>
        } />
        <Route path="/admin" element={<AdminPanel onClose={() => {}} business={businessInfo} />} />
        <Route path="/cliente" element={<ClientPortal business={businessInfo} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

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

const App = () => (
  <BrowserRouter>
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  </BrowserRouter>
);

export default App;