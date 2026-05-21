import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Bell,
  CheckSquare,
  ClipboardList,
  LogOut,
  Map,
  X
} from 'lucide-react';

interface SidebarProps {
  onClose?: () => void;
}

const SidebarOrganizationAdmin = ({ onClose }: SidebarProps) => {
  const { logout, user } = useAuth();
  const userName = user?.full_name?.trim() || 'Organization Admin';
  const initials = userName
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const isVerified = user?.is_verified ?? false;
  const statusLabel = isVerified ? 'Verified' : 'Pending Verification';
  const statusTextClass = isVerified ? 'text-[#7DE2A7]' : 'text-[#F2B1B1]';
  const statusDotClass = isVerified ? 'bg-[#2BD96B]' : 'bg-[#E05A5A]';

  const navItems = [
    { label: 'My Queue', to: '/organization-admin/dashboard', icon: ClipboardList, badge: 2 },
    { label: 'District Map', to: '/organization-admin/map', icon: Map },
    { label: 'Resolved Tickets', to: '/organization-admin/resolved', icon: CheckSquare },
  ];

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col overflow-y-auto rounded-r-[2rem] md:rounded-r-[4rem] bg-[#6E4B33] py-8 text-[#F6EEE3] shadow-xl">
      <div className="mb-8 px-8 border-b border-white/10 pb-4 flex justify-between items-start">
        <div>
          <h1 className="text-[32px] font-extrabold leading-none tracking-tight">CivicWorks</h1>
          <p className="text-xs text-[#E9D6C0] mt-1">Organization Admin</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden p-1 text-white/70 hover:text-white bg-white/10 rounded-full">
            <X size={20} />
          </button>
        )}
      </div>

      <div className="mb-6 mx-4 rounded-2xl bg-[#5D3F2C] p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7D5A42] text-xs font-bold">
            {initials}
          </span>
          <div>
            <p className="text-sm font-semibold">{userName}</p>
            <p className={`flex items-center gap-1 text-[11px] ${statusTextClass}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass}`} />
              {statusLabel}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-r-4xl rounded-l-none px-6 py-4 text-sm transition ${
                  isActive ? 'bg-white/10 border-l-4 border-white text-white font-bold' : 'opacity-70 hover:opacity-100 hover:bg-white/5 border-l-4 border-transparent'
                }`
              }
            >
              <span className="flex items-center gap-2">
                <Icon size={14} />
                {item.label}
              </span>
              {item.badge ? (
                <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EE3E4A] px-1 text-[10px] font-bold">
                  {item.badge}
                </span>
              ) : null}
            </NavLink>
          );
        })}
      </nav>

      <div className="space-y-1 px-4 pb-3 mt-auto">
        <NavLink
          to="/organization-admin/notifications"
          className={({ isActive }) =>
            `flex w-full items-center gap-2 rounded-lg px-4 py-3 text-sm transition ${
              isActive ? 'bg-white/10 text-white font-semibold' : 'text-[#EFDCC6] hover:bg-[#5D3F2C]/70'
            }`
          }
        >
          <Bell size={14} />
          Notifications
        </NavLink>
        <button
          type="button"
          onClick={() => {
            logout();
            onClose?.();
          }}
          className="flex w-full items-center gap-2 rounded-lg px-4 py-3 text-sm text-[#F8C6C6] transition hover:bg-[#5D3F2C]/70"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default SidebarOrganizationAdmin;
