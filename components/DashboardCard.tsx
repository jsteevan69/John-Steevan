
import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subText?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, subText, icon, trend, loading }) => {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 bg-slate-100 rounded-lg animate-pulse"></div>
          <div className="w-16 h-5 bg-slate-100 rounded-full animate-pulse"></div>
        </div>
        <div>
          <div className="h-3 bg-slate-100 rounded w-1/2 mb-2 animate-pulse"></div>
          <div className="h-8 bg-slate-200 rounded w-3/4 mb-2 animate-pulse"></div>
          <div className="h-2 bg-slate-100 rounded w-1/3 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between transition-all hover:shadow-md h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            trend === 'up' ? 'bg-green-100 text-green-700' : 
            trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
          }`}>
            {trend === 'up' ? '↑ Rising' : trend === 'down' ? '↓ Falling' : '• Stable'}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="text-xs text-gray-400 mt-1">{subText}</p>
      </div>
    </div>
  );
};

export default DashboardCard;
