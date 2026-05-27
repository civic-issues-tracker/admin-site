/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/preserve-manual-memoization */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useState, useEffect, useMemo } from 'react';
import { 
  IoSearchOutline, 
  IoFilterOutline, 
  IoMailOutline,
} from "react-icons/io5";
import Table from './../../../components/ui/Table'; 
import { privateApi } from '../../auth/services/authService';
import toast from 'react-hot-toast';
import ThemeLoader from '../../../components/ui/ThemeLoader';
import { IssueDetailModal } from './IssueDetailModal';



const AdminIssuesPage: React.FC = () => {
  const [issues, setIssues] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    const fetchIssues = async () => {
      setLoading(true);
      try {
        setLoading(true);
        const response = await privateApi.get('/issues/'); 
        setIssues(response.data);
      } catch (error) {
        console.error("Error fetching issues:", error);
        toast.error("Failed to load reported issues."); 
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
    console.log("Check my issue data fields:", filteredIssues);
  }, []);

  {loading && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
    <ThemeLoader size="lg" />
  </div>
)}

  // SEARCH & FILTER 
const filteredIssues = useMemo(() => {
  return issues.filter((issue) => {
    //  HANDLE STATUS FILTER DROPDOWN
    if (statusFilter !== "All") {
      const issueStatus = (issue.status || "submitted").toString().toLowerCase();
      const targetFilter = statusFilter.toLowerCase();
      
      // If the status doesn't match the selected filter, drop it immediately
      if (issueStatus !== targetFilter) return false;
    }

    // HANDLE SEARCH BAR TEXT
    if (!searchTerm.trim()) return true;
    
    const query = searchTerm.toLowerCase();
    
    const location = issue.location_address?.toLowerCase() || "";
    const category = issue.category_name?.toLowerCase() || issue.category?.toLowerCase() || "";
    const description = issue.description?.toLowerCase() || (issue as any).title?.toLowerCase() || "";
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
}, [searchTerm, statusFilter, issues]);

// HELPER FOR FETCHING LATEST DATA STREAM
const refreshIssuesFeed = async (setIssues: React.Dispatch<React.SetStateAction<any[]>>) => {
  try {
    const response = await privateApi.get('/issues/');
    // Handle both cases where data is returned directly or wrapped in a results array (pagination)
    const freshData = response.data.results || response.data;
    setIssues(freshData);
  } catch (error) {
    console.error("Failed to re-fetch issues snapshot:", error);
  }
};

// FLAG REPORT HANDLER
const handleFlagReport = async (issueId: string, currentNotes: string | null, setIssues: React.Dispatch<React.SetStateAction<any[]>>) => {
  try {
    const timeStamp = new Date().toLocaleString();
    const updatedNotes = currentNotes 
      ? `[FLAGGED on ${timeStamp}]\n${currentNotes}`
      : `[FLAGGED on ${timeStamp}] User reported this issue as inappropriate.`;

    // Execute partial update using authenticated instance
    await privateApi.patch(`/issues/${issueId}/`, {
      internal_notes: updatedNotes
    });

    toast.success("Issue has been successfully flagged for admin review.");
    await refreshIssuesFeed(setIssues);
  } catch (error) {
    console.error("Error flagging report:", error);
    toast.error("Failed to flag the issue. Check permissions.");
  }
};

// PERMANENT DELETE HANDLER
// const handlePermanentDelete = async (issueId: string, setIssues: React.Dispatch<React.SetStateAction<any[]>>) => {
//   // const confirmDelete = window.confirm("Are you absolutely sure you want to permanently delete this issue? This cannot be undone.");
//   // if (!confirmDelete) return;

//   try {
//     await privateApi.delete(`/issues/${issueId}/`);
    
//     toast.success("Issue deleted successfully.");
//     await refreshIssuesFeed(setIssues); 
//   } catch (error) {
//     console.error("Error deleting issue:", error);
//     toast.error("Failed to delete the issue.");
//   }
// };

  //  COLUMN DEFINITIONS 
  const columns = [
  {
    header: "ID",
    key: "issue_number", 
    render: (issue: any) => (
      <span className="font-mono text-xs text-secondary/60">
        {issue.issue_number || issue.id?.slice(0, 8)}
      </span>
    )
  },
  {
    header: "Reporter",
    key: "resident_name",
    render: (issue: any) => {
      const rawName = issue.resident_name || "Anonymous Resident";
      const cleanName = rawName.split('(')[0].trim();
      
      return (
        <div className="flex flex-col">
          <span className="font-bold text-secondary">{cleanName}</span>
          <span className="text-[10px] uppercase tracking-widest text-primary/60 font-black mt-0.5">
            Verified User
          </span>
        </div>
      );
    }
  },
  {
    header: "Location",
    key: "location_address",
    render: (issue: any) => {
      const parts = issue.location_address?.split(',') || [];
      return (
        <div className="max-w-45">
          <p className="font-bold text-secondary truncate">{parts[0] || "Unknown"}</p>
          <p className="text-xs text-secondary/50 truncate">
            {parts[1]?.trim() || parts[2]?.trim() || ""}
          </p>
        </div>
      );
    }
  },
  {
    header: "Category",
    key: "category_name", 
  },
  {
    header: "Contact Info",
    key: "contact",
    render: (issue: any) => {
      const rawName = issue.resident_name || "";
      const emailMatch = rawName.match(/\(([^)]+)\)/);
      const email = emailMatch ? emailMatch[1] : "N/A";

      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-secondary/70">
            <IoMailOutline size={12} className="text-secondary/30" />
            <span className="lowercase">{email}</span>
          </div>
          {/* <div className="flex items-center gap-2 text-xs text-secondary/50">
            <IoCallOutline size={12} className="text-secondary/30" />
            <span className="font-mono text-[11px]">No Phone</span>
          </div> */}
        </div>
      );
    }
  },
  {
    header: "Status",
    key: "status",
    render: (issue: any) => {
      const rawStatus = issue.status || "submitted";
      
      const normalizedKey = rawStatus.toString().toLowerCase().replace(/ /g, '_');
      
      const statusStyles: Record<string, string> = {
        submitted: "bg-amber-500/10 text-amber-700 border border-amber-500/20",
        in_progress: "bg-blue-500/10 text-blue-600 border border-blue-500/20",
        resolved: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
        rejected: "bg-red-500/10 text-red-600 border border-red-500/20",
        pending_admin: "bg-purple-500/10 text-purple-600 border border-purple-500/20",
        escalated: "bg-rose-500/10 text-rose-700 border border-rose-500/20",
      };

      const currentStyle = statusStyles[normalizedKey] || "bg-[#E5D3B3]/20 text-[#A07156] border border-[#E5D3B3]/30";

      const displayLabel = rawStatus.toString().replace(/_/g, ' ');

      return (
        <span className={`px-2.5 py-1 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all duration-150 ${currentStyle}`}>
          {displayLabel}
        </span>
      );
    }
  },
  {
    header: "Date Reported",
    key: "created_at",
    render: (issue: any) => {
      return (
        <span className="text-xs text-secondary/60">
          {issue.created_at ? new Date(issue.created_at).toLocaleDateString() : "N/A"}
        </span>
      );
    }
  },
{ 
  header: 'Actions', 
  key: 'actions',
  render: (issue: any) => {

    return (
      <button
        onClick={(e) => {
          e.stopPropagation(); 
          handleFlagReport(issue.id, issue.internal_notes, setIssues);
          toast.success(`Issue ${issue.issue_number} flagged successfully.`);
        }}
        className="p-2 hover:bg-amber-500/5 text-amber-600 rounded-xl transition-all flex items-center gap-2 font-bold text-xs"
        title="Flag Report"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
        <span>Flag Report</span>
      </button>
    );
  }
}
];



  return (
    <div className="min-h-screen bg-[#FDFBF7] px-6 lg:px-20 py-10 animate-in fade-in duration-500">
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

        <div className="relative min-w-50 font-sans">
          <IoFilterOutline className="absolute left-5 top-1/2 -translate-y-1/2 text-[#2C0901]/40" size={18} />
          
          <select 
            className="w-full bg-white border border-[#E5D3B3]/30 rounded-2xl py-4 pl-12 pr-5 text-sm font-bold text-[#2C0901] outline-none cursor-pointer appearance-none shadow-sm transition-all hover:border-[#A07156]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
            <option value="pending_admin">Pending Admin Review</option>
            <option value="escalated">Escalated</option>
          </select>

          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#2C0901]/30 text-[9px]">
            ▼
          </div>
        </div>
      </div>

      {/* Table  */}
      <Table 
        columns={columns} 
        data={filteredIssues} 
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
  );
};

export default AdminIssuesPage;