import React from 'react';
import { IoCloseOutline, IoPersonCircleOutline, IoMailOutline, IoCalendarOutline, IoShieldCheckmarkOutline } from "react-icons/io5";

interface UserDetailDrawerProps {
  user: any | null;
  isOpen: boolean;
  onClose: () => void;
}

const UserDetailDrawer = ({ user, isOpen, onClose }: UserDetailDrawerProps) => {
  if (!user) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-secondary/20 backdrop-blur-sm z-[150] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-tertiary shadow-2xl z-[200] transform transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-8 h-full flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-start mb-10">
            <h2 className="font-header text-2xl font-black text-secondary uppercase tracking-tighter">
              User <span className="font-light">Profile</span>
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-secondary/5 rounded-full transition-colors text-secondary">
              <IoCloseOutline size={24} />
            </button>
          </div>

          {/* Profile Info */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-[2rem] bg-secondary/5 flex items-center justify-center text-secondary mb-4 border border-secondary/5">
              <IoPersonCircleOutline size={60} />
            </div>
            <h3 className="text-xl font-bold text-secondary">{user.name}</h3>
            <span className={`mt-2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
              user.status === 'Active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
            }`}>
              {user.status}
            </span>
          </div>

          {/* Data List */}
          <div className="space-y-6 flex-1">
            <div className="group">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/30 mb-2">Email Address</p>
              <div className="flex items-center gap-3 text-secondary/80 font-bold">
                <IoMailOutline className="text-secondary/20" size={18} />
                {user.email}
              </div>
            </div>

            <div className="group">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/30 mb-2">Account Type</p>
              <div className="flex items-center gap-3 text-secondary/80 font-bold">
                <IoShieldCheckmarkOutline className="text-secondary/20" size={18} />
                {user.role}
              </div>
            </div>

            <div className="group">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/30 mb-2">Member Since</p>
              <div className="flex items-center gap-3 text-secondary/80 font-bold">
                <IoCalendarOutline className="text-secondary/20" size={18} />
                {user.joined}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-8 border-t border-secondary/5">
            <button className="w-full py-4 bg-secondary text-white rounded-2xl font-bold text-sm hover:opacity-90 transition-opacity">
              Send Message
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDetailDrawer;