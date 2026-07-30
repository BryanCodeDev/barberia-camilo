import React, { useState, useEffect } from 'react';
import { ArrowLeft, X, Check, ChevronRight, User, Phone, MessageSquare, Loader2 } from 'lucide-react';
import { services } from '../../data/services';
import { APP_CONFIG } from '../../utils/constants';

const apiBaseUrl = APP_CONFIG.apiBaseUrl;

const BookingForm = ({ onClose, preselectedService = null }) => {
  const [currentStep, setCurrentStep] = useState(preselectedService ? 2 : 1);
  const [selectedService, setSelectedService] = useState(preselectedService);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientMessage, setClientMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

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

  const fetchAvailableSlots = async (date, serviceId, workstationId) => {
    try {
      const params = new URLSearchParams({ date: date.toISOString().split('T')[0] });
      if (serviceId) params.append('service_id', serviceId);
      if (workstationId) params.append('workstation_id', workstationId);
      const response = await fetch(`${apiBaseUrl}/appointments/available-slots?${params.toString()}`);
      if (!response.ok) throw new Error('Error al cargar horarios');
      const data = await response.json();
      return data.slots;
    } catch (err) {
      console.error('Error fetching slots:', err);
      return [];
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
    setLoading(true);
    setError(null);

    try {
      let clientId;
      const clientResponse = await fetch(`${apiBaseUrl}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: clientName, phone: clientPhone }),
      });

      if (!clientResponse.ok) {
        const clientData = await clientResponse.json();
        if (clientResponse.status === 409 && clientData.clientId) {
          clientId = clientData.clientId;
        } else {
          throw new Error(clientData.error || 'Error al registrar el cliente');
        }
      } else {
        const clientData = await clientResponse.json();
        clientId = clientData.id;
      }

      const payload = {
        client_id: clientId,
        service_id: selectedService.id,
        appointment_date: selectedDate.toISOString().split('T')[0],
        appointment_time: selectedTime,
        client_message: clientMessage,
      };

      const appointmentResponse = await fetch(`${apiBaseUrl}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const appointmentData = await appointmentResponse.json();

      if (!appointmentResponse.ok) {
        throw new Error(appointmentData.error || 'Error al crear la cita');
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 3000);
    } catch (err) {
      setError(err.message || 'Error al agendar la cita');
    } finally {
      setLoading(false);
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
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-screen overflow-hidden flex flex-col">
        <div className="bg-white px-4 sm:px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {currentStep > 1 && (
                <button onClick={goBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              )}
              <nav className="flex space-x-1 sm:space-x-2 text-xs sm:text-sm">
                {steps.map((step, index) => (
                  <React.Fragment key={step.id}>
                    <span className={`px-2 py-1 rounded transition-colors ${
                      step.active ? 'text-amber-600 bg-amber-50 font-medium' :
                      step.completed ? 'text-gray-600 bg-gray-50' :
                      'text-gray-400'
                    }`}>
                      {step.name}
                    </span>
                    {index < steps.length - 1 && (
                      <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 self-center" />
                    )}
                  </React.Fragment>
                ))}
              </nav>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl m-4 sm:m-6 p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {showSuccess && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl m-4 sm:m-6">
              <div className="p-4 sm:p-6 text-center">
                <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mb-4">
                  <Check className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-amber-900 mb-2">¡Agendamiento Exitoso!</h3>
                <div className="text-amber-700 space-y-2">
                  <p className="font-medium">Tu cita ha sido reservada correctamente</p>
                  <div className="bg-white rounded-lg p-3 sm:p-4 mt-4 border border-amber-100">
                    <div className="text-sm space-y-1 text-gray-700">
                      <p><strong>Servicio:</strong> {selectedService?.name}</p>
                      <p><strong>Fecha:</strong> {selectedDate && formatDateFull(selectedDate)}</p>
                      <p><strong>Hora:</strong> {selectedTime}</p>
                      <p><strong>Cliente:</strong> {clientName}</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800"><strong>Recordatorio:</strong> Por favor llega 5 minutos antes de tu cita</p>
                  </div>
                  <p className="text-sm mt-3 text-amber-600">Te contactaremos pronto para confirmar los detalles</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && !showSuccess && (
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 space-y-4 sm:space-y-0">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Selecciona tu Servicio</h2>
                  <div className="text-gray-600">
                    <h3 className="text-base sm:text-lg font-medium">Camilo Correa Barber</h3>
                    <p className="text-sm text-gray-500">Master Barber - Experiencia VIP</p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-sm text-gray-500">Mosquera, Cundinamarca</div>
                  <div className="text-xs text-gray-400">CALLE 3 #4 - 77 EDIFICIO INFINITO LOCAL 01</div>
                </div>
              </div>
              <div className="space-y-3">
                {services.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => handleServiceSelect(service)}
                    className="border border-gray-200 rounded-lg p-4 hover:border-amber-400 hover:bg-amber-50 cursor-pointer transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-start justify-between sm:block">
                          <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{service.name}</h4>
                          <div className="text-right ml-4 sm:hidden">
                            <div className="font-semibold text-amber-600 text-sm">${service.price.toLocaleString('es-CO')}</div>
                          </div>
                        </div>
                        <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-1 space-x-3">
                          <span>⏱️ {service.duration}</span>
                          {service.popular && (
                            <span className="bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full text-xs font-medium">⭐ Popular</span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mt-2 line-clamp-2">{service.description}</p>
                      </div>
                      <div className="hidden sm:block text-right ml-4">
                        <div className="font-bold text-amber-600 text-lg">${service.price.toLocaleString('es-CO')}</div>
                        <div className="text-xs text-gray-500">COP</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && !showSuccess && (
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 space-y-4 sm:space-y-0">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Selecciona Fecha y Hora</h2>
                  <div className="text-gray-600"><div className="text-base sm:text-lg font-medium">{formatDateForCalendar(new Date())}</div></div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-sm text-gray-500">Camilo Correa Barber</div>
                  <div className="flex items-center mt-1"><div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div><span className="text-sm text-green-600">Disponible</span></div>
                </div>
              </div>

              {selectedService && (
                <div className="mb-6 p-3 sm:p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                    <div>
                      <div className="text-sm sm:text-base font-semibold text-amber-900">{selectedService.name}</div>
                      <div className="text-xs sm:text-sm text-amber-700">⏱️ {selectedService.duration}</div>
                    </div>
                    <div className="text-base sm:text-lg font-bold text-amber-600">${selectedService.price.toLocaleString('es-CO')}</div>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-base sm:text-lg font-medium mb-4">Selecciona una fecha</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
                  {getAvailableDates().slice(0, 14).map((date, index) => {
                    const formatted = formatDate(date);
                    const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();
                    return (
                      <button
                        key={index}
                        onClick={() => handleDateSelect(date)}
                        className={`p-2 sm:p-3 rounded-lg text-center transition-all duration-200 ${
                          isSelected ? 'bg-amber-400 text-black shadow-md scale-105' :
                          'hover:bg-amber-50 text-gray-700 border border-gray-200 hover:border-amber-300'
                        }`}
                      >
                        <div className="text-xs text-gray-500">{formatted.dayName}</div>
                        <div className={`text-base sm:text-lg font-semibold ${isSelected ? 'text-black' : ''}`}>{formatted.day}</div>
                        <div className="text-xs">{formatted.month}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedDate && (
                <div>
                  <h4 className="text-base sm:text-lg font-medium mb-4">Horarios disponibles</h4>
                  {loading ? (
                    <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-amber-500" /></div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                      {availableSlots.map((time, index) => (
                        <button
                          key={index}
                          onClick={() => handleTimeSelect(time)}
                          className={`p-3 border rounded-lg text-center transition-all duration-200 ${
                            selectedTime === time ? 'border-amber-400 bg-amber-50 text-amber-700 shadow-md' :
                            'border-gray-200 hover:border-amber-300 hover:bg-amber-50'
                          }`}
                        >
                          <div className="font-medium text-sm sm:text-base">{time}</div>
                        </button>
                      ))}
                    </div>
                  )}
                  {availableSlots.length === 0 && !loading && (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-2">No hay horarios disponibles para esta fecha</p>
                      <button className="text-amber-600 text-sm hover:underline">Selecciona otra fecha</button>
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
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Tus Datos</h2>
                  <p className="text-gray-600">Para confirmar tu cita necesitamos tus datos</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2"><User className="h-4 w-4 inline mr-2" />Nombre completo</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => { setClientName(e.target.value); setFieldErrors(prev => ({ ...prev, name: null })); }}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${fieldErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Tu nombre completo"
                  />
                  {fieldErrors.name && <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2"><Phone className="h-4 w-4 inline mr-2" />Teléfono</label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => { setClientPhone(e.target.value); setFieldErrors(prev => ({ ...prev, phone: null })); }}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent ${fieldErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="3101234567"
                    maxLength={10}
                  />
                  {fieldErrors.phone && <p className="mt-1 text-sm text-red-600">{fieldErrors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2"><MessageSquare className="h-4 w-4 inline mr-2" />Mensaje (opcional)</label>
                  <textarea
                    value={clientMessage}
                    onChange={(e) => setClientMessage(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Confirmar Reserva</h2>
                  <p className="text-gray-600">Revisa los detalles de tu cita</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 sm:p-6 mb-6">
                <div className="flex flex-col space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-base sm:text-lg">{selectedService?.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">⏱️ {selectedService?.duration}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600"><span className="font-medium">📅 Fecha:</span><br />{selectedDate && formatDateFull(selectedDate)}</div>
                      <div className="text-sm text-gray-600"><span className="font-medium">🕒 Hora:</span><br />{selectedTime}</div>
                      <div className="text-sm text-gray-600"><span className="font-medium">👤 Cliente:</span><br />{clientName}</div>
                      <div className="text-sm text-gray-600"><span className="font-medium">📞 Teléfono:</span><br />{clientPhone}</div>
                      {clientMessage && <div className="text-sm text-gray-600"><span className="font-medium">💬 Mensaje:</span><br />{clientMessage}</div>}
                    </div>
                    <div className="flex flex-col justify-center sm:text-right">
                      <div className="text-2xl font-bold text-amber-600">${selectedService?.price.toLocaleString('es-CO')}</div>
                      <div className="text-sm text-gray-500">Pesos Colombianos</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-900 mb-2">📋 Información importante:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Por favor llega 5 minutos antes de tu cita</li>
                  <li>• Te contactaremos para confirmar los detalles</li>
                  <li>• En caso de cancelación, avísanos con 24h de anticipación</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {!showSuccess && (
          <div className="flex-shrink-0 border-t border-gray-200 p-4 sm:p-6 bg-white">
            {currentStep === 2 && canContinueStep2 && (
              <button onClick={() => setCurrentStep(3)} className="w-full bg-amber-400 text-black py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-amber-500 transition-all duration-200 hover:shadow-lg">Continuar</button>
            )}
            {currentStep === 3 && (
              <button onClick={() => { if (validateClientForm()) setCurrentStep(4); }} className="w-full bg-amber-400 text-black py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-amber-500 transition-all duration-200 hover:shadow-lg">Continuar</button>
            )}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-center text-lg font-bold space-y-2 sm:space-y-0">
                  <span>Total a pagar:</span>
                  <span className="text-2xl text-amber-600">${selectedService?.price.toLocaleString('es-CO')}</span>
                </div>
                <button onClick={confirmBooking} disabled={loading} className="w-full bg-black text-white py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 hover:shadow-lg flex items-center justify-center">
                  {loading ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Agendando...</> : '✂️ Confirmar Reserva'}
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