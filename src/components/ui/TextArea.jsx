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
          'w-full px-4 py-3 border border-[#E4DCC9] rounded-sm focus:ring-2 focus:ring-[#A9812E]/40 focus:border-[#A9812E] outline-none',
          className || '',
        ].join(' ')}
      />
      {error && <p className="mt-1 text-sm text-[#C25555]">{error}</p>}
    </div>
  );
};

export default TextArea;
