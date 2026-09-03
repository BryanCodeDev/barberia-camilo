import React, { useEffect } from 'react';
import { Clock, TrendingUp, TrendingDown, Ticket, CalendarCheck, Wallet } from 'lucide-react';
import StatsCards from './StatsCards';
import BarberAgenda from './BarberAgenda';
import useWebSocket from '../../hooks/useWebSocket';

const DashboardView = ({
  userRole,
  username,
  stats,
  statsLoading,
  revenuePeriod,
  setRevenuePeriod,
  revenueData,
  revenueLoading,
  formatCOP,
  formatPeriodLabel,
  onRefresh,
}) => {
  const { subscribe } = useWebSocket(null);

  useEffect(() => {
    const events = [
      'appointment:created',
      'appointment:updated',
      'appointment:status-changed',
      'appointment:cancelled',
      'appointment:deleted',
    ];
    const unsubscribers = events.map((event) =>
      subscribe(event, () => {
        if (typeof onRefresh === 'function') {
          onRefresh();
        }
      })
    );
    return () => {
      unsubscribers.forEach((unsub) => unsub && unsub());
    };
  }, [subscribe, onRefresh]);
  const expectedRevenue = revenueData?.current?.confirmed_revenue_cents || 0;
  const actualRevenue = revenueData?.current?.completed_revenue_cents || 0;

  return (
    <div className="space-y-6 animate-fade-in" key="dashboard">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="section-title">{userRole === 'barber' ? 'Mi Resumen' : 'Resumen del Negocio'}</h2>
          <p className="text-sm text-stone mt-1">{userRole === 'barber' ? 'Tus metricas y agenda del dia' : 'Metricas clave, rendimiento reciente y agenda del dia'}</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={revenuePeriod}
            onChange={(e) => setRevenuePeriod(e.target.value)}
            className="px-3 py-2 border border-cream-line rounded-xl text-sm bg-white focus:ring-2 focus:ring-gold/30 focus:border-gold outline-none transition-all duration-200 text-ink-soft"
          >
            <option value="total">Total</option>
            <option value="today">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {[
          {
            label: 'Ingresos confirmados',
            sublabel: formatPeriodLabel(revenuePeriod),
            value: revenueLoading ? '...' : formatCOP(expectedRevenue),
            icon: Wallet,
            accent: 'from-status-amber/10 to-status-amber/5',
            iconBg: 'bg-status-amber/15 text-status-amber.deep',
            delay: 0,
          },
          {
            label: 'Ingresos completados',
            sublabel: formatPeriodLabel(revenuePeriod),
            value: revenueLoading ? '...' : formatCOP(actualRevenue),
            icon: TrendingUp,
            accent: 'from-status-green/10 to-status-green/5',
            iconBg: 'bg-status-green/15 text-status-green.deep',
            delay: 50,
          },
          {
            label: 'Ticket promedio',
            sublabel: formatPeriodLabel(revenuePeriod),
            value: revenueLoading ? '...' : formatCOP(revenueData?.current?.average_ticket_cents),
            icon: Ticket,
            accent: 'from-status-blue/10 to-status-blue/5',
            iconBg: 'bg-status-blue/15 text-status-blue.deep',
            delay: 100,
          },
          {
            label: 'Citas periodo anterior',
            sublabel: '',
            value: revenueLoading ? '...' : (revenueData?.previous?.appointments ?? 0),
            icon: Clock,
            accent: 'from-stone-faint/30 to-stone-faint/10',
            iconBg: 'bg-stone-faint/30 text-stone',
            delay: 150,
          },
        ].map((kpi, index) => (
          <div
            key={index}
            className={[
              'kpi-card group hover:-translate-y-0.5 transition-all duration-200',
              `bg-gradient-to-br ${kpi.accent}`,
            ].join(' ')}
            style={{ animationDelay: `${kpi.delay}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${kpi.iconBg} shadow-sm transition-transform duration-200 group-hover:scale-105`}>
                <kpi.icon className="h-5 w-5" />
              </div>
              {index === 0 && revenueData && revenueData.change_percent !== null && (
                <div className={[
                  'flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg',
                  revenueData.change_percent >= 0
                    ? 'bg-status-green/10 text-status-green.deep'
                    : 'bg-status-red/10 text-status-red.deep'
                ].join(' ')}>
                  {revenueData.change_percent >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>{Math.abs(revenueData.change_percent).toFixed(1)}%</span>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-stone mb-1">{kpi.label}</p>
              <p className="text-2xl sm:text-3xl font-serif text-ink-soft group-hover:text-gold-deep transition-colors duration-300">
                {kpi.value}
              </p>
              {kpi.sublabel && (
                <p className="text-xs text-stone-faint mt-1.5">vs. periodo anterior</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="card-premium p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-status-blue/10 rounded-xl">
            <CalendarCheck className="h-5 w-5 text-status-blue.deep" />
          </div>
          <div>
            <h3 className="font-serif text-lg text-ink-soft">Estado de Citas</h3>
            <p className="text-xs text-stone">Resumen general del dia</p>
          </div>
        </div>
        <StatsCards stats={stats} loading={statsLoading} />
      </div>

      <BarberAgenda userRole={userRole} username={username} />
    </div>
  );
};

export default DashboardView;