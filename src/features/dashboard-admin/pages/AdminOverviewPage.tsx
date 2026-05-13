import React, { useState, useEffect } from "react";
import AdminStatCard from "./AdminStatCard";
import AdminHeader from "../../../components/layout/AdminHeader";
import BaseBarChart from "../../../components/ui/BaseBarChart";
import BasePieChart from "../../../components/ui/BasePieChart";
import Table from "../../../components/ui/Table";
import { type Report } from '../../report/components/IssueMapPicker';
import { type ReportFormData } from "../type";
import { AdminStatsOverview } from "../services/AdminStatsOverview";
import { mockReports } from "../../../mock/mockReports";    

type AdminIssue = Report & ReportFormData;

interface AdminOverviewPageProps {
  issues?: AdminIssue[]; 
}

const AdminOverviewPage: React.FC<AdminOverviewPageProps> = ({ issues = [] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [liveStats, setLiveStats] = useState({
    totalReported: "0",
    totalSolved: "0",
    activeIssues: "0",
    resolutionRate: "0%",
  });

  useEffect(() => {
    const fetchStats = async () => {
      const data = await AdminStatsOverview.getDashboardStats();
      setLiveStats(data);
    };
    fetchStats();
  }, []);

  const dataSource = issues.length > 0 ? issues : (mockReports as unknown as AdminIssue[]);

  const filteredIssues = dataSource.filter((issue) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    
    const location = issue.location_address?.toLowerCase() || "";
    const category = issue.category?.toLowerCase() || "";
    const title = (issue as any).title?.toLowerCase() || "";

    return location.includes(query) || category.includes(query) || title.includes(query);
  });

  const cards = [
    { title: "Total Issues reported", value: liveStats.totalReported, change: "4.3%", isUp: true, timeframe: "from last month" },
    { title: "Active Issues", value: liveStats.totalReported, change: "4.3%", isUp: false, timeframe: "from last month" },
    { title: "Total Issues Solved", value: liveStats.totalSolved, change: "8%", isUp: true, timeframe: "from last month" },
    { title: "Resolution Rate", value: liveStats.resolutionRate, change: "2%", isUp: true, timeframe: "from last month" },
  ];

  const pieData = [
    { name: 'Water', value: 400 },
    { name: 'Roads', value: 300 },
    { name: 'Electricity', value: 300 },
    { name: 'Waste', value: 200 },
  ];

  const columns = [
    { header: 'Issue Id', key: 'id' },
    { header: 'Title', key: 'title' },
    { 
      header: 'Location', 
      key: 'location_address', 
      render: (item: AdminIssue) => (
        <span className="text-[10px] font-medium truncate max-w-37.5 inline-block">
          {item.location_address || "N/A"}
        </span>
      )
    },
    { 
      header: 'Status', 
      key: 'status',
      render: (report: AdminIssue) => {
        const statusStyles: Record<string, string> = {
          resolved: 'bg-green-100 text-green-700',
          rejected: 'bg-red-100 text-red-700',
          in_progress: 'bg-amber-100 text-amber-700',
          under_review: 'bg-blue-100 text-blue-700',
          submitted: 'bg-gray-100 text-gray-600',
        };

        return (
          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
            statusStyles[report.status] || 'bg-gray-100 text-gray-600'
          }`}>
            {(report.status || 'pending').replace('_', ' ')}
          </span>
        );
      }
    },
    { 
      header: 'Date Reported', 
      key: 'Date',
      render: (report: AdminIssue) => (
        <span className="text-secondary/40 italic text-[11px]">
          {report.created_at ? new Date(report.created_at).toLocaleDateString() : 'N/A'}
        </span>
      )
    },
  ];

  return (
    <div className="space-y-8 p-4 md:p-8 bg-[#FDFBF7] min-h-screen">
      <AdminHeader />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {cards.map((stat, i) => (
          <AdminStatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] md:rounded-[3rem] shadow-sm border border-secondary/5 overflow-hidden">
          <div className="overflow-y-auto">
            <BaseBarChart 
              title="Monthly Report Activity"
              data={[
                { name: 'Jan', reported: 65, solved: 40 },
                { name: 'Feb', reported: 45, solved: 30 },
                { name: 'Mar', reported: 85, solved: 70 },
                { name: 'Apr', reported: 35, solved: 25 },
                { name: 'May', reported: 90, solved: 75 },
                { name: 'Jun', reported: 55, solved: 45 },
                { name: 'Jul', reported: 55, solved: 45 },
                { name: 'Aug', reported: 55, solved: 45 },
                { name: 'Sep', reported: 55, solved: 45 },
                { name: 'Oct', reported: 55, solved: 45 },
              ]}
              dataKeys={[
                { key: 'reported', color: '#5C4033', label: 'Issues Reported' },
                { key: 'solved', color: '#E5D3B3', label: 'Issues Solved' }
              ]}
            />
          </div>
        </div>
        <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] shadow-sm border border-secondary/5 overflow-hidden">
          <BasePieChart 
            title="Issue Distribution By Categories"
            data={pieData}
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4">
          <h3 className="text-sm font-black text-secondary uppercase tracking-[0.2em]">
            {searchQuery ? "Search Results" : "Recent Activity"}
          </h3>
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search by location, title, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-secondary/10 rounded-full px-6 py-2.5 text-xs font-bold text-secondary outline-none focus:border-secondary/30 transition-all placeholder:text-secondary/30"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <svg className="w-4 h-4 text-secondary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <button className="text-[10px] w-fit font-bold text-secondary/40 uppercase hover:text-secondary transition-colors text-left">
            View All Reports
          </button>
        </div>
        
        <div className="bg-white rounded-[2.5rem] overflow-x-auto border border-secondary/5 shadow-sm">
          <Table<AdminIssue> 
            columns={columns as any} 
            data={filteredIssues} 
          />
          {filteredIssues.length === 0 && (
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