import { useState } from 'react';
import { 
  IoSettingsOutline, 
  IoNotificationsOutline, 
  IoShieldCheckmarkOutline, 
  IoSaveOutline, 
} from "react-icons/io5";
import toast from 'react-hot-toast';

const AdminSettingsPage = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'categories' | 'security'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [masterKey, setMasterKey] = useState("••••••••••••••••••••••••••••••••");
  const [isCycling, setIsCycling] = useState(false);

  // --- State for System Variables ---
  const [systemName, setSystemName] = useState("Addis Ababa Civic Care Tracker");
  const [autoEscalateDays, setAutoEscalateDays] = useState(5);
  const [enableSmsAlerts, setEnableSmsAlerts] = useState(true);


  // --- Handlers ---
  const handleSaveGeneralSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Simulate API call to update backend settings configs
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("System parameters updated successfully.");
    } catch (error) {
      toast.error("Failed to persist general configurations.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCycleKey = () => {
  setIsCycling(true);

  toast.loading("Requesting key rotation challenge...", { id: "key-rotate" });

  setTimeout(() => {
    // Simulate generating a new secure random hash string
    const mockNewHash = Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('');
    setMasterKey(mockNewHash);

    toast.success("Master key rotated successfully.", { id: "key-rotate" });
    setIsCycling(false);
  }, 1500);
};


  return (
    <div className="min-h-screen bg-[#FDFBF7] px-6 lg:px-20 py-10 animate-in fade-in duration-500">
      
      {/* Page Title Header */}
      <header className="mb-10">
        <h1 className="font-header text-4xl font-black text-secondary tracking-tighter uppercase">
          System Core <span className="font-light">Settings</span>
        </h1>
        <p className="font-body text-[10px] text-secondary/40 uppercase tracking-[0.4em] mt-2 font-bold">
          Global Configurations & Control Variables
        </p>
      </header>

      <div className="grid grid-col-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Navigation Tabs Column */}
        <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-3 lg:pb-0 border-b lg:border-b-0 border-secondary/5">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-3 px-5 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${
              activeTab === 'general' 
                ? 'bg-secondary text-white border-secondary shadow-md' 
                : 'bg-tertiary text-secondary/60 border-secondary/5 hover:bg-secondary/5 hover:text-secondary'
            }`}
          >
            <IoSettingsOutline size={16} /> General Parameters
          </button>
          
          
          
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-3 px-5 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${
              activeTab === 'security' 
                ? 'bg-secondary text-white border-secondary shadow-md' 
                : 'bg-tertiary text-secondary/60 border-secondary/5 hover:bg-secondary/5 hover:text-secondary'
            }`}
          >
            <IoShieldCheckmarkOutline size={16} /> Access & Security
          </button>
        </div>

        {/* Configurations Settings Content Workspace */}
        <div className="lg:col-span-3 bg-tertiary border border-secondary/5 rounded-3xl p-6 md:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
          
          {/* TAB 1: GENERAL SYSTEM PARAMETERS */}
          {activeTab === 'general' && (
            <form onSubmit={handleSaveGeneralSettings} className="space-y-6">
              <div>
                <h3 className="text-base font-black text-secondary uppercase tracking-tight mb-1">Global Variables</h3>
                <p className="text-xs text-secondary/40">Adjust structural metadata text and dispatch notification parameters.</p>
              </div>

              <div className="h-1px bg-secondary/5 my-2" />

              <div className="grid gap-5">
                <div className="group">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/40 block mb-2">Platform Application Title</label>
                  <input 
                    type="text" 
                    value={systemName}
                    onChange={(e) => setSystemName(e.target.value)}
                    className="w-full bg-white border border-secondary/10 rounded-xl py-3.5 px-4 text-xs text-secondary font-bold outline-none focus:ring-2 ring-secondary/5 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="group">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/40 block mb-2">Auto-Escalation Threshold (Days)</label>
                    <input 
                      type="number" 
                      value={autoEscalateDays}
                      onChange={(e) => setAutoEscalateDays(Number(e.target.value))}
                      className="w-full bg-white border border-secondary/10 rounded-xl py-3.5 px-4 text-xs text-secondary font-bold outline-none focus:ring-2 ring-secondary/5 transition-all"
                    />
                  </div>

                  <div className="group">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/40 block mb-2">Fallback Emergency Contact</label>
                    <input 
                      type="text" 
                      defaultValue="+251111111111"
                      className="w-full bg-white border border-secondary/10 rounded-xl py-3.5 px-4 text-xs text-secondary font-bold outline-none focus:ring-2 ring-secondary/5 transition-all"
                    />
                  </div>
                </div>

                <div className="h-1px bg-secondary/5 my-2" />

                {/* Styled Custom Toggles */}
                <div className="flex items-center justify-between p-4 bg-white/50 border border-secondary/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-secondary/5 flex items-center justify-center text-secondary/60">
                      <IoNotificationsOutline size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-secondary">Dispatch Automated Resident SMS Alerts</h4>
                      <p className="text-[10px] text-secondary/40">Broadcasts cellular state alerts instantly when ticket state resolves.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={enableSmsAlerts}
                      onChange={(e) => setEnableSmsAlerts(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-10 h-6 bg-secondary/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-secondary/20 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary"></div>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3.5 bg-secondary text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:opacity-95 transition-opacity disabled:opacity-50"
                >
                  <IoSaveOutline size={14} /> {isSaving ? "Persisting..." : "Save Configurations"}
                </button>
              </div>
            </form>
          )}
          

          {/* TAB 3: ACCESS, RESTRICTIONS & SECURITY LOCK */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-black text-secondary uppercase tracking-tight mb-1">Security Tokens & Scope Access</h3>
                <p className="text-xs text-secondary/40">Audit backend environmental authentication restrictions and authorization checkpoints.</p>
              </div>

              <div className="h-1px bg-secondary/5" />

              <div className="space-y-4">
                <div className="p-4 rounded-2xl border border-amber-500/10 bg-amber-500/5 flex gap-4 items-start">
                  <span className="text-xl mt-0.5">🛡️</span>
                  <div>
                    <h4 className="text-xs font-black text-amber-800 uppercase tracking-tight">Active Scope Block: System Admin Clearance Verified</h4>
                    <p className="text-[11px] text-amber-700/80 leading-relaxed mt-1">
                      Your current session validation footprint token contains high administrative clearances. Access modification parameters verified through encrypted backend JSON Web Web Token routing rules.
                    </p>
                  </div>
                </div>

                <div className="group">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/40 block mb-2">Permitted Email Registration Domains</label>
                  <input 
                    type="text" 
                    disabled
                    value="* (All standard verifiable external mail routing filters allowed)"
                    className="w-full bg-secondary/5 border border-secondary/5 rounded-xl py-3.5 px-4 text-xs text-secondary/40 font-bold outline-none cursor-not-allowed"
                  />
                </div>

                <div className="group">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/40 block mb-2">Fallback Master Encryption Seed Identity</label>
                  <div className="flex gap-2">
                    <input 
                      type="password" 
                      disabled
                      value={masterKey}
                      className="w-full bg-secondary/5 border border-secondary/5 rounded-xl py-3.5 px-4 text-xs text-secondary/40 font-mono font-bold outline-none cursor-not-allowed"
                    />
                    <button 
                      type="button"
                      onClick={handleCycleKey}
                      disabled={isCycling}
                      className="px-4 bg-tertiary border border-secondary/10 rounded-xl text-xs font-bold text-secondary hover:bg-secondary/5 whitespace-nowrap transition-all disabled:opacity-50"
                    >
                      {isCycling ? "Cycling..." : "Cycle Key"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;