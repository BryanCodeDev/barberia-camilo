import React, { useState, useEffect } from 'react';
import { ArrowLeft, X, Check, ChevronRight, User, Phone, MessageSquare, Loader2, Clock, CalendarDays, Info } from 'lucide-react';
import { fetchServices, formatPrice } from '../../data/services';
import { api } from '../../services/api';

const BookingForm = ({ onClose, preselectedService = null, business }) => {
  const [currentStep, setCurrentStep] = useState(preselectedService ? 2 : 1);
  const [selectedService, setSelectedService] = useState(preselectedService);
  const [services, setServices] = useState([]);
  const [localBusiness, setLocalBusiness] = useState({
    name: "Barber Trebol",
    title: "Master Barber",
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientMessage, setClientMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [servicesLoading, setServicesLoading] = useState(true);

  useEffect(() => {
    if (business) {
      setLocalBusiness({
        name: business.name || 'Barber Trebol',
        title: business.title || 'Master Barber',
      });
    }
  }, [business]);

  useEffect(() => {
    fetchServices().then((data) => {
      setServices(data);
      setServicesLoading(false);
    });
  }, []);

  const steps = [
    { id: 1, name: 'Servicios', active: currentStep === 1, completed: currentStep > 1 },
    { id: 2, name: 'Fecha y Hora', active: currentStep === 2, completed: currentStep > 2 },
    { id: 3, name: 'Tus Datos', active: currentStep === 3, completed: false },
    { id: 4, name: 'Confirmar', active: currentStep === 4, completed: false },
  ];

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const fetchAvailableSlots = async (date, serviceId) => {
    try {
      setSlotsLoading(true);
      const params = new URLSearchParams({ date: date.toISOString().split('T')[0] });
      if (serviceId) params.append('service_id', serviceId);
      const data = await api.get(`/appointments/available-slots?${params.toString()}`);
      return data.slots;
    } catch (err) {
      console.error('Error fetching slots:', err);
      return [];
    } finally {
      setSlotsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate && selectedService) {
      fetchAvailableSlots(selectedDate, selectedService.id).then((slots) => {
        setAvailableSlots(slots);
      });
    }
  }, [selectedDate, selectedService]);

  const formatDate = (date) => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return {
      dayName: days[date.getDay()],
      day: date.getDate(),
      month: months[date.getMonth()],
    };
  };

  const formatDateFull = (date) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${days[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]}`;
  };

  const formatDateForCalendar = (date) => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${months[date.getMonth()]} de ${date.getFullYear()}`;
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setSelectedDate(null);
    setSelectedTime(null);
    setAvailableSlots([]);
    setCurrentStep(2);
  };

  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setAvailableSlots([]);
    if (selectedService) {
      const slots = await fetchAvailableSlots(date, selectedService.id);
      setAvailableSlots(slots);
    }
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const validateClientForm = () => {
    const errors = {};
    if (!clientName.trim() || clientName.trim().length < 2) {
      errors.name = 'El nombre debe tener al menos 2 caracteres';
    }
    if (!clientPhone.trim() || !/^\d{10}$/.test(clientPhone.trim())) {
      errors.phone = 'El teléfono debe tener 10 dígitos';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const confirmBooking = async () => {
    setSubmitLoading(true);
    setError(null);

    try {
      let clientId;
      try {
        const clientData = await api.post('/clients', { name: clientName, phone: clientPhone });
        clientId = clientData.id;
      } catch (clientErr) {
        if (clientErr.data?.clientId) {
          clientId = clientErr.data.clientId;
        } else {
          console.error('Error registering client:', clientErr);
          throw new Error(clientErr.message || 'Error al registrar el cliente');
        }
      }

      const payload = {
        client_id: clientId,
        service_id: selectedService.id,
        appointment_date: selectedDate.toISOString().split('T')[0],
        appointment_time: selectedTime,
        client_message: clientMessage,
      };

      const appointmentData = await api.post('/appointments', payload);
      console.log('Appointment created:', appointmentData);

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 3000);
    } catch (err) {
      console.error('Error confirming booking:', err);
      setError(err.message || 'Error al agendar la cita');
    } finally {
      setSubmitLoading(false);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      if (currentStep === 3) {
        setSelectedDate(null);
        setSelectedTime(null);
        setAvailableSlots([]);
      }
      if (currentStep === 4) {
        setClientName('');
        setClientPhone('');
        setClientMessage('');
        setFieldErrors({});
      }
    }
  };

  const canContinueStep2 = selectedDate && selectedTime;

  return (
    <div className="fixed inset-0 bg-[#121113]/70 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-4xl max-h-screen overflow-hidden flex flex-col">
        <div className="bg-white px-4 sm:px-6 py-4 border-b border-[#E4DCC9] flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {currentStep > 1 && (
                <button onClick={goBack} className="p-2 hover:bg-[#F6F2EA] rounded-sm transition-colors">
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-[#1C1A16]" />
                </button>
              )}
              <nav className="flex space-x-1 sm:space-x-2 text-xs sm:text-sm">
                {steps.map((step, index) => (
                  <React.Fragment key={step.id}>
                    <span className={`px-2 py-1 rounded-sm transition-colors ${
                      step.active ? 'text-[#8B6A22] bg-[#F6F2EA] font-semibold' :
                      step.completed ? 'text-[#6B6459]' :
                      'text-[#B7B1A3]'
                    }`}>
                      {step.name}
                    </span>
                    {index < steps.length - 1 && (
                      <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-[#D8D3C7] self-center" />
                    )}
                  </React.Fragment>
                ))}
              </nav>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-[#F6F2EA] rounded-sm transition-colors">
              <X className="h-4 w-4 sm:h-5 sm:w-5 text-[#1C1A16]" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="bg-[#FBEAEA] border border-[#E3B8B8] rounded-sm m-4 sm:m-6 p-4">
              <p className="text-[#8B2E2E] text-sm">{error}</p>
            </div>
          )}

          {showSuccess && (
            <div className="bg-[#F6F2EA] border border-[#E4DCC9] rounded-sm m-4 sm:m-6">
              <div className="p-4 sm:p-6 text-center">
                <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-[#A9812E]/15 mb-4">
                  <Check className="h-6 w-6 text-[#8B6A22]" />
                </div>
                <h3 className="font-serif text-lg text-[#1C1A16] mb-2">Agendamiento Exitoso</h3>
                <div className="text-[#6B6459] space-y-2">
                  <p className="font-medium text-[#1C1A16]">Tu cita ha sido reservada correctamente</p>
                  <div className="bg-white rounded-sm p-3 sm:p-4 mt-4 border border-[#E4DCC9] text-left">
                    <div className="text-sm space-y-1 text-[#1C1A16]">
                      <p><strong>Servicio:</strong> {selectedService?.name}</p>
                      <p><strong>Fecha:</strong> {selectedDate && formatDateFull(selectedDate)}</p>
                      <p><strong>Hora:</strong> {selectedTime}</p>
                      <p><strong>Cliente:</strong> {clientName}</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-white border border-[#E4DCC9] rounded-sm flex items-start gap-2 text-left">
                    <Info className="h-4 w-4 text-[#A9812E] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-[#6B6459]"><strong className="text-[#1C1A16]">Recordatorio:</strong> por favor llega 5 minutos antes de tu cita</p>
                  </div>
                  <p className="text-sm mt-3 text-[#8B6A22]">Te contactaremos pronto para confirmar los detalles</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && !showSuccess && (
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 space-y-4 sm:space-y-0">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl text-[#1C1A16] mb-2">Selecciona tu Servicio</h2>
                  <div className="text-[#6B6459]">
                    <h3 className="text-base font-medium text-[#1C1A16]">{localBusiness.name}</h3>
                    <p className="text-sm text-[#6B6459]">{localBusiness.title} · Experiencia VIP</p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-sm text-[#6B6459]">Mosquera, Cundinamarca</div>
                  <div className="text-xs text-[#B7B1A3]">CALLE 3 #4 - 77 EDIFICIO INFINITO LOCAL 01</div>
                </div>
              </div>
              <div className="space-y-3">
                {servicesLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-[#A9812E] mx-auto" />
                    <p className="text-[#6B6459] mt-2 text-sm">Cargando servicios...</p>
                  </div>
                ) : services.length === 0 ? (
                  <p className="text-[#6B6459] text-center py-4 text-sm">No hay servicios disponibles en este momento.</p>
                ) : (
                  services.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => handleServiceSelect(service)}
                      className="border border-[#E4DCC9] rounded-sm p-4 hover:border-[#A9812E] hover:bg-[#F6F2EA]/60 cursor-pointer transition-all duration-200"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
                        <div className="flex-1">
                          <div className="flex items-start justify-between sm:block">
                            <h4 className="font-semibold text-[#1C1A16] text-sm sm:text-base">{service.name}</h4>
                            <div className="text-right ml-4 sm:hidden">
                              <div className="font-semibold text-[#8B6A22] text-sm">{formatPrice(service.price)}</div>
                            </div>
                          </div>
                          <div className="flex items-center text-xs sm:text-sm text-[#6B6459] mt-1 space-x-3">
                            <span className="flex items-center"><Clock className="h-3 w-3 mr-1" />{service.duration}</span>
                            {service.popular && (
                              <span className="bg-[#A9812E]/10 text-[#8B6A22] px-2 py-0.5 rounded-sm text-xs font-medium">Popular</span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-[#6B6459] mt-2 line-clamp-2">{service.description}</p>
                        </div>
                        <div className="hidden sm:block text-right ml-4">
                          <div className="font-semibold text-[#8B6A22] text-lg">{formatPrice(service.price)}</div>
                          <div className="text-xs text-[#B7B1A3]">COP</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && !showSuccess && (
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 space-y-4 sm:space-y-0">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl text-[#1C1A16] mb-2">Selecciona Fecha y Hora</h2>
                  <div className="text-[#6B6459] text-base font-medium">{formatDateForCalendar(new Date())}</div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-sm text-[#6B6459]">{localBusiness.name}</div>
                  <div className="flex items-center mt-1 sm:justify-end"><div className="w-1.5 h-1.5 bg-[#4E7A4E] rounded-full mr-2"></div><span className="text-sm text-[#4E7A4E]">Disponible</span></div>
                </div>
              </div>

              {selectedService && (
                <div className="mb-6 p-3 sm:p-4 bg-[#F6F2EA] rounded-sm border border-[#E4DCC9]">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                    <div>
                      <div className="text-sm sm:text-base font-semibold text-[#1C1A16]">{selectedService.name}</div>
                      <div className="text-xs sm:text-sm text-[#6B6459] flex items-center"><Clock className="h-3 w-3 mr-1" />{selectedService.duration}</div>
                    </div>
                    <div className="text-base sm:text-lg font-semibold text-[#8B6A22]">{formatPrice(selectedService.price)}</div>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-base font-medium mb-4 text-[#1C1A16]">Selecciona una fecha</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
                  {getAvailableDates().slice(0, 14).map((date, index) => {
                    const formatted = formatDate(date);
                    const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();
                    return (
                      <button
                        key={index}
                        onClick={() => handleDateSelect(date)}
                        className={`p-2 sm:p-3 rounded-sm text-center transition-all duration-200 ${
                          isSelected ? 'bg-[#A9812E] text-[#121113] shadow-sm' :
                          'hover:bg-[#F6F2EA] text-[#1C1A16] border border-[#E4DCC9] hover:border-[#A9812E]/60'
                        }`}
                      >
                        <div className={`text-xs ${isSelected ? 'text-[#121113]/70' : 'text-[#B7B1A3]'}`}>{formatted.dayName}</div>
                        <div className="text-base sm:text-lg font-semibold">{formatted.day}</div>
                        <div className="text-xs">{formatted.month}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedDate && (
                <div>
                  <h4 className="text-base font-medium mb-4 text-[#1C1A16]">Horarios disponibles</h4>
                  {slotsLoading ? (
                    <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-[#A9812E]" /></div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                      {availableSlots.map((time, index) => (
                        <button
                          key={index}
                          onClick={() => handleTimeSelect(time)}
                          className={`p-3 border rounded-sm text-center transition-all duration-200 ${
                            selectedTime === time ? 'border-[#A9812E] bg-[#F6F2EA] text-[#8B6A22] shadow-sm' :
                            'border-[#E4DCC9] hover:border-[#A9812E]/60 hover:bg-[#F6F2EA]/60'
                          }`}
                        >
                          <div className="font-medium text-sm sm:text-base">{time}</div>
                        </button>
                      ))}
                    </div>
                  )}
                  {availableSlots.length === 0 && !slotsLoading && (
                    <div className="text-center py-8">
                      <p className="text-[#6B6459] mb-2 text-sm">No hay horarios disponibles para esta fecha</p>
                      <button className="text-[#8B6A22] text-sm hover:underline">Selecciona otra fecha</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && !showSuccess && (
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 space-y-4 sm:space-y-0">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl text-[#1C1A16] mb-2">Tus Datos</h2>
                  <p className="text-[#6B6459] text-sm">Para confirmar tu cita necesitamos tus datos</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-[#1C1A16] mb-2"><User className="h-4 w-4 mr-2 text-[#A9812E]" />Nombre completo</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => { setClientName(e.target.value); setFieldErrors(prev => ({ ...prev, name: null })); }}
                    className={`w-full px-4 py-3 border rounded-sm focus:ring-2 focus:ring-[#A9812E]/40 focus:border-[#A9812E] outline-none ${fieldErrors.name ? 'border-[#C25555]' : 'border-[#E4DCC9]'}`}
                    placeholder="Tu nombre completo"
                  />
                  {fieldErrors.name && <p className="mt-1 text-sm text-[#C25555]">{fieldErrors.name}</p>}
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium text-[#1C1A16] mb-2"><Phone className="h-4 w-4 mr-2 text-[#A9812E]" />Teléfono</label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => { setClientPhone(e.target.value); setFieldErrors(prev => ({ ...prev, phone: null })); }}
                    className={`w-full px-4 py-3 border rounded-sm focus:ring-2 focus:ring-[#A9812E]/40 focus:border-[#A9812E] outline-none ${fieldErrors.phone ? 'border-[#C25555]' : 'border-[#E4DCC9]'}`}
                    placeholder="3101234567"
                    maxLength={10}
                  />
                  {fieldErrors.phone && <p className="mt-1 text-sm text-[#C25555]">{fieldErrors.phone}</p>}
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium text-[#1C1A16] mb-2"><MessageSquare className="h-4 w-4 mr-2 text-[#A9812E]" />Mensaje (opcional)</label>
                  <textarea
                    value={clientMessage}
                    onChange={(e) => setClientMessage(e.target.value)}
                    className="w-full px-4 py-3 border border-[#E4DCC9] rounded-sm focus:ring-2 focus:ring-[#A9812E]/40 focus:border-[#A9812E] outline-none"
                    rows={3}
                    placeholder="Algún detalle especial para tu cita..."
                    maxLength={500}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && !showSuccess && (
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 space-y-4 sm:space-y-0">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl text-[#1C1A16] mb-2">Confirmar Reserva</h2>
                  <p className="text-[#6B6459] text-sm">Revisa los detalles de tu cita</p>
                </div>
              </div>

              <div className="bg-[#F6F2EA] border border-[#E4DCC9] rounded-sm p-4 sm:p-6 mb-6">
                <div className="flex flex-col space-y-4">
                  <div>
                    <h3 className="font-semibold text-[#1C1A16] text-base sm:text-lg">{selectedService?.name}</h3>
                    <p className="text-sm text-[#6B6459] mt-1 flex items-center"><Clock className="h-3.5 w-3.5 mr-1.5" />{selectedService?.duration}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 text-sm text-[#1C1A16]">
                      <div><span className="font-medium text-[#6B6459] flex items-center"><CalendarDays className="h-3.5 w-3.5 mr-1.5" />Fecha</span>{selectedDate && formatDateFull(selectedDate)}</div>
                      <div><span className="font-medium text-[#6B6459] flex items-center"><Clock className="h-3.5 w-3.5 mr-1.5" />Hora</span>{selectedTime}</div>
                      <div><span className="font-medium text-[#6B6459] flex items-center"><User className="h-3.5 w-3.5 mr-1.5" />Cliente</span>{clientName}</div>
                      <div><span className="font-medium text-[#6B6459] flex items-center"><Phone className="h-3.5 w-3.5 mr-1.5" />Teléfono</span>{clientPhone}</div>
                      {clientMessage && <div><span className="font-medium text-[#6B6459] flex items-center"><MessageSquare className="h-3.5 w-3.5 mr-1.5" />Mensaje</span>{clientMessage}</div>}
                    </div>
                    <div className="flex flex-col justify-center sm:text-right">
                      <div className="text-2xl font-semibold text-[#8B6A22]">{formatPrice(selectedService?.price)}</div>
                      <div className="text-sm text-[#B7B1A3]">Pesos Colombianos</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#E4DCC9] rounded-sm p-4 mb-6">
                <h4 className="font-medium text-[#1C1A16] mb-2 flex items-center"><Info className="h-4 w-4 mr-2 text-[#A9812E]" />Información importante</h4>
                <ul className="text-sm text-[#6B6459] space-y-1 list-disc list-inside">
                  <li>Por favor llega 5 minutos antes de tu cita</li>
                  <li>Te contactaremos para confirmar los detalles</li>
                  <li>En caso de cancelación, avísanos con 24h de anticipación</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {!showSuccess && (
          <div className="flex-shrink-0 border-t border-[#E4DCC9] p-4 sm:p-6 bg-white">
            {currentStep === 2 && canContinueStep2 && (
              <button onClick={() => setCurrentStep(3)} className="w-full bg-[#A9812E] text-[#121113] py-3 sm:py-4 rounded-sm font-semibold text-base uppercase tracking-wide hover:bg-[#C9A860] transition-colors">Continuar</button>
            )}
            {currentStep === 3 && (
              <button onClick={() => { if (validateClientForm()) setCurrentStep(4); }} className="w-full bg-[#A9812E] text-[#121113] py-3 sm:py-4 rounded-sm font-semibold text-base uppercase tracking-wide hover:bg-[#C9A860] transition-colors">Continuar</button>
            )}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-center text-lg font-semibold space-y-2 sm:space-y-0">
                  <span className="text-[#1C1A16]">Total a pagar:</span>
                  <span className="text-2xl text-[#8B6A22]">{formatPrice(selectedService?.price)}</span>
                </div>
                <button onClick={confirmBooking} disabled={submitLoading} className="w-full bg-[#121113] text-[#F6F2EA] py-3 sm:py-4 rounded-sm font-semibold text-base uppercase tracking-wide hover:bg-[#1C1A16] transition-colors disabled:opacity-50 flex items-center justify-center">
                  {submitLoading ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Agendando...</> : 'Confirmar Reserva'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingForm;
