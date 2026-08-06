import { 
  IoCloseOutline, 
  IoMailOutline, 
  IoCalendarOutline, 
  IoShieldCheckmarkOutline,
  IoCallOutline
} from "react-icons/io5";

interface UserDetailDrawerProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any | null;
  isOpen: boolean;
  onClose: () => void;
}

const UserDetailDrawer = ({ user, isOpen, onClose }: UserDetailDrawerProps) => {
  if (!user) return null;

  // Handles dynamic naming structures securely across both components
  const displayName = user.full_name || user.name || "User";
  const userEmail = user.email || "";
  const userPhone = user.phone || "";
  const userRole = user.role_name || user.role || "Resident";
  
  // Normalized status flags matching both schemas
  const isAccountActive = user.is_active === true || user.status === "Active";

  // const handleContactClick = () => {
  //   if (userEmail) {
  //     window.location.href = `mailto:${userEmail}?subject=Civic Issue Tracker Administrative Outreach`;
  //   }
  // };

  const handleEmailClick = () => {
  if (userEmail) {
    window.location.href = `mailto:${userEmail}?subject=Civic Issue Tracker Administrative Outreach`;
  }
};

const handlePhoneClick = () => {
  if (userPhone) {
    // This triggers the device's native dialer app
    window.location.href = `tel:${userPhone}`;
  }
};

  return (
    <>
      {/* Backdrop Layer with clean overlay blur */}
      <div 
        className={`fixed inset-0 bg-secondary/20 backdrop-blur-md z-150 transition-opacity duration-500 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer Panel Sliding Layout */}
      <div 
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-tertiary shadow-[0_0_50px_rgba(0,0,0,0.08)] border-l border-secondary/5 z-200 transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-8 h-full flex flex-col justify-between">
          
          <div>
            {/* Drawer Header */}
            <div className="flex justify-between items-center mb-10 pb-4 border-b border-secondary/5">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/30">
                System File View
              </span>
              <button 
                onClick={onClose} 
                className="w-9 h-9 rounded-full flex items-center justify-center border border-secondary/10 hover:bg-secondary/5 text-secondary/60 hover:text-secondary transition-all"
              >
                <IoCloseOutline size={22} />
              </button>
            </div>

            {/* Profile Avatar & Identity Identity Layout */}
            <div className="flex flex-col items-center mb-10 text-center">
              <div className="relative mb-4">
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=4A3728&color=fff&size=120&bold=true`}
                  alt={displayName}
                  className="w-24 h-24 rounded-2xl object-cover shadow-md border-4 border-white"
                />
                <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                  isAccountActive ? 'bg-emerald-500' : 'bg-rose-500'
                }`} />
              </div>
              
              <h3 className="text-xl font-black text-secondary tracking-tight">
                {displayName}
              </h3>
              
              <span className={`mt-2.5 px-3.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                isAccountActive 
                  ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/10' 
                  : 'bg-rose-500/5 text-rose-600 border-rose-500/10'
              }`}>
                {isAccountActive ? "Active Registry" : "Suspended"}
              </span>
            </div>

            {/* Glassmorphic Parameter Lists */}
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/30 block mb-1">
                Account Information
              </span>

              {/* Email Card */}
              <div className="flex items-center gap-4 p-4 bg-white/50 border border-secondary/5 rounded-2xl hover:bg-white transition-all shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-secondary/5 flex items-center justify-center text-secondary/40">
                  <IoMailOutline size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] uppercase text-secondary/30 font-bold tracking-wider">Email Address</p>
                  <p className="text-xs font-bold text-secondary truncate">{userEmail || "No email mapped"}</p>
                </div>
              </div>

              {/* Phone Card (Conditional) */}
              {userPhone && (
                <div className="flex items-center gap-4 p-4 bg-white/50 border border-secondary/5 rounded-2xl hover:bg-white transition-all shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-secondary/5 flex items-center justify-center text-secondary/40">
                    <IoCallOutline size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] uppercase text-secondary/30 font-bold tracking-wider">Phone Link</p>
                    <p className="text-xs font-bold text-secondary truncate">{userPhone}</p>
                  </div>
                </div>
              )}

              {/* Security Privileges Card */}
              <div className="flex items-center gap-4 p-4 bg-white/50 border border-secondary/5 rounded-2xl hover:bg-white transition-all shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-secondary/5 flex items-center justify-center text-secondary/40">
                  <IoShieldCheckmarkOutline size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] uppercase text-secondary/30 font-bold tracking-wider">Access Scope</p>
                  <p className="text-xs font-bold text-secondary capitalize">{userRole}</p>
                </div>
              </div>

              {/* Account Timeline Card */}
              {(user.joined || user.created_at) && (
                <div className="flex items-center gap-4 p-4 bg-white/50 border border-secondary/5 rounded-2xl hover:bg-white transition-all shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-secondary/5 flex items-center justify-center text-secondary/40">
                    <IoCalendarOutline size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] uppercase text-secondary/30 font-bold tracking-wider">Membership Created</p>
                    <p className="text-xs font-bold text-secondary">
                      {new Date(user.joined || user.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modern Dual Action Footer Buttons */}
          <div className="pt-6 border-t border-secondary/5 space-y-2.5">
            <div className="grid grid-cols-2 gap-3">
              {/* Email Button */}
              <button 
                onClick={handleEmailClick}
                disabled={!userEmail}
                className="py-3.5 bg-secondary text-white rounded-xl font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                <IoMailOutline size={14} />
                Contact via Email
              </button>

              {/* Phone Button */}
              <button 
                onClick={handlePhoneClick}
                disabled={!userPhone}
                className="py-3.5 bg-white text-secondary border border-secondary/10 rounded-xl font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs hover:bg-secondary/5 active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                <IoCallOutline size={14} />
                Contact via Phone
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default UserDetailDrawer;