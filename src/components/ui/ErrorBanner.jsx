import React from 'react';
import { X } from 'lucide-react';

const typeClasses = {
  error: 'bg-[#FBEAEA] border-[#E3B8B8] text-[#8B2E2E]',
  success: 'bg-[#EEF5EE] border-[#C7DEC7] text-[#3E6B3E]',
  warning: 'bg-[#FBF3E4] border-[#EAD9AE] text-[#8B6A22]',
};

const ErrorBanner = ({ message, onDismiss, type = 'error' }) => {
  return (
    <div
      className={[
        'px-4 py-3 rounded-sm text-sm flex items-center justify-between',
        typeClasses[type] || typeClasses.error,
      ].join(' ')}
    >
      <span>{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-current hover:opacity-70 ml-4"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default ErrorBanner;
