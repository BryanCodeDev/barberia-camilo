import React from 'react';

const TextArea = ({
  value,
  onChange,
  placeholder,
  disabled,
  className,
  error,
  label,
  rows = 3,
  maxLength,
}) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-[#1C1A16] mb-2">
          {label}
        </label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={[
          'w-full px-4 py-3 border border-[#E4DCC9] rounded-sm outline-none resize-none transition-all duration-200',
          'focus:ring-2 focus:ring-[#A9812E]/25 focus:border-[#A9812E]',
          disabled ? 'opacity-60 cursor-not-allowed' : '',
          className || '',
        ].join(' ')}
      />
      {maxLength && (
        <div className="mt-1 text-right text-[11px] text-[#B7B1A3]">
          {(value || '').length}/{maxLength}
        </div>
      )}
      {error && <p className="mt-1 text-sm text-[#C25555] animate-fade-in">{error}</p>}
    </div>
  );
};

export default TextArea;