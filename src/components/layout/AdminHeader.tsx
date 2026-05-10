import React from 'react';
import { Bell, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const AdminHeader: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 md:px-8 py-4 md:py-6 bg-transparent gap-4">
      <div className="w-full sm:w-auto">
        <h2 className="text-lg md:text-2xl font-medium text-secondary/80 leading-tight">
          Welcome back, <span className="font-black text-secondary block sm:inline">Mr. {user?.full_name || 'Abebe'}</span>
        </h2>
      </div>

      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 md:gap-6">
        <button className="p-2 text-secondary/40 hover:text-secondary transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-primary" />
        </button>

        <div className="flex items-center gap-3 sm:pl-6 sm:border-l border-secondary/10">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-secondary leading-none uppercase tracking-tighter">
              {user?.full_name || 'Hebron Enyew'}
            </p>
            <p className="text-[10px] text-secondary/40 font-medium lowercase">
              {user?.email || 'hebronenyeww@gmail.com'}
            </p>
          </div>
          
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-secondary/5 border border-secondary/10 flex items-center justify-center overflow-hidden">
            <User size={18} className="text-secondary/40" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;