/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';
import { Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { privateApi } from '../../features/auth/services/authService';

interface AdminHeaderProps {
  onOpenIssue: (issue: any) => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onOpenIssue }) => {
  const { user, logout } = useAuth();
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  // Track IDs that have been clicked to remove the red badge
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await privateApi.get('/issues/');
      const data = res.data.results || res.data;
      const filtered = Array.isArray(data) 
        ? data.filter((i: any) => i.status === 'pending_admin' || i.status === 'escalated')
        : [];
      setNotifications(filtered);
    } catch (err) {
      console.error("Failed to fetch alerts", err);
    }
  };

  // Logic to determine if we should show the red dot
  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  const handleIssueClick = (issue: any) => {
    // Mark as read locally
    setReadIds(prev => new Set(prev).add(issue.id));
    onOpenIssue(issue);
    setShowNotifDrawer(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setShowNotifDrawer(false);
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setShowProfileDrawer(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 md:px-8 py-4 md:py-6 bg-transparent gap-4">
      <div className="w-full sm:w-auto">
        <h2 className="text-lg md:text-2xl font-medium text-secondary/80 leading-tight">
          Welcome back, <span className="font-black text-secondary block sm:inline">Mr. {user?.full_name?.split(' ')[0] || 'Abebe'}</span>
        </h2>
      </div>

      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 md:gap-6">
        
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifDrawer(!showNotifDrawer)}
            className="p-2 text-secondary/40 hover:text-secondary transition-colors relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-primary" />
            )}
          </button>

          {showNotifDrawer && (
            <div className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-xl border border-neutral-100 p-2 z-50 animate-in fade-in zoom-in duration-200">
              <h4 className="text-[10px] font-black uppercase text-neutral-400 p-3">Pending Action Required</h4>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? notifications.map((issue) => (
                  <button 
                    key={issue.id} 
                    onClick={() => handleIssueClick(issue)} 
                    className={`w-full text-left p-3 hover:bg-neutral-50 transition-colors border-b border-neutral-50 last:border-0 ${readIds.has(issue.id) ? 'opacity-60' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-bold text-secondary">{issue.issue_number}</p>
                      <span className="text-[9px] font-bold uppercase bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">{issue.status}</span>
                    </div>
                    <p className="text-[11px] font-semibold text-neutral-800 mt-1">{issue.category_name || "General"}</p>
                    <p className="text-[10px] text-neutral-500 truncate mt-0.5">{issue.location_address}</p>
                  </button>
                )) : <p className="text-xs text-neutral-400 p-4 italic text-center">No new alerts.</p>}
              </div>
            </div>
          )}
        </div>

        {/* Profile Section */}
        <div className="relative" ref={profileRef}>
          <div 
            className="flex items-center gap-3 sm:pl-6 sm:border-l border-secondary/10 cursor-pointer"
            onClick={() => setShowProfileDrawer(!showProfileDrawer)}
          >
            <p className="text-xs font-black text-secondary leading-none uppercase tracking-tighter hidden sm:block">
              {user?.full_name || 'Hebron Enyew'}
            </p>
            <div className="w-9 h-9 rounded-full bg-secondary/5 border border-secondary/10 flex items-center justify-center overflow-hidden">
              <User size={18} className="text-secondary/40" />
            </div>
          </div>

          {showProfileDrawer && (
            <div className="absolute right-0 mt-4 w-56 bg-white rounded-2xl shadow-xl border border-neutral-100 p-4 z-50">
              <p className="text-xs font-bold text-secondary mb-1">{user?.full_name}</p>
              <p className="text-[10px] text-neutral-400 mb-4">{user?.email}</p>
              <button 
                onClick={logout} 
                className="w-full flex items-center gap-2 text-xs font-bold text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;