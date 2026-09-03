import React from 'react';
import { X, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

const typeConfig = {
  error: { classes: 'bg-[#FBEAEA] border-[#E3B8B8] text-[#8B2E2E]', Icon: AlertCircle },
  success: { classes: 'bg-[#EEF5EE] border-[#C7DEC7] text-[#3E6B3E]', Icon: CheckCircle2 },
  warning: { classes: 'bg-[#FBF3E4] border-[#EAD9AE] text-[#8B6A22]', Icon: AlertTriangle },
};

const ErrorBanner = ({ message, onDismiss, type = 'error' }) => {
  const { classes, Icon } = typeConfig[type] || typeConfig.error;
  return (
    <div
      className={[
        'px-4 py-3 rounded-sm border text-sm flex items-center justify-between gap-3 animate-fade-in',
        classes,
      ].join(' ')}
      role={type === 'error' ? 'alert' : 'status'}
    >
      <span className="flex items-start gap-2">
        <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <span>{message}</span>
      </span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-current hover:opacity-70 transition-opacity flex-shrink-0"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default ErrorBanner;