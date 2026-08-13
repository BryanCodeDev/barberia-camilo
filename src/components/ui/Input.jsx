import React from 'react';

const variantClasses = {
  default: 'bg-white',
  dark: 'bg-[#121113] text-[#F6F2EA] border-[#2A2723] placeholder-[#6E6A61]',
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
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A9812E]" />
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={[
            'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#A9812E]/40 focus:border-[#A9812E] outline-none transition-all',
            error ? 'border-[#C25555]' : 'border-[#E4DCC9]',
            variantClasses[variant] || variantClasses.default,
            Icon ? 'pl-9' : '',
            className || '',
          ].join(' ')}
          {...rest}
        />
      </div>
      {error && <p className="mt-1.5 text-sm text-[#C25555]">{error}</p>}
    </div>
  );
};

export default Input;
