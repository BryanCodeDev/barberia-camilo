import React from 'react';
import { Calendar, Clock, Check, AlertTriangle, User, DollarSign } from 'lucide-react';

const STAT_STYLES = {
  total: {
    card: 'bg-gradient-to-br from-status-blue/10 to-status-blue/5 border-status-blue/20',
    label: 'text-status-blue.deep',
    value: 'text-ink-soft',
    icon: 'bg-status-blue text-white',
  },
  pending: {
    card: 'bg-gradient-to-br from-status-amber/10 to-status-amber/5 border-status-amber/20',
    label: 'text-status-amber.deep',
    value: 'text-ink-soft',
    icon: 'bg-status-amber text-ink',
  },
  confirmed: {
    card: 'bg-gradient-to-br from-status-green/10 to-status-green/5 border-status-green/20',
    label: 'text-status-green.deep',
    value: 'text-ink-soft',
    icon: 'bg-status-green text-white',
  },
  completed: {
    card: 'bg-gradient-to-br from-status-blue/10 to-status-blue/5 border-status-blue/20',
    label: 'text-status-blue.deep',
    value: 'text-ink-soft',
    icon: 'bg-status-blue text-white',
  },
  cancelled: {
    card: 'bg-gradient-to-br from-status-red/10 to-status-red/5 border-status-red/20',
    label: 'text-status-red.deep',
    value: 'text-ink-soft',
    icon: 'bg-status-red text-white',
  },
  today: {
    card: 'bg-gradient-to-br from-gold/10 to-gold/5 border-gold/20',
    label: 'text-gold-deep',
    value: 'text-ink-soft',
    icon: 'bg-gold text-ink',
  },
};

const StatsCards = ({ stats, loading }) => {
  const items = [
    { label: 'Total Citas', value: stats.total, styleKey: 'total', icon: Calendar },
    { label: 'Pendientes', value: stats.pending, styleKey: 'pending', icon: Clock },
    { label: 'Confirmadas', value: stats.confirmed, styleKey: 'confirmed', icon: Check },
    { label: 'Completadas', value: stats.completed, styleKey: 'completed', icon: Check },
    { label: 'Canceladas', value: stats.cancelled, styleKey: 'cancelled', icon: AlertTriangle },
    { label: 'Citas Hoy', value: stats.today, styleKey: 'today', icon: User },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {items.map((stat, index) => {
        const style = STAT_STYLES[stat.styleKey];
        return (
          <div
            key={index}
            className={[
              'kpi-card group hover:-translate-y-0.5 transition-all duration-200',
              style.card,
            ].join(' ')}
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-xl ${style.icon} shadow-sm transition-transform duration-200 group-hover:scale-105`}>
                <stat.icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
            <div>
              <p className={`text-xs font-medium mb-1 ${style.label}`}>{stat.label}</p>
              <p className={`text-xl sm:text-2xl lg:text-3xl font-serif ${style.value} group-hover:text-gold-deep transition-colors duration-300`}>
                {loading ? (
                  <span className="inline-block w-8 h-6 skeleton-pulse rounded" />
                ) : (
                  stat.value
                )}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;