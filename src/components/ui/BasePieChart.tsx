import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PieData {
  name: string;
  value: number;
}

interface BasePieChartProps {
  data: PieData[];
  title?: string;
  colors?: string[];
}

const DEFAULT_COLORS = ['#5C4033', '#8B5E3C', '#BC8F8F', '#E5D3B3', '#F5F5F5'];

const BasePieChart: React.FC<BasePieChartProps> = ({ 
  data, 
  title, 
  colors = DEFAULT_COLORS 
}) => {
  return (
    <div className="w-full h-full p-4 md:p-6 flex flex-col">
      {title && (
        <h3 className="text-[10px] md:text-sm font-black text-secondary uppercase tracking-tighter mb-4 text-center">
          {title}
        </h3>
      )}
      <div className="h-62.5 md:h-75 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={window.innerWidth < 768 ? 50 : 70}
              outerRadius={window.innerWidth < 768 ? 80 : 100}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
            />
            <Legend 
              verticalAlign="bottom" 
              iconType="circle" 
              wrapperStyle={{ fontSize: '9px', textTransform: 'uppercase', fontWeight: 'bold', paddingTop: '10px' }} 
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BasePieChart;