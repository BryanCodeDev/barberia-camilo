import React, { useState, useEffect } from 'react';
import { Loader2, Save } from 'lucide-react';
import { api } from '../../services/api';

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
    setSettings(prev => ({ ...prev, [name]: value }));
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

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#A9812E]" /></div>;

  return (
    <div className="bg-white border border-[#E4DCC9] rounded-sm p-6">
      <h3 className="font-serif text-xl text-[#1C1A16] mb-6">Configuración del Negocio</h3>
      {error && <div className="bg-[#FBEAEA] border border-[#E3B8B8] text-[#8B2E2E] px-4 py-3 rounded-sm text-sm mb-4">{error}</div>}
      {success && <div className="bg-[#EEF5EE] border border-[#C7DEC7] text-[#3E6B3E] px-4 py-3 rounded-sm text-sm mb-4">Configuración actualizada correctamente</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1C1A16] mb-2">Nombre del Negocio</label>
            <input type="text" name="business_name" value={settings?.business_name || ''} onChange={handleChange} className="w-full px-4 py-2 border border-[#E4DCC9] rounded-sm bg-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1C1A16] mb-2">Nombre del Barber</label>
            <input type="text" name="barber_name" value={settings?.barber_name || ''} onChange={handleChange} className="w-full px-4 py-2 border border-[#E4DCC9] rounded-sm bg-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1C1A16] mb-2">Teléfono</label>
            <input type="tel" name="phone" value={settings?.phone || ''} onChange={handleChange} className="w-full px-4 py-2 border border-[#E4DCC9] rounded-sm bg-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1C1A16] mb-2">WhatsApp</label>
            <input type="tel" name="whatsapp_number" value={settings?.whatsapp_number || ''} onChange={handleChange} className="w-full px-4 py-2 border border-[#E4DCC9] rounded-sm bg-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1C1A16] mb-2">Email</label>
            <input type="email" name="email" value={settings?.email || ''} onChange={handleChange} className="w-full px-4 py-2 border border-[#E4DCC9] rounded-sm bg-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1C1A16] mb-2">Dirección</label>
            <input type="text" name="address" value={settings?.address || ''} onChange={handleChange} className="w-full px-4 py-2 border border-[#E4DCC9] rounded-sm bg-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1C1A16] mb-2">Zona horaria</label>
            <input type="text" name="timezone" value={settings?.timezone || 'America/Bogota'} onChange={handleChange} className="w-full px-4 py-2 border border-[#E4DCC9] rounded-sm bg-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1C1A16] mb-2">Días máx. de reserva anticipada</label>
            <input type="number" name="max_advance_booking_days" value={settings?.max_advance_booking_days || 14} onChange={handleChange} className="w-full px-4 py-2 border border-[#E4DCC9] rounded-sm bg-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1C1A16] mb-2">Horas mín. para cancelar</label>
            <input type="number" name="min_cancel_hours" value={settings?.min_cancel_hours || 24} onChange={handleChange} className="w-full px-4 py-2 border border-[#E4DCC9] rounded-sm bg-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1C1A16] mb-2">Buffer entre turnos (min)</label>
            <input type="number" name="buffer_minutes_between_appointments" value={settings?.buffer_minutes_between_appointments || 0} onChange={handleChange} className="w-full px-4 py-2 border border-[#E4DCC9] rounded-sm bg-white" />
          </div>
        </div>
        <button type="submit" disabled={saving} className="bg-[#A9812E] text-[#121113] px-6 py-3 rounded-sm font-semibold text-sm hover:bg-[#C9A860] transition-colors flex items-center disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </div>
  );
};

export default SettingsEditor;
