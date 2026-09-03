import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Info } from 'lucide-react';
import Button from '../ui/Button';

const BookingSuccessModal = ({ isOpen, onClose, appointment, recommendations = [], autoClose = false, autoCloseDelay = 3000 }) => {
  const [timeLeft, setTimeLeft] = useState(3);
  const autoCloseRef = useRef(null);
  const countdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    setTimeLeft(3);
    if (autoClose) {
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
    }

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    };
  }, [isOpen, onClose, autoClose]);

  useEffect(() => {
    if (isOpen && autoClose) {
      autoCloseRef.current = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
    }
    return () => {
      if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    };
  }, [isOpen, onClose, autoClose, autoCloseDelay]);

  if (!isOpen || !appointment) return null;

  const formatDate = (date) => {
    if (!date) return '';
    const str = String(date);
    const match = str.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return date;
    const [, year, month, day] = match;
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    return d.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const progress = autoClose ? ((autoCloseDelay / 1000 - timeLeft) / (autoCloseDelay / 1000)) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4">
      <style>{`
        @keyframes bronx-check-circle {
          from { stroke-dashoffset: 76; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes bronx-check-mark {
          from { stroke-dashoffset: 24; }
          to { stroke-dashoffset: 0; }
        }
        .bronx-check-circle {
          stroke-dasharray: 76;
          animation: bronx-check-circle 0.5s ease-out forwards;
        }
        .bronx-check-mark {
          stroke-dasharray: 24;
          animation: bronx-check-mark 0.35s 0.45s ease-out forwards;
          stroke-dashoffset: 24;
        }
      `}</style>
      <div className="absolute inset-0 bg-[#121113]/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-white rounded-sm shadow-2xl w-full max-w-lg p-6 sm:p-8 animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#9A9488] hover:text-[#1C1A16] hover:bg-[#F6F2EA] rounded-sm transition-colors"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <svg className="w-16 h-16 mx-auto mb-4" viewBox="0 0 52 52">
            <circle
              className="bronx-check-circle"
              cx="26" cy="26" r="24"
              fill="none" stroke="#5FAE68" strokeWidth="2.5"
            />
            <path
              className="bronx-check-mark"
              fill="none" stroke="#5FAE68" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
              d="M15 27 L23 34 L38 18"
            />
          </svg>
          <h3 className="font-serif text-2xl text-[#1C1A16] mb-2">Cita Confirmada</h3>
          <p className="text-sm text-[#6B6459]">
            Te enviamos un correo con la confirmación.
          </p>
        </div>

        <div className="bg-[#F6F2EA] border border-[#E4DCC9] rounded-sm p-4 mb-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#6B6459]">Servicio:</span>
              <span className="font-medium text-[#1C1A16]">{appointment.service_name}</span>
            </div>
            <div
              className="flex justify-between pt-2"
              style={{ borderTop: '1.5px dashed #E4DCC9' }}
            >
              <span className="text-[#6B6459]">Fecha:</span>
              <span className="font-medium text-[#1C1A16]">{formatDate(appointment.appointment_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B6459]">Hora:</span>
              <span className="font-medium text-[#1C1A16]">{appointment.appointment_time}</span>
            </div>
            {appointment.workstation_name && (
              <div className="flex justify-between">
                <span className="text-[#6B6459]">Estación:</span>
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
          {autoClose ? (
            <div className="flex items-center gap-2 text-xs text-[#B7B1A3]">
              <svg className="w-4 h-4 -rotate-90" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="6.5" fill="none" stroke="#E4DCC9" strokeWidth="2" />
                <circle
                  cx="8" cy="8" r="6.5" fill="none" stroke="#A9812E" strokeWidth="2"
                  strokeDasharray={2 * Math.PI * 6.5}
                  strokeDashoffset={2 * Math.PI * 6.5 * (1 - progress / 100)}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                  strokeLinecap="round"
                />
              </svg>
              Se cierra en {timeLeft}s
            </div>
          ) : <span />}
          <Button onClick={onClose} size="sm">
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessModal;