import React from 'react';
import { Calendar, Clock, Check, AlertTriangle, User } from 'lucide-react';

const STAT_STYLES = {
  blue: { card: 'bg-[#EEF3FB] border-[#C9D9F0]', label: 'text-[#3B5B8C]', value: 'text-[#1E3352]', icon: 'bg-[#3B5B8C]' },
  yellow: { card: 'bg-[#FBF3E4] border-[#EAD9AE]', label: 'text-[#8B6A22]', value: 'text-[#4A3812]', icon: 'bg-[#A9812E]' },
  green: { card: 'bg-[#EEF5EE] border-[#C7DEC7]', label: 'text-[#3E6B3E]', value: 'text-[#274627]', icon: 'bg-[#4E7A4E]' },
  amber: { card: 'bg-[#FBF3E4] border-[#EAD9AE]', label: 'text-[#8B6A22]', value: 'text-[#4A3812]', icon: 'bg-[#A9812E]' },
};

const StatsCards = ({ stats, loading }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5 mb-8">
      {[
        { label: 'Total Citas', value: stats.total, color: 'blue', icon: Calendar },
        { label: 'Pendientes', value: stats.pending, color: 'yellow', icon: Clock },
        { label: 'Confirmadas', value: stats.confirmed, color: 'green', icon: Check },
        { label: 'Canceladas', value: stats.cancelled, color: 'amber', icon: AlertTriangle },
        { label: 'Hoy', value: stats.today, color: 'blue', icon: User },
      ].map((stat, index) => {
        const style = STAT_STYLES[stat.color];
        return (
          <div key={index} className={`p-4 sm:p-6 rounded-sm border ${style.card}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium mb-1 ${style.label}`}>{stat.label}</p>
                <p className={`text-2xl sm:text-3xl font-serif ${style.value}`}>{loading ? '...' : stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${style.icon}`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
