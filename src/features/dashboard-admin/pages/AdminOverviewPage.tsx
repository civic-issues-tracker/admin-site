import React from "react";
import AdminStatCard from "./AdminStatCard";
import AdminHeader from "../../../components/layout/AdminHeader";
import BaseBarChart from "../../../components/ui/BaseBarChart";
import BasePieChart from "../../../components/ui/BasePieChart";
import Table from "../../../components/ui/Table";
import { type Report } from '../../report/components/IssueMapPicker';

interface AdminOverviewPageProps {
  reports: Report[];
}

const AdminOverviewPage: React.FC<AdminOverviewPageProps> = ({ reports }) => {
  const mockStats = [
    { title: "Total Issues reported", value: "12,482", change: "4.3%", isUp: true, timeframe: "from last month" },
    { title: "Total Issues Submitted", value: "16,546", change: "8%", isUp: true, timeframe: "from last month" },
    { title: "Resolution Rate", value: "78%", change: "8%", isUp: false, timeframe: "from last month" },
    { title: "Active Issues", value: "5,430", change: "4.3%", isUp: true, timeframe: "from last month" },
  ];

  const barData = [
    { name: 'Jan', reported: 65, resolved: 40 },
    { name: 'Feb', reported: 45, resolved: 30 },
    { name: 'Mar', reported: 85, resolved: 70 },
    { name: 'Apr', reported: 35, resolved: 25 },
    { name: 'May', reported: 90, resolved: 75 },
    { name: 'Jun', reported: 15, resolved: 10 },
    { name: 'Jul', reported: 55, resolved: 45 },
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
      key: 'location',
      render: (report: Report) => (
        <span className="text-[10px] font-medium">
          {report.location_lat.toFixed(2)}, {report.location_long.toFixed(2)}
        </span>
      )
    },
    { 
      header: 'Status', 
      key: 'status',
      render: (report: Report) => {
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
            {report.status.replace('_', ' ')}
          </span>
        );
      }
    },
    { 
      header: 'Created At', 
      key: 'createdAt',
      render: (report: Report) => (
        <span className="text-secondary/40 italic text-[11px]">
          {new Date(report.created_at).toLocaleDateString()}
        </span>
      )
    },
  ];

  return (
    <div className="space-y-8 p-4 md:p-8 bg-[#FDFBF7] min-h-screen">
      <AdminHeader />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {mockStats.map((stat, i) => (
          <AdminStatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] md:rounded-[3rem] shadow-sm border border-secondary/5 overflow-hidden">
          <BaseBarChart 
            title="Reported & Resolved Issues per Month"
            data={barData}
            dataKeys={[
              { key: 'reported', color: '#5C4033', label: 'Reported' },
              { key: 'resolved', color: '#E5D3B3', label: 'Resolved' }
            ]}
          />
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
          <h3 className="text-sm font-black text-secondary uppercase tracking-[0.2em]">Recent Activity</h3>
          <button className="text-[10px] w-fit font-bold text-secondary/40 uppercase hover:text-secondary transition-colors text-left">
            View All Reports
          </button>
        </div>
        
        <div className="bg-white rounded-[2.5rem] overflow-x-auto border border-secondary/5 shadow-sm">
          <Table columns={columns} data={reports} />
        </div>
      </div>
    </div>
  );
};

export default AdminOverviewPage;