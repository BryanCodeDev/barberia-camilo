import React from 'react';
import { Calendar } from 'lucide-react';
import AppointmentCard from './AppointmentCard';

const AppointmentList = ({
  appointments,
  onConfirm,
  onCancel,
  onComplete,
  onNoShow,
  onDelete,
  onEdit,
  formatDate,
  getStatusColor,
  getStatusText,
  loading,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#A9812E] border-t-transparent" />
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <Calendar className="h-12 w-12 text-[#D8D3C7] mx-auto mb-4" />
        <h3 className="font-serif text-lg text-[#1C1A16] mb-2">No hay citas agendadas</h3>
        <p className="text-[#6B6459] max-w-md mx-auto text-sm">Las citas aparecerán aquí cuando los clientes las agenden.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#E4DCC9]">
      {appointments.map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          onConfirm={onConfirm}
          onCancel={onCancel}
          onComplete={onComplete}
          onNoShow={onNoShow}
          onDelete={onDelete}
          onEdit={onEdit}
          formatDate={formatDate}
          getStatusColor={getStatusColor}
          getStatusText={getStatusText}
        />
      ))}
    </div>
  );
};

export default AppointmentList;
