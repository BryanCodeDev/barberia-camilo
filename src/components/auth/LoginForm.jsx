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
    <div className="w-full max-w-md mx-auto animate-scale-in">
      <div className="bg-ink border border-ink-line rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 sm:p-8 text-center border-b border-ink-line">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-lg shadow-gold/20">
             <span className="text-ink font-serif font-bold text-2xl">EB</span>
          </div>
          <h2 className="font-serif text-2xl text-cream mb-2">{headerTitle}</h2>
          {headerSubtitle && <p className="text-sm text-stone-light">{headerSubtitle}</p>}
        </div>
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {error && <ErrorBanner message={error} className="mb-4" />}
          {fields.map((field) => {
            const { type, label, name, placeholder, required, className, ...rest } = field;
            if (type === 'password') {
              return (
                <div key={name} className="space-y-2">
                  <label className="block text-sm font-medium text-stone-light">{label}</label>
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
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-dim hover:text-gold-light p-1 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              );
            }
            return (
              <div key={name} className="space-y-2">
                <label className="block text-sm font-medium text-stone-light">{label}</label>
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
    </div>
  );
};

export default LoginForm;
