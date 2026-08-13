import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-5xl',
};

const Modal = ({ isOpen, onClose, children, title, size = 'md', showClose = true }) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative bg-white border border-[#E4DCC9] rounded-lg shadow-2xl w-full ${sizeClasses[size] || sizeClasses.md} animate-slide-up max-h-[90vh] flex flex-col`}
        role="dialog"
        aria-modal="true"
      >
        {(title || showClose) && (
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#E4DCC9]">
            {title && <h3 className="font-serif text-lg sm:text-xl text-[#1C1A16]">{title}</h3>}
            {showClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-[#9A9488] hover:text-[#1C1A16] hover:bg-[#F6F2EA] rounded-md transition-colors"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
        <div className="overflow-y-auto px-5 sm:px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
