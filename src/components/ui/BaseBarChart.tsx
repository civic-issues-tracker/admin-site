import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ChartData {
  name: string;
  [key: string]: string | number; 
}

interface BaseBarChartProps {
  data: ChartData[];
  title?: string;
  height?: number; // Optional prop so it doesn't break if passed from parent containers
  dataKeys: { key: string; color: string; label: string }[];
}

const BaseBarChart: React.FC<BaseBarChartProps> = ({ data, title, dataKeys }) => {
  return (
    <div className="w-full h-full select-none font-sans">
      {title && (
        <h3 className="text-[10px] md:text-sm font-black text-secondary uppercase tracking-tighter mb-2 text-center">
          {title}
        </h3>
      )}
      
      <div className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
          >
            {/* Soft, low-contrast horizontal dividing grid matrices */}
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5D3B3/20" opacity={0.3} />
            
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#2C0901', fontSize: 10, fontWeight: '700' }} 
              dy={5}
            />
            
            {/* Added a controlled width to prevent numbers from clipping off-canvas */}
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              width={28}
              tick={{ fill: '#2C0901', fontSize: 10, fontWeight: '600', opacity: 0.5 }} 
            />
            
            {/* Custom high-fidelity styled Tooltip matching your dashboard layout aesthetics */}
            <Tooltip 
              cursor={{ fill: '#E5D3B3', opacity: 0.1 }} 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#2C0901] text-white p-3 rounded-xl shadow-xl border border-[#E5D3B3]/10 flex flex-col gap-1 text-[11px] font-sans pointer-events-none">
                      <p className="font-black opacity-60 uppercase text-[9px] tracking-wider mb-0.5">
                        {payload[0].payload.name}
                      </p>
                      {payload.map((p, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                          <span className="font-medium text-neutral-300">{p.name}:</span>
                          <span className="font-black text-white">{Number(p.value).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            
            <Legend 
              verticalAlign="bottom" 
              iconType="circle" 
              iconSize={6}
              wrapperStyle={{ 
                fontSize: '9px', 
                textTransform: 'uppercase', 
                fontWeight: '800', 
                paddingTop: '12px',
                color: '#2C0901'
              }} 
            />
            
            {dataKeys.map((item) => (
              <Bar 
                key={item.key} 
                dataKey={item.key} 
                fill={item.color} 
                radius={[4, 4, 0, 0]} 
                barSize={12} 
                name={item.label} 
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BaseBarChart;