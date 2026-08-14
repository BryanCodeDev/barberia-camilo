import React from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import AppointmentCard from './AppointmentCard';

const SkeletonCard = () => (
  <div className="p-4 sm:p-6 border-b border-cream-line last:border-b-0">
    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl skeleton-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-48 skeleton-pulse rounded-lg" />
            <div className="h-4 w-32 skeleton-pulse rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="h-12 skeleton-pulse rounded-xl" />
          <div className="h-12 skeleton-pulse rounded-xl" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        {[1,2,3,4].map(i => (
          <div key={i} className="w-9 h-9 skeleton-pulse rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);

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
      <div className="divide-y divide-cream-line">
        {[1, 2, 3].map(i => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-cream flex items-center justify-center border border-cream-line">
          <Calendar className="h-8 w-8 text-stone-faint" />
        </div>
        <h3 className="font-serif text-lg text-ink-soft mb-2">No hay citas agendadas</h3>
        <p className="text-stone max-w-md mx-auto text-sm">
          Las citas apareceran aqui cuando los clientes las agenden a traves del portal.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-cream-line">
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
