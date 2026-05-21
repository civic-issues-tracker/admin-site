import { useState, useEffect, useMemo } from 'react';
import { 
  IoSearchOutline, 
  IoFilterOutline, 
  IoPersonOutline, 
  IoBusinessOutline,
  IoShieldCheckmarkOutline,
  IoMailOutline,
  IoCalendarOutline,
  IoEllipsisVertical,
  IoEyeOutline,
  IoLockClosedOutline,
  IoLockOpenOutline,
} from "react-icons/io5";
import Table from './../../../components/ui/Table';
import UserDetailDrawer from './UserDetailDrawer';
import toast from 'react-hot-toast';
import { privateApi } from '../../auth/services/authService'; // Un-commented and hooked up
import ThemeLoader from '../../../components/ui/ThemeLoader';

// Typings mapped exactly to your backend JSON scheme response
export interface BackendUser {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role_name: 'resident' | 'organization_admin' | 'system_admin';
  organization_name: string | null;
  is_active: boolean;
  email_verified: boolean;
  sms_verified: boolean;
  created_at: string;
  last_login: string;
}

const getStatusStyle = (isActive: boolean) => {
  return isActive 
    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
    : "bg-rose-500/10 text-rose-600 border-rose-500/20";
};

const AdminUsersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<BackendUser | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // --- FETCH USERS FROM BACKEND ---
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Base endpoint from your USER_MANAGEMENT_API.md
      const response = await privateApi.get('/auth/admin/users/');
      const freshData = response.data.results || response.data;
      setUsers(Array.isArray(freshData) ? freshData : []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch registered system accounts.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- FILTER & SEARCH LOGIC ---
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const nameMatch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const emailMatch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const phoneMatch = user.phone?.includes(searchTerm) || false;
      
      const matchesSearch = nameMatch || emailMatch || phoneMatch;

      // Map matching roles from frontend selector values to backend role strings
      let matchesRole = true;
      if (roleFilter === "User") matchesRole = user.role_name === "resident";
      else if (roleFilter === "Organization") matchesRole = user.role_name === "organization_admin";
      else if (roleFilter === "Admin") matchesRole = user.role_name === "system_admin";
      
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const handleViewProfile = (user: BackendUser) => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
    setActiveMenu(null); 
  };

  // --- BLOCK / UNBLOCK DATA HANDLERS ---
  const handleToggleStatus = async (id: string, currentActiveStatus: boolean) => {
    try {
      if (currentActiveStatus) {
        // DELETE request to soft-block a user profile
        await privateApi.delete(`/auth/admin/users/${id}/block/`);
        toast.success("User account suspended successfully.");
      } else {
        // POST request to unblock a user profile
        await privateApi.post(`/auth/admin/users/${id}/unblock/`, {});
        toast.success("User account reactivated successfully.");
      }
      // Re-fetch users to keep state accurate with server
      fetchUsers();
    } catch (error: any) {
      const apiError = error.response?.data?.error || "Failed to update security status.";
      toast.error(apiError);
    } finally {
      setActiveMenu(null);
    }
  };

  // --- COLUMN DEFINITIONS ---
  const columns = [
    { 
      header: "Account Holder", 
      key: "full_name",
      render: (user: BackendUser) => {
        let Icon = IoPersonOutline;
        if (user.role_name === 'organization_admin') Icon = IoBusinessOutline;
        if (user.role_name === 'system_admin') Icon = IoShieldCheckmarkOutline;

        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-secondary/5 flex items-center justify-center text-secondary border border-secondary/5">
              <Icon size={16} />
            </div>
            <div>
              <div className="text-sm font-bold text-secondary">{user.full_name || "Unnamed Profile"}</div>
              <div className="text-[10px] text-secondary/30 uppercase font-mono tracking-tighter">
                {user.id.slice(0, 8)}...
              </div>
            </div>
          </div>
        );
      }
    },
    { 
      header: "Contact Info", 
      key: "email",
      render: (user: BackendUser) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-secondary/70">
            <IoMailOutline className="text-secondary/30" />
            <span className="text-xs font-medium">{user.email}</span>
          </div>
          {user.phone && <div className="text-[10px] text-secondary/40 pl-6">{user.phone}</div>}
        </div>
      )
    },
    { 
      header: "Account Role", 
      key: "role_name",
      render: (user: BackendUser) => {
        const roles = {
          resident: { label: "Resident", style: "text-secondary/60 bg-secondary/5" },
          organization_admin: { label: "Org Admin", style: "text-amber-600 bg-amber-500/5" },
          system_admin: { label: "System Admin", style: "text-blue-600 bg-blue-500/5" }
        };
        const currentRole = roles[user.role_name] || { label: user.role_name, style: "text-secondary/40 bg-secondary/5" };
        
        return (
          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${currentRole.style}`}>
            {currentRole.label}
          </span>
        );
      }
    },
    { 
      header: "Status", 
      key: "is_active",
      render: (user: BackendUser) => (
        <span className={`px-3.5 py-1.5 rounded-full text-[9px] uppercase font-black border ${getStatusStyle(user.is_active)}`}>
          {user.is_active ? "Active" : "Suspended"}
        </span>
      )
    },
    { 
      header: "Joined Date", 
      key: "created_at",
      render: (user: BackendUser) => (
        <div className="flex items-center gap-2 text-secondary/50 text-xs">
          <IoCalendarOutline size={14} />
          {new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
        </div>
      )
    },
    {
      header: "Actions",
      key: "actions",
      render: (user: BackendUser) => (
        <div className="relative flex justify-center">
          <button 
            onClick={(e) => {
              e.stopPropagation(); 
              setActiveMenu(activeMenu === user.id ? null : user.id);
            }}
            className={`p-2 rounded-xl transition-all duration-200 ${
              activeMenu === user.id ? 'bg-secondary text-white' : 'hover:bg-secondary/10 text-secondary/40 hover:text-secondary'
            }`}
          >
            <IoEllipsisVertical size={18} />
          </button>

          {activeMenu === user.id && (
            <div 
              className="absolute right-0 top-12 w-48 bg-tertiary border border-secondary/10 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in duration-200"
              onClick={(e) => e.stopPropagation()} 
            >
              <button 
                onClick={() => handleViewProfile(user)}
                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-secondary/70 hover:bg-secondary/5 hover:text-secondary transition-colors"
              >
                <IoEyeOutline size={16} /> View Full Profile
              </button>
              
              <button 
                onClick={() => handleToggleStatus(user.id, user.is_active)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold transition-colors ${
                  user.is_active ? 'text-orange-500 hover:bg-orange-500/5' : 'text-emerald-600 hover:bg-emerald-500/5'
                }`}
              >
                {user.is_active ? (
                  <>
                    <IoLockClosedOutline size={16} /> Suspend User
                  </>
                ) : (
                  <>
                    <IoLockOpenOutline size={16} /> Activate User
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )
    }
  ];

  useEffect(() => {
    const closeMenu = () => setActiveMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFBF7] px-6 lg:px-20 py-10 animate-in fade-in duration-500">
      <header className="mb-10">
        <h1 className="font-header text-4xl font-black text-secondary tracking-tighter uppercase">
          User <span className="font-light">Management</span>
        </h1>
        <p className="font-body text-[10px] text-secondary/40 uppercase tracking-[0.4em] mt-2 font-bold">Admin Control Center</p>
      </header>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <IoSearchOutline className="absolute left-5 top-1/2 -translate-y-1/2 text-secondary/40" size={20} />
          <input 
            type="text"
            placeholder="Search by account name, phone, or email address..."
            className="w-full bg-tertiary border border-secondary/5 rounded-2xl py-4 pl-14 pr-5 text-sm text-secondary outline-none focus:ring-2 ring-secondary/5 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative min-w-50">
          <IoFilterOutline className="absolute left-5 top-1/2 -translate-y-1/2 text-secondary/40" size={18} />
          <select 
            className="w-full bg-tertiary border border-secondary/5 rounded-2xl py-4 pl-12 pr-5 text-sm text-secondary outline-none cursor-pointer appearance-none"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="All">All Structural Roles</option>
            <option value="User">Residents / Basic Users</option>
            <option value="Organization">Organization Authorities</option>
            <option value="Admin">System Super Admins</option>
          </select>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-secondary/20 text-[10px]">▼</div>
        </div>
      </div>

      {/* Table Section */}
      {isLoading ? (
        <div className="h-64 flex items-center justify-center text-sm font-medium text-secondary/40">
          <ThemeLoader size="md" />         
        </div>
      ) : (
        <Table 
          columns={columns} 
          data={filteredUsers} 
          onRowClick={(user) => handleViewProfile(user)}
        />
      )}

      {/* Sliding Premium Side Drawer */}
      <UserDetailDrawer 
        user={selectedUser} 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </div>
  );
};

export default AdminUsersPage;