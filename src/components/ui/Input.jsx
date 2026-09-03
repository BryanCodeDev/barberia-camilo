import React from 'react';

const variantClasses = {
  default: 'bg-white border-[#E4DCC9] focus:border-[#A9812E]',
  dark: 'bg-[#121113] text-[#F6F2EA] border-[#2A2723] placeholder-[#6E6A61] focus:border-[#C9A860]',
};

const Input = ({
  value,
  onChange,
  name,
  type = 'text',
  placeholder,
  disabled,
  className,
  error,
  label,
  icon: Icon,
  variant = 'default',
  ...rest
}) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-[#1C1A16] mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A9812E] pointer-events-none" />
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={[
            'w-full px-4 py-3 border rounded-sm outline-none transition-all duration-200',
            'focus:ring-2 focus:ring-[#A9812E]/25',
            error ? 'border-[#C25555] focus:border-[#C25555]' : (variantClasses[variant] || variantClasses.default),
            Icon ? 'pl-9' : '',
            disabled ? 'opacity-60 cursor-not-allowed' : '',
            className || '',
          ].join(' ')}
          {...rest}
        />
      </div>
      {error && <p className="mt-1.5 text-sm text-[#C25555] animate-fade-in">{error}</p>}
    </div>
  );
};

export default Input;