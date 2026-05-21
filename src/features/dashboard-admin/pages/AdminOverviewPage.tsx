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
import {IssueDetailModal} from "./IssueDetailModal";

type AdminIssue = Report & ReportFormData;

interface AdminOverviewPageProps {
  issues?: AdminIssue[]; 
}

const AdminOverviewPage: React.FC<AdminOverviewPageProps> = () => {
  const [searchQuery, setSearchQuery] = useState("");
  // const [liveStats, setLiveStats] = useState({
  //   totalReported: "0",
  //   totalSolved: "0",
  //   activeIssues: "0",
  //   resolutionRate: "0%",
  // });
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState<any[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
  const handleClose = () => setOpenMenuId(null);
  window.addEventListener('click', handleClose);
  return () => window.removeEventListener('click', handleClose);
}, []);

  // Single consolidated fetch function to get your truth data
  const fetchIssues = async () => {
    setLoading(true);
    try {
      const response = await privateApi.get('/issues/');
      // Match structure whether it's wrapped in paginated results or raw array
      const rawIssues = Array.isArray(response.data) ? response.data : response.data.results || [];
      setIssues(rawIssues);
    } catch (error) {
      console.error("Error fetching issues:", error);
      toast.error("Failed to load reported issues.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const liveStats = useMemo(() => {
    const total = issues.length;
    const solved = issues.filter((i) => i.status?.toLowerCase() === 'resolved').length;
    const rejected = issues.filter((i) => i.status?.toLowerCase() === 'rejected').length;
    
    const active = total - (solved + rejected);
    const rate = total > 0 ? Math.round((solved / total) * 100) : 0;

    return {
      totalReported: total.toLocaleString(),
      totalSolved: solved.toLocaleString(),
      activeIssues: active < 0 ? "0" : active.toLocaleString(),
      resolutionRate: `${rate}%`
    };
  }, [issues]); 

  // Fallback to mock data if state container hasn't loaded records yet
  const dataSource = issues.length > 0 ? issues : (mockReports as unknown as any[]);

  // Smooth item search matching layout filter
  const filteredIssues = useMemo(() => {
    return dataSource.filter((issue) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      
      const location = issue.location_address?.toLowerCase() || "";
      const category = issue.category_name?.toLowerCase() || issue.category?.toLowerCase() || "";
      const description = issue.description?.toLowerCase() || issue.title?.toLowerCase() || "";
      const residentName = issue.resident_name?.toLowerCase() || "";
      const status = issue.status?.toLowerCase() || "";
      const createdAt = issue.created_at ? new Date(issue.created_at).toLocaleDateString().toLowerCase() : "";
      const id = issue.issue_number?.toString().toLowerCase() || issue.id?.slice(0, 8).toLowerCase() || "";   

      return (
        location.includes(query) || 
        category.includes(query) || 
        description.includes(query) ||
        residentName.includes(query) ||
        status.includes(query) ||
        createdAt.includes(query) ||
        id.includes(query)
      );
    });
  }, [dataSource, searchQuery]);

  useEffect(() => {
    console.log("Check my issue data fields:", filteredIssues);
    console.log("LIVE STATS PREVIEW:", liveStats);
  }, [filteredIssues, liveStats]);

  const cards = [
    { title: "Total Issues reported", value: liveStats.totalReported, change: "4.3%", isUp: true, timeframe: "from last month" },
    { title: "Active Issues", value: liveStats.activeIssues, change: "4.3%", isUp: false, timeframe: "from last month" },
    { title: "Total Issues Solved", value: liveStats.totalSolved, change: "8%", isUp: true, timeframe: "from last month" },
    { title: "Resolution Rate", value: liveStats.resolutionRate, change: "2%", isUp: true, timeframe: "from last month" },
  ];

  // const pieData = [
  //   { name: 'Water', value: 400 },
  //   { name: 'Roads', value: 300 },
  //   { name: 'Electricity', value: 300 },
  //   { name: 'Waste', value: 200 },
  // ];

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
          "Submitted": "bg-yellow-500/10 text-yellow-600",
          "In Progress": "bg-blue-500/10 text-blue-600",
          "Resolved": "bg-emerald-500/10 text-emerald-600",
        };

        return (
          <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest whitespace-nowrap ${
            statusStyles[report.status] || 'bg-gray-100 text-gray-600'
          }`}>
            {(report.status || 'pending').replace('_', ' ')}
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
    },
    { 
  header: 'Actions', 
  key: 'actions',
  render: (issue: any) => {
    const isMenuOpen = openMenuId === issue.id;

    return (
      <div className="relative inline-block text-left">
        <button
          onClick={(e) => {
            e.stopPropagation(); 
            setOpenMenuId(isMenuOpen ? null : issue.id);
          }}
          className="p-2 hover:bg-secondary/5 text-secondary/40 hover:text-secondary rounded-xl transition-all"
        >
          <svg 
            className="w-4 h-4" 
            fill="currentColor" 
            viewBox="0 0 16 16"
          >
            <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
          </svg>
        </button>

        {/* Floating Context Menu Dropdown */}
        {isMenuOpen && (
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="absolute right-0 mt-2 w-48 bg-white border border-secondary/10 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-1 duration-150"
          >
            {/* 1. Flag Action */}
            <button
              onClick={() => {
                setOpenMenuId(null);
                // Call your flag backend function here:
                toast.success(`Issue ${issue.issue_number} flagged successfully.`);
              }}
              className="w-full text-left px-4 py-2.5 text-xs font-bold text-amber-600 hover:bg-amber-500/5 transition-colors flex items-center gap-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
              Flag Report
            </button>

            {/* 2. Internal Note Action */}
            <button
              onClick={() => {
                setOpenMenuId(null);
                // Call your prompt or modal for internal notes here:
                const note = prompt("Enter system admin internal logs:");
                if (note) toast.success("Internal note appended.");
              }}
              className="w-full text-left px-4 py-2.5 text-xs font-bold text-secondary/70 hover:bg-secondary/5 transition-colors flex items-center gap-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              System Admin Note
            </button>

            {/* Divider Line */}
            <div className="border-t border-secondary/5 my-1" />

            {/* 3. Permanent Delete Action */}
            <button
            onClick={() => {
              setOpenMenuId(null);
              
              toast((t) => (
                <div className="flex flex-col gap-3 p-1">
                  <div className="text-2xs text-secondary font-bold">
                    Permanently delete <span className="font-mono text-secondary">{issue.issue_number}</span>?
                    <p className="text-[13px] font-medium text-secondary/40 mt-0.5 normal-case">This administrative action cannot be undone.</p>
                  </div>
                  
                  <div className="flex items-center justify-end gap-2 mt-1">
                    {/* Cancel Option */}
                    <button
                      onClick={() => toast.dismiss(t.id)}
                      className="px-3 py-1.5 rounded-lg text-[12px] font-black uppercase tracking-wider text-secondary/50 hover:bg-secondary/5 transition-all"
                    >
                      Cancel
                    </button>
                    
                    {/* Confirmed Delete Option */}
                    <button
                      onClick={async () => {
                        toast.dismiss(t.id); 
                        
                        // Put your delete backend API call logic here:
                        // await privateApi.delete(`/issues/${issue.id}/`);
                        
                        toast.error("Record permanently deleted.");
                      }}
                      className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white text-[12px] font-black uppercase tracking-wider transition-all"
                    >
                      Confirm Delete
                    </button>
                  </div>
                </div>
                  ), {
                    duration: Infinity, 
                    position: 'top-center',
                    style: {
                      background: '#white',
                      border: '1px solid rgba(var(--secondary-rgb), 0.1)',
                      borderRadius: '1.25rem',
                      padding: '12px 16px',
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
                    }
                  });
                }}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-500/5 transition-colors flex items-center gap-2"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Permanent Delete
              </button>
                    </div>
                  )}
                </div>
              );
            }
          }
  ];

  const barChartData = useMemo(() => {
  // Initialize an empty map for the calendar months
  const monthlyMap: Record<string, { name: string; reported: number; solved: number }> = {};

  // Loop through your real database issues list
  issues.forEach((issue) => {
    if (!issue.created_at) return;

    // Parse out a clean shorthand month name (e.g., "Jan", "Feb", "May")
    const date = new Date(issue.created_at);
    const monthName = date.toLocaleString('en-US', { month: 'short' }); 

    // If this month bucket doesn't exist yet, seed it with zero values
    if (!monthlyMap[monthName]) {
      monthlyMap[monthName] = { name: monthName, reported: 0, solved: 0 };
    }

    // Increment metrics matching your exact configuration keys
    monthlyMap[monthName].reported += 1;
    if (issue.status?.toLowerCase() === 'resolved') {
      monthlyMap[monthName].solved += 1;
    }
  });

  const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const formattedData = Object.values(monthlyMap).sort((a, b) => 
    monthOrder.indexOf(a.name) - monthOrder.indexOf(b.name)
  );

  return formattedData.length > 0 ? formattedData : [{ name: 'May', reported: 0, solved: 0 }];
}, [issues]);

const pieChartData = useMemo(() => {
  if (!issues || issues.length === 0) return [];

  // 1. Count instances of each category
  const categoryCounts: Record<string, number> = {};
  issues.forEach((issue) => {
    // Normalizes name field mappings safely (handles 'Water', 'Roads', etc.)
    const categoryName = issue.category_name || issue.category || "General Infrastructure";
    categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
  });

  const totalIssuesCount = issues.length;

  // 2. Map color hex configurations to your brand scheme
  const designPalette = [
    '#2C0901', // Deep Coffee Black
    '#A06A50', // Earthy Roasted Clay
    '#D4A373', // Warm Sand Tan
    '#FAEDCD', // Soft Almond Cream
    '#E5D3B3', // Muted Gold Dust
  ];

  // 3. Convert absolute numerical counts into clean percentages
  const formattedPieData = Object.entries(categoryCounts).map(([name, count], index) => {
    const rawPercentage = (count / totalIssuesCount) * 100;
    
    return {
      name: name,
      // FIXED: Use the exact raw float for the SVG vector math engine to prevent rendering gaps
      value: rawPercentage, 
      // FIXED: Pass a clean rounded string explicitly meant only for UI typography badges
      displayPercentage: Math.round(rawPercentage),
      color: designPalette[index % designPalette.length] 
    };
  });

  // Sort descending so the largest segments stack elegantly first
  return formattedPieData.sort((a, b) => b.value - a.value);
}, [issues]);

  return (
    <div className="w-full space-y-6 md:space-y-8 p-4 md:p-8 bg-[#FDFBF7] min-h-screen relative">
      <AdminHeader />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {cards.map((stat, i) => (
          <AdminStatCard key={i} {...stat} />
        ))}
      </div>

      {/* Charts Grid */}
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
        
        {/* PIE CHART SIDE WRAPPER */}
        <div className="bg-white rounded-4xl md:rounded-[3rem] shadow-sm border border-secondary/5 overflow-hidden flex flex-col justify-center h-72 md:h-auto">
          <BasePieChart data={pieChartData} />
        </div>
      </div>

      {/* Table Section */}
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
        
        {/* Table Wrapper */}
        <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-secondary/5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full scrollbar-hide">
            <div className="min-w-200 w-full">
              <Table<AdminIssue> 
                columns={columns as any} 
                data={filteredIssues.slice(0, 5)} 
                isLoading={loading}
                onRowClick={(issue) => {
                  setSelectedIssueId(issue.id);
                  setIsModalOpen(true);
                }}
              />

              {isModalOpen && selectedIssueId && (
                      <IssueDetailModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        issue={filteredIssues.find((i) => i.id === selectedIssueId) || null}
                        setIssues={setIssues}
                      />
                    )}
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