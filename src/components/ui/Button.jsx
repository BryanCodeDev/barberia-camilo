import React from 'react';
import { Loader2 } from 'lucide-react';

const variantClasses = {
  primary: 'bg-[#A9812E] text-[#121113] hover:bg-[#C9A860]',
  secondary: 'bg-white border border-[#E4DCC9] text-[#6B6459] hover:border-[#A9812E]/60 hover:text-[#8B6A22]',
  dark: 'bg-[#121113] text-[#F6F2EA] hover:bg-[#1C1A16]',
  blue: 'bg-[#3B5B8C] text-white hover:bg-[#1E3352]',
  ghost: 'text-[#6B6459] hover:text-[#D8D3C7] hover:bg-[#2A2723]',
};

const sizeClasses = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-base',
  lg: 'px-8 py-3.5 text-sm',
};

const Button = ({
  children,
  onClick,
  type = 'button',
  disabled,
  className,
  variant = 'primary',
  size = 'md',
  loading,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold uppercase tracking-wide transition-all duration-200',
        'disabled:opacity-50',
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size] || sizeClasses.md,
        className || '',
      ].join(' ')}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;
