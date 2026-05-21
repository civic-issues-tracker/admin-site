import React, { useEffect, useState } from "react";

interface PieData {
  name: string;
  value: number;
  color: string;
}

interface BasePieChartProps {
  data?: PieData[]; 
}

const BasePieChart: React.FC<BasePieChartProps> = ({ data: overridingData }) => {
  // Balanced data parameters mapping exactly to the layout regions
  const [chartData, setChartData] = useState<PieData[]>([
    { name: 'Power Grid Infrastructure', value: 40, color: '#2C0901' }, 
    { name: 'Roads & Bridges', value: 25, color: '#A06A50' },          
    { name: 'Water Supply', value: 20, color: '#D4A373' },             
    { name: 'Telecomm. Networks', value: 15, color: '#FAEDCD' },        
  ]);

  useEffect(() => {
    if (overridingData) {
      setChartData(overridingData);
    }
  }, [overridingData]);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  // Setup dimension parameters for a clean, high-fidelity SVG viewport coordinate grid
  const size = 200;
  const center = size / 2;
  const outerRadius = 90;
  const innerRadius = 55;

  // Track operational cumulative angles
  let currentAngle = 0;

  // Custom sort to ensure the slider legend below reads: Telecomm -> Water -> Roads -> Power Grid
  const legendOrder = chartData && chartData.length > 0 
  ? [...chartData] 
  : [
      { name: 'Telecomm.', value: 0, color: '#FAEDCD' },
      { name: 'Water Supply', value: 0, color: '#D4A373' },
      { name: 'Roads & Bridges', value: 0, color: '#A06A50' },
      { name: 'Power Grid', value: 0, color: '#2C0901' },
    ];

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-[320px] mx-auto select-none">
      
      {/* 1. PIE CHART CONTAINER WITH INTERIOR DEPTH GLOW */}
      <div className="relative w-52 h-52 flex items-center justify-center rounded-full bg-[#FDFBF7] shadow-[inset_0_2px_8px_rgba(44,9,1,0.02),0_10px_35px_rgba(212,163,115,0.12)]">
        
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full overflow-visible relative z-10">
          {chartData.map((item, index) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0;
            const angleExtent = (percentage / 100) * 360;

            // Compute structural geometry coordinate points for the current slice path arc
            const startAngleRad = ((currentAngle - 90) * Math.PI) / 180;
            const endAngleRad = ((currentAngle + angleExtent - 90) * Math.PI) / 180;

            // Outer sector path limits
            const xOStart = center + outerRadius * Math.cos(startAngleRad);
            const yOStart = center + outerRadius * Math.sin(startAngleRad);
            const xOEnd = center + outerRadius * Math.cos(endAngleRad);
            const yOEnd = center + outerRadius * Math.sin(endAngleRad);

            // Inner sector path limits
            const xIStart = center + innerRadius * Math.cos(startAngleRad);
            const yIStart = center + innerRadius * Math.sin(startAngleRad);
            const xIEnd = center + innerRadius * Math.cos(endAngleRad);
            const yIEnd = center + innerRadius * Math.sin(endAngleRad);

            const largeArcFlag = angleExtent > 180 ? 1 : 0;

            // SVG Path command string drawing clean closed wedge paths
            const pathData = `
              M ${xIStart} ${yIStart}
              L ${xOStart} ${yOStart}
              A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${xOEnd} ${yOEnd}
              L ${xIEnd} ${yIEnd}
              A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${xIStart} ${yIStart}
              Z
            `.trim();

            // Calculate center point of the slice region to anchor the text labels
            const midAngleRad = ((currentAngle + angleExtent / 2 - 90) * Math.PI) / 180;
            const labelRadius = innerRadius + (outerRadius - innerRadius) / 2;
            const textX = center + labelRadius * Math.cos(midAngleRad);
            const textY = center + labelRadius * Math.sin(midAngleRad);

            // Increment the angle for the next loop iteration
            currentAngle += angleExtent;

            const isLightBackground = item.name.includes("Telecomm");

            return (
              <g key={`segment-${index}`} className="group">
                {/* Solid Vector Path Sector */}
                <path
                  d={pathData}
                  fill={item.color}
                  className="transition-all duration-300 hover:opacity-95 cursor-pointer"
                />
                
                {/* Center Anchored Floating Label Text */}
                <text
                    x={textX}
                    y={textY}
                    fill={isLightBackground ? "#2C0901" : "#FFFFFF"}
                    fontSize="10" 
                    fontWeight="900"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="pointer-events-none font-sans tracking-tight"
                  >
                    {(item as any).displayPercentage ?? Math.round(item.value || 0)}%
                  </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 2. THE HORIZONTAL LEGEND SCROLL BLOCK */}
      <div className="w-full bg-[#ffffff] border border-[#E5D3B3]/25 py-3 px-5 rounded-full shadow-[0_4px_20px_rgba(44,9,1,0.03)] flex items-center justify-between">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-0.5 w-full pr-2">
          {legendOrder.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 shrink-0">
              <div className="w-2.5 h-2.5 relative overflow-hidden shrink-0">
                <div 
                  className="w-5 h-5 rounded-full absolute -top-1.25 -left-1.25"
                  style={{ 
                    backgroundColor: item.color,
                    clipPath: 'polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%)' 
                  }}
                />
              </div>
              <span className="text-[10px] font-black text-[#2C0901]/80 tracking-tight font-sans whitespace-nowrap">
                {item.name}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col text-[8px] font-bold text-[#A06A50]/40 border-l border-[#E5D3B3]/40 pl-2.5 leading-none shrink-0">
          <span>↖</span>
          <span>↙</span>
        </div>
      </div>

      {/* API DATA CALL DOCUMENTATION (COMMENTED OUT REUSABLE BLOCK)
      useEffect(() => {
        if (overridingData) return;
        
        const loadInfrastructureMetrics = async () => {
          try {
            const res = await fetch("https://api.yourdomain.com/v1/metrics");
            const dataPayload = await res.json();
            setChartData(dataPayload.data);
          } catch (err) {
            console.error("API Fetch error:", err);
          }
        };
        loadInfrastructureMetrics();
      }, [overridingData]);
      */}

    </div>
  );
};

export default BasePieChart;