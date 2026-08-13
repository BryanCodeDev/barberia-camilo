import React from 'react';
import { User, Phone, Calendar, MessageSquare, Check, AlertTriangle, EyeOff, Trash2, Pencil } from 'lucide-react';

const AppointmentCard = ({
  appointment,
  onConfirm,
  onCancel,
  onComplete,
  onNoShow,
  onDelete,
  onEdit,
  formatDate,
  getStatusColor,
  getStatusText,
}) => {
  return (
    <div className="p-4 sm:p-6 hover:bg-[#F6F2EA]/50 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-start sm:items-center space-x-3">
            <div className="bg-[#A9812E]/10 p-2 rounded-full flex-shrink-0">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-[#8B6A22]" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-[#1C1A16] text-base sm:text-lg truncate">{appointment.client_name}</h4>
              <div className="flex items-center text-sm text-[#6B6459] mt-1">
                <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">{appointment.client_phone}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="font-medium text-[#1C1A16] bg-[#F6F2EA] px-3 py-2.5 rounded-lg">
              <span className="text-[#6B6459]">Servicio: </span>{appointment.service_name}
            </div>
            <div className="flex items-center text-[#6B6459] bg-[#F6F2EA] px-3 py-2.5 rounded-lg">
              <Calendar className="h-3 w-3 mr-2 flex-shrink-0" />
              <span className="truncate">{formatDate(appointment.appointment_date)} - {appointment.appointment_time}</span>
            </div>
          </div>
          {appointment.client_message && (
            <div className="flex items-start text-sm text-[#1C1A16] bg-[#EEF3FB] p-3 rounded-lg">
              <MessageSquare className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-[#3B5B8C]" />
              <span className="break-words">{appointment.client_message}</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between sm:justify-end space-x-3 flex-shrink-0">
          <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(appointment.status)}`}>
            {getStatusText(appointment.status)}
          </span>
          <div className="flex items-center space-x-1">
            <button onClick={() => onEdit(appointment)} className="text-[#3B5B8C] hover:bg-[#EEF3FB] p-2 rounded-lg transition-colors" title="Editar cita">
              <Pencil className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            {appointment.status === 'pending' && (
              <button onClick={() => onConfirm(appointment.id, 'confirmed')} className="text-[#3E6B3E] hover:bg-[#EEF5EE] p-2 rounded-lg transition-colors" title="Confirmar cita">
                <Check className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}
            {appointment.status === 'pending' && (
              <button onClick={() => {
                const reason = window.prompt('Motivo de cancelación:');
                if (reason !== null && reason.trim().length > 0) onCancel(appointment.id, 'cancelled', reason.trim());
              }} className="text-[#8B2E2E] hover:bg-[#FBEAEA] p-2 rounded-lg transition-colors" title="Cancelar cita">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}
            {appointment.status === 'confirmed' && (
              <button onClick={() => onComplete(appointment.id, 'completed')} className="text-[#3B5B8C] hover:bg-[#EEF3FB] p-2 rounded-lg transition-colors" title="Marcar como completada">
                <Check className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}
            {appointment.status === 'confirmed' && (
              <button onClick={() => onNoShow(appointment.id, 'no-show')} className="text-[#6B6459] hover:bg-[#F1EFEB] p-2 rounded-lg transition-colors" title="Marcar como no se presentó">
                <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}
            <button onClick={() => onDelete(appointment.id)} className="text-[#8B2E2E] hover:bg-[#FBEAEA] p-2 rounded-lg transition-colors" title="Eliminar cita">
              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;
