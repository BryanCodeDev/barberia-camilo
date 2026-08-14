import React from 'react';
import { User, Phone, Calendar, MessageSquare, Check, AlertTriangle, EyeOff, Trash2, Pencil, Scissors, Users, Clock, DollarSign } from 'lucide-react';

const STATUS_ICONS = {
  pending: Clock,
  confirmed: Check,
  cancelled: AlertTriangle,
  completed: Check,
  'no-show': EyeOff,
};

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
  const StatusIcon = STATUS_ICONS[appointment.status] || Clock;

  return (
    <div className="list-item group">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold/15 to-gold/5 flex items-center justify-center flex-shrink-0 border border-gold/20">
              <User className="h-5 w-5 text-gold" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-ink-soft text-base sm:text-lg truncate">{appointment.client_name}</h4>
                <span className={`status-badge ${getStatusColor(appointment.status)}`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {getStatusText(appointment.status)}
                </span>
              </div>
              <div className="flex items-center text-sm text-stone mt-1">
                <Phone className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-stone-faint" />
                <span className="truncate">{appointment.client_phone}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
            <div className="flex items-center gap-2 bg-cream/50 px-3.5 py-2.5 rounded-xl border border-cream-line">
              <Calendar className="h-4 w-4 text-stone-faint flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-stone-faint">Fecha y hora</p>
                <p className="font-medium text-ink-soft truncate">{formatDate(appointment.appointment_date)} - {appointment.appointment_time}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-cream/50 px-3.5 py-2.5 rounded-xl border border-cream-line">
              <Scissors className="h-4 w-4 text-stone-faint flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-stone-faint">Servicio</p>
                <p className="font-medium text-ink-soft truncate">{appointment.service_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gold/5 px-3.5 py-2.5 rounded-xl border border-gold/10">
              <DollarSign className="h-4 w-4 text-gold flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gold-deep">Ganancia</p>
                <p className="font-medium text-gold-deep truncate">{(appointment.price_cents || 0).toLocaleString('es-CO')} COP</p>
              </div>
            </div>
          </div>

          {appointment.client_message && (
            <div className="flex items-start gap-2.5 mt-3 bg-status-blue/5 px-3.5 py-2.5 rounded-xl border border-status-blue/10">
              <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0 text-status-blue.deep" />
              <p className="text-sm text-ink-soft break-words">{appointment.client_message}</p>
            </div>
          )}

          <div className="flex items-center gap-4 mt-3 text-xs text-stone">
            {appointment.barber_name && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {appointment.barber_name}
              </span>
            )}
            {appointment.workstation_name && (
              <span className="flex items-center gap-1">
                <Scissors className="h-3 w-3" />
                {appointment.workstation_name}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between lg:justify-end gap-2 flex-shrink-0">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(appointment)}
              className="action-btn action-btn-edit"
              title="Editar cita"
            >
              <Pencil className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            {appointment.status === 'pending' && (
              <>
                <button
                  onClick={() => onConfirm(appointment.id, 'confirmed')}
                  className="action-btn action-btn-confirm"
                  title="Confirmar cita"
                >
                  <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button
                  onClick={() => {
                    const reason = window.prompt('Motivo de cancelacion:');
                    if (reason !== null && reason.trim().length > 0) onCancel(appointment.id, 'cancelled', reason.trim());
                  }}
                  className="action-btn action-btn-cancel"
                  title="Cancelar cita"
                >
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </>
            )}
            {appointment.status === 'confirmed' && (
              <>
                <button
                  onClick={() => onComplete(appointment.id, 'completed')}
                  className="action-btn action-btn-complete"
                  title="Marcar como completada"
                >
                  <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button
                  onClick={() => onNoShow(appointment.id, 'no-show')}
                  className="action-btn text-stone hover:bg-stone-faint/30"
                  title="Marcar como no se presento"
                >
                  <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </>
            )}
            <button
              onClick={() => onDelete(appointment.id)}
              className="action-btn action-btn-delete"
              title="Eliminar cita"
            >
              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;
