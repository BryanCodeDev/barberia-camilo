import React, { useEffect } from 'react';
import { Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SessionReplacedModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="relative bg-[#101010] border border-[rgba(201,168,96,0.20)] rounded-2xl shadow-2xl shadow-black/60 w-full max-w-md animate-slide-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-replaced-title"
      >
        <div className="p-6 sm:p-8 text-center">
          <div className="relative w-16 h-16 mx-auto mb-5">
            <span className="absolute inset-0 rounded-2xl bg-[#EF4444]/10 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="relative w-16 h-16 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center justify-center">
              <Monitor className="h-8 w-8 text-[#EF4444]" />
            </div>
          </div>

          <h2 id="session-replaced-title" className="font-serif text-xl sm:text-2xl text-white mb-3">
            Sesión cerrada
          </h2>

          <p className="text-sm text-[#A3A3A3] mb-2">
            Tu cuenta inició sesión en otro dispositivo.
          </p>

          <p className="text-sm text-[#666666] mb-6">
            Por seguridad, esta sesión ha sido cerrada automáticamente.
          </p>

          <button
            onClick={() => {
              onClose();
              navigate('/');
            }}
            className="w-full px-5 py-3 rounded-xl text-sm font-semibold bg-gradient-to-b from-[#E0C47A] to-[#C9A860] text-[#0A0A0A] shadow-[0_2px_0_rgba(0,0,0,0.2)] hover:from-[#EAD08F] hover:to-[#D8BA76] active:translate-y-px active:shadow-none transition-all duration-200"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionReplacedModal;