import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import ErrorBanner from '../ui/ErrorBanner';
import Loader from '../ui/Loader';

const NUMERIC_FIELDS = ['max_advance_booking_days', 'min_cancel_hours', 'buffer_minutes_between_appointments'];

const SettingsEditor = ({ onUpdate, userRole }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await api.get('/business-settings');
        setSettings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = NUMERIC_FIELDS.includes(name)
      ? (value === '' ? '' : (Number.isNaN(Number(value)) ? settings[name] : Number(value)))
      : value;
    setSettings(prev => ({ ...prev, [name]: parsedValue }));
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.patch('/business-settings', settings);
      setSuccess(true);
      if (onUpdate) onUpdate();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-16"><Loader size="lg" /></div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="font-serif text-xl text-ink-soft mb-1">Configuracion del Negocio</h3>
        <p className="text-sm text-stone">Actualiza la informacion y parametros de operacion</p>
      </div>

      {error && <ErrorBanner message={error} className="mb-4" />}
      {success && <ErrorBanner message="Configuracion actualizada correctamente" type="success" className="mb-4" />}

      <div className="space-y-6">
        <div className="card-premium p-5 sm:p-6">
          <h4 className="text-sm font-semibold text-ink-soft uppercase tracking-wider mb-4">Informacion General</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nombre del Negocio" name="business_name" value={settings?.business_name || ''} onChange={handleChange} disabled={userRole !== 'admin'} />
            <Input label="Telefono" name="phone" value={settings?.phone || ''} onChange={handleChange} type="tel" disabled={userRole !== 'admin'} />
            <Input label="WhatsApp" name="whatsapp_number" value={settings?.whatsapp_number || ''} onChange={handleChange} type="tel" disabled={userRole !== 'admin'} />
            <Input label="Email" name="email" value={settings?.email || ''} onChange={handleChange} type="email" disabled={userRole !== 'admin'} />
            <Input label="Direccion" name="address" value={settings?.address || ''} onChange={handleChange} disabled={userRole !== 'admin'} />
            <Input label="Zona horaria" name="timezone" value={settings?.timezone || 'America/Bogota'} onChange={handleChange} disabled={userRole !== 'admin'} />
            <Input label="Instagram" name="instagram" value={settings?.instagram || ''} onChange={handleChange} placeholder="elbronx.official" disabled={userRole !== 'admin'} />
            <Input label="Facebook" name="facebook" value={settings?.facebook || ''} onChange={handleChange} placeholder="elbronx.official" disabled={userRole !== 'admin'} />
            <Input label="TikTok" name="tiktok" value={settings?.tiktok || ''} onChange={handleChange} placeholder="@elbronxbarber" disabled={userRole !== 'admin'} />
            <Input label="YouTube" name="youtube" value={settings?.youtube || ''} onChange={handleChange} placeholder="@elbronxofficial" disabled={userRole !== 'admin'} />
          </div>
        </div>

        <div className="card-premium p-5 sm:p-6">
          <h4 className="text-sm font-semibold text-ink-soft uppercase tracking-wider mb-4">Parametros de Reserva</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Dias max. de reserva anticipada"
              name="max_advance_booking_days"
              value={settings?.max_advance_booking_days || 14}
              onChange={handleChange}
              type="number"
              min="1"
              max="90"
              disabled={userRole !== 'admin'}
            />
            <Input
              label="Horas min. para cancelar"
              name="min_cancel_hours"
              value={settings?.min_cancel_hours || 24}
              onChange={handleChange}
              type="number"
              min="0"
              max="720"
              disabled={userRole !== 'admin'}
            />
            <Input
              label="Buffer entre turnos (min)"
              name="buffer_minutes_between_appointments"
              value={settings?.buffer_minutes_between_appointments || 0}
              onChange={handleChange}
              type="number"
              min="0"
              max="120"
              disabled={userRole !== 'admin'}
            />
          </div>
        </div>
      </div>

      {userRole === 'admin' && (
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={saving} loading={saving} size="md">
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      )}
    </form>
  );
};

export default SettingsEditor;
