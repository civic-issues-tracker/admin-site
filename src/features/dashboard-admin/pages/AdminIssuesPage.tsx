import React, { useState, useEffect, useMemo } from 'react';
import { 
  IoSearchOutline, 
  IoFilterOutline, 
  IoEyeOutline, 
  IoCheckmarkCircleOutline, 
  IoLocationOutline ,
  IoMailOutline,
  IoCallOutline
} from "react-icons/io5";
import Table from './../../../components/ui/Table'; 
import { privateApi } from '../../auth/services/authService';
import Toast from '../../../components/ui/Toast';

//HELPERS & MOCK DATA
const getStatusStyle = (status: string) => {
  switch (status) {
    case "Solved": return "bg-green-500/10 text-green-500 border-green-500/20";
    case "In Progress": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    default: return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
  }
};

const MOCK_ISSUES = Array.from({ length: 20 }).map((_, i) => ({
  id: `ISS-${1000 + i}`,
  reporter: ["Hebron Enyew", "Abebe Kebede", "Sara Tekle", "Mulugeta Belay"][i % 4],
  location_address: ["Bole, Addis Ababa", "Gerji", "Megenagna", "Piassa", "Casanchis"][i % 5],
  category: ["Roads", "Water", "Electricity", "Waste Management"][i % 4],
  department: ["Infrastructure", "Utility", "Sanitation"][i % 3],
  status: ["Submitted", "In Progress", "Solved"][i % 3],
  created_at: `2026-05-${String((i % 12) + 1).padStart(2, '0')}`,
}));

const AdminIssuesPage: React.FC = () => {
  const [issues, setIssues] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      setLoading(true);
      try {
        const response = await privateApi.get('/issues/'); 
        setIssues(response.data);
      } catch (error) {
        console.error("Error fetching issues:", error);
        Toast("Failed to load reported issues.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  // SEARCH & FILTER 
  const filteredIssues = useMemo(() => {
  return issues.filter((issue) => {
    const reporter = (issue.reporter || "").toLowerCase();
    const address = (issue.location_address || "").toLowerCase();
    const category = (issue.category || "").toLowerCase();
    const id = (String(issue.id) || "").toLowerCase(); // Ensure ID is a string
    const search = searchTerm.toLowerCase();

    const matchesSearch = 
      reporter.includes(search) ||
      address.includes(search) ||
      category.includes(search) ||
      id.includes(search);

    const matchesStatus = statusFilter === "All" || issue.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
}, [searchTerm, statusFilter, issues]);

  //  COLUMN DEFINITIONS 
  const columns = [
    { header: "ID", key: "id" },
    {
    header: "Reporter",
    key: "reporter",
    render: (issue: any) => (
      <div className="flex flex-col">
        <span className="font-bold text-secondary text-sm">
          {issue.resident_name || issue.reporter || "Anonymous"}
        </span>
        <span className="text-[10px] text-secondary/40 uppercase font-black tracking-tighter">
          Verified User
        </span>
      </div>
    )
  },
    { 
      header: "Location", 
      key: "location_address",
      render: (issue: any) => (
        <div className="flex items-center gap-2 text-sm text-secondary/80">
          <IoLocationOutline className="text-secondary/40" />
          {issue.location_address.slice(0, 30) || "N/A"}
        </div>
      )
    },
    { header: "Category", key: "category_name" },
    { 
      header: "Status", 
      key: "status",
      render: (issue: any) => (
        <span className={`px-4 py-1.5 rounded-full text-[9px] uppercase font-black border ${getStatusStyle(issue.status)}`}>
          {issue.status}
        </span>
      )
    },
    {
    header: "Contact Info",
    key: "contact",
    render: (issue: any) => (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs text-secondary/70">
          <IoMailOutline size={12} className="text-secondary/30" />
          {issue.reporter_email || "N/A"}
        </div>
        <div className="flex items-center gap-2 text-xs text-secondary/70">
          <IoCallOutline size={12} className="text-secondary/30" />
          {issue.reporter_phone || "No Phone"}
        </div>
      </div>
    )
  },
    {
  header: "Actions",
  key: "actions",
  render: (issue: any) => (
    <div className="flex items-center gap-4">
      <button 
        onClick={(e) => {
          e.stopPropagation();
          handleViewDetails(issue);
        }}
        className="p-2.5 rounded-xl bg-secondary/5 text-secondary hover:bg-secondary hover:text-white transition-all duration-300"
        title="View Details"
      >
        <IoEyeOutline size={20} />
      </button>

     
      <button 
        onClick={(e) => {
          e.stopPropagation();
          handleResolveIssue(issue.id, issue.status);
        }}
        className={`p-2.5 rounded-full transition-all duration-300 ${
          issue.status === 'Resolved' 
            ? 'bg-green-500 text-white cursor-default' 
            : 'text-secondary/40 hover:text-green-500 hover:bg-green-500/10'
        }`}
        disabled={issue.status === 'Resolved'}
        title={issue.status === 'Resolved' ? "Already Resolved" : "Mark as Resolved"}
      >
        <IoCheckmarkCircleOutline size={22} />
      </button>
    </div>
  )
}
  ];

  const handleViewDetails = (issue: any) => {
  setSelectedIssue(issue);
  setIsDrawerOpen(true);
};

const handleResolveIssue = async (id: string, currentStatus: string) => {
  if (currentStatus === "Resolved") return;

  
  
  const confirmed = window.confirm("Are you sure you want to mark this issue as Resolved?");
  
  if (confirmed) {
    setIssues(prev => prev.map(issue => 
      issue.id === id ? { ...issue, status: "Resolved" } : issue
    ));

    try {
      // API call to update Django backend
      // await privateApi.patch(`/issues/${id}/`, { status: "Resolved" });
      showToast("Issue successfully resolved", "success");
    } catch (error) {
      showToast("Failed to update issue status", "error");
      // Optional: Rollback state on error
    }
  }
};

  return (
    <div className="min-h-screen bg-primary px-6 lg:px-20 py-10 animate-in fade-in duration-500">
      <header className="mb-10">
        <h1 className="font-header text-4xl font-black text-secondary tracking-tighter uppercase">
          Issue <span className="font-light">Management</span>
        </h1>
        <p className="font-body text-[10px] text-secondary/40 uppercase tracking-[0.4em] mt-2 font-bold">Admin Control Center</p>
      </header>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <IoSearchOutline className="absolute left-5 top-1/2 -translate-y-1/2 text-secondary/40" size={20} />
          <input 
            type="text"
            placeholder="Search by name, location, category..."
            className="w-full bg-tertiary border border-secondary/5 rounded-2xl py-4 pl-14 pr-5 text-sm text-secondary outline-none focus:ring-2 ring-secondary/5 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative min-w-[200px]">
          <IoFilterOutline className="absolute left-5 top-1/2 -translate-y-1/2 text-secondary/40" size={18} />
          <select 
            className="w-full bg-tertiary border border-secondary/5 rounded-2xl py-4 pl-12 pr-5 text-sm text-secondary outline-none cursor-pointer appearance-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="In Progress">In Progress</option>
            <option value="Solved">Solved</option>
          </select>

          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-secondary/20 text-[10px]">
                   ▼
          </div>
        </div>
      </div>

      {/* Table  */}
      <Table 
        columns={columns} 
        data={filteredIssues} 
        onRowClick={(issue) => handleRowClick(issue)} 
      />
    </div>
  );
};

export default AdminIssuesPage;