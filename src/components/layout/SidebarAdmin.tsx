import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, BarChart3, AlertCircle, 
  Building2, Users, Monitor, Settings, LogOut 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import  LogoIcon  from '../../assets/icons/logoIcon';

const SidebarAdmin: React.FC = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/admin-dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Analytics', path: '/admin/analytics', icon: <BarChart3 size={20} /> },
    { name: 'Issues', path: '/admin/issues', icon: <AlertCircle size={20} /> },
    { name: 'Organizations', path: '/admin/organizations', icon: <Building2 size={20} /> },
    { name: 'Categories', path: '/admin/categories', icon: <BarChart3 size={20} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'AI Monitoring', path: '/admin/ai-monitoring', icon: <Monitor size={20} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside className="w-72 h-screen bg-[#5C4033] text-white flex flex-col py-10 rounded-r-[4rem] sticky top-0">
      <div className="px-10 mb-16">
            <Link to="/" className="flex items-center gap-2 md:gap-3 shrink-0 z-110">
                  <LogoIcon size={35} color="var(--color-primary)" />
                  <span className="font-black text-2xl md:text-4xl lg:text-5xl tracking-tighter uppercase">
                    የኛ<span className="text-primary font-light"> Fix</span>
                  </span>
            </Link>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-4 px-10 py-4 transition-all duration-300
              ${isActive 
                ? 'bg-white/10 border-l-4 border-white font-bold' 
                : 'opacity-60 hover:opacity-100 hover:bg-white/5 border-l-4 border-transparent'}
            `}
          >
            {item.icon}
            <span className="text-sm tracking-wide">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-10 mt-auto">
        <button className="flex items-center gap-4 py-4 opacity-60 hover:opacity-100 hover:text-red-300 transition-all">
          <LogOut size={20} />
          <span className="text-sm font-bold uppercase tracking-widest">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default SidebarAdmin;