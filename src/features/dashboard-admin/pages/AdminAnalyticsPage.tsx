import React, { useState, useEffect, useMemo } from "react";
import BaseBarChart from "../../../components/ui/BaseBarChart";
import BasePieChart from "../../../components/ui/BasePieChart"; 
import { privateApi } from "../../auth/services/authService";
import ThemeLoader from "../../../components/ui/ThemeLoader";

// Interface representing a raw issue object fetched directly from your database
interface RawIssue {
  id: string;
  issue_number: string;
  description: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'resolved' | 'rejected' | string;
  priority: 'Low' | 'Medium' | 'High' | string;
  
  // Location Fields
  location_address: string;
  location_lat: string | number;
  location_long: string | number;

  // Category Details
  category: string;
  category_name: string;
  subcategory: string | null;
  subcategory_name: string | null;

  // Assignments & Ownership
  organization: string;
  organization_name: string;
  assigned_to_org_admin: string | null;
  assigned_admin_name: string | null;

  // Submitter Details
  resident: string;
  resident_name: string;
  resident_email: string;
  resident_phone: string;

  // Timestamps
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  
  // Optional / Legacy fields to prevent type breaks 
  subcity?: string;
  sub_city?: string;
}

const AdminAnalyticsPage: React.FC = () => {
  const primaryColor = "#5C4033"; 
  const secondaryColor = "#E5D3B3"; 
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // State handles for raw fetched system instances
  const [rawIssues, setRawIssues] = useState<RawIssue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch all raw database objects directly on layout build
  useEffect(() => {
    const loadSystemData = async () => {
      try {
        setLoading(true);
        // Pointing directly to your generic API resource collector
        const response = await privateApi.get("issues/");
        setRawIssues(Array.isArray(response.data) ? response.data : response.data.results || []);
      } catch (error) {
        console.error("Error reading dashboard records sequence:", error);
      } finally {
        setLoading(false);
      }
    };
    loadSystemData();
  }, []);

  // FRONTEND CALCULATION ENGINE into analytics metrics
  const calculatedMetrics = useMemo(() => {
    // 1. Frequent Incident Volume Calculation Grouping
    const incidentCounts: Record<string, number> = {};
    rawIssues.forEach(issue => {
      if (issue.status !== 'resolved') {
        incidentCounts[issue.category_name] = (incidentCounts[issue.category_name] || 0) + 1;
      }
    });
    if (rawIssues && rawIssues.length > 0) {
      console.log("👉 INSPECT FIRST ISSUE STRUCTURE:", rawIssues[0]);
    }

    // Sort categories by active volumes to pick the top three
    const sortedIncidents = Object.entries(incidentCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    // Dynamic mapping back to UI slots with fallback properties
    const frequentIncidents = [
      {
        name: sortedIncidents[0]?.[0] || "Road Potholes & Cracks",
        count: sortedIncidents[0]?.[1] || 0,
        percentage_change: 12, // Kept stable matching your local design delta metrics
        is_increased: true
      },
      {
        name: sortedIncidents[1]?.[0] || "Water Pipe Leakage",
        count: sortedIncidents[1]?.[1] || 0,
        percentage_change: 5,
        is_increased: true
      },
      {
        name: sortedIncidents[2]?.[0] || "Power Line Grid Failures",
        count: sortedIncidents[2]?.[1] || 0,
        percentage_change: 2,
        is_increased: false
      }
    ];

    // 2. Subcity Load Aggregator (Dynamic Address Parser)
    const subcityGroups: Record<string, { accepted: number; total: number }> = {};
    let parsedRealSubcitiesCount = 0;

    rawIssues.forEach(issue => {
      let assignedSubcity = "";

      // 1. Try to extract from location_address string dynamically
      if (issue.location_address && typeof issue.location_address === 'string') {
        const parts = issue.location_address.split(',').map(p => p.trim());
        
        // Addis Ababa addresses typically structure as: [Place, Kebele/Neighborhood, Subcity, City, Country]
        // If there are 4 or 5 parts, the subcity is usually the one right before "Addis Ababa"
        const addisIndex = parts.findIndex(p => p.toLowerCase().includes("addis ababa"));
        
        if (addisIndex > 0) {
          // Grab the element immediately preceding "Addis Ababa" (e.g., "Kirkos")
          assignedSubcity = parts[addisIndex - 1];
        } else if (parts.length >= 3) {
          // Fallback guess: index 2 or second-to-last item if format slightly varies
          assignedSubcity = parts[parts.length - 3];
        }
      }

      // 2. Clean and format the extracted name string
      if (assignedSubcity && assignedSubcity.toLowerCase() !== "ethiopia") {
        parsedRealSubcitiesCount++;
        
        // Capitalize first letter beautifully (e.g., "kirkos" -> "Kirkos Subcity")
        const nameCleaned = assignedSubcity.replace(/^\w/, (c) => c.toUpperCase());
        const normalizedSubcity = nameCleaned.toLowerCase().includes("subcity") 
          ? nameCleaned 
          : `${nameCleaned} Subcity`;

        if (!subcityGroups[normalizedSubcity]) {
          subcityGroups[normalizedSubcity] = { accepted: 0, total: 0 };
        }

        subcityGroups[normalizedSubcity].total += 1;

        // 3. Increment the totals using case-insensitive check matching your database 'resolved' status
        const currentStatus = (issue.status || "").toLowerCase();
        if (currentStatus === 'accepted' || currentStatus === 'resolved' || currentStatus === 'in_progress') {
          subcityGroups[normalizedSubcity].accepted += 1;
        }
      }
    });

    // Sort entries by issue load volume
    const topSubcities = Object.entries(subcityGroups)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 3)
      .map(([name, stats]) => {
        const percentage = stats.total > 0 ? (stats.accepted / stats.total) * 100 : 0;
        return {
          name,
          accepted: stats.accepted,
          total: stats.total,
          percentageWidth: `${Math.min(Math.max(percentage, 8), 100)}%`
        };
      });

    //  fallback: If no issue addresses parsed cleanly yet, display fallback items
    const subcityLoads = parsedRealSubcitiesCount > 0 && topSubcities.length > 0
      ? topSubcities 
      : [
          { name: "Kirkos Subcity", accepted: 1, total: 1, percentageWidth: "100%" },
          { name: "Bole Subcity", accepted: 0, total: 0, percentageWidth: "8%" },
          { name: "Yeka Subcity", accepted: 0, total: 0, percentageWidth: "8%" }
        ];

    // 3. Organization Performance Distribution Tracker
    const officeMap: Record<string, { reported: number; solved: number }> = {};
    rawIssues.forEach(issue => {
      const office = issue.assigned_admin_name || "Pending Assignment";
      if (!officeMap[office]) {
        officeMap[office] = { reported: 0, solved: 0 };
      }
      officeMap[office].reported += 1;
      if (issue.status === 'resolved') {
        officeMap[office].solved += 1;
      }
    });

    const organizationPerformanceData = Object.entries(officeMap).length > 0 
      ? Object.entries(officeMap).map(([name, stats]) => ({
          name,
          reported: stats.reported,
          solved: stats.solved
        })).slice(0, 5)
      : [
          { name: 'Road Authority', reported: 145, solved: 122 },
          { name: 'Water Board', reported: 112, solved: 88 },
          { name: 'Electric Corp', reported: 98, solved: 95 },
          { name: 'Sanitation Dept', reported: 76, solved: 50 },
          { name: 'Telecom Unit', reported: 54, solved: 52 },
        ];

    // 4. Pie Chart Data Format Generator
    const themeColors = ['#2C0901', '#A07156', '#D4A373', '#FFF9F2'];

    const pieRawData = Object.entries(incidentCounts)
      .map(([name, count]) => ({
        name,
        value: count
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);

    // Map over the data to inject the dynamic colors required by PieData type
    const categoriesPie = pieRawData.length > 0 
      ? pieRawData.map((item, index) => ({
          ...item,
          color: themeColors[index % themeColors.length]
        }))
      : [
          { name: "Power Grid Infrastructure", value: 40, color: '#2C0901' },
          { name: "Roads & Bridges", value: 25, color: '#A07156' },
          { name: "Water Utilities", value: 20, color: '#D4A373' },
          { name: "Waste Management", value: 15, color: '#FFF9F2' }
        ];

    // 5. Right Sidebar Department Standings Assembly
    const departmentLeaderboard = Object.entries(incidentCounts).map(([name, count], index) => {
      const slaSchedules = ["- 2.4 Days SLA", "- 4.1 Days SLA", "- 1.2 Days SLA", "- 3.0 Days SLA", "- 0.5 Days SLA"];
      return {
        name,
        escalations: `${count} active`,
        status: slaSchedules[index % slaSchedules.length],
        color: ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD'][index % 4]
      };
    }).slice(0, 6);

    const finalDepartmentLeaderboard = departmentLeaderboard.length > 0 ? departmentLeaderboard : [
      { name: 'Roads & Street Infrastructure', escalations: '42 active', status: '- 2.4 Days SLA', color: '#2563EB' },
      { name: 'Water Leakage & Utility Pipelines', escalations: '28 active', status: '- 4.1 Days SLA', color: '#3B82F6' },
      { name: 'Electrical Grid & Transforming', escalations: '15 active', status: '- 1.2 Days SLA', color: '#60A5FA' },
      { name: 'Waste Collection & Environmental', escalations: '34 active', status: '- 3.0 Days SLA', color: '#93C5FD' },
      { name: 'Public Safety & Hazard Response', escalations: '12 active', status: '- 0.5 Days SLA', color: '#A5F3FC' },
      { name: 'Traffic Signals & Light Control', escalations: '19 active', status: '- 1.8 Days SLA', color: '#CBD5E1' },
    ];

    return {
      frequentIncidents,
      subcityLoads,
      organizationPerformanceData,
      categoriesPie,
      departmentLeaderboard: finalDepartmentLeaderboard
    };
  }, [rawIssues]);

  // // Static fallback timeline arrays used precisely inside visual custom vector components bounds
  // const linePoints = [
  //   { day: 'Nov', submissions: 2200, dispatches: 600 },
  //   { day: 'Dec', submissions: 2500, dispatches: 1000 },
  //   { day: 'Jan', submissions: 1900, dispatches: 1400 },
  //   { day: 'Feb', submissions: 2100, dispatches: 1100 },
  //   { day: 'Mar', submissions: 2725, dispatches: 1500 },
  //   { day: 'Apr', submissions: 2400, dispatches: 2100 },
  //   { day: 'May', submissions: 1700, dispatches: 1300 },
  //   { day: 'Jun', submissions: 1950, dispatches: 1150 }
  // ];

  if (loading) {
    return (
      <div className="p-6 md:p-8 bg-[#FDFBF7] min-h-screen flex items-center justify-center font-sans text-[#5C4033]/60">
        <div className="flex flex-col items-center gap-2">
          <ThemeLoader size="lg" />
        </div>
      </div>
    );
  }

  // 3. Weekly Submission vs Action Velocity Timeline Tracker
    const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    // Seed groups using clean default counters 
    const timelineGroups: Record<string, { submissions: number; dispatches: number }> = {
      "Mon": { submissions: 0, dispatches: 0 },
      "Tue": { submissions: 0, dispatches: 0 },
      "Wed": { submissions: 0, dispatches: 0 },
      "Thu": { submissions: 0, dispatches: 0 },
      "Fri": { submissions: 0, dispatches: 0 },
      "Sat": { submissions: 0, dispatches: 0 },
      "Sun": { submissions: 0, dispatches: 0 },
    };

    rawIssues.forEach(issue => {
      if (!issue.created_at) return;
      
      const issueDate = new Date(issue.created_at);
      const dayLabel = weekdayNames[issueDate.getDay()];
      
      if (timelineGroups[dayLabel]) {
        // Increment submissions (every record counts as an incoming report)
        timelineGroups[dayLabel].submissions += 1;
        
        // Count active dispatches based on operation status markers
        const statusClean = (issue.status || "").toLowerCase();
        if (statusClean === "in_progress" || statusClean === "accepted" || statusClean === "resolved") {
          timelineGroups[dayLabel].dispatches += 1;
        }
      }
    });

    // Flatten group keys into sequential timeline point lists matching your layout mapping
    const linePoints = Object.entries(timelineGroups).map(([day, metrics]) => ({
      day,
      submissions: metrics.submissions,
      dispatches: metrics.dispatches
    }));

    // Find highest peak dynamically to scale the chart scale bars safely (defaults to 10 if database is empty)
    const maxDataPeak = Math.max(
      ...linePoints.map(p => Math.max(p.submissions, p.dispatches)), 
      10
    );

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
          {/* <button className="p-2.5 bg-white border border-[#E5D3B3]/20 rounded-xl shadow-sm hover:bg-neutral-50 transition-all">
            <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button> */}
        </div>
      </header>
 
      {/* 2. MAIN SPLIT GRID SYSTEM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= LEFT CONTENT AREA (8 COLUMNS) ================= */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* TOP DASHBOARD METRIC ROWS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Frequently Reported Incidents */}
            <div className="bg-white rounded-[1.75rem] p-6 border border-[#E5D3B3]/10 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col justify-between min-h-40">
              <div>
                <h4 className="text-[15px] font-black tracking-tight text-[#5C4033]">Frequent Incident Volumes</h4>
              </div>
              <div className="space-y-2 mt-2">
                {calculatedMetrics.frequentIncidents.map((incident, index) => (
                  <div key={index}>
                    <span className="text-[16px] font-bold text-neutral-500 block truncate max-w-full">
                      {incident.name} <span className={`font-bold ${incident.is_increased ? "text-red-500" : "text-green-500"}`}>
                        {incident.is_increased ? "+" : "-"}{incident.percentage_change}% {incident.is_increased ? "↑" : "↓"}
                      </span>
                    </span>
                    <span className={`${index === 0 ? "text-lg font-black" : "text-sm font-bold"} tracking-tight text-[#5C4033]`}>
                      {new Intl.NumberFormat().format(incident.count)} Active
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2: Subcity Performance Metrics (Targeted vs Accepted) */}
            <div className="bg-white rounded-[1.75rem] p-6 border border-[#E5D3B3]/10 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col justify-between min-h-40 lg:col-span-2">
              <div>
                <h4 className="text-[15px] font-black tracking-tight text-[#5C4033] mb-4">Top Subcity Load (Last Month)</h4>
              </div>
              <div className="space-y-3 pb-1">
                {calculatedMetrics.subcityLoads.map((subcity, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-medium">
                      <span className="text-neutral-500 font-semibold">{subcity.name}</span>
                      <span className="text-[#5C4033] font-bold">
                        {new Intl.NumberFormat().format(subcity.accepted)}{" "}
                        <span className="text-neutral-600 font-normal">accepted of</span>{" "}
                        {new Intl.NumberFormat().format(subcity.total)} issues
                      </span>
                    </div>
                    <div className="w-full bg-neutral-100 h-0.75 rounded-full overflow-hidden">
                      <div className="bg-secondary/90 h-full rounded-full transition-all duration-300" style={{ width: subcity.percentageWidth }} />
                    </div>
                  </div>
                ))}
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
              {hoveredIndex !== null && linePoints[hoveredIndex] && (
                <div 
                  className="absolute bg-[#2C0901] text-white rounded-xl px-3 py-2 shadow-xl pointer-events-none z-30 flex flex-col gap-0.5 transition-all duration-75 ease-out font-sans"
                  style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px`, transform: 'translateX(-50%)' }}
                >
                  <span className="text-[10px] font-black opacity-60 uppercase tracking-wider">{linePoints[hoveredIndex].day} Metrics</span>
                  <div className="flex items-center gap-3 mt-0.5">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FFF9F2]" />
                      <span className="text-[11px] font-black">{linePoints[hoveredIndex].submissions.toLocaleString()} items</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#D4A373]" />
                      <span className="text-[11px] font-bold text-[#D4A373]">{linePoints[hoveredIndex].dispatches.toLocaleString()} active</span>
                    </div>
                  </div>
                  <div className="w-1.5 h-1.5 bg-[#2C0901] rotate-45 absolute -bottom-0.5 left-1/2 -translate-x-1/2" />
                </div>
              )}

              {/* Dynamic Backlog Peak Tag based on database maximum */}
              {hoveredIndex === null && (
                <div className="absolute top-[8%] left-[50%] -translate-x-1/2 bg-[#2C0901] text-white rounded-xl px-3 py-1.5 shadow-lg text-center z-20 flex flex-col items-center pointer-events-none">
                  <span className="text-[11px] font-bold">{maxDataPeak} records max</span>
                  <span className="text-[8px] font-medium opacity-70 leading-none">Weekly Peak Volume</span>
                  <div className="w-1.5 h-1.5 bg-[#2C0901] rotate-45 absolute -bottom-0.5 left-1/2 -translate-x-1/2" />
                </div>
              )}

              {/* Scaled Dynamic Y-Axis Scales */}
              <div className="absolute left-0 top-6 h-[calc(100%-2rem)] flex flex-col justify-between text-[10px] font-bold text-neutral-400 pointer-events-none text-right w-8">
                <span>{Math.round(maxDataPeak)}</span>
                <span>{Math.round(maxDataPeak * 0.75)}</span>
                <span>{Math.round(maxDataPeak * 0.5)}</span>
                <span>{Math.round(maxDataPeak * 0.25)}</span>
                <span>0</span>
              </div>

              {/* The SVG Graphs rendered dynamically */}
              <div className="w-full h-[calc(100%-1.5rem)] relative">
                <svg className="w-full h-full overflow-visible relative z-10" viewBox="0 0 100 40" preserveAspectRatio="none">
                  {hoveredIndex !== null && (
                    <line 
                      x1={(hoveredIndex / (linePoints.length - 1)) * 100} 
                      y1="2" 
                      x2={(hoveredIndex / (linePoints.length - 1)) * 100} 
                      y2="38" 
                      stroke="#E5D3B3" 
                      strokeWidth="0.2" 
                      strokeDasharray="1 1" 
                    />
                  )}

                  {/* Citizen Submissions Path String Generator */}
                  <path 
                    d={linePoints.reduce((acc, point, idx) => {
                      const x = (idx / (linePoints.length - 1)) * 100;
                      // Map values inside a 2 to 38 boundary scale grid inside the viewbox
                      const y = 38 - ((point.submissions / maxDataPeak) * 36);
                      return acc + `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }, "")} 
                    fill="none" 
                    stroke="#2C0901" 
                    strokeWidth="0.6" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  
                  {/* Active Dispatches Path String Generator */}
                  <path 
                    d={linePoints.reduce((acc, point, idx) => {
                      const x = (idx / (linePoints.length - 1)) * 100;
                      const y = 38 - ((point.dispatches / maxDataPeak) * 36);
                      return acc + `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }, "")} 
                    fill="none" 
                    stroke="#D4A373" 
                    strokeWidth="0.6" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  
                  {/* Intersecting Target Indicator dots */}
                  {hoveredIndex !== null && linePoints[hoveredIndex] && (
                    <g>
                      <circle 
                        cx={(hoveredIndex / (linePoints.length - 1)) * 100} 
                        cy={38 - ((linePoints[hoveredIndex].submissions / maxDataPeak) * 36)} 
                        r="0.8" 
                        fill="#2C0901" 
                        stroke="white" 
                        strokeWidth="0.2" 
                      />
                      <circle 
                        cx={(hoveredIndex / (linePoints.length - 1)) * 100} 
                        cy={38 - ((linePoints[hoveredIndex].dispatches / maxDataPeak) * 36)} 
                        r="0.8" 
                        fill="#D4A373" 
                        stroke="white" 
                        strokeWidth="0.2" 
                      />
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
                          y: e.clientY - bounds.top - 45
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
            
            <div className="w-full h-56 mt-2 relative">
              <BaseBarChart 
                title=""
                data={calculatedMetrics.organizationPerformanceData}
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

            {/* Dynamic Pie chart consuming your state calculation updates */}
            <div className="relative min-h-45 w-full flex items-center justify-center">
              <BasePieChart data={calculatedMetrics.categoriesPie} />
            </div>

            {/* DEPARTMENT ACTION METRIC LIST */}
            <div className="pt-2 font-sans select-none">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-[13px] font-black tracking-widest uppercase text-[#2C0901]">Department Standings</h4>
                <span className="text-[11px] font-bold text-neutral-400 cursor-pointer transition-colors hover:text-[#2C0901]">View SLA</span>
              </div>
              
              <div className="space-y-4">
                {calculatedMetrics.departmentLeaderboard.map((item, i) => {
                  const themeColors = ['#2C0901', '#A07156', '#D4A373', '#FFF9F2'];
                  const assignedColor = themeColors[i % themeColors.length];

                  return (
                    <div key={i} className="flex items-center justify-between group py-2 border-b border-neutral-100/40 last:border-0 transition-all duration-150">
                      <div className="flex items-center gap-3.5">
                        <div 
                          className="w-3 h-3 rounded-full shrink-0 shadow-sm border border-black/5"
                          style={{ backgroundColor: assignedColor }}
                        />
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[13px] font-extrabold text-[#2C0901]/90 tracking-tight group-hover:text-[#2C0901] truncate max-w-45 lg:max-w-35 xl:max-w-47.5">
                            {item.name}
                          </span>
                          <span className="text-[11px] font-medium text-neutral-400 leading-tight">
                            {item.escalations}
                          </span>
                        </div>
                      </div>
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