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
    <div className="bg-[#1C1A16] border border-[#2A2723] rounded-xl shadow-2xl p-6 sm:p-8 max-w-md mx-auto animate-scale-in">
      <div className="text-center mb-8">
        {HeaderIcon && (
          <div className="w-16 h-16 rounded-full border border-[#A9812E]/60 flex items-center justify-center mx-auto mb-5 bg-[#121113] shadow-lg shadow-[#A9812E]/10">
            <HeaderIcon className="h-7 w-7 text-[#C9A860]" />
          </div>
        )}
        <h2 className="font-serif text-2xl text-[#F6F2EA] mb-2">{headerTitle}</h2>
        {headerSubtitle && <p className="text-sm text-[#9A9488]">{headerSubtitle}</p>}
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <ErrorBanner message={error} className="mb-4" />}
        {fields.map((field) => {
          const { type, label, name, placeholder, required, className, ...rest } = field;
          if (type === 'password') {
            return (
              <div key={name} className="space-y-1.5">
                <label className="block text-sm font-medium text-[#D8D3C7]">{label}</label>
                <div className="relative">
                  <Input
                    name={name}
                    value={values[name]}
                    onChange={handleChange}
                    type={showPassword ? 'text' : 'password'}
                    placeholder={placeholder}
                    error={errors[name]}
                    className={className}
                    variant="dark"
                    {...rest}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6E6A61] hover:text-[#C9A860] p-1 transition-colors">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            );
          }
          return (
            <div key={name} className="space-y-1.5">
              <label className="block text-sm font-medium text-[#D8D3C7]">{label}</label>
              <Input
                label=""
                name={name}
                value={values[name]}
                onChange={handleChange}
                type={type}
                placeholder={placeholder}
                error={errors[name]}
                className={className}
                variant="dark"
                {...rest}
              />
            </div>
          );
        })}
        <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
          {submitLabel}
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
