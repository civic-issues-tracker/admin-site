import  { useState, useEffect, useMemo } from 'react';
import { 
  IoSearchOutline, 
  IoFilterOutline, 
  IoPersonOutline, 
  IoBusinessOutline,
  IoMailOutline,
  IoCalendarOutline,
  IoEllipsisVertical,
  IoEyeOutline,
  IoLockClosedOutline,
  IoLockOpenOutline,
  IoTrashOutline
} from "react-icons/io5";
import Table from './../../../components/ui/Table';
import UserDetailDrawer from './UserDetailDrawer'
import Toast from '../../../components/ui/Toast';

// --- HELPERS ---
const getStatusStyle = (status: string) => {
  switch (status) {
    case "Active": return "bg-green-500/10 text-green-500 border-green-500/20";
    case "Pending": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    case "Suspended": return "bg-red-500/10 text-red-500 border-red-500/20";
    default: return "bg-secondary/10 text-secondary/40 border-secondary/10";
  }
};

const AdminUsersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);


  const mockUsers = [
    { id: "1", name: "Hebron Enyew", email: "hebron@example.com", role: "Admin", status: "Active", joined: "2026-05-01" },
    { id: "2", name: "Abebe Kebede", email: "abebe@example.com", role: "User", status: "Pending", joined: "2026-05-12" },
    { id: "3", name: "Clean Addis Co.", email: "contact@cleanaddis.com", role: "Organization", status: "Active", joined: "2026-04-20" },
    { id: "4", name: "Sara Tekle", email: "sara@example.com", role: "User", status: "Active", joined: "2026-05-10" },
    { id: "5", name: "Green Way NGO", email: "info@greenway.org", role: "Organization", status: "Suspended", joined: "2026-03-15" },
  ];

  // FILTER LOGIC 
  const filteredUsers = useMemo(() => {
    return mockUsers.filter((user) => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === "All" || user.role === roleFilter;
      
      return matchesSearch && matchesRole;
    });
  }, [searchTerm, roleFilter]);

  const handleViewProfile = (user: any) => {
        setSelectedUser(user);
        setIsDrawerOpen(true);
        setActiveMenu(null); 
      };

    const handleToggleStatus = (id: string, currentStatus: string) => {
        const isSuspending = currentStatus === "Active";
        const newStatus = isSuspending ? "Suspended" : "Active";

        // await privateApi.patch(`/users/${id}/`, { status: newStatus });
        // Update local state for immediate feedback
        setUsers((prevUsers: unknown) =>
          prevUsers.map((user) =>
            user.id === id ? { ...user, status: newStatus } : user
          )
        );

        Toast(
          `User ${isSuspending ? "suspended" : "activated"} successfully`, 
          isSuspending ? "info" : "success"
        );

        setActiveMenu(null);
      };

      const handleDeleteUser = (id: string) => {
        const confirmDelete = window.confirm(
          "Are you sure you want to delete this account? This action cannot be undone."
        );

        if (confirmDelete) {
          // Filter out the deleted user
          setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
          
          Toast("User account has been permanently deleted.", "success");
        }
        
        setActiveMenu(null);
      };

  //  COLUMN DEFINITIONS 
  const columns = [
    { 
      header: "Account Holder", 
      key: "name",
      render: (user: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
            {user.role === "Organization" ? <IoBusinessOutline size={16} /> : <IoPersonOutline size={16} />}
          </div>
          <div>
            <div className="text-sm font-bold text-secondary">{user.name}</div>
            <div className="text-[10px] text-secondary/30 uppercase tracking-tighter font-medium">ID: {user.id}</div>
          </div>
        </div>
      )
    },
    { 
      header: "Contact Info", 
      key: "email",
      render: (user: any) => (
        <div className="flex items-center gap-2 text-secondary/70">
          <IoMailOutline className="text-secondary/30" />
          <span className="text-xs">{user.email}</span>
        </div>
      )
    },
    { 
      header: "Type", 
      key: "role",
      render: (user: any) => (
        <span className={`text-[10px] font-black uppercase tracking-widest ${user.role === 'Admin' ? 'text-blue-500' : 'text-secondary/60'}`}>
          {user.role}
        </span>
      )
    },
    { 
      header: "Status", 
      key: "status",
      render: (user: any) => (
        <span className={`px-4 py-1.5 rounded-full text-[9px] uppercase font-black border ${getStatusStyle(user.status)}`}>
          {user.status}
        </span>
      )
    },
    { 
      header: "Joined Date", 
      key: "joined",
      render: (user: any) => (
        <div className="flex items-center gap-2 text-secondary/50 text-xs">
          <IoCalendarOutline size={14} />
          {user.joined}
        </div>
      )
    },
    {
  header: "Actions",
  key: "actions",
  render: (user: any) => (
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

      {/* DROPDOWN MENU */}
      {activeMenu === user.id && (
        <div 
          className="absolute right-0 top-12 w-48 bg-tertiary border border-secondary/10 rounded-2xl shadow-2xl z-[100] py-2 animate-in fade-in zoom-in duration-200"
          onClick={(e) => e.stopPropagation()} 
        >
          <button 
            onClick={() => handleViewProfile(user)}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-secondary/70 hover:bg-secondary/5 hover:text-secondary transition-colors"
          >
            <IoEyeOutline size={16} /> View Profile
          </button>
          
          <button 
            onClick={() => handleToggleStatus(user.id, user.status)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold transition-colors ${
              user.status === 'Active' 
                ? 'text-orange-500 hover:bg-orange-500/5' 
                : 'text-green-500 hover:bg-green-500/5'
            }`}
          >
            {user.status === 'Active' ? (
              <>
                <IoLockClosedOutline size={16} /> Suspend User
              </>
            ) : (
              <>
                <IoLockOpenOutline size={16} /> Activate User
              </>
            )}
          </button>

          <div className="h-[1px] bg-secondary/5 my-1 mx-2" />

          <button 
            onClick={() => handleDeleteUser(user.id)}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-500/5 transition-colors"
          >
            <IoTrashOutline size={16} /> Delete Account
          </button>
        </div>
      )}
    </div>
  )
}
  ];
  

    // Close menu when clicking anywhere else
    useEffect(() => {
      const closeMenu = () => setActiveMenu(null);
      window.addEventListener('click', closeMenu);
      return () => window.removeEventListener('click', closeMenu);
    }, []);

  return (
    <div className="min-h-screen bg-primary px-6 lg:px-20 py-10 animate-in fade-in duration-500">
      <header className="mb-10">
        <h1 className="font-header text-4xl font-black text-secondary tracking-tighter uppercase">
          User <span className="font-light">Registry</span>
        </h1>
        <p className="font-body text-[10px] text-secondary/40 uppercase tracking-[0.4em] mt-2 font-bold">
          Account & Organization Management
        </p>
      </header>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <IoSearchOutline className="absolute left-5 top-1/2 -translate-y-1/2 text-secondary/40" size={20} />
          <input 
            type="text"
            placeholder="Search by name or email..."
            className="w-full bg-tertiary border border-secondary/5 rounded-2xl py-4 pl-14 pr-5 text-sm text-secondary outline-none focus:ring-2 ring-secondary/5 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative min-w-[200px]">
          <IoFilterOutline className="absolute left-5 top-1/2 -translate-y-1/2 text-secondary/40" size={18} />
          <select 
            className="w-full bg-tertiary border border-secondary/5 rounded-2xl py-4 pl-12 pr-5 text-sm text-secondary outline-none cursor-pointer appearance-none"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="All">All Roles</option>
            <option value="User">Individual Users</option>
            <option value="Organization">Organizations</option>
            <option value="Admin">Administrators</option>
          </select>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-secondary/20 text-[10px]">▼</div>
        </div>
      </div>

      {/*  Table */}
      <Table 
        columns={columns} 
        data={filteredUsers} 
        onRowClick={(user) => console.log("Viewing profile:", user.id)}
      />

      <UserDetailDrawer 
        user={selectedUser} 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />

    </div>
  );
};

export default AdminUsersPage;