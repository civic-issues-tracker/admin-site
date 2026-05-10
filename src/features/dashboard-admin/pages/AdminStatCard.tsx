import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface AdminStatCardProps {
  title: string;
  value: string;
  change: string;
  isUp: boolean;
  timeframe: string;
}

const AdminStatCard: React.FC<AdminStatCardProps> = ({ title, value, change, isUp, timeframe }) => {
  return (
    <div className="bg-white p-4 md:p-6 rounded-4xl md:rounded-4xl shadow-sm border border-secondary/5 flex flex-col gap-3 md:gap-4 transition-all">
      <p className="text-[9px] md:text-[10px] font-bold text-secondary/40 uppercase tracking-[0.2em]">
        {title}
      </p>

      <h3 className="text-2xl md:text-4xl font-black text-secondary tracking-tighter">
        {value}
      </h3>

      <div className="flex flex-wrap items-center gap-2 mt-auto">
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${
          isUp ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
        }`}>
          {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {change}
        </div>
        <span className="text-[9px] font-bold text-secondary/20 uppercase tracking-widest whitespace-nowrap">
          {timeframe}
        </span>
      </div>
    </div>
  );
};

export default AdminStatCard;