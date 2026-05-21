import React, {useState} from "react";
import BaseBarChart from "../../../components/ui/BaseBarChart";
import BasePieChart from "../../../components/ui/BasePieChart"; 

const AdminAnalyticsPage: React.FC = () => {
  const primaryColor = "#5C4033"; 
  const secondaryColor = "#E5D3B3"; 
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // X-Axis Organization performance mapping for past month
  const organizationPerformanceData = [
    { name: 'Road Authority', reported: 145, solved: 122 },
    { name: 'Water Board', reported: 112, solved: 88 },
    { name: 'Electric Corp', reported: 98, solved: 95 },
    { name: 'Sanitation Dept', reported: 76, solved: 50 },
    { name: 'Telecom Unit', reported: 54, solved: 52 },
  ];

  // System Flow Line Points (Citizen Velocity Metrics: Submissions vs Dispatches)
  const linePoints = [
  { day: 'Nov', submissions: 2200, dispatches: 600 },
  { day: 'Dec', submissions: 2500, dispatches: 1000 },
  { day: 'Jan', submissions: 1900, dispatches: 1400 },
  { day: 'Feb', submissions: 2100, dispatches: 1100 },
  { day: 'Mar', submissions: 2725, dispatches: 1500 },
  { day: 'Apr', submissions: 2400, dispatches: 2100 },
  { day: 'May', submissions: 1700, dispatches: 1300 },
  { day: 'Jun', submissions: 1950, dispatches: 1150 }
];

  // Right sidebar data - Public Sector Department SLA & Escalations Ledger
  const departmentLeaderboard = [
    { name: 'Roads & Street Infrastructure', escalations: '42 active', status: '- 2.4 Days SLA', color: '#2563EB' },
    { name: 'Water Leakage & Utility Pipelines', escalations: '28 active', status: '- 4.1 Days SLA', color: '#3B82F6' },
    { name: 'Electrical Grid & Transforming', escalations: '15 active', status: '- 1.2 Days SLA', color: '#60A5FA' },
    { name: 'Waste Collection & Environmental', escalations: '34 active', status: '- 3.0 Days SLA', color: '#93C5FD' },
    { name: 'Public Safety & Hazard Response', escalations: '12 active', status: '- 0.5 Days SLA', color: '#A5F3FC' },
    { name: 'Traffic Signals & Light Control', escalations: '19 active', status: '- 1.8 Days SLA', color: '#CBD5E1' },
  ];

  return (
    <div className="p-6 md:p-8 bg-[#FDFBF7] min-h-screen font-sans text-[#5C4033] flex flex-col gap-6">
      
      {/* FIXED HEADER CONFIGURATION */}
      <header className="mb-10">
        <div className="flex justify-between">
          <div>
            <h1 className="font-header text-4xl font-black text-secondary tracking-tighter uppercase">
              Analytics <span className="font-light">Management</span>
            </h1>
            <p className="font-body text-[10px] text-secondary/40 uppercase tracking-[0.4em] mt-2 font-bold">Admin Control Center</p>
          </div>
          <button className="p-2.5 bg-white border border-[#E5D3B3]/20 rounded-xl shadow-sm hover:bg-neutral-50 transition-all">
            <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </header>
 
      {/* 2. MAIN SPLIT GRID SYSTEM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= LEFT CONTENT AREA (8 COLUMNS) ================= */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* TOP DASHBOARD METRIC ROWS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Frequently Reported Incidents */}
            <div className="bg-white rounded-[1.75rem] p-6 border border-[#E5D3B3]/10 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col justify-between min-h-[160px]">
              <div>
                <h4 className="text-[15px] font-black tracking-tight text-[#5C4033]">Frequent Incident Volumes</h4>
              </div>
              <div className="space-y-2 mt-2">
                <div>
                  <span className="text-[10px] font-medium text-neutral-400 block">Road Potholes & Cracks <span className="text-red-500 font-bold">+12% ↑</span></span>
                  <span className="text-lg font-black tracking-tight text-[#5C4033]">1,420 Active</span>
                </div>
                <div>
                  <span className="text-[10px] font-medium text-neutral-400 block">Water Pipe Leakage <span className="text-red-500 font-bold">+5% ↑</span></span>
                  <span className="text-sm font-bold text-[#5C4033]/80">980 Active</span>
                </div>
                <div>
                  <span className="text-[10px] font-medium text-neutral-400 block">Power Line Grid Failures <span className="text-green-500 font-bold">-2% ↓</span></span>
                  <span className="text-sm font-bold text-[#5C4033]/80">840 Active</span>
                </div>
              </div>
            </div>

            {/* Card 2: Subcity Performance Metrics (Targeted vs Accepted) */}
            <div className="bg-white rounded-[1.75rem] p-6 border border-[#E5D3B3]/10 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col justify-between min-h-[160px] lg:col-span-2">
              <div>
                <h4 className="text-[15px] font-black tracking-tight text-[#5C4033] mb-4">Top Subcity Load (Last Month)</h4>
              </div>
              <div className="space-y-3 pb-1">
                {/* Subcity Item 1 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-medium">
                    <span className="text-neutral-500 font-semibold">Bole Subcity</span>
                    <span className="text-[#5C4033] font-bold">960 <span className="text-neutral-600 font-normal">accepted of</span> 1,200 pr.</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-[3px] rounded-full overflow-hidden">
                    <div className="bg-secondary/90 h-full rounded-full" style={{ width: '80%' }} />
                  </div>
                </div>
                {/* Subcity Item 2 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-medium">
                    <span className="text-neutral-500 font-semibold">Yeka Subcity</span>
                    <span className="text-[#5C4033] font-bold">720 <span className="text-neutral-600 font-normal">accepted of</span> 900 pr.</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-[3px] rounded-full overflow-hidden">
                    <div className="bg-secondary/90 h-full rounded-full" style={{ width: '80%' }} />
                  </div>
                </div>
                {/* Subcity Item 3 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-medium">
                    <span className="text-neutral-500 font-semibold">Arada Subcity</span>
                    <span className="text-[#5C4033] font-bold">510 <span className="text-neutral-600 font-normal">accepted of</span> 600 pr.</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-[3px] rounded-full overflow-hidden">
                    <div className="bg-secondary/90 h-full rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN LINE CHART CONTAINER (Citizen Submission vs Action Velocity) */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-[#E5D3B3]/10 shadow-[0_4px_25px_rgba(0,0,0,0.01)] flex flex-col gap-6 select-none relative" onMouseLeave={() => setHoveredIndex(null)}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-6 text-[11px] font-bold">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#2C0901]" />
                  <span className="text-neutral-500">Citizen Submissions (Issues Reported)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#D4A373]" />
                  <span className="text-neutral-500">Active Dispatches (Crews Sent)</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-neutral-50 p-1 rounded-xl">
                <button className="p-1.5 bg-white shadow-sm rounded-lg transition-all text-[#2C0901]/80 hover:text-[#2C0901]">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 12l3-3 3 3 4-4M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Expanded Canvas Grid Area */}
            <div className="h-64 relative pt-6 w-full pl-12 pr-2">
              
              {/* DYNAMIC COMPONENT FLOATING HOVER CARD TOOLTIP */}
              {hoveredIndex !== null && (
                <div 
                  className="absolute bg-[#2C0901] text-white rounded-xl px-3 py-2 shadow-xl pointer-events-none z-30 flex flex-col gap-0.5 transition-all duration-75 ease-out font-sans"
                  style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px`, transform: 'translateX(-50%)' }}
                >
                  <span className="text-[10px] font-black opacity-60 uppercase tracking-wider">{linePoints[hoveredIndex].day} Metrics</span>
                  <div className="flex items-center gap-3 mt-0.5">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FFF9F2]" />
                      <span className="text-[11px] font-black">{linePoints[hoveredIndex].submissions.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#D4A373]" />
                      <span className="text-[11px] font-bold text-[#D4A373]">{linePoints[hoveredIndex].dispatches.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="w-1.5 h-1.5 bg-[#2C0901] rotate-45 absolute -bottom-0.5 left-1/2 -translate-x-1/2" />
                </div>
              )}

              {/* Static March Backlog Peak Tag - Renders only when not explicitly inspecting other months */}
              {hoveredIndex === null && (
                <div className="absolute top-[10%] left-[49%] -translate-x-1/2 bg-[#2C0901] text-white rounded-xl px-3 py-1.5 shadow-lg text-center z-20 flex flex-col items-center pointer-events-none">
                  <span className="text-[11px] font-bold">2,725 reports</span>
                  <span className="text-[8px] font-medium opacity-70 leading-none">March Backlog Peak</span>
                  <div className="w-1.5 h-1.5 bg-[#2C0901] rotate-45 absolute -bottom-0.5 left-1/2 -translate-x-1/2" />
                </div>
              )}

              {/* Y-Axis Scales */}
              <div className="absolute left-0 top-6 h-[calc(100%-2rem)] flex flex-col justify-between text-[10px] font-bold text-neutral-400 pointer-events-none text-right w-8">
                <span>3k</span>
                <span>2.4k</span>
                <span>1.8k</span>
                <span>1.2k</span>
                <span>600</span>
                <span>0</span>
              </div>

              {/* The SVG Graphs rendered with correct theme colors */}
              <div className="w-full h-[calc(100%-1.5rem)] relative">
                <svg className="w-full h-full overflow-visible relative z-10" viewBox="0 0 100 40" preserveAspectRatio="none">
                  
                  {/* Dynamic Vertical Guide Tracker Line on active month hover */}
                  {hoveredIndex !== null && (
                    <line 
                      x1={(hoveredIndex / (linePoints.length - 1)) * 100} 
                      y1="4" 
                      x2={(hoveredIndex / (linePoints.length - 1)) * 100} 
                      y2="36" 
                      stroke="#E5D3B3" 
                      strokeWidth="0.3" 
                      strokeDasharray="1 1" 
                    />
                  )}

                  {/* Citizen Submissions Line - Deep Coffee Brown */}
                  <path d="M 0 30 C 10 32, 12 18, 18 20 C 24 22, 26 34, 34 26 C 42 18, 48 32, 54 24 C 60 16, 68 8, 76 12 C 84 16, 88 34, 100 24" fill="none" stroke="#2C0901" strokeWidth="0.6" strokeLinecap="round" />
                  
                  {/* Active Dispatches Line - Warm Tan/Caramel */}
                  <path d="M 0 36 C 8 38, 14 30, 22 28 C 30 26, 36 34, 42 32 C 48 30, 56 16, 64 20 C 72 24, 82 36, 100 32" fill="none" stroke="#D4A373" strokeWidth="0.6" strokeLinecap="round" />
                  
                  {/* Intersecting Target Indicator dots matching the selection status */}
                  {hoveredIndex !== null ? (
                    <g>
                      <circle cx={(hoveredIndex / (linePoints.length - 1)) * 100} cy={36 - ((linePoints[hoveredIndex].submissions / 3000) * 32)} r="0.9" fill="#2C0901" stroke="white" strokeWidth="0.25" />
                      <circle cx={(hoveredIndex / (linePoints.length - 1)) * 100} cy={36 - ((linePoints[hoveredIndex].dispatches / 3000) * 32)} r="0.9" fill="#D4A373" stroke="white" strokeWidth="0.25" />
                    </g>
                  ) : (
                    <g>
                      <circle cx="53" cy="23.5" r="0.8" fill="#2C0901" stroke="white" strokeWidth="0.3" className="animate-ping" />
                      <circle cx="53" cy="23.5" r="0.5" fill="#2C0901" stroke="white" strokeWidth="0.15" />
                    </g>
                  )}
                </svg>

                {/* INVISIBLE MOUSE INTERACTION TRACKING OVERLAY */}
                <div className="absolute inset-0 flex z-20">
                  {linePoints.map((_, idx) => (
                    <div
                      key={`slice-trigger-${idx}`}
                      className="h-full w-full cursor-pointer"
                      onMouseMove={(e) => {
                        const bounds = e.currentTarget.parentElement!.getBoundingClientRect();
                        setTooltipPos({
                          x: e.clientX - bounds.left,
                          y: e.clientY - bounds.top - 75
                        });
                        setHoveredIndex(idx);
                      }}
                      onMouseEnter={() => setHoveredIndex(idx)}
                    />
                  ))}
                </div>
              </div>
              
              {/* X-Axis Timeline */}
              <div className="flex justify-between items-center mt-3 text-[10px] font-bold text-neutral-400/80">
                {linePoints.map((p, idx) => (
                  <span 
                    key={p.day} 
                    className={`w-full text-center transition-all duration-200 ${hoveredIndex === idx ? 'text-[#2C0901] scale-110 font-black' : ''}`}
                  >
                    {p.day}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* LOWER BAR CHART: Organization Distribution Level */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-[#E5D3B3]/10 shadow-[0_4px_25px_rgba(0,0,0,0.01)] flex flex-col gap-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-[#5C4033]">Organizational Triage Volume</h3>
              <p className="text-[10px] font-medium opacity-40 mt-0.5">Issues accepted vs successfully solved by assigned public offices over the past month</p>
            </div>
            
            {/* FIXED: Added a strict, safe utility height class (h-56 = 224px) directly on the chart wrapper */}
            <div className="w-full h-56 mt-2 relative">
              <BaseBarChart 
                title=""
                data={organizationPerformanceData}
                dataKeys={[
                  { key: 'reported', color: primaryColor, label: 'Accepted Issues' },
                  { key: 'solved', color: secondaryColor, label: 'Solved Issues' }
                ]}
              />
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDEBAR DATA (4 COLUMNS) ================= */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          <div className="bg-white rounded-[2.5rem] p-8 border border-[#E5D3B3]/10 shadow-[0_4px_25px_rgba(0,0,0,0.01)] flex flex-col gap-6">
            
            <div>
              <h3 className="text-[13px] font-black tracking-tight text-[#5C4033]">Top Categories</h3>
            </div>

            {/* Rendered Direct SVG Pie Viewport Container */}
            <div className="relative min-h-[180px] w-full flex items-center justify-center">
              <BasePieChart />
            </div>

            {/* DEPARTMENT ACTION METRIC LIST */}
            <div className="pt-2 font-sans select-none">
              <div className="flex justify-between items-center mb-4">
                {/* Boosted size slightly for a cleaner hierarchy */}
                <h4 className="text-[13px] font-black tracking-widest uppercase text-[#2C0901]">Department Standings</h4>
                <span className="text-[11px] font-bold text-neutral-400 cursor-pointer transition-colors hover:text-[#2C0901]">View SLA</span>
              </div>
              
              {/* Expanded spacing between items from space-y-3.5 to space-y-4 */}
              <div className="space-y-4">
                {departmentLeaderboard.map((item, i) => {
                  // OVERRIDE BLUE COLORS: Mapping the list indices perfectly to your Donut chart colors
                  // 0: Dark Coffee, 1: Medium Brown, 2: Warm Tan, 3: Soft Cream
                  const themeColors = ['#2C0901', '#A07156', '#D4A373', '#FFF9F2'];
                  const assignedColor = themeColors[i % themeColors.length];

                  return (
                    <div key={i} className="flex items-center justify-between group py-2 border-b border-neutral-100/40 last:border-0 transition-all duration-150">
                      <div className="flex items-center gap-3.5">
                        {/* Dynamic round dot indicator explicitly updated to match coffee donut chart */}
                        <div 
                          className="w-3 h-3 rounded-full shrink-0 shadow-sm border border-black/5"
                          style={{ backgroundColor: assignedColor }}
                        />
                        <div className="flex flex-col gap-0.5">
                          {/* Increased text size from 11px to 13px */}
                          <span className="text-[13px] font-extrabold text-[#2C0901]/90 tracking-tight group-hover:text-[#2C0901] truncate max-w-[180px] lg:max-w-[140px] xl:max-w-[190px]">
                            {item.name}
                          </span>
                          {/* Increased text size from 9px to 11px */}
                          <span className="text-[11px] font-medium text-neutral-400 leading-tight">
                            {item.escalations}
                          </span>
                        </div>
                      </div>
                      
                      {/* Increased status text size from 11px to 13px */}
                      <span className="text-[13px] font-black text-right tracking-tight text-[#2C0901]">
                        {item.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminAnalyticsPage;