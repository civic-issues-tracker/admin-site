import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, BarChart3, AlertCircle, 
  Building2, Users, LogOut, Menu, X 
} from 'lucide-react';
import LogoIcon from '../../assets/icons/logoIcon';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const SidebarAdmin: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', path: '/admin-dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Analytics', path: '/admin/analytics', icon: <BarChart3 size={20} /> },
    { name: 'Issues', path: '/admin/issues', icon: <AlertCircle size={20} /> },
    { name: 'Organizations', path: '/admin/organizations', icon: <Building2 size={20} /> },
    { name: 'Categories', path: '/admin/categories', icon: <BarChart3 size={20} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={20} /> },
    // { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  const handleLogout = async () => {
    try {
      await logout(); 
      toast.success("Logged out safely");
      navigate('/login'); 
    } catch (error) {
      toast.error("Error during logout");
      console.error(error);
    }
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="lg:hidden fixed top-6 left-6 z-120 p-3 bg-[#5C4033] text-white rounded-xl shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-100 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-110
        w-72 h-screen bg-[#5C4033] text-white flex flex-col py-10 
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:rounded-r-[4rem]
      `}>
        <div className="px-10 mb-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 md:gap-3 shrink-0">
            <LogoIcon size={35} color="var(--color-primary)" />
            <span className="font-black text-2xl md:text-3xl tracking-tighter uppercase">
              የኛ<span className="text-primary font-light"> Fix</span>
            </span>
          </Link>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-white/50 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
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

        {/* Logout Action Area */}
        <div className="px-10 mt-auto pt-6 border-t border-white/10">
          <button 
            className="flex items-center gap-4 py-4 w-full opacity-60 hover:opacity-100 hover:text-red-300 transition-all"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span className="text-sm font-bold uppercase tracking-widest">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default SidebarAdmin;