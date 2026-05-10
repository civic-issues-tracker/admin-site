import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ChartData {
  name: string;
  [key: string]: string | number; 
}

interface BaseBarChartProps {
  data: ChartData[];
  title?: string;
  dataKeys: { key: string; color: string; label: string }[];
}

const BaseBarChart: React.FC<BaseBarChartProps> = ({ data, title, dataKeys }) => (
  <div className="w-full h-full p-4 md:p-6">
    {title && <h3 className="text-[10px] md:text-sm font-black text-secondary uppercase tracking-tighter mb-4 md:mb-6 text-center">{title}</h3>}
    <div className="h-62.5 md:h-75 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          margin={{ top: 10, right: 10, left: window.innerWidth < 768 ? -25 : -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#5C4033', fontSize: 9, fontWeight: 'bold' }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#5C4033', fontSize: 9 }} 
          />
          <Tooltip cursor={{fill: 'transparent'}} />
          <Legend 
            verticalAlign="bottom" 
            iconType="rect" 
            wrapperStyle={{ fontSize: '9px', textTransform: 'uppercase', fontWeight: 'bold', paddingTop: '15px' }} 
          />
          
          {dataKeys.map((item) => (
            <Bar 
              key={item.key} 
              dataKey={item.key} 
              fill={item.color} 
              radius={[4, 4, 0, 0]} 
              barSize={window.innerWidth < 768 ? 8 : 12} 
              name={item.label} 
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default BaseBarChart;