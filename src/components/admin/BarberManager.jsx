import React, { useState, useEffect } from 'react';
import { Plus, Loader2, Pencil, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import Modal from '../ui/Modal';
import Input from '../ui/Input';

const BarberManager = ({ userRole }) => {
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', is_active: true });
  const [saving, setSaving] = useState(false);
  const canEdit = userRole === 'admin';

  const fetchBarbers = async () => {
    try {
      setLoading(true);
      const data = await api.get('/admin/barbers');
      setBarbers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBarbers(); }, []);

  const openCreateModal = () => {
    setEditingBarber(null);
    setForm({ name: '', email: '', phone: '', is_active: true });
    setModalOpen(true);
  };

  const openEditModal = (barber) => {
    setEditingBarber(barber);
    setForm({ name: barber.name, email: barber.email || '', phone: barber.phone || '', is_active: !!barber.is_active });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingBarber) {
        await api.patch(`/admin/barbers/${editingBarber.id}`, form);
      } else {
        await api.post('/admin/barbers', form);
      }
      setModalOpen(false);
      fetchBarbers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Desactivar este barbero?')) return;
    try {
      await api.delete(`/admin/barbers/${id}`);
      fetchBarbers();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white border border-[#E4DCC9] rounded-lg shadow-sm p-4 sm:p-6 card-hover-lift">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h3 className="font-serif text-xl text-[#1C1A16]">Barberos</h3>
        {canEdit && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 bg-[#A9812E] text-[#121113] px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#C9A860] transition-all duration-200 btn-press shadow-sm"
          >
            <Plus className="h-4 w-4" /> Nuevo Barbero
          </button>
        )}
      </div>
      {error && <div className="bg-[#FBEAEA] border border-[#E3B8B8] text-[#8B2E2E] px-4 py-3 rounded-lg text-sm mb-4 animate-fade-in">{error}</div>}
      <div className="space-y-3">
        {loading && <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-[#A9812E]" /></div>}
        {barbers.length === 0 && !loading && <p className="text-[#6B6459] text-sm text-center py-8">No hay barberos registrados.</p>}
        {barbers.map(barber => (
          <div key={barber.id} className="border border-[#E4DCC9] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#A9812E]/40 hover:shadow-md transition-all duration-200">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-[#1C1A16] truncate">{barber.name}</h4>
              <p className="text-sm text-[#6B6459] mt-1">{barber.email || 'Sin email'} — {barber.phone || 'Sin teléfono'}</p>
              <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-md text-xs font-medium ${barber.is_active ? 'bg-[#EEF5EE] text-[#3E6B3E]' : 'bg-[#FBEAEA] text-[#8B2E2E]'}`}>{barber.is_active ? 'Activo' : 'Inactivo'}</span>
            </div>
            {canEdit && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => openEditModal(barber)} className="p-2.5 text-[#3B5B8C] hover:bg-[#EEF3FB] rounded-lg transition-colors" title="Editar">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(barber.id)} className="p-2.5 text-[#8B2E2E] hover:bg-[#FBEAEA] rounded-lg transition-colors" title="Desactivar">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBarber ? 'Editar Barbero' : 'Nuevo Barbero'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <Input
              label="Nombre completo"
              name="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="Ej. Juan Pérez"
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="correo@ejemplo.com"
            />
            <Input
              label="Teléfono"
              name="phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+57 300 123 4567"
            />
            <label className="flex items-center gap-2.5 text-sm text-[#6B6459] cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-4 h-4 rounded border-[#E4DCC9] text-[#A9812E] focus:ring-[#A9812E]"
              />
              <span>Barbero activo</span>
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-5 py-2.5 border border-[#E4DCC9] rounded-lg text-sm font-medium hover:bg-[#F6F2EA] transition-colors"
            >
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 bg-[#A9812E] text-[#121113] px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#C9A860] transition-all duration-200 disabled:opacity-50 btn-press shadow-sm">
              {saving ? 'Guardando...' : (editingBarber ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BarberManager;
