import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, X, Check, ChevronRight, User, Phone, Mail, MessageSquare, Clock, CalendarDays, Info, Scissors, Send } from 'lucide-react';
import { fetchServices, formatPrice } from '../../data/services';
import { api } from '../../services/api';
import { APP_CONFIG } from '../../utils/constants';
import Button from '../ui/Button';
import Input from '../ui/Input';
import TextArea from '../ui/TextArea';
import ErrorBanner from '../ui/ErrorBanner';
import Loader from '../ui/Loader';

const toLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const BookingForm = ({ onClose, preselectedService = null, business }) => {
  const [currentStep, setCurrentStep] = useState(preselectedService ? 2 : 1);
  const [selectedService, setSelectedService] = useState(preselectedService);
  const [services, setServices] = useState([]);
  const [localBusiness, setLocalBusiness] = useState({
    name: "BARBERÍA EL BRONX",
    title: "EL BRONX",
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedWorkstation, setSelectedWorkstation] = useState(null);
  const [workstations, setWorkstations] = useState([]);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientMessage, setClientMessage] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [servicesLoading, setServicesLoading] = useState(true);
  const [workstationsLoading, setWorkstationsLoading] = useState(true);
  const [modalMounted, setModalMounted] = useState(false);
  const successTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setModalMounted(true), 20);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (business) {
      setLocalBusiness({
        name: business.name || 'BARBERÍA EL BRONX',
        title: business.title || 'EL BRONX',
        address: business.address || 'Mosquera, Cundinamarca',
        address_line: business.address_line || 'CALLE 3 #4 - 77 EDIFICIO INFINITO LOCAL 01',
      });
    }
  }, [business]);

  useEffect(() => {
    fetchServices().then((data) => {
      setServices(data);
      setServicesLoading(false);
    }).catch(() => {
      setServicesLoading(false);
    });
  }, []);

  useEffect(() => {
    const fetchWorkstations = async () => {
      try {
        const data = await api.get('/workstations');
        setWorkstations(data.filter(w => w.is_active));
      } catch (err) {
        console.error('Error fetching workstations:', err);
      } finally {
        setWorkstationsLoading(false);
      }
    };
    fetchWorkstations();
  }, []);

  const steps = [
    { id: 1, name: 'Servicios', active: currentStep === 1, completed: currentStep > 1 },
    { id: 2, name: 'Estación, Fecha y Hora', active: currentStep === 2, completed: currentStep > 2 },
    { id: 3, name: 'Tus Datos', active: currentStep === 3, completed: currentStep > 3 },
    { id: 4, name: 'Confirmar', active: currentStep === 4, completed: false },
  ];

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 1; i <= APP_CONFIG.maxAdvanceBookingDays; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const fetchAvailableSlots = async (date, serviceId, workstationId) => {
    try {
      setSlotsLoading(true);
      const params = new URLSearchParams({ date: toLocalDateString(date) });
      if (serviceId) params.append('service_id', serviceId);
      if (workstationId) params.append('workstation_id', workstationId);
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
      fetchAvailableSlots(selectedDate, selectedService.id, selectedWorkstation?.id).then((slots) => {
        setAvailableSlots(slots);
      });
    }
  }, [selectedDate, selectedService, selectedWorkstation]);

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
    setSelectedWorkstation(null);
    setCurrentStep(2);
  };

  const handleWorkstationSelect = (ws) => {
    setSelectedWorkstation(ws);
    setSelectedTime(null);
    setAvailableSlots([]);
  };

  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setAvailableSlots([]);
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
    if (!clientEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail.trim())) {
      if (clientEmail.trim()) {
        errors.email = 'El correo electrónico debe ser válido';
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinueStep3 = () => {
    if (validateClientForm()) {
      setCurrentStep(4);
    }
  };

  const confirmBooking = async () => {
    if (!validateClientForm()) {
      setCurrentStep(3);
      return;
    }
    setSubmitLoading(true);
    setError(null);

    try {
      let clientId;
      try {
        const clientData = await api.post('/clients', { name: clientName, phone: clientPhone, email: clientEmail });
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
        appointment_date: toLocalDateString(selectedDate),
        appointment_time: selectedTime,
        client_message: clientMessage,
        client_name: clientName,
        client_phone: clientPhone,
        client_email: clientEmail,
        source: 'web',
      };
      if (selectedWorkstation?.id) {
        payload.workstation_id = selectedWorkstation.id;
      }

      const appointmentData = await api.post('/appointments', payload);
      console.log('Appointment created:', appointmentData);

      if (appointmentData.appointment?.recommendations && appointmentData.appointment.recommendations.length > 0) {
        setRecommendations(appointmentData.appointment.recommendations);
      } else {
        setRecommendations([]);
      }

      setShowSuccess(true);
      successTimeoutRef.current = setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 8000);
    } catch (err) {
      console.error('Error confirming booking:', err);
      setError(err.message || 'Error al agendar la cita');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleFinish = () => {
    if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    setShowSuccess(false);
    onClose();
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepId) => {
    const targetStep = steps.find((s) => s.id === stepId);
    if (targetStep && (targetStep.completed || targetStep.active)) {
      setCurrentStep(stepId);
    }
  };

  const canContinueStep2 = selectedDate && selectedTime && selectedWorkstation;

  return (
    <div
      className={`fixed inset-0 bg-[#121113]/70 flex items-center justify-center p-2 sm:p-4 z-50 transition-opacity duration-300 ${
        modalMounted ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className={`bg-white rounded-sm shadow-2xl w-full max-w-4xl max-h-screen overflow-hidden flex flex-col transition-all duration-300 ease-out ${
          modalMounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-[0.98]'
        }`}
      >
        <div className="bg-white px-4 sm:px-6 py-4 border-b border-[#E4DCC9] flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {currentStep > 1 && (
                <button onClick={goBack} className="p-2 hover:bg-[#F6F2EA] rounded-sm transition-colors">
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-[#1C1A16]" />
                </button>
              )}
              <nav className="flex space-x-1 sm:space-x-2 text-xs sm:text-sm">
                {steps.map((step, index) => {
                  const isClickable = step.completed || step.active;
                  return (
                    <React.Fragment key={step.id}>
                      <button
                        type="button"
                        onClick={() => goToStep(step.id)}
                        disabled={!isClickable}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-sm transition-colors ${
                          step.active ? 'text-[#8B6A22] bg-[#F6F2EA] font-semibold' :
                          step.completed ? 'text-[#6B6459] hover:bg-[#F6F2EA] cursor-pointer' :
                          'text-[#B7B1A3] cursor-default'
                        }`}
                        title={isClickable ? `Ir a ${step.name}` : step.name}
                      >
                        <span className={`hidden sm:flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-semibold flex-shrink-0 ${
                          step.completed ? 'bg-[#A9812E] text-[#121113]' :
                          step.active ? 'border border-[#A9812E] text-[#8B6A22]' :
                          'border border-[#D8D3C7] text-[#B7B1A3]'
                        }`}>
                          {step.completed ? <Check className="h-3 w-3" /> : step.id}
                        </span>
                        <span className="hidden sm:inline">{step.name}</span>
                        <span className="sm:hidden">{step.name.split(',')[0].split(' y ')[0]}</span>
                      </button>
                      {index < steps.length - 1 && (
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-[#D8D3C7] self-center" />
                      )}
                    </React.Fragment>
                  );
                })}
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
            <div className="fixed inset-0 bg-[#121113]/80 flex items-center justify-center p-4 z-[60]">
              <div className="bg-white rounded-sm shadow-2xl w-full max-w-lg p-6 sm:p-8 text-center animate-fade-in">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-status-green/15 flex items-center justify-center">
                  <Check className="h-8 w-8 text-status-green.deep" />
                </div>
                <h3 className="font-serif text-2xl text-[#1C1A16] mb-2">Cita Confirmada</h3>
                <p className="text-sm text-[#6B6459] mb-6">
                  Te enviamos un correo y un mensaje de WhatsApp con la confirmacion y nuestras recomendaciones personalizadas.
                </p>
                <div className="bg-[#F6F2EA] border border-[#E4DCC9] rounded-sm p-4 mb-6 text-left">
                  <div className="text-sm space-y-1 text-[#1C1A16]">
                    <p><strong>Servicio:</strong> {selectedService?.name}</p>
                    <p><strong>Fecha:</strong> {selectedDate && formatDateFull(selectedDate)}</p>
                    <p><strong>Hora:</strong> {selectedTime}</p>
                    <p><strong>Cliente:</strong> {clientName}</p>
                    {selectedWorkstation && <p><strong>Estacion:</strong> {selectedWorkstation.name}</p>}
                  </div>
                  <div className="mt-3 p-3 bg-white border border-[#E4DCC9] rounded-sm flex items-start gap-2">
                    <Info className="h-4 w-4 text-[#A9812E] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-[#6B6459]"><strong className="text-[#1C1A16]">Recordatorio:</strong> por favor llega 5 minutos antes de tu cita</p>
                  </div>
                </div>
                {recommendations.length > 0 && (
                  <div className="bg-[#F6F2EA] border border-[#E4DCC9] rounded-sm p-4 mb-6 text-left">
                    <h4 className="font-medium text-[#1C1A16] mb-2 text-sm uppercase tracking-wide">Recomendaciones para tu servicio</h4>
                    <ul className="text-sm text-[#6B6459] space-y-2 list-disc list-inside">
                      {recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <Button onClick={handleFinish} size="lg" className="w-full">Cerrar</Button>
              </div>
            </div>
          )}

          {currentStep === 1 && !showSuccess && (
            <div className="p-4 sm:p-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 space-y-4 sm:space-y-0">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl text-[#1C1A16] mb-2">Elige tu Servicio</h2>
                  <div className="text-[#6B6459]">
                    <h3 className="text-base font-medium text-[#1C1A16]">{localBusiness.name}</h3>
                    <p className="text-sm text-[#6B6459]">{localBusiness.title} · Experiencia premium</p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-sm text-[#6B6459]">{localBusiness.address || 'Mosquera, Cundinamarca'}</div>
                  <div className="text-xs text-[#B7B1A3]">{localBusiness.address_line || 'CALLE 3 #4 - 77 EDIFICIO INFINITO LOCAL 01'}</div>
                </div>
              </div>
              <div className="space-y-3">
                {servicesLoading ? (
                  <div className="text-center py-8">
                    <Loader size="lg" className="mx-auto" />
                    <p className="text-[#6B6459] mt-2 text-sm">Cargando servicios...</p>
                  </div>
                ) : services.length === 0 ? (
                  <p className="text-[#6B6459] text-center py-4 text-sm">No hay servicios disponibles en este momento.</p>
                ) : (
                  services.map((service, idx) => (
                    <div
                      key={service.id}
                      onClick={() => handleServiceSelect(service)}
                      style={{ animationDelay: `${idx * 60}ms` }}
                      className="animate-fade-in border border-[#E4DCC9] rounded-sm p-4 hover:border-[#A9812E] hover:bg-[#F6F2EA]/60 hover:shadow-[0_8px_20px_-10px_rgba(169,129,46,0.4)] hover:-translate-y-0.5 cursor-pointer transition-all duration-200"
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
            <div className="p-4 sm:p-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 space-y-4 sm:space-y-0">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl text-[#1C1A16] mb-2">Escoge Estación, Fecha y Hora</h2>
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

              {workstationsLoading ? (
                <div className="flex items-center justify-center py-8"><Loader size="lg" /></div>
              ) : (
                <div className="mb-6">
                  <h3 className="text-base font-medium mb-4 text-[#1C1A16]">Selecciona una estación</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {workstations.map((ws) => (
                      <button
                        key={ws.id}
                        onClick={() => handleWorkstationSelect(ws)}
                        className={`p-4 border rounded-sm text-center transition-all duration-200 hover:-translate-y-0.5 ${
                          selectedWorkstation?.id === ws.id ? 'border-[#A9812E] bg-[#F6F2EA] text-[#8B6A22] shadow-md scale-[1.02]' :
                          'border-[#E4DCC9] hover:border-[#A9812E]/60 hover:bg-[#F6F2EA]/60 hover:shadow-sm'
                        }`}
                      >
                        <Scissors className="h-5 w-5 mx-auto mb-2 text-[#A9812E]" />
                        <div className="font-medium text-sm sm:text-base">{ws.name}</div>
                        <div className="text-xs text-[#6B6459]">{ws.barber_name || 'Sin asignar'}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedWorkstation && (
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
              )}

              {selectedDate && selectedWorkstation && (
                <div>
                  <h4 className="text-base font-medium mb-4 text-[#1C1A16]">Horarios disponibles</h4>
                  {slotsLoading ? (
                    <div className="flex items-center justify-center py-8"><Loader size="lg" /></div>
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
                      <button onClick={() => { setSelectedDate(null); setAvailableSlots([]); }} className="text-[#8B6A22] text-sm hover:underline">Selecciona otra fecha</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && !showSuccess && (
            <div className="p-4 sm:p-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 space-y-4 sm:space-y-0">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl text-[#1C1A16] mb-2">Tus Datos</h2>
                  <p className="text-[#6B6459] text-sm">Ya casi terminas: cuéntanos quién viene a la cita</p>
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  label={<span className="flex items-center"><User className="h-4 w-4 mr-2 text-[#A9812E]" />Nombre completo</span>}
                  type="text"
                  value={clientName}
                  onChange={(e) => { setClientName(e.target.value); setFieldErrors(prev => ({ ...prev, name: null })); }}
                  placeholder="Tu nombre completo"
                  error={fieldErrors.name}
                />
                <Input
                  label={<span className="flex items-center"><Phone className="h-4 w-4 mr-2 text-[#A9812E]" />Teléfono</span>}
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => { setClientPhone(e.target.value); setFieldErrors(prev => ({ ...prev, phone: null })); }}
                  placeholder="3101234567"
                  maxLength={10}
                  error={fieldErrors.phone}
                />
                <Input
                  label={<span className="flex items-center"><Mail className="h-4 w-4 mr-2 text-[#A9812E]" />Correo electrónico (opcional)</span>}
                  type="email"
                  value={clientEmail}
                  onChange={(e) => { setClientEmail(e.target.value); setFieldErrors(prev => ({ ...prev, email: null })); }}
                  placeholder="tu@email.com"
                  error={fieldErrors.email}
                />
                <TextArea
                  label={<span className="flex items-center"><MessageSquare className="h-4 w-4 mr-2 text-[#A9812E]" />Mensaje (opcional)</span>}
                  value={clientMessage}
                  onChange={(e) => setClientMessage(e.target.value)}
                  placeholder="Algún detalle especial para tu cita..."
                  maxLength={500}
                />
              </div>
            </div>
          )}

          {currentStep === 4 && !showSuccess && (
            <div className="p-4 sm:p-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 space-y-4 sm:space-y-0">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl text-[#1C1A16] mb-2">Confirmar Reserva</h2>
                  <p className="text-[#6B6459] text-sm">Un último vistazo antes de asegurar tu cupo</p>
                </div>
              </div>

              <div className="bg-[#F6F2EA] border border-[#E4DCC9] rounded-sm p-4 sm:p-6 mb-6 transition-shadow duration-300 hover:shadow-sm">
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
                      {selectedWorkstation && <div><span className="font-medium text-[#6B6459] flex items-center"><Scissors className="h-3.5 w-3.5 mr-1.5" />Estación</span>{selectedWorkstation.name}</div>}
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

        {/* Barra de navegación inferior: aquí se avanza entre pasos */}
        {!showSuccess && currentStep > 1 && (
          <div className="border-t border-[#E4DCC9] px-4 sm:px-6 py-4 flex items-center justify-between gap-3 flex-shrink-0 bg-white">
            <button
              onClick={goBack}
              className="flex items-center gap-1.5 text-sm text-[#6B6459] hover:text-[#1C1A16] px-3 py-2.5 rounded-sm hover:bg-[#F6F2EA] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Atrás
            </button>

            <div className="flex flex-col items-end gap-1.5">
              {currentStep === 2 && !canContinueStep2 && (
                <span className="text-xs text-[#B7B1A3] hidden sm:block">
                  Elige estación, fecha y hora para continuar
                </span>
              )}
              {currentStep === 2 && (
                <Button
                  onClick={() => setCurrentStep(3)}
                  disabled={!canContinueStep2}
                  size="lg"
                  className="flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continuar
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
              {currentStep === 3 && (
                <Button
                  onClick={handleContinueStep3}
                  size="lg"
                  className="flex items-center gap-2"
                >
                  Continuar
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
              {currentStep === 4 && (
                <Button
                  onClick={confirmBooking}
                  disabled={submitLoading}
                  size="lg"
                  className="flex items-center gap-2 disabled:opacity-70"
                >
                  {submitLoading ? (
                    <>
                      <Loader size="sm" />
                      Agendando...
                    </>
                  ) : (
                    <>
                      Confirmar Cita
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}

        {showSuccess && (
          <div className="fixed inset-0 bg-[#121113]/80 flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-sm shadow-2xl w-full max-w-lg p-6 sm:p-8 text-center animate-fade-in">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full bg-status-green/20 animate-ping" />
                <div className="relative w-16 h-16 rounded-full bg-status-green/15 flex items-center justify-center">
                  <Check className="h-8 w-8 text-status-green.deep" />
                </div>
              </div>
              <h3 className="font-serif text-2xl text-[#1C1A16] mb-2">¡Tu cita está confirmada!</h3>
              <p className="text-sm text-[#6B6459] mb-6">
                Te enviamos un correo y un mensaje de WhatsApp con la confirmación y nuestras recomendaciones personalizadas.
              </p>
              {recommendations.length > 0 && (
                <div className="bg-[#F6F2EA] border border-[#E4DCC9] rounded-sm p-4 mb-6 text-left">
                  <h4 className="font-medium text-[#1C1A16] mb-2 text-sm uppercase tracking-wide">Recomendaciones para tu servicio</h4>
                  <ul className="text-sm text-[#6B6459] space-y-2 list-disc list-inside">
                    {recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
              <Button onClick={handleFinish} size="lg" className="w-full">Cerrar</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingForm;