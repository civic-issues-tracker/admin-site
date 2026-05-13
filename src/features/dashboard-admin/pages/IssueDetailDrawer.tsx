import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Calendar, User, Tag, AlertCircle, Phone, Mail, Clock } from 'lucide-react';

interface IssueDetailDrawerProps {
  issue: any;
  onClose: () => void;
}

const IssueDetailDrawer: React.FC<IssueDetailDrawerProps> = ({ issue, onClose }) => {
  if (!issue) return null;

  // Format date helper
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-primary/40 backdrop-blur-md"
        />

        {/* Drawer Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl border-l border-secondary/10 flex flex-col"
        >
          {/* Header */}
          <div className="p-8 border-b border-secondary/5 flex justify-between items-center bg-tertiary/10">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/30">Issue Track ID</span>
              <h2 className="text-xl font-black uppercase tracking-tighter text-secondary">
                #{issue.id?.toString().padStart(5, '0')}
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="p-3 rounded-full hover:bg-secondary/5 text-secondary/40 hover:text-secondary transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
            
            {/* Status & Category */}
            <div className="flex gap-4">
              <div className="flex-1 p-4 bg-secondary/5 rounded-2xl border border-secondary/5">
                <p className="text-[9px] font-black uppercase tracking-widest text-secondary/30 mb-1">Status</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${issue.status === 'Resolved' ? 'bg-green-500' : 'bg-orange-500'}`} />
                  <span className="text-xs font-bold uppercase text-secondary">{issue.status || 'Pending'}</span>
                </div>
              </div>
              <div className="flex-1 p-4 bg-secondary/5 rounded-2xl border border-secondary/5">
                <p className="text-[9px] font-black uppercase tracking-widest text-secondary/30 mb-1">Category</p>
                <span className="text-xs font-bold uppercase text-secondary">
                  {issue.category?.name || issue.category || 'General'}
                </span>
              </div>
            </div>

            {/* Description */}
            <section>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-secondary/40 mb-3 flex items-center gap-2">
                <AlertCircle size={12} /> Detailed Report
              </h4>
              <div className="bg-tertiary/20 p-5 rounded-lg border-l-4 border-secondary/20">
                <p className="text-sm font-medium leading-relaxed text-secondary/80 italic">
                  "{issue.description || 'No detailed description provided.'}"
                </p>
              </div>
            </section>

            {/* Reporter Information */}
            <section className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-secondary/40 mb-3 flex items-center gap-2">
                <User size={12} /> Contact Information
              </h4>
              <div className="grid gap-3">
                <div className="flex items-center gap-4 p-4 border border-secondary/5 rounded-xl bg-white shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center font-black text-xs">
                    {(issue.reporter_name || issue.reporter?.name || "U")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-black text-secondary uppercase tracking-tight">
                      {issue.reporter_name || issue.reporter?.name || "Anonymous Resident"}
                    </p>
                    <p className="text-[10px] font-bold text-secondary/30 uppercase">Authorized Reporter</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 px-4">
                  <div className="flex items-center gap-3 text-secondary/60">
                    <Mail size={14} className="text-secondary/20" />
                    <span className="text-xs font-medium">{issue.reporter?.email || issue.reporter_email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-secondary/60">
                    <Phone size={14} className="text-secondary/20" />
                    <span className="text-xs font-medium">{issue.reporter?.phone_number || issue.reporter_phone || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Location & Time */}
            <section className="grid grid-cols-2 gap-6 pt-4 border-t border-secondary/5">
              <div>
                <h4 className="text-[9px] font-black uppercase tracking-widest text-secondary/30 mb-2 flex items-center gap-1">
                   <Clock size={10} /> Reported Date
                </h4>
                <p className="text-xs font-bold text-secondary uppercase">{formatDate(issue.created_at)}</p>
              </div>
              <div>
                <h4 className="text-[9px] font-black uppercase tracking-widest text-secondary/30 mb-2 flex items-center gap-1">
                   <MapPin size={10} /> Location
                </h4>
                <p className="text-[10px] font-bold text-secondary/70 uppercase leading-tight line-clamp-2">
                  {issue.location_address || "Coordinates Only"}
                </p>
              </div>
            </section>

          </div>

          {/* Footer Action */}
          <div className="p-8 border-t border-secondary/5 bg-tertiary/10">
            <button 
              onClick={onClose}
              className="w-full py-4 bg-secondary text-white text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-lg active:scale-95"
            >
              Return to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default IssueDetailDrawer;