import React, { useState, useEffect } from 'react';
import { Loader2, MessageSquare, Check, X, Clock, Mail } from 'lucide-react';
import { api } from '../../services/api';

const NotificationsCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const data = await api.get('/admin/notifications');
        setNotifications(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'bg-[#EEF5EE] text-[#3E6B3E]';
      case 'failed': return 'bg-[#FBEAEA] text-[#8B2E2E]';
      case 'pending': return 'bg-[#FBF3E4] text-[#8B6A22]';
      default: return 'bg-[#F1EFEB] text-[#6B6459]';
    }
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#A9812E]" /></div>;

  return (
    <div className="bg-white border border-[#E4DCC9] rounded-sm p-6">
      <h3 className="font-serif text-xl text-[#1C1A16] mb-6">Centro de Notificaciones</h3>
      {error && <div className="bg-[#FBEAEA] border border-[#E3B8B8] text-[#8B2E2E] px-4 py-3 rounded-sm text-sm mb-4">{error}</div>}
      <div className="space-y-3">
        {notifications.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-[#D8D3C7] mx-auto mb-4" />
            <p className="text-[#6B6459] text-sm">No hay notificaciones registradas.</p>
            <p className="text-[#B7B1A3] text-xs mt-2">Las notificaciones de WhatsApp y email se mostrarán aquí una vez que el backend las registre.</p>
          </div>
        )}
        {notifications.map((notification) => (
          <div key={notification.id} className="border border-[#E4DCC9] rounded-sm p-4 flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#F6F2EA] rounded-sm">
                {getChannelIcon(notification.channel)}
              </div>
              <div>
                <p className="text-sm text-[#1C1A16] font-medium">{notification.recipient}</p>
                <p className="text-xs text-[#6B6459] mt-1">Canal: {notification.channel}</p>
                <p className="text-xs text-[#B7B1A3] mt-1">{notification.sent_at ? new Date(notification.sent_at).toLocaleString('es-CO') : 'Pendiente'}</p>
                {notification.error_message && <p className="text-xs text-[#C25555] mt-1">Error: {notification.error_message}</p>}
              </div>
            </div>
            <span className={`px-3 py-1 rounded-sm text-xs font-medium ${getStatusColor(notification.status)}`}>
              {notification.status === 'sent' ? 'Enviada' : notification.status === 'failed' ? 'Fallida' : 'Pendiente'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsCenter;
