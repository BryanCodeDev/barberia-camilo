import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import MobileStickyCTA from './components/layout/MobileStickyCTA';
import HeroSection from './components/sections/HeroSection';
import ServicesSection from './components/sections/ServicesSection';
import BookingForm from './components/sections/BookingForm';
import AdminPanel from './pages/AdminPanel';
import ClientPortal from './pages/ClientPortal';
import Profile from './pages/Profile';
import { useBusinessSettings } from './hooks/useBusinessSettings';
import { onBookingRequested } from './utils/booking';
import ErrorBoundary from './components/common/ErrorBoundary';

const AppContent = () => {
  const location = useLocation();
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
    address_line: settings?.address || 'KR 3 # 13 - 12 MZ 2 IN L1 CENTRO COMERCIAL EL TREBOL',
    phone: settings?.phone || '+301 566 7129',
    whatsapp: settings?.whatsapp_number || '3015667129',
    email: settings?.email || '',
    instagram: settings?.instagram || '',
    facebook: settings?.facebook || '',
  }), [settings]);

  const isAdminRoute = location.pathname.startsWith('/admin');

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
        <Route path="/admin/citas" element={<AdminPanel onClose={() => {}} business={businessInfo} />} />
        <Route path="/admin/barberos" element={<AdminPanel onClose={() => {}} business={businessInfo} />} />
        <Route path="/admin/estaciones" element={<AdminPanel onClose={() => {}} business={businessInfo} />} />
        <Route path="/admin/servicios" element={<AdminPanel onClose={() => {}} business={businessInfo} />} />
        <Route path="/admin/clientes" element={<AdminPanel onClose={() => {}} business={businessInfo} />} />
        <Route path="/admin/desempeno" element={<AdminPanel onClose={() => {}} business={businessInfo} />} />
        <Route path="/admin/notificaciones" element={<AdminPanel onClose={() => {}} business={businessInfo} />} />
        <Route path="/admin/ayuda" element={<AdminPanel onClose={() => {}} business={businessInfo} />} />
        <Route path="/cliente" element={<ClientPortal business={businessInfo} />} />
        <Route path="/perfil" element={<Profile business={businessInfo} />} />
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

      {!isAdminRoute && <Footer business={businessInfo} />}
      {!isAdminRoute && <MobileStickyCTA business={businessInfo} />}
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