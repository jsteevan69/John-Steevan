
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { YieldDataPoint } from '../types';

interface YieldChartProps {
  data: YieldDataPoint[];
  loading?: boolean;
}

const YieldChart: React.FC<YieldChartProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="w-full h-[350px] relative overflow-hidden bg-white border border-slate-100 rounded-2xl p-6">
        {/* Skeleton Grid */}
        <div className="absolute inset-x-12 inset-y-12 flex flex-col justify-between opacity-20">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-full h-[1px] bg-slate-300"></div>
          ))}
        </div>
        {/* Skeleton Chart Lines - simulating lines with skewed pulses */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-4/5 h-1/2">
            <div className="absolute top-1/4 left-0 w-full h-[3px] bg-blue-100/50 rounded-full animate-pulse rotate-[2deg] origin-left"></div>
            <div className="absolute top-1/2 left-0 w-full h-[3px] bg-violet-100/50 rounded-full animate-pulse rotate-[-1deg] origin-left"></div>
            <div className="absolute top-3/4 left-0 w-full h-[3px] bg-emerald-100/50 rounded-full animate-pulse rotate-[1deg] origin-left"></div>
          </div>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-slate-300 text-[10px] font-bold uppercase tracking-widest animate-pulse">
          Fetching market trends...
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[350px] bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
        <p className="text-slate-400 text-sm font-medium">No trend data available.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            dx={-10}
            domain={['auto', 'auto']}
            unit="%"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' 
            }}
            labelStyle={{ color: '#64748b', fontWeight: 'bold', marginBottom: '4px' }}
          />
          <Legend 
            verticalAlign="top" 
            align="right" 
            height={36} 
            iconType="circle"
            wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}
          />
          <Line 
            type="monotone" 
            dataKey="91-Day" 
            stroke="#3b82f6" 
            strokeWidth={3} 
            dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} 
            activeDot={{ r: 6 }} 
            name="91-Day T-Bill"
          />
          <Line 
            type="monotone" 
            dataKey="182-Day" 
            stroke="#8b5cf6" 
            strokeWidth={3} 
            dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} 
            activeDot={{ r: 6 }} 
            name="182-Day T-Bill"
          />
          <Line 
            type="monotone" 
            dataKey="364-Day" 
            stroke="#10b981" 
            strokeWidth={3} 
            dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} 
            activeDot={{ r: 6 }} 
            name="364-Day T-Bill"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default YieldChart;
