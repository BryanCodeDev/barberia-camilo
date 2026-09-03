import React from 'react';
import { Loader2 } from 'lucide-react';

const variantClasses = {
  primary:
    'bg-gradient-to-b from-[#C9A860] to-[#A9812E] text-[#121113] shadow-[0_2px_0_rgba(0,0,0,0.15),0_6px_16px_-6px_rgba(169,129,46,0.55)] hover:from-[#D8BA76] hover:to-[#BC9440] hover:shadow-[0_2px_0_rgba(0,0,0,0.15),0_10px_22px_-6px_rgba(169,129,46,0.65)]',
  secondary:
    'bg-white border border-[#E4DCC9] text-[#6B6459] hover:border-[#A9812E]/70 hover:text-[#8B6A22]',
  dark:
    'bg-[#121113] text-[#F6F2EA] hover:bg-[#1C1A16] shadow-[0_2px_0_rgba(0,0,0,0.3)]',
  blue: 'bg-[#3B5B8C] text-white hover:bg-[#1E3352]',
  ghost: 'text-[#6B6459] hover:text-[#D8D3C7] hover:bg-[#2A2723]',
};

const sizeClasses = {
  sm: 'px-3.5 py-2 text-xs',
  md: 'px-5 py-3 text-sm',
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
        'relative inline-flex items-center justify-center gap-2 rounded-sm font-semibold uppercase tracking-wide',
        'transition-all duration-200 ease-out active:translate-y-px active:shadow-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A9812E]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0',
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