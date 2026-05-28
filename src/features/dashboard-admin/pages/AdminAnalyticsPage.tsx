/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import BaseBarChart from "../../../components/ui/BaseBarChart";
import BasePieChart from "../../../components/ui/BasePieChart"; 
import { privateApi } from "../../auth/services/authService";
import ThemeLoader from "../../../components/ui/ThemeLoader";

interface RawIssue {
  id: string;
  issue_number: string;
  description: string;
  status: string;
}

const AdminAnalyticsPage: React.FC = () => {
  const primaryColor = "#5C4033"; 
  const secondaryColor = "#E5D3B3"; 
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const [loading, setLoading] = useState<boolean>(true);
  const [rawIssues, setRawIssues] = useState<RawIssue[]>([]);
  const [frequentIncidents, setFrequentIncidents] = useState<any[]>([]);
  const [subcityData, setSubcityData] = useState<any[]>([]);
  const [weeklyActivity, setWeeklyActivity] = useState<any[]>([]);
  const [orgTriage, setOrgTriage] = useState<any[]>([]);
  const [resolutionSpeed, setResolutionSpeed] = useState<any[]>([]);

  useEffect(() => {
    const loadSystemDataAndAnalytics = async () => {
      try {
        setLoading(true);
        const [
          issuesRes, 
          // monthlyAnalyticsRes, 
          categoryRatiosRes,
          weeklyActivityRes,
          orgTriageRes,
          resolutionSpeedRes,
          subcityLoadRes
        ] = await Promise.all([
          privateApi.get("issues/"),
          privateApi.get("analytics/monthly-activity/"),
          privateApi.get("analytics/category-ratios/"),
          privateApi.get("analytics/weekly-line-activity/"),
          privateApi.get("analytics/org-triage/"),
          privateApi.get("analytics/resolution-speed/"),
          privateApi.get("analytics/subcity-load/")
        ]);

        setRawIssues(Array.isArray(issuesRes.data) ? issuesRes.data : []);
        
        const _rawIssues = issuesRes.data;
        console.log(_rawIssues);

        // Explicitly map keys from category-ratios response payload
        const ratiosPayload = Array.isArray(categoryRatiosRes.data) ? categoryRatiosRes.data : [];
        const normalizedRatios = ratiosPayload.map((item: any) => ({
          name: item.category || "General Issue",
          count: Number(item.count || 0),
          percentage: Number(item.percentage || 0)
        }));
        setFrequentIncidents(normalizedRatios);

        setWeeklyActivity(Array.isArray(weeklyActivityRes.data) ? weeklyActivityRes.data : []);
        setOrgTriage(orgTriageRes.data?.admin_performance_leaderboard || []);
        setResolutionSpeed(Array.isArray(resolutionSpeedRes.data) ? resolutionSpeedRes.data : []);
        setSubcityData(Array.isArray(subcityLoadRes.data) ? subcityLoadRes.data : []);

      } catch (error) {
        console.error("Error running analytic engines pipeline:", error);
      } finally {
        setLoading(false);
        
      }
    };
    loadSystemDataAndAnalytics();
  }, []);

  const processedMetrics = useMemo(() => {
    const themeColors = ['#2C0901', '#A07156', '#D4A373', '#E5D3B3', '#C19A6B', '#8B5A2B'];

    // Subcity breakdown text matching
    const regionalAggregation = {
      "Kirkos Subcity": { total: 0, accepted: 0 },
      "Bole Subcity": { total: 0, accepted: 0 },
      "Yeka Subcity": { total: 0, accepted: 0 }
    };

    subcityData.forEach((item: any) => {
      const address = (item.subcity || "").toLowerCase();
      const count = Number(item.total_issues || 0);
      const breakdown = item.status_breakdown || {};
      
      // Accumulate everything moving or processed as accepted operational items
      const acceptedCount = count - Number(breakdown.submitted || breakdown.unassigned || 0);

      if (address.includes("kirkos")) {
        regionalAggregation["Kirkos Subcity"].total += count;
        regionalAggregation["Kirkos Subcity"].accepted += acceptedCount;
      } else if (address.includes("bole")) {
        regionalAggregation["Bole Subcity"].total += count;
        regionalAggregation["Bole Subcity"].accepted += acceptedCount;
      } else if (address.includes("yeka")) {
        regionalAggregation["Yeka Subcity"].total += count;
        regionalAggregation["Yeka Subcity"].accepted += acceptedCount;
      }
    });

    const subcityLoads = Object.entries(regionalAggregation).map(([name, data]) => {
      const percentage = data.total > 0 ? (data.accepted / data.total) * 100 : 0;
      return {
        name,
        accepted: data.accepted,
        total: data.total,
        percentageWidth: `${Math.min(Math.max(percentage, 0), 100)}%`
      };
    });

    // Generate Pie Data points
    const categoriesPie = frequentIncidents.map((item: any, idx: number) => ({
      name: item.name,
      value: Math.round(item.percentage),
      color: themeColors[idx % themeColors.length]
    }));

    // Generate Department List rows
    const departmentLeaderboard = frequentIncidents.map((item: any, idx: number) => {
      const speedMatch = resolutionSpeed.find((speed: any) => speed.category === item.name);
      let speedText = "1.5 Days SLA"; 
      
      if (speedMatch && speedMatch.avg_resolution_hours !== undefined) {
        const speedDays = (Number(speedMatch.avg_resolution_hours) / 24).toFixed(1);
        speedText = `${speedDays} Days SLA`;
      }

      return {
        name: item.name,
        escalations: `${item.count} active case${item.count !== 1 ? 's' : ''} tracked`,
        status: `- ${speedText}`,
        color: themeColors[idx % themeColors.length]
      };
    });

    return {
      subcityLoads,
      categoriesPie: categoriesPie.length > 0 ? categoriesPie : [{ name: "No Open Incidents", value: 100, color: '#2C0901' }],
      departmentLeaderboard: departmentLeaderboard.length > 0 ? departmentLeaderboard : [
        { name: 'Operational Base Secure', escalations: '0 cases tracked', status: '- 0 Days SLA', color: '#2C0901' }
      ]
    };
  }, [frequentIncidents, subcityData, resolutionSpeed]);

  const organizationPerformanceData = useMemo(() => {
    return orgTriage.length > 0
      ? orgTriage.map((admin: any) => ({
          name: admin.admin_name || "Assigned Admin",
          reported: Number(admin.accepted_issues || 0),
          solved: Number(admin.solved_issues || 0),
        }))
       
      : [{ name: 'Pending Admin Allocation', reported: 0, solved: 0 }];
      console.log(orgTriage);
  }, [orgTriage]);

  const linePoints = useMemo(() => {
    const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const fullWeekTemplate: Record<string, { submissions: number; dispatches: number }> = {
      "Sun": { submissions: 0, dispatches: 0 }, "Mon": { submissions: 0, dispatches: 0 },
      "Tue": { submissions: 0, dispatches: 0 }, "Wed": { submissions: 0, dispatches: 0 },
      "Thu": { submissions: 0, dispatches: 0 }, "Fri": { submissions: 0, dispatches: 0 },
      "Sat": { submissions: 0, dispatches: 0 },
    };

    weeklyActivity.forEach((point: any) => {
      const dayName = point.day || "Thu";
      if (fullWeekTemplate[dayName] !== undefined) {
        fullWeekTemplate[dayName].submissions = point.reported !== undefined ? Number(point.reported) : 0;
        fullWeekTemplate[dayName].dispatches = point.active_in_progress !== undefined ? Number(point.active_in_progress) : 0;
      }
    });

    return weekdayLabels.map(day => ({
      day,
      submissions: fullWeekTemplate[day].submissions,
      dispatches: fullWeekTemplate[day].dispatches
    }));
  }, [weeklyActivity]);

  const maxDataPeak = useMemo(() => {
    return Math.max(...linePoints.map(p => Math.max(p.submissions, p.dispatches)), 5);
  }, [linePoints]);

  if (loading) {
    return (
      <div className="p-6 md:p-8 bg-[#FDFBF7] min-h-screen flex items-center justify-center text-[#5C4033]/60">
        <ThemeLoader size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-[#FDFBF7] min-h-screen font-sans text-[#5C4033] flex flex-col gap-6">
      <header className="mb-10">
        <div>
          <h1 className="font-header text-4xl font-black text-secondary tracking-tighter uppercase">
            Analytics <span className="font-light">Management</span>
          </h1>
          <p className="font-body text-[10px] text-secondary/40 uppercase tracking-[0.4em] mt-2 font-bold">Admin Control Center</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* CARD 1: FREQUENT INCIDENT VOLUMES */}
            <div className="bg-white rounded-[1.75rem] p-6 border border-[#E5D3B3]/10 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col justify-between min-h-40">
              <div>
                <h4 className="text-[15px] font-black tracking-tight text-[#5C4033]">Frequent Incident Volumes</h4>
              </div>
              <div className="space-y-2 mt-2">
                {frequentIncidents.slice(0, 3).map((incident, index) => (
                  <div key={index}>
                    <span className="text-[13px] font-bold text-neutral-500 block truncate">
                      {incident.name}
                    </span>
                    <span className={`${index === 0 ? "text-lg font-black" : "text-sm font-bold"} tracking-tight text-[#5C4033]`}>
                      {incident.count} Active Cases
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CARDS 2 & 3: SUBCITY LOADS */}
            <div className="bg-white rounded-[1.75rem] p-6 border border-[#E5D3B3]/10 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col justify-between min-h-40 lg:col-span-2">
              <div>
                <h4 className="text-[15px] font-black tracking-tight text-[#5C4033] mb-4">Top Subcity Operational Load</h4>
              </div>
              <div className="space-y-3 pb-1">
                {processedMetrics.subcityLoads.map((subcity, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-medium">
                      <span className="text-neutral-500 font-semibold">{subcity.name}</span>
                      <span className="text-[#5C4033] font-bold">
                        {subcity.accepted} <span className="text-neutral-600 font-normal">active of</span> {subcity.total} issues
                      </span>
                    </div>
                    <div className="w-full bg-neutral-100 h-1 rounded-full overflow-hidden">
                      <div className="bg-secondary/90 h-full rounded-full transition-all duration-300" style={{ width: subcity.total > 0 ? subcity.percentageWidth : '0%' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* LINE CHART */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-[#E5D3B3]/10 shadow-[0_4px_25px_rgba(0,0,0,0.01)] flex flex-col gap-6 select-none relative" onMouseLeave={() => setHoveredIndex(null)}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-6 text-[11px] font-bold">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#2C0901]" />
                  <span className="text-neutral-500">Citizen Submissions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#D4A373]" />
                  <span className="text-neutral-500">Active Dispatches</span>
                </div>
              </div>
            </div>

            <div className="h-64 relative pt-6 w-full pl-12 pr-2">
              {hoveredIndex !== null && linePoints[hoveredIndex] && (
                <div 
                  className="absolute bg-[#2C0901] text-white rounded-xl px-3 py-2 shadow-xl pointer-events-none z-30 flex flex-col gap-0.5"
                  style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px`, transform: 'translateX(-50%)' }}
                >
                  <span className="text-[10px] font-black opacity-60 uppercase">{linePoints[hoveredIndex].day} Matrix</span>
                  <div className="flex items-center gap-3 text-[11px] font-bold mt-0.5">
                    <span>{linePoints[hoveredIndex].submissions} Reported</span>
                    <span className="text-[#D4A373]">{linePoints[hoveredIndex].dispatches} Active</span>
                  </div>
                </div>
              )}

              <div className="absolute left-0 top-6 h-[calc(100%-2rem)] flex flex-col justify-between text-[10px] font-bold text-neutral-400 text-right w-8">
                <span>{Math.round(maxDataPeak)}</span>
                <span>{Math.round(maxDataPeak * 0.5)}</span>
                <span>0</span>
              </div>

              <div className="w-full h-[calc(100%-1.5rem)] relative">
                <svg className="w-full h-full overflow-visible relative z-10" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <path 
                    d={linePoints.reduce((acc, point, idx) => {
                      const x = (idx / (linePoints.length - 1)) * 100;
                      const y = 38 - ((point.submissions / maxDataPeak) * 36);
                      return acc + `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }, "")} 
                    fill="none" stroke="#2C0901" strokeWidth="0.6" 
                  />
                  <path 
                    d={linePoints.reduce((acc, point, idx) => {
                      const x = (idx / (linePoints.length - 1)) * 100;
                      const y = 38 - ((point.dispatches / maxDataPeak) * 36);
                      return acc + `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }, "")} 
                    fill="none" stroke="#D4A373" strokeWidth="0.6" 
                  />
                </svg>

                <div className="absolute inset-0 flex z-20">
                  {linePoints.map((_, idx) => (
                    <div
                      key={idx} className="h-full w-full cursor-pointer"
                      onMouseMove={(e) => {
                        const bounds = e.currentTarget.parentElement!.getBoundingClientRect();
                        setTooltipPos({ x: e.clientX - bounds.left, y: e.clientY - bounds.top - 45 });
                        setHoveredIndex(idx);
                      }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-3 text-[10px] font-bold text-neutral-400/80">
                {linePoints.map((p, idx) => (
                  <span key={idx} className={`w-full text-center ${hoveredIndex === idx ? 'text-[#2C0901] font-black' : ''}`}>
                    {p.day}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* BAR CHART */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-[#E5D3B3]/10 shadow-[0_4px_25px_rgba(0,0,0,0.01)] flex flex-col gap-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-[#5C4033]">Administrative Office Performance</h3>
            </div>
            <div className="w-full h-56 mt-2 relative">
              <BaseBarChart 
                title="" data={organizationPerformanceData}
                dataKeys={[
                  { key: 'reported', color: primaryColor, label: 'Accepted Triage' },
                  { key: 'solved', color: secondaryColor, label: 'Resolved Operations' }
                ]}
              />
            </div>
          </div>
        </div>

        {/* SIDEBAR BLOCK */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-[#E5D3B3]/10 shadow-[0_4px_25px_rgba(0,0,0,0.01)] flex flex-col gap-6">
            <div>
              <h3 className="text-[13px] font-black tracking-tight text-[#5C4033]">Category Breakdown Ratios</h3>
            </div>

            <div className="relative min-h-45 w-full flex items-center justify-center">
              <BasePieChart data={processedMetrics.categoriesPie} />
            </div>

            <div className="pt-2 font-sans">
              <h4 className="text-[13px] font-black tracking-widest uppercase text-[#2C0901] mb-4">Department Performance</h4>
              <div className="space-y-4">
                {processedMetrics.departmentLeaderboard.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-neutral-100/40 last:border-0">
                    <div className="flex items-center gap-3.5">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[13px] font-extrabold text-[#2C0901]/90 tracking-tight truncate max-w-36">{item.name}</span>
                        <span className="text-[11px] font-medium text-neutral-400 leading-tight">{item.escalations}</span>
                      </div>
                    </div>
                    <span className="text-[13px] font-black text-right tracking-tight text-[#2C0901] shrink-0 ml-2">{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminAnalyticsPage;