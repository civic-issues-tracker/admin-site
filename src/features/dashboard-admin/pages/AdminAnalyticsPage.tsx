import React from "react";
import BaseBarChart from "../../../components/ui/BaseBarChart";
import BasePieChart from "../../../components/ui/BasePieChart";

const AdminAnalyticsPage: React.FC = () => {
  const primaryColor = "#5C4033"; // Deep Brown
  const secondaryColor = "#E5D3B3"; // Sand-Gold
  
  // const [hoverData, setHoverData] = useState<{ x: number, y: number, val: string } | null>(null);

  // Monthly Report Data
  const monthlyResolutionData = [
    { name: 'Jan', reported: 45, solved: 38 },
    { name: 'Feb', reported: 52, solved: 48 },
    { name: 'Mar', reported: 38, solved: 35 },
    { name: 'Apr', reported: 65, solved: 50 },
    { name: 'May', reported: 48, solved: 42 },
  ];

  // Weekly Report
  const linePoints = [
    { day: 'Mon', val: '12k' }, { day: 'Tue', val: '18k' }, { day: 'Wed', val: '15k' },
    { day: 'Thu', val: '24k' }, { day: 'Fri', val: '20k' }, { day: 'Sat', val: '28k' }, { day: 'Sun', val: '22k' }
  ];

  return (
    <div className="p-6 md:p-10 bg-primary/10 min-h-screen font-sans text-[#5C4033] flex flex-col gap-8 overflow-hidden">
      <header className="mb-10">
        <h1 className="font-header text-4xl font-black text-secondary tracking-tighter uppercase">
          Analytics <span className="font-light">Dashboard</span>
        </h1>
        <p className="font-body text-[10px] text-secondary/40 uppercase tracking-[0.4em] mt-2 font-bold">Admin Control Center</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* 1. WEEKLY INTERACTION FLOW */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-[#E5D3B3]/10">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em]">Weekly Interaction Flow</h3>
                <div className="flex items-center gap-3 mt-2">
                   <span className="text-2xl font-black">24.8k</span>
                   <div className="flex items-center text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      <span>↑ 12.5%</span>
                   </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-[#5C4033] text-white rounded-full">Live Display</span>
                <p className="text-[9px] font-bold text-[#5C4033]/30 uppercase tracking-widest">Real-time engagement</p>
              </div>
            </div>

            <div className="h-48 relative px-2">
               <svg className="w-full h-full overflow-visible relative z-10" viewBox="0 0 100 40" preserveAspectRatio="none">
                 <path d="M 0 30 L 16 25 L 33 32 L 50 15 L 66 22 L 83 10 L 100 18" fill="none" stroke={primaryColor} strokeWidth="0.6" />
                 {[0, 16, 33, 50, 66, 83, 100].map((x, i) => (
                    <circle key={i} cx={x} cy={[30, 25, 32, 15, 22, 10, 18][i]} r="1" fill={primaryColor} />
                 ))}
               </svg>
               <div className="flex justify-between mt-6 text-[9px] font-black text-[#5C4033]/30 uppercase tracking-widest">
                  {linePoints.map(p => <span key={p.day}>{p.day}</span>)}
               </div>
            </div>
          </div>

          {/*SUB-CITIES LISTING */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-[#E5D3B3]/10">
            <h3 className="text-xs font-black uppercase tracking-[0.25em] mb-10 text-left">Subcities With Most Reports</h3>
            <div className="space-y-6">
               {[
                 { name: 'Bole Subcity', reports: 420, trend: '+12%', color: primaryColor },
                 { name: 'Arada Subcity', reports: 310, trend: '+5%', color: '#8D7060' },
                 { name: 'Kirkos Subcity', reports: 285, trend: '-2%', color: secondaryColor },
                 { name: 'Lideta Subcity', reports: 190, trend: '+8%', color: '#D2B48C' }
               ].map((city, i) => (
                 <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-6">
                       <span className="text-[10px] font-black text-[#E5D3B3]">0{i+1}</span>
                       <div>
                          <p className="text-[12px] font-black uppercase tracking-widest text-[#5C4033]">{city.name}</p>
                          <p className="text-[8px] font-bold text-[#5C4033]/30 uppercase tracking-[0.2em] text-left">Active Reports</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-8">
                       <div className="w-32 bg-[#E5D3B3]/20 h-[2px] hidden md:block rounded-full">
                          <div className="h-full" style={{ width: `${(city.reports/420)*100}%`, backgroundColor: city.color }} />
                       </div>
                       <div className="text-right min-w-[60px]">
                          <span className="text-[11px] font-black block">{city.reports}</span>
                          <span className={`text-[8px] font-bold ${city.trend.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>{city.trend}</span>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          {/*  TOP 5 ISSUES */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-[#E5D3B3]/10">
            <h3 className="text-xs font-black uppercase tracking-[0.25em] mb-10 text-left">Frequent Issue Types</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {[
                 { name: 'Pothole Repair', category: 'Infrastructure', count: 142 },
                 { name: 'Water Leakage', category: 'Utilities', count: 98 },
                 { name: 'Waste Collection', category: 'Sanitation', count: 84 },
                 { name: 'Street Lights', category: 'Power', count: 72 },
                 { name: 'Pothole Repair', category: 'Infrastructure', count: 142 },
                 { name: 'Water Leakage', category: 'Utilities', count: 98 },
                 { name: 'Waste Collection', category: 'Sanitation', count: 84 },
                 { name: 'Street Lights', category: 'Power', count: 72 },
                 { name: 'Pothole Repair', category: 'Infrastructure', count: 142 },
                 { name: 'Water Leakage', category: 'Utilities', count: 98 },
                 { name: 'Waste Collection', category: 'Sanitation', count: 84 },
                 { name: 'Street Lights', category: 'Power', count: 72 }
               ].map((issue, i) => (
                 <div key={i} className="flex items-center justify-between p-4 bg-[#FDFBF7] rounded-2xl border border-[#E5D3B3]/10">
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest">{issue.name}</p>
                       <p className="text-[8px] font-bold opacity-30 uppercase">{issue.category}</p>
                    </div>
                    <span className="text-xs font-black">{issue.count}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* MONTHLY BAR CHART  */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-[#E5D3B3]/10 h-[450px] flex flex-col">
             <div className="mb-8">
                <h3 className="text-xs font-black uppercase tracking-[0.25em]">Monthly Resolution</h3>
                <p className="text-[9px] font-bold text-[#5C4033]/30 uppercase tracking-[0.2em] mt-1">Comparison: Reported vs Solved</p>
             </div>
             
             <div className="flex-grow relative w-full">
                <BaseBarChart 
                  title=""
                  data={monthlyResolutionData}
                  dataKeys={[
                    { key: 'reported', color: primaryColor, label: 'Reported' },
                    { key: 'solved', color: secondaryColor, label: 'Solved' }
                  ]}
                />
             </div>
          </div>

          {/* TOP ISSUE AREAS  */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-[#E5D3B3]/10 flex flex-col min-h-[400px]">
            <h3 className="text-xs font-black uppercase tracking-[0.25em] text-[#5C4033] mb-10 w-full text-left">Top Issue Areas</h3>
            
            <div className="relative flex-grow flex flex-col justify-center">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 opacity-[0.03] pointer-events-none">
                <div className="absolute inset-0 border-[15px] border-[#5C4033] rounded-full" />
                <div className="absolute inset-6 border-[15px] border-[#5C4033] rounded-full" />
                <div className="absolute inset-12 border-[15px] border-[#5C4033] rounded-full" />
              </div>

              {/* Descending List of Subcities */}
              <div className="relative z-10 space-y-8">
                {[
                  { name: 'Bole', count: 420 },
                  { name: 'Arada', count: 310 },
                  { name: 'Kirkos', count: 285 },
                  { name: 'Lideta', count: 190 }
                ].map((subcity, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black text-[#E5D3B3]">0{i + 1}</span>
                      <span className="text-xs font-black uppercase tracking-widest text-[#5C4033]">
                        {subcity.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-[#5C4033]">{subcity.count}</span>
                      <span className="text-sm font-semibold text-[#5C4033]  tracking-tighter">Reports</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-[#E5D3B3]/10">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#5C4033]/50 text-center">
                Resolved Efficiency: <span className="text-[#5C4033]">92%</span>
              </p>
            </div>
          </div>

          {/* AREA DISTRIBUTION */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-[#E5D3B3]/10 flex flex-col h-full">
            <h3 className="text-xs font-black uppercase tracking-[0.25em] mb-8 text-left">Subcity Distribution</h3>
            
            {/* Flex-grow and relative positioning ensures the chart fills available space proportionally */}
            <div className="flex-grow relative min-h-[250px] w-full flex items-center justify-center">
              <BasePieChart 
                title=""
                data={[
                  { name: 'Bole', value: 35 },
                  { name: 'Arada', value: 25 },
                  { name: 'Kirkos', value: 20 },
                  { name: 'Lideta', value: 20 },
                ]}
              />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[#E5D3B3]/10 pt-6">
              {[
                { name: 'Bole', val: '35%', col: primaryColor },
                { name: 'Arada', val: '25%', col: '#8D7060' },
                { name: 'Kirkos', val: '20%', col: secondaryColor },
                { name: 'Lideta', val: '20%', col: '#D2B48C' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.col }} />
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-40">{item.name}</span>
                  </div>
                  <span className="text-[10px] font-black">{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;