/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  IoSearchOutline, 
  IoFilterOutline, 
  IoMailOutline,
} from "react-icons/io5";
import Table from './../../../components/ui/Table'; 
import { privateApi } from '../../auth/services/authService';
import toast from 'react-hot-toast';
import { IssueDetailModal } from './IssueDetailModal';
import { useInfiniteQuery } from '@tanstack/react-query';

const PAGE_SIZE = 10;

const fetchIssuesApi = async ({ pageParam = 0, queryKey }: { pageParam?: number; queryKey: any[] }) => {
  const searchTerm = queryKey[1];
  const statusFilter = queryKey[2];
  
  const queryParams = new URLSearchParams();
  if (searchTerm.trim()) {
    queryParams.append('search', searchTerm.trim());
  }
  if (statusFilter !== "All") {
    queryParams.append('status', statusFilter.toLowerCase());
  }

  queryParams.append('limit', PAGE_SIZE.toString());
  queryParams.append('offset', pageParam.toString());

  const url = `/issues/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await privateApi.get(url);
  
  const freshData = response.data.results || response.data;
  const dataArray = Array.isArray(freshData) ? freshData : [];

  return {
    results: dataArray,
    nextOffset: dataArray.length === PAGE_SIZE ? pageParam + PAGE_SIZE : undefined,
  };
};

// Skeleton Table Loader Component
const AdminTableSkeleton: React.FC = () => {
  return (
    <div className="w-full bg-white rounded-2xl border border-secondary/5 overflow-hidden shadow-sm animate-pulse">
      <div className="bg-secondary/5 h-12 w-full border-b border-secondary/5" />
      <div className="divide-y divide-secondary/5">
        {[...Array(6)].map((_, idx) => (
          <div key={idx} className="p-4 flex items-center justify-between gap-4">
            <div className="h-4 bg-secondary/10 rounded w-16" />
            <div className="flex flex-col gap-1 w-32">
              <div className="h-4 bg-secondary/10 rounded w-28" />
              <div className="h-2 bg-secondary/10 rounded w-16" />
            </div>
            <div className="flex flex-col gap-1 w-36">
              <div className="h-4 bg-secondary/10 rounded w-24" />
              <div className="h-2 bg-secondary/10 rounded w-20" />
            </div>
            <div className="h-4 bg-secondary/10 rounded w-24" />
            <div className="h-4 bg-secondary/10 rounded w-28" />
            <div className="h-6 bg-secondary/10 rounded-xl w-20" />
            <div className="h-4 bg-secondary/10 rounded w-20" />
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminIssuesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localOverrides, setLocalOverrides] = useState<Record<string, any>>({});

  // Ref anchor to observe the bottom boundary element of the page
  const bottomBoundaryRef = useRef<HTMLDivElement | null>(null);

  // Debounce search input changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // TanStack Infinite Query hook for persistence and caching
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['adminIssues', debouncedSearch, statusFilter],
    queryFn: fetchIssuesApi,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    initialPageParam: 0,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    gcTime: 1000 * 60 * 15,    
  });

  // Derive flat issue list directly from Query cache and apply local overrides if updated
  const localIssues = useMemo(() => {
    if (!data) return [];
    const flattened = data.pages.flatMap((page) => page.results);
    return flattened.map((issue) => localOverrides[issue.id] || issue);
  }, [data, localOverrides]);

  useEffect(() => {
    if (isError) {
      toast.error("Failed to load reported issues.");
    }
  }, [isError]);

  // --- AUTOMATIC INFINITE SCROLL OBSERVER ---
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage || isLoading) return;

    const currentObserverTarget = bottomBoundaryRef.current;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchNextPage();
      }
    }, {
      rootMargin: '200px',
    });

    if (currentObserverTarget) {
      observer.observe(currentObserverTarget);
    }

    return () => {
      if (currentObserverTarget) {
        observer.unobserve(currentObserverTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, isLoading, fetchNextPage]);

  // Handler to update an issue's state inside the modal cleanly
  const handleSetIssues = (action: React.SetStateAction<any[]>) => {
    if (typeof action === 'function') {
      const updatedList = action(localIssues);
      const newOverrides: Record<string, any> = {};
      updatedList.forEach((item) => {
        newOverrides[item.id] = item;
      });
      setLocalOverrides((prev) => ({ ...prev, ...newOverrides }));
    }
  };

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

      {/* Table / Skeleton Loading State */}
      {isLoading ? (
        <AdminTableSkeleton />
      ) : (
        <Table 
          columns={columns} 
          data={localIssues} 
          isLoading={false}
          onRowClick={(issue) => {
            setSelectedIssueId(issue.id);
            setIsModalOpen(true);
          }} 
        />
      )}

      {/* INVISIBLY ANCHORED BOTTOM BOUNDARY TARGET Element */}
      <div ref={bottomBoundaryRef} className="h-10 w-full flex justify-center items-center mt-4">
        {isFetchingNextPage && (
          <p className="text-[10px] uppercase font-black tracking-widest text-secondary/30 animate-pulse">
            Loading additional updates...
          </p>
        )}
      </div>

      {isModalOpen && selectedIssueId && (
        <IssueDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          issue={localIssues.find((i) => i.id === selectedIssueId) || null}
          setIssues={handleSetIssues}
        />
      )}
    </div>
  );
};

export default AdminIssuesPage;