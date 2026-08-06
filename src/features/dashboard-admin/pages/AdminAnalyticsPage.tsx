/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import BaseBarChart from "../../../components/ui/BaseBarChart";
import BasePieChart from "../../../components/ui/BasePieChart";
import { privateApi } from "../../auth/services/authService";

// Skeleton loading component
const SkeletonPulse = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200/60 rounded-xl ${className}`} />
);

const AdminAnalyticsPage: React.FC = () => {
  const primaryColor = "#5C4033";
  const secondaryColor = "#E5D3B3";
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // --- TanStack Query for Analytics Data Pipeline ---
  const { data: analyticsPipeline, isLoading } = useQuery({
    queryKey: ['admin-analytics-pipeline'],
    queryFn: async () => {
      const [
        issuesRes,
        monthlyRes,
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

      const ratiosPayload = Array.isArray(categoryRatiosRes.data)
        ? categoryRatiosRes.data
        : (categoryRatiosRes.data?.results || []);

      const normalizedRatios = ratiosPayload.map((item: any) => ({
        name: item.name || item.category || item.category_name || item.issue__category__name || "General Issue",
        count: Number(item.count ?? item.total_issues ?? item.total ?? item.active_cases ?? 0),
        percentage: Number(item.percentage ?? item.displayPercentage ?? item.value ?? 0)
      }));

      return {
        rawIssues: Array.isArray(issuesRes.data) ? issuesRes.data : (issuesRes.data?.results || []),
        monthlyActivity: Array.isArray(monthlyRes.data) ? monthlyRes.data : (monthlyRes.data?.results || []),
        frequentIncidents: normalizedRatios,
        weeklyActivity: Array.isArray(weeklyActivityRes.data) ? weeklyActivityRes.data : (weeklyActivityRes.data?.results || []),
        orgTriage: orgTriageRes.data?.admin_performance_leaderboard || orgTriageRes.data?.results || (Array.isArray(orgTriageRes.data) ? orgTriageRes.data : []),
        resolutionSpeed: Array.isArray(resolutionSpeedRes.data) ? resolutionSpeedRes.data : (resolutionSpeedRes.data?.results || []),
        subcityData: Array.isArray(subcityLoadRes.data) ? subcityLoadRes.data : (subcityLoadRes.data?.results || [])
      };
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  // Safe, memoized extractions to preserve referential equality and satisfy ESLint rules
  const frequentIncidents = useMemo(
    () => analyticsPipeline?.frequentIncidents ?? [],
    [analyticsPipeline?.frequentIncidents]
  );
  const subcityData = useMemo(
    () => analyticsPipeline?.subcityData ?? [],
    [analyticsPipeline?.subcityData]
  );
  const resolutionSpeed = useMemo(
    () => analyticsPipeline?.resolutionSpeed ?? [],
    [analyticsPipeline?.resolutionSpeed]
  );
  const orgTriage = useMemo(
    () => analyticsPipeline?.orgTriage ?? [],
    [analyticsPipeline?.orgTriage]
  );
  const weeklyActivity = useMemo(
    () => analyticsPipeline?.weeklyActivity ?? [],
    [analyticsPipeline?.weeklyActivity]
  );

  const processedMetrics = useMemo(() => {
    const themeColors = ['#2C0901', '#A07156', '#D4A373', '#E5D3B3', '#C19A6B', '#8B5A2B'];

    // Helper to parse geocoding/Nominatim raw string blobs into clean Subcity names
    const normalizeSubcity = (rawString: string): string => {
      if (!rawString || rawString.trim() === "") return "Unknown Subcity";

      const parts = rawString.split(",").map((p) => p.trim());

      const knownAddisSubcities = [
        "Bole", "Kirkos", "Arada", "Lideta", "Akaky Kaliti",
        "Addis Ketema", "Nifas Silk-Lafto", "Gullele", "Yeka", "Kolfe Keranio", "Lemi Kura"
      ];

      for (const part of parts) {
        const found = knownAddisSubcities.find(
          (sc) => sc.toLowerCase() === part.toLowerCase() || part.toLowerCase().includes(sc.toLowerCase())
        );
        if (found) return found;
      }

      const cleanPart = parts[0].replace(/Special Zone|Zone|Subcity|Kifle Ketema/gi, "").trim();
      return cleanPart.charAt(0).toUpperCase() + cleanPart.slice(1);
    };

    // Dynamic Top 3 Subcity aggregation from live backend data
    const subcityMap: Record<string, { total: number; accepted: number }> = {};

    subcityData.forEach((item: any) => {
      const rawName = item.subcity || item.name || item.location || "Unknown Subcity";
      const name = normalizeSubcity(rawName);
      const count = Number(item.total_issues ?? item.total ?? item.count ?? 0);
      const breakdown = item.status_breakdown || {};

      const inProgressCount = Number(breakdown.in_progress ?? breakdown.inProgress ?? 0);
      const resolvedCount = Number(breakdown.resolved ?? breakdown.solved ?? 0);
      const rejectedCount = Number(breakdown.rejected ?? 0);

      const submittedCount = breakdown.submitted !== undefined
        ? Number(breakdown.submitted)
        : breakdown.pending !== undefined
          ? Number(breakdown.pending)
          : Math.max(0, count - (inProgressCount + resolvedCount + rejectedCount));

      const acceptedCount = item.accepted ?? item.active ?? (count - submittedCount);

      if (!subcityMap[name]) {
        subcityMap[name] = { total: 0, accepted: 0 };
      }
      subcityMap[name].total += count;
      subcityMap[name].accepted += acceptedCount;
    });

    // Sort subcities by total volume and slice top 3
    let subcityLoads = Object.entries(subcityMap)
      .map(([name, data]) => {
        const percentage = data.total > 0 ? (data.accepted / data.total) * 100 : 0;
        return {
          name,
          accepted: data.accepted,
          total: data.total,
          percentageWidth: `${Math.min(Math.max(percentage, 0), 100)}%`
        };
      })
      .sort((a, b) => b.total - a.total);

    // If less than 3 subcities, keep taking top available or slice up to 3
    subcityLoads = subcityLoads.slice(0, 3);

    // Synchronize Category Colors Map across Pie Chart & Department Legend
    const totalIncidentVolume = frequentIncidents.reduce((acc: number, cur: any) => acc + (cur.count || 0), 0);
    const categoryColorMap: Record<string, string> = {};

    frequentIncidents.forEach((item: any, idx: number) => {
      categoryColorMap[item.name] = themeColors[idx % themeColors.length];
    });

    const categoriesPie = frequentIncidents
      .map((item: any) => {
        const calculatedPercentage = totalIncidentVolume > 0
          ? Math.round((item.count / totalIncidentVolume) * 100)
          : Math.round(item.percentage);

        return {
          name: item.name,
          value: calculatedPercentage,
          count: item.count,
          color: categoryColorMap[item.name] || themeColors[0]
        };
      })
      .filter((item: any) => item.value > 0)
      .sort((a: any, b: any) => b.value - a.value);

    // Generate Department List rows using identical synced colors
    const departmentLeaderboard = frequentIncidents.map((item: any) => {
      const speedMatch = resolutionSpeed.find((speed: any) => speed.category === item.name || speed.name === item.name);
      let speedText = "1.5 Days SLA";

      if (speedMatch && (speedMatch.avg_resolution_hours !== undefined || speedMatch.sla !== undefined)) {
        const hours = Number(speedMatch.avg_resolution_hours ?? speedMatch.sla ?? 36);
        const speedDays = (hours / 24).toFixed(1);
        speedText = `${speedDays} Days SLA`;
      }

      return {
        name: item.name,
        count: item.count,
        escalations: `${item.count} active case${item.count !== 1 ? 's' : ''} tracked`,
        status: `- ${speedText}`,
        color: categoryColorMap[item.name] || themeColors[0]
      };
    });

    return {
      subcityLoads: subcityLoads.length > 0 ? subcityLoads : [
        { name: 'No Active Subcity Data', accepted: 0, total: 0, percentageWidth: '0%' }
      ],
      categoriesPie: categoriesPie.length > 0 ? categoriesPie : [{ name: "No Open Incidents", value: 100, color: '#2C0901' }],
      departmentLeaderboard: departmentLeaderboard.length > 0 ? departmentLeaderboard : [
        { name: 'Operational Base Secure', escalations: '0 cases tracked', status: '- 0 Days SLA', color: '#2C0901' }
      ]
    };
  }, [frequentIncidents, subcityData, resolutionSpeed]);

  const organizationPerformanceData = useMemo(() => {
    return orgTriage.length > 0
      ? orgTriage.map((admin: any) => ({
        name: admin.admin_name || admin.name || "Assigned Admin",
        reported: Number(admin.accepted_issues ?? admin.reported ?? 0),
        solved: Number(admin.solved_issues ?? admin.solved ?? 0),
      }))
      : [{ name: 'Pending Admin Allocation', reported: 0, solved: 0 }];
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
      const dayName = point.day || point.name || "Thu";
      if (fullWeekTemplate[dayName] !== undefined) {
        fullWeekTemplate[dayName].submissions = point.reported !== undefined ? Number(point.reported) : Number(point.submissions || 0);
        fullWeekTemplate[dayName].dispatches = point.active_in_progress !== undefined ? Number(point.active_in_progress) : Number(point.dispatches || 0);
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

  return (
    <div className="p-6 md:p-8 bg-[#FDFBF7] min-h-screen font-sans text-secondary flex flex-col gap-6">
      <header className="mb-10">
        <div>
          <h1 className="font-header text-4xl font-black text-secondary tracking-tighter uppercase">
            Analytics <span className="font-light">Management</span>
          </h1>
          <p className="font-body text-[10px] text-secondary/70 uppercase tracking-[0.4em] mt-2 font-bold">Admin Control Center</p>
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
                {isLoading ? (
                  <div className="space-y-3 py-1">
                    <SkeletonPulse className="h-4 w-3/4" />
                    <SkeletonPulse className="h-6 w-1/2" />
                    <SkeletonPulse className="h-4 w-2/3" />
                  </div>
                ) : (
                  frequentIncidents.slice(0, 3).map((incident: { name: string; count: number }, index: number) => (
                    <div key={index}>
                      <span className="text-[13px] font-bold text-neutral-500 block truncate">
                        {incident.name}
                      </span>
                      <span className={`${index === 0 ? "text-lg font-black" : "text-sm font-bold"} tracking-tight text-[#5C4033]`}>
                        {incident.count} Active Cases
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* CARDS 2 & 3: SUBCITY LOADS */}
            <div className="bg-white rounded-[1.75rem] p-6 border border-[#E5D3B3]/10 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col justify-between min-h-40 lg:col-span-2">
              <div>
                <h4 className="text-[15px] font-black tracking-tight text-[#5C4033] mb-4">Top Subcity Operational Load</h4>
              </div>
              <div className="space-y-3 pb-1">
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between">
                          <SkeletonPulse className="h-3 w-1/3" />
                          <SkeletonPulse className="h-3 w-1/4" />
                        </div>
                        <SkeletonPulse className="h-1.5 w-full rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : (
                  processedMetrics.subcityLoads.map((subcity, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-medium">
                        <span className="text-neutral-500 font-semibold">{subcity.name}</span>
                        <span className="text-secondary font-bold">
                          {subcity.accepted} <span className="text-neutral-600 font-normal">active of</span> {subcity.total} issues
                        </span>
                      </div>
                      <div className="w-full bg-neutral-100 h-1 rounded-full overflow-hidden">
                        <div className="bg-secondary/90 h-full rounded-full transition-all duration-300" style={{ width: subcity.total > 0 ? subcity.percentageWidth : '0%' }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* LINE CHART */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-[#E5D3B3]/10 shadow-[0_4px_25px_rgba(0,0,0,0.01)] flex flex-col gap-6 select-none relative" onMouseLeave={() => setHoveredIndex(null)}>
            {isLoading ? (
              <div className="h-64 w-full flex flex-col justify-between">
                <SkeletonPulse className="h-4 w-48" />
                <SkeletonPulse className="h-48 w-full rounded-2xl" />
              </div>
            ) : (
              <>
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
                      <span key={idx} className={`w-full text-center ${hoveredIndex === idx ? 'text-secondary font-black' : ''}`}>
                        {p.day}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* BAR CHART */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-[#E5D3B3]/10 shadow-[0_4px_25px_rgba(0,0,0,0.01)] flex flex-col gap-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-secondary">Administrative Office Performance</h3>
            </div>
            <div className="w-full h-56 mt-2 relative">
              {isLoading ? (
                <div className="h-full flex items-end justify-between gap-4 pt-4">
                  {[...Array(5)].map((_, i) => (
                    <SkeletonPulse key={i} className={`w-full h-${(i % 3 + 1) * 12}`} />
                  ))}
                </div>
              ) : (
                <BaseBarChart
                  title="" data={organizationPerformanceData}
                  dataKeys={[
                    { key: 'reported', color: primaryColor, label: 'Accepted Triage' },
                    { key: 'solved', color: secondaryColor, label: 'Resolved Operations' }
                  ]}
                />
              )}
            </div>
          </div>
        </div>

        {/* SIDEBAR BLOCK */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-[#E5D3B3]/10 shadow-[0_4px_25px_rgba(0,0,0,0.01)] flex flex-col gap-6">
            <div>
              <h3 className="text-[13px] font-black tracking-tight text-secondary">Category Breakdown Ratios</h3>
            </div>

            <div className="relative min-h-45 w-full flex items-center justify-center">
              {isLoading ? (
                <SkeletonPulse className="w-40 h-40 rounded-full" />
              ) : (
                <BasePieChart data={processedMetrics.categoriesPie} />
              )}
            </div>

            <div className="pt-2 font-sans">
              <h4 className="text-[13px] font-black tracking-widest uppercase text-secondary mb-4">Department Performance</h4>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex justify-between items-center py-2">
                        <SkeletonPulse className="h-4 w-1/2" />
                        <SkeletonPulse className="h-4 w-1/4" />
                      </div>
                    ))}
                  </div>
                ) : (
                  processedMetrics.departmentLeaderboard.map((item: { name: string; count: number; color: string; escalations: string; status: string }, i: number) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-neutral-100/40 last:border-0">
                      <div className="flex items-center gap-3.5">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[13px] font-extrabold text-secondary tracking-tight truncate max-w-36">{item.name}</span>
                          <span className="text-[11px] font-medium text-neutral-400 leading-tight">{item.escalations}</span>
                        </div>
                      </div>
                      <span className="text-[13px] font-black text-right tracking-tight text-secondary shrink-0 ml-2">{item.status}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminAnalyticsPage;