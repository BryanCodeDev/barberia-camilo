import React, { useState } from 'react';
import { Eye, EyeOff, Shield } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import ErrorBanner from '../ui/ErrorBanner';

const LoginForm = ({ fields, onSubmit, loading, error, submitLabel, headerIcon: HeaderIcon, headerTitle, headerSubtitle }) => {
  const [values, setValues] = useState(() => {
    const initial = {};
    fields.forEach((field) => {
      initial[field.name] = '';
    });
    return initial;
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    fields.forEach((field) => {
      if (field.required && !values[field.name]?.trim()) {
        newErrors[field.name] = `${field.label} es requerido`;
      }
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    onSubmit(values);
  };

  return (
    <div className="bg-white border border-[#E4DCC9] rounded-sm shadow-sm p-6 sm:p-8 max-w-md mx-auto">
      <div className="text-center mb-8">
        {HeaderIcon && (
          <div className="w-14 h-14 rounded-full border border-[#A9812E]/60 flex items-center justify-center mx-auto mb-4">
            <HeaderIcon className="h-6 w-6 text-[#8B6A22]" />
          </div>
        )}
        <h2 className="font-serif text-xl text-[#1C1A16] mb-2">{headerTitle}</h2>
        {headerSubtitle && <p className="text-sm text-[#6B6459]">{headerSubtitle}</p>}
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <ErrorBanner message={error} />}
        {fields.map((field) => {
          const { type, label, name, placeholder, required, className, ...rest } = field;
          if (type === 'password') {
            return (
              <div key={name}>
                <label className="block text-sm font-medium text-[#1C1A16] mb-2">{label}</label>
                <div className="relative">
                  <Input
                    name={name}
                    value={values[name]}
                    onChange={handleChange}
                    type={showPassword ? 'text' : 'password'}
                    placeholder={placeholder}
                    error={errors[name]}
                    className={className}
                    {...rest}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6E6A61] hover:text-[#1C1A16] p-1">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            );
          }
          return (
            <Input
              key={name}
              label={label}
              name={name}
              value={values[name]}
              onChange={handleChange}
              type={type}
              placeholder={placeholder}
              error={errors[name]}
              className={className}
              {...rest}
            />
          );
        })}
        <Button type="submit" loading={loading} className="w-full" size="lg">
          {submitLabel}
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
