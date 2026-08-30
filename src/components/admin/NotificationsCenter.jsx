import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, MessageSquare, Check, X, Clock, Mail, Bell } from 'lucide-react';
import { api } from '../../services/api';
import useWebSocket from '../../hooks/useWebSocket';

const STATUS_CONFIG = {
  sent: {
    label: 'Enviada',
    icon: Check,
    className: 'bg-status-green/10 text-status-green.deep border-status-green/20',
  },
  failed: {
    label: 'Fallida',
    icon: X,
    className: 'bg-status-red/10 text-status-red.deep border-status-red/20',
  },
  pending: {
    label: 'Pendiente',
    icon: Clock,
    className: 'bg-status-amber/10 text-status-amber.deep border-status-amber/20',
  },
};

const CHANNEL_CONFIG = {
  whatsapp: { icon: MessageSquare, label: 'WhatsApp', color: 'text-status-green.deep bg-status-green/10' },
  email: { icon: Mail, label: 'Email', color: 'text-status-blue.deep bg-status-blue/10' },
};

const NotificationsCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get('/admin/notifications');
      setNotifications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const { subscribe } = useWebSocket(null);

  useEffect(() => {
    const unsub = subscribe('notification:new', () => {
      fetchNotifications();
    });
    return unsub;
  }, [subscribe, fetchNotifications]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-gold mx-auto mb-3" />
          <p className="text-sm text-stone">Cargando notificaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-xl text-ink-soft">Centro de Notificaciones</h3>
          <p className="text-sm text-stone mt-1">Historial de notificaciones enviadas</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-stone">
          <Bell className="h-4 w-4" />
          <span>{notifications.length} registros</span>
        </div>
      </div>

      {error && (
        <div className="bg-status-red/10 border border-status-red/20 text-status-red.deep px-4 py-3 rounded-xl text-sm animate-fade-in">
          {error}
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-cream flex items-center justify-center border border-cream-line">
            <Bell className="h-8 w-8 text-stone-faint" />
          </div>
          <p className="text-stone text-sm mb-1">No hay notificaciones registradas.</p>
          <p className="text-stone-faint text-xs max-w-md mx-auto">
            Las notificaciones de correo electronico se mostraran aqui una vez que el backend las registre.
          </p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-cream-line" />
          <div className="space-y-4">
            {notifications.map((notification, index) => {
              const statusCfg = STATUS_CONFIG[notification.status] || STATUS_CONFIG.pending;
              const channelCfg = CHANNEL_CONFIG[notification.channel] || { icon: Clock, label: notification.channel, color: 'text-stone bg-stone-faint/20' };
              const StatusIcon = statusCfg.icon;
              const ChannelIcon = channelCfg.icon;
              return (
                <div
                  key={notification.id}
                  className="relative pl-14 animate-slide-left"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <div className="absolute left-3.5 top-5 w-3 h-3 rounded-full bg-gold border-2 border-cream shadow-sm" />

                  <div className="card-premium p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl ${channelCfg.color}`}>
                          <ChannelIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium text-ink-soft truncate">{notification.recipient}</p>
                            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-medium border ${statusCfg.className}`}>
                              <StatusIcon className="h-3 w-3 inline mr-1" />
                              {statusCfg.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-stone">
                            <span className="px-2 py-0.5 rounded-md bg-cream border border-cream-line font-medium">
                              {channelCfg.label}
                            </span>
                            <span>{notification.sent_at ? new Date(notification.sent_at).toLocaleString('es-CO') : 'Pendiente'}</span>
                          </div>
                          {notification.error_message && (
                            <p className="text-xs text-status-red.deep mt-2 bg-status-red/5 px-3 py-2 rounded-lg border border-status-red/10">
                              Error: {notification.error_message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsCenter;
