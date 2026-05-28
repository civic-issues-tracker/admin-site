/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import AdminStatCard from "./AdminStatCard";
import AdminHeader from "../../../components/layout/AdminHeader";
import BaseBarChart from "../../../components/ui/BaseBarChart";
import BasePieChart from "../../../components/ui/BasePieChart";
import Table from "../../../components/ui/Table";
import { type Report } from '../../report/components/IssueMapPicker';
import { type ReportFormData } from "../type";
import { mockReports } from "../../../mock/mockReports";    
import { privateApi } from "../../auth/services/authService";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { IssueDetailModal } from "./IssueDetailModal";

type AdminIssue = Report & ReportFormData;

interface AdminOverviewPageProps {
  issues?: AdminIssue[]; 
}

const AdminOverviewPage: React.FC<AdminOverviewPageProps> = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  // State for Modal handling
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null);
  
  const navigate = useNavigate();

  // Backend Analytics States
  const [monthlyActivity, setMonthlyActivity] = useState<any[]>([]);
  const [categoryRatios, setCategoryRatios] = useState<any[]>([]);
  const [quickStats, setQuickStats] = useState({
    totalReported: "0",
    activeIssues: "0",
    totalSolved: "0",
    resolutionRate: "0%"
  });

  const fetchIssues = async () => {
    try {
      const response = await privateApi.get('/issues/');
      const rawIssues = Array.isArray(response.data) ? response.data : response.data.results || [];
      setIssues(rawIssues);
      if (!searchQuery.trim()) {
        setSearchResults(rawIssues);
      }
    } catch (error) {
      console.error("Error fetching issues:", error);
      toast.error("Failed to load reported issues.");
    }
  };

  const fetchBackendAnalytics = async () => {
    try {
      const [monthlyRes, ratiosRes, triageRes] = await Promise.all([
        privateApi.get('/analytics/monthly-activity/'),
        privateApi.get('/analytics/category-ratios/'),
        privateApi.get('/analytics/org-triage/') 
      ]);

      if (Array.isArray(monthlyRes.data)) {
        setMonthlyActivity(monthlyRes.data);
      } else if (monthlyRes.data?.results && Array.isArray(monthlyRes.data.results)) {
        setMonthlyActivity(monthlyRes.data.results);
      }

      if (Array.isArray(ratiosRes.data)) {
        setCategoryRatios(ratiosRes.data);
      } else if (ratiosRes.data?.results && Array.isArray(ratiosRes.data.results)) {
        setCategoryRatios(ratiosRes.data.results);
      }

      if (triageRes.data) {
        const data = triageRes.data;
        const total = data.total_reported ?? data.total ?? issues.length;
        const solved = data.total_solved ?? data.solved ?? issues.filter((i) => i.status?.toLowerCase() === 'resolved').length;
        const active = data.active_issues ?? data.active ?? (issues.length - issues.filter((i) => ['resolved', 'rejected'].includes(i.status?.toLowerCase())).length);
        const rate = data.resolution_rate ?? data.rate ?? (total > 0 ? Math.round((solved / total) * 100) : 0);

        setQuickStats({
          totalReported: Number(total).toLocaleString(),
          activeIssues: Number(active < 0 ? 0 : active).toLocaleString(),
          totalSolved: Number(solved).toLocaleString(),
          resolutionRate: `${rate}%`
        });
      }
    } catch (error) {
      console.error("Error structural fetching backend analytics profiles:", error);
    }
  };

  const handleSearchFetch = async (search: string) => {
    setLoading(true);
    try {
      const trimmedSearch = search.trim().toLowerCase();
      let config = {};

      if (trimmedSearch) {
        const statusMap: Record<string, string> = {
            "in progress": "in_progress", "in_progress": "in_progress",
            "pending admin review": "pending_admin_review", "pending_admin_review": "pending_admin_review", 
            "pending admin": "pending_admin_review", "pending_admin": "pending_admin_review",
            "submitted": "submitted", "resolved": "resolved", "escalated": "escalated", "rejected": "rejected"
        };
        
        if (statusMap[trimmedSearch]) {
            config = { params: { status: statusMap[trimmedSearch] } };
        } else {
            config = { params: { search: search.trim() } };
        }
      }

      const response = await privateApi.get('/issues/', config);
      const rawResults = Array.isArray(response.data) ? response.data : response.data.results || [];
      setSearchResults(rawResults);
    } catch (error) {
      console.error("Error executing query search:", error);
      toast.error("Search query failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  useEffect(() => {
    fetchBackendAnalytics();
  }, [issues]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearchFetch(searchQuery);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const dataSource = searchResults.length > 0 ? searchResults : (issues.length === 0 && !loading ? (mockReports as unknown as any[]) : searchResults);

  const filteredIssues = useMemo(() => {
    return dataSource;
  }, [dataSource]);

  const cards = [
    { title: "Total Issues reported", value: quickStats.totalReported, change: "4.3%", isUp: true, timeframe: "from last month" },
    { title: "Active Issues", value: quickStats.activeIssues, change: "4.3%", isUp: false, timeframe: "from last month" },
    { title: "Total Issues Solved", value: quickStats.totalSolved, change: "8%", isUp: true, timeframe: "from last month" },
    { title: "Resolution Rate", value: quickStats.resolutionRate, change: "2%", isUp: true, timeframe: "from last month" },
  ];

  const columns = [
    { header: 'Issue Id', key: 'issue_number'  },
    { header: 'Category', key: 'category_name', render: (issue: any) => (<span className="text-[12px] font-medium truncate max-w-30 md:max-w-37.5 inline-block">{issue.category_name}</span>) },
    { 
      header: 'Location', 
      key: 'location_address', 
      render: (item: AdminIssue) => (
        <span className="text-[12px] font-medium truncate max-w-30 md:max-w-37.5 inline-block">
          {item.location_address || "N/A"}
        </span>
      )
    },
    { 
      header: 'Status', 
      key: 'status',
      render: (report: AdminIssue) => {
        const statusStyles: Record<string, string> = {
          "submitted": "bg-yellow-500/10 text-yellow-600",
          "Submitted": "bg-yellow-500/10 text-yellow-600",
          "in progress": "bg-blue-500/10 text-blue-600",
          "In Progress": "bg-blue-500/10 text-blue-600",
          "resolved": "bg-emerald-500/10 text-emerald-600",
          "Resolved": "bg-emerald-500/10 text-emerald-600",
          "escalated": "bg-red-500/10 text-red-600",
          "Escalated": "bg-red-500/10 text-red-600",
          "pending_admin": "bg-red-500/10 text-red-600",
          "pending_admin_review": "bg-red-500/10 text-red-600",
          "rejected": "bg-neutral-500/10 text-neutral-600"
        };
        const rawStatus = report.status || 'pending';
        return (
          <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest whitespace-nowrap ${
            statusStyles[rawStatus] || 'bg-gray-100 text-gray-600'
          }`}>
            {rawStatus.replace('_', ' ')}
          </span>
        );
      }
    },
    { 
      header: 'Date Reported', 
      key: 'created_at',
      render: (report: AdminIssue) => (
        <span className="text-secondary/40 italic text-[12px] whitespace-nowrap">
          {report.created_at ? new Date(report.created_at).toLocaleDateString() : 'N/A'}
        </span>
      )
    }
  ];

  const barChartData = useMemo(() => {
    if (monthlyActivity.length === 0) return [{ name: 'May', reported: 0, solved: 0 }];
    return monthlyActivity.map((item: any) => ({
      name: item.month || item.name,
      reported: item.reported ?? item.issues_reported ?? 0,
      solved: item.solved ?? item.issues_solved ?? 0
    }));
  }, [monthlyActivity]);

  const pieChartData = useMemo(() => {
    if (categoryRatios.length === 0) return [];
    const designPalette = ['#2C0901', '#A06A50', '#D4A373', '#FAEDCD', '#E5D3B3'];
    return categoryRatios.map((item: any, index: number) => {
      const rawValue = item.value ?? item.percentage ?? item.count ?? 0;
      const extractedName = item.name || item.category_name || item.category || item.issue__category__name || "Infrastructure";
      return {
        name: extractedName,
        value: rawValue,
        displayPercentage: item.displayPercentage ?? Math.round(rawValue),
        color: item.color || designPalette[index % designPalette.length]
      };
    }).sort((a: any, b: any) => b.value - a.value);
  }, [categoryRatios]);

  return (
    <div className="w-full space-y-6 md:space-y-8 p-4 md:p-8 bg-[#FDFBF7] min-h-screen relative">
      <AdminHeader onOpenIssue={(issue) => { setSelectedIssue(issue); setIsModalOpen(true); }} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {cards.map((stat, i) => (
          <AdminStatCard key={i} {...stat} />
        ))}
      </div>

      <IssueDetailModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSelectedIssue(null); }} 
        issue={selectedIssue}
        setIssues={setIssues} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 bg-white rounded-4xl md:rounded-[3rem] shadow-sm border border-secondary/5 overflow-hidden p-6 md:p-8 flex flex-col justify-between">
          <div className="w-full overflow-x-auto overflow-y-hidden">
            <div className="min-w-150 lg:min-w-full h-72 relative">
              <BaseBarChart 
                title="Monthly Report Activity"
                data={barChartData}
                dataKeys={[
                  { key: 'reported', color: '#2C0901', label: 'Issues Reported' }, 
                  { key: 'solved', color: '#D4A373', label: 'Issues Solved' }   
                ]}
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-4xl md:rounded-[3rem] shadow-sm border border-secondary/5 overflow-hidden flex flex-col justify-center h-72 md:h-auto">
          <BasePieChart data={pieChartData} />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2 md:px-4">
          <h3 className="text-sm font-black text-secondary uppercase tracking-[0.2em]">
            {searchQuery ? "Search Results" : "Recent Activity"}
          </h3>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search by location, title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-secondary/10 rounded-full px-6 py-2.5 text-xs font-bold text-secondary outline-none focus:border-secondary/30 transition-all placeholder:text-secondary/30 shadow-sm"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <svg className="w-4 h-4 text-secondary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <button onClick={() => navigate("/admin/issues")} className="text-[10px] font-bold text-secondary/40 uppercase hover:text-secondary transition-colors text-center md:text-left whitespace-nowrap">
              View All Reports
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-secondary/5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full scrollbar-hide">
            <div className="min-w-200 w-full">
              <Table<AdminIssue> 
                columns={columns as any} 
                data={filteredIssues.slice(0, 5)} 
                isLoading={loading}
                onRowClick={(issue) => {
                  setSelectedIssue(issue);
                  setIsModalOpen(true);
                }}
              />
            </div>
          </div>

          {!loading && filteredIssues.length === 0 && (
            <div className="p-12 text-center text-secondary/40 text-[10px] font-black uppercase tracking-widest">
              No matching reports found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOverviewPage;