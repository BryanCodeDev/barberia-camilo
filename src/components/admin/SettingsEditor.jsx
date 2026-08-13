import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { api } from '../../services/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import ErrorBanner from '../ui/ErrorBanner';
import Loader from '../ui/Loader';

const NUMERIC_FIELDS = ['max_advance_booking_days', 'min_cancel_hours', 'buffer_minutes_between_appointments'];

const SettingsEditor = ({ onUpdate }) => {
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

  if (loading) return <div className="flex items-center justify-center py-12"><Loader size="lg" /></div>;

  return (
    <div className="bg-white border border-[#E4DCC9] rounded-sm shadow-sm p-6">
      <h3 className="font-serif text-xl text-[#1C1A16] mb-6">Configuración del Negocio</h3>
      {error && <ErrorBanner message={error} className="mb-4" />}
      {success && <ErrorBanner message="Configuración actualizada correctamente" type="success" className="mb-4" />}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Nombre del Negocio" name="business_name" value={settings?.business_name || ''} onChange={handleChange} />
          <Input label="Nombre del Barber" name="barber_name" value={settings?.barber_name || ''} onChange={handleChange} />
          <Input label="Teléfono" name="phone" value={settings?.phone || ''} onChange={handleChange} type="tel" />
          <Input label="WhatsApp" name="whatsapp_number" value={settings?.whatsapp_number || ''} onChange={handleChange} type="tel" />
          <Input label="Email" name="email" value={settings?.email || ''} onChange={handleChange} type="email" />
          <Input label="Dirección" name="address" value={settings?.address || ''} onChange={handleChange} />
          <Input label="Zona horaria" name="timezone" value={settings?.timezone || 'America/Bogota'} onChange={handleChange} />
          <Input label="Días máx. de reserva anticipada" name="max_advance_booking_days" value={settings?.max_advance_booking_days || 14} onChange={handleChange} type="number" min="1" max="90" />
          <Input label="Horas mín. para cancelar" name="min_cancel_hours" value={settings?.min_cancel_hours || 24} onChange={handleChange} type="number" min="0" max="720" />
          <Input label="Buffer entre turnos (min)" name="buffer_minutes_between_appointments" value={settings?.buffer_minutes_between_appointments || 0} onChange={handleChange} type="number" min="0" max="120" />
        </div>
        <Button type="submit" disabled={saving} loading={saving} size="sm">
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </form>
    </div>
  );
};

export default SettingsEditor;
