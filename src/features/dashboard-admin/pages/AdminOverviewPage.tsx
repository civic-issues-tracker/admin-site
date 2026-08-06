/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminStatCard from "./AdminStatCard";
import AdminHeader from "../../../components/layout/AdminHeader";
import BaseBarChart from "../../../components/ui/BaseBarChart";
import BasePieChart from "../../../components/ui/BasePieChart";
import Table from "../../../components/ui/Table";
import { type Report } from '../../report/components/IssueMapPicker';
import { type ReportFormData } from "../type";
import { mockReports } from "../../../mock/mockReports";
import { privateApi } from "../../auth/services/authService";
import { useNavigate } from "react-router-dom";
import { IssueDetailModal } from "./IssueDetailModal";

type AdminIssue = Report & ReportFormData;

interface AdminOverviewPageProps {
  issues?: AdminIssue[];
}

// Skeleton loading primitives declared at module scope for performance
const SkeletonPulse = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200/60 rounded-xl ${className}`} />
);

const AdminOverviewPage: React.FC<AdminOverviewPageProps> = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null);
  const navigate = useNavigate();

  // Debounce search query to prevent unnecessary API requests
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // --- Primary Issues Query ---
  const { data: rawIssuesData, isLoading: issuesLoading } = useQuery({
    queryKey: ['issues', debouncedSearch],
    queryFn: async () => {
      let config = {};
      if (debouncedSearch) {
        const trimmed = debouncedSearch.toLowerCase();
        const statusMap: Record<string, string> = {
          "in progress": "in_progress", "in_progress": "in_progress",
          "pending admin review": "pending_admin_review", "pending_admin_review": "pending_admin_review",
          "pending admin": "pending_admin_review", "pending_admin": "pending_admin_review",
          "submitted": "submitted", "resolved": "resolved", "escalated": "escalated", "rejected": "rejected"
        };

        if (statusMap[trimmed]) {
          config = { params: { status: statusMap[trimmed] } };
        } else {
          config = { params: { search: debouncedSearch } };
        }
      }

      const response = await privateApi.get('/issues/', config);
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    },
    staleTime: 1000 * 60 * 5,       // Data remains fresh for 5 minutes
    gcTime: 1000 * 60 * 30,          // Kept in cache memory for 30 minutes
    refetchOnWindowFocus: false,     // Prevents refetching simply by clicking back onto browser window
  });

  // --- Analytics Query ---
  const { data: analyticsData = { monthly: [], ratios: [], triage: {} }, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const [monthlyRes, ratiosRes, triageRes] = await Promise.all([
        privateApi.get('/analytics/monthly-activity/'),
        privateApi.get('/analytics/category-ratios/'),
        privateApi.get('/analytics/org-triage/')
      ]);
      return {
        monthly: Array.isArray(monthlyRes.data) ? monthlyRes.data : (monthlyRes.data?.results || []),
        ratios: Array.isArray(ratiosRes.data) ? ratiosRes.data : (ratiosRes.data?.results || []),
        triage: triageRes.data
      };
    },
    staleTime: 1000 * 60 * 5,       // Data remains fresh for 5 minutes
    gcTime: 1000 * 60 * 30,          // Kept in cache memory for 30 minutes
    refetchOnWindowFocus: false,     // Prevents refetching simply by clicking back onto browser window
  });

  // Derived issues dataset fallback
  const issuesData = useMemo(() => {
    if (!rawIssuesData) return [];
    if (rawIssuesData.length === 0 && !debouncedSearch && !issuesLoading) {
      return mockReports as unknown as any[];
    }
    return rawIssuesData;
  }, [rawIssuesData, debouncedSearch, issuesLoading]);

  // Quick Stats memoization
  const quickStats = useMemo(() => {
    const data = analyticsData.triage || {};
    const total = data.total_reported ?? data.total ?? issuesData.length;
    const solved = data.total_solved ?? data.solved ?? issuesData.filter((i: any) => i.status?.toLowerCase() === 'resolved').length;
    const active = data.active_issues ?? data.active ?? (issuesData.length - issuesData.filter((i: any) => ['resolved', 'rejected'].includes(i.status?.toLowerCase())).length);
    const rate = data.resolution_rate ?? data.rate ?? (total > 0 ? Math.round((solved / total) * 100) : 0);

    return {
      totalReported: Number(total).toLocaleString(),
      activeIssues: Number(active < 0 ? 0 : active).toLocaleString(),
      totalSolved: Number(solved).toLocaleString(),
      resolutionRate: `${rate}%`
    };
  }, [analyticsData, issuesData]);

  const cards = [
    { title: "Total Issues reported", value: quickStats.totalReported, change: "4.3%", isUp: true, timeframe: "from last month" },
    { title: "Active Issues", value: quickStats.activeIssues, change: "4.3%", isUp: false, timeframe: "from last month" },
    { title: "Total Issues Solved", value: quickStats.totalSolved, change: "8%", isUp: true, timeframe: "from last month" },
    { title: "Resolution Rate", value: quickStats.resolutionRate, change: "2%", isUp: true, timeframe: "from last month" },
  ];

  const columns = [
    { header: 'Issue Id', key: 'issue_number' },
    { header: 'Category', key: 'category_name', render: (issue: any) => (<span className="text-[12px] font-medium truncate max-w-30 md:max-w-37.5 inline-block">{issue.category_name}</span>) },
    {
      header: 'Location', key: 'location_address', render: (item: AdminIssue) => (
        <span className="text-[12px] font-medium truncate max-w-30 md:max-w-37.5 inline-block">{item.location_address || "N/A"}</span>
      )
    },
    {
      header: 'Status', key: 'status', render: (report: AdminIssue) => {
        const statusStyles: Record<string, string> = {
          "submitted": "bg-yellow-500/10 text-yellow-600", "in progress": "bg-blue-500/10 text-blue-600",
          "resolved": "bg-emerald-500/10 text-emerald-600", "escalated": "bg-red-500/10 text-red-600",
          "pending_admin": "bg-red-500/10 text-red-600", "pending_admin_review": "bg-red-500/10 text-red-600",
          "rejected": "bg-neutral-500/10 text-neutral-600"
        };
        const rawStatus = (report.status || 'pending').toLowerCase();
        return (
          <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest whitespace-nowrap ${statusStyles[rawStatus] || 'bg-gray-100 text-gray-600'}`}>
            {rawStatus.replace('_', ' ')}
          </span>
        );
      }
    },
    {
      header: 'Date Reported', key: 'created_at', render: (report: AdminIssue) => (
        <span className="text-secondary/40 italic text-[12px] whitespace-nowrap">
          {report.created_at ? new Date(report.created_at).toLocaleDateString() : 'N/A'}
        </span>
      )
    }
  ];

  const barChartData = useMemo(() => {
    if (analyticsData.monthly.length === 0) return [{ name: 'May', reported: 0, solved: 0 }];
    return analyticsData.monthly.map((item: any) => ({
      name: item.month || item.name,
      reported: item.reported ?? item.issues_reported ?? 0,
      solved: item.solved ?? item.issues_solved ?? 0
    }));
  }, [analyticsData.monthly]);

  const pieChartData = useMemo(() => {
    if (analyticsData.ratios.length === 0) return [];
    const designPalette = ['#2C0901', '#A06A50', '#D4A373', '#FAEDCD', '#E5D3B3'];
    return analyticsData.ratios.map((item: any, index: number) => {
      const rawValue = item.value ?? item.percentage ?? item.count ?? 0;
      const extractedName = item.name || item.category_name || item.category || item.issue__category__name || "Infrastructure";
      return {
        name: extractedName,
        value: rawValue,
        displayPercentage: item.displayPercentage ?? Math.round(rawValue),
        color: item.color || designPalette[index % designPalette.length]
      };
    }).sort((a: any, b: any) => b.value - a.value);
  }, [analyticsData.ratios]);

  return (
    <div className="w-full space-y-8 md:space-y-10 lg:space-y-12 p-4 md:p-8 lg:p-10 bg-primary min-h-screen relative">
      
      {/* 1. Header Section */}
      <AdminHeader onOpenIssue={() => { }} />

      {/* 2. Stat Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
        {cards.map((stat, i) => (
          <div key={i} className="h-28">
            {analyticsLoading || issuesLoading ? (
              <div className="bg-primary border border-secondary/5 rounded-3xl p-5 h-full flex flex-col justify-between shadow-sm">
                <div className="space-y-2">
                  <SkeletonPulse className="h-3 w-1/2" />
                  <SkeletonPulse className="h-7 w-2/3" />
                </div>
                <SkeletonPulse className="h-3 w-1/3" />
              </div>
            ) : (
              <AdminStatCard {...stat} />
            )}
          </div>
        ))}
      </div>

      <IssueDetailModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedIssue(null); }}
        issue={selectedIssue}
        setIssues={() => { }}
      />

      {/* 3. Visual Analytics Section (Bar & Pie Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
        <div className="lg:col-span-2 bg-primary rounded-4xl md:rounded-[3rem] shadow-sm border border-secondary/5 overflow-hidden p-6 md:p-8 flex flex-col justify-between min-h-88 h-80">
          {analyticsLoading ? (
            <div className="h-full flex flex-col justify-between space-y-4">
              <SkeletonPulse className="h-6 w-48" />
              <div className="flex items-end justify-between gap-3 h-48 pt-4">
                {[...Array(6)].map((_, i) => (
                  <SkeletonPulse key={i} className={`w-full h-${(i % 3 + 1) * 12}`} />
                ))}
              </div>
            </div>
          ) : (
            <BaseBarChart
              title="Monthly Report Activity"
              data={barChartData}
              dataKeys={[
                { key: 'reported', color: '#2C0901', label: 'Issues Reported' },
                { key: 'solved', color: '#D4A373', label: 'Issues Solved' }
              ]}
            />
          )}
        </div>

        <div className="bg-primary rounded-4xl md:rounded-[3rem] shadow-sm border border-secondary/5 overflow-hidden p-6 md:p-8 flex flex-col justify-center min-h-88 h-80">
          {analyticsLoading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-6">
              <SkeletonPulse className="w-36 h-36 rounded-full" />
              <div className="w-full space-y-2">
                <SkeletonPulse className="h-3 w-3/4 mx-auto" />
                <SkeletonPulse className="h-3 w-1/2 mx-auto" />
              </div>
            </div>
          ) : (
            <BasePieChart data={pieChartData} />
          )}
        </div>
      </div>

      {/* 4. Recent Activity & Table Section */}
      <div className="space-y-6 md:space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2 md:px-4">
          <h3 className="text-xs md:text-sm font-black text-secondary uppercase tracking-[0.2em]">
            {searchQuery ? "Search Results" : "Recent Activity"}
          </h3>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search by location, title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-primary border border-secondary/10 rounded-full px-6 py-2.5 text-xs font-bold text-secondary outline-none focus:border-secondary/30 transition-all placeholder:text-secondary/30 shadow-sm"
              />
            </div>
            <button 
              onClick={() => navigate("/admin/issues")} 
              className="text-[10px] font-bold text-secondary uppercase hover:text-secondary transition-colors text-center md:text-left whitespace-nowrap"
            >
              View All Reports
            </button>
          </div>
        </div>

        <div className="bg-primary rounded-3xl md:rounded-[2.5rem] border border-secondary/5 shadow-sm overflow-hidden p-6 md:p-8">
          {issuesLoading ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-secondary/5">
                {[...Array(5)].map((_, i) => (
                  <SkeletonPulse key={i} className="h-4 w-20" />
                ))}
              </div>
              {[...Array(5)].map((_, i) => (
                <SkeletonPulse key={i} className="h-12 w-full rounded-2xl" />
              ))}
            </div>
          ) : (
            <Table<AdminIssue>
              columns={columns as any}
              data={issuesData.slice(0, 5)}
              isLoading={false}
              onRowClick={(issue) => { setSelectedIssue(issue); setIsModalOpen(true); }}
            />
          )}
        </div>
      </div>

    </div>
  );
};

export default AdminOverviewPage;