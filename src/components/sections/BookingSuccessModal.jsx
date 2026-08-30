import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Info } from 'lucide-react';
import Button from '../ui/Button';

const BookingSuccessModal = ({ isOpen, onClose, appointment, recommendations = [] }) => {
  const [timeLeft, setTimeLeft] = useState(3);
  const autoCloseRef = useRef(null);
  const countdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    setTimeLeft(3);
    countdownRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      autoCloseRef.current = setTimeout(() => {
        onClose();
      }, 3000);
    }
    return () => {
      if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !appointment) return null;

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date + 'T00:00:00');
    return d.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-white rounded-sm shadow-2xl w-full max-w-lg p-6 sm:p-8 animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#9A9488] hover:text-[#1C1A16] hover:bg-[#F6F2EA] rounded-md transition-colors"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="font-serif text-2xl text-[#1C1A16] mb-2">Cita Confirmada</h3>
          <p className="text-sm text-[#6B6459]">
            Te enviamos un correo y un mensaje de WhatsApp con la confirmacion.
          </p>
        </div>

        <div className="bg-[#F6F2EA] border border-[#E4DCC9] rounded-sm p-4 mb-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#6B6459]">Servicio:</span>
              <span className="font-medium text-[#1C1A16]">{appointment.service_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B6459]">Fecha:</span>
              <span className="font-medium text-[#1C1A16]">{formatDate(appointment.appointment_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B6459]">Hora:</span>
              <span className="font-medium text-[#1C1A16]">{appointment.appointment_time}</span>
            </div>
            {appointment.workstation_name && (
              <div className="flex justify-between">
                <span className="text-[#6B6459]">Estacion:</span>
                <span className="font-medium text-[#1C1A16]">{appointment.workstation_name}</span>
              </div>
            )}
          </div>
        </div>

        {recommendations.length > 0 && (
          <div className="bg-[#F6F2EA] border border-[#E4DCC9] rounded-sm p-4 mb-6">
            <h4 className="font-medium text-[#1C1A16] mb-2 text-sm uppercase tracking-wide">
              Recomendaciones
            </h4>
            <ul className="text-sm text-[#6B6459] space-y-1 list-disc list-inside">
              {recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-sm p-3 mb-6 flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-800">
            <strong>Recordatorio:</strong> por favor llega 5 minutos antes de tu cita
          </p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-[#B7B1A3]">
            Se cerrara automaticamente en {timeLeft}s
          </span>
          <Button onClick={onClose} size="sm">
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessModal;
