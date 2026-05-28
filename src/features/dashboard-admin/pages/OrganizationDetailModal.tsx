/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { IoMailOutline, IoCallOutline, IoLocationOutline, IoCloseOutline, IoPeopleOutline, IoPersonAddOutline, IoLayersOutline, IoPricetagOutline } from "react-icons/io5";
import { organizationApi } from '../../auth/services/OrganizationService';
import { toast } from 'react-hot-toast';

interface AdminProfile {
  id: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  phone_number?: string;
  profile_picture?: string;
  is_active?: boolean;
  status?: 'Pending' | 'Active' | 'Blocked';
}

// interface Organization {
//   id: string;
//   name: string;
//   code?: string;
//   contact_email?: string;
//   contact_phone?: string; 
//   address?: string;
//   logo?: string;
//   admins?: AdminProfile[]; 
//   created_at?: string;
//   category?: { id: string; name: string } | null;
//   subcategories?: Array<{ id: string; name: string }> | null;
// }

interface OrganizationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: any | null;
  setOrganizationsList?: React.Dispatch<React.SetStateAction<any[]>>; // Accept any array configuration smoothly
}

export const OrganizationDetailModal: React.FC<OrganizationDetailModalProps> = ({
  isOpen,
  onClose,
  organization,
  setOrganizationsList,
}) => {
  const [fetchedAdmins, setFetchedAdmins] = useState<AdminProfile[]>([]);
  const [isAddingAdmin, setIsAddingAdmin] = useState<boolean>(false);
  const [newAdminEmail, setNewAdminEmail] = useState<string>('');

  const backendBaseUrl = import.meta.env.VITE_BASE_URL || ''; 

  useEffect(() => {
    if (isOpen && organization) {
      setFetchedAdmins(organization.admins || []);
      console.log("OrganizationDetailModal opened for org:", organization);
    }
  }, [isOpen, organization]);

  // Guard clause handled safely after all state hooks
  if (!isOpen || !organization) return null;

  const handleAddAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim() || !organization?.id) return;
    
    setIsAddingAdmin(true);
    try {
      await organizationApi.createAdmin(newAdminEmail, organization.id);
      toast.success(`Invitation email sent to ${newAdminEmail}!`);

      const pendingAdmin: AdminProfile = {
        id: `pending-${Date.now()}`,
        email: newAdminEmail,
        full_name: "Pending Activation",
        status: "Pending",
        is_active: false
      };

      setFetchedAdmins((prev) => [...prev, pendingAdmin]);

      // Update the parent component's master state array in memory safely
      if (setOrganizationsList) {
        setOrganizationsList((prevOrgs) => 
          prevOrgs.map((org) => 
            org.id === organization.id 
              ? { ...org, admins: [...(org.admins || []), pendingAdmin] }
              : org
          )
        );
      }

      setNewAdminEmail('');
    } catch (error) {
      toast.error(`Failed to send admin invitation. ${error} Please try again.`);
      console.error("Error inviting admin:", error);
    } finally {
      setIsAddingAdmin(false);
    }
  };
  console.log("Rendering OrganizationDetailModal with organization:", organization); 

  const logoUrl = organization.logo
    ? (organization.logo.startsWith('http') ? organization.logo : `${backendBaseUrl}${organization.logo.startsWith('/') ? '' : '/'}${organization.logo}`)
    : 'https://placehold.co/100?text=Org';

  // SAFELY IDENTIFY LINKED CLASSIFICATIONS
  const linkedCategoryName = organization.categories?.[0]?.name || organization.category_name;
  const targetSubcategories = organization.subcategories || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] border border-neutral-100">
        
        {/* LEFT PANEL: Core Company Fields */}
        <div className="w-full md:w-5/12 bg-neutral-50/60 p-6 sm:p-8 border-b md:border-b-0 md:border-r border-neutral-100 overflow-y-auto">
          <div className="flex items-center justify-between md:block mb-6">
            <img 
              src={logoUrl} 
              alt={organization.name} 
              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-2xl border border-neutral-200/80 bg-white p-1.5 shadow-sm"
            />
            <button 
              onClick={onClose}
              className="md:hidden p-2 rounded-xl bg-white border border-neutral-200 text-neutral-500 font-medium text-xs shadow-sm flex items-center gap-1"
            >
              Close
            </button>
          </div>

          <span className="text-[10px] font-bold text-neutral-500 bg-neutral-200/60 rounded-full px-2.5 py-1 uppercase tracking-wider">
            {organization.code || "Active Org"}
          </span>
          
          <h2 className="text-xl sm:text-2xl font-black text-neutral-800 mt-2.5 leading-tight">
            {organization.name}
          </h2>

          <hr className="my-5 border-neutral-200/60" />

          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <IoMailOutline className="text-neutral-400 mt-0.5" size={16} />
              <div>
                <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Contact Email</h4>
                <p className="text-sm font-medium text-neutral-700 break-all">
                  {organization.contact_email || "No email assigned"}
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <IoCallOutline className="text-neutral-400 mt-0.5" size={16} />
              <div>
                <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Phone Line</h4>
                <p className="text-sm font-medium text-neutral-700">
                  {organization.contact_phone || "No registered phone"}
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <IoLocationOutline className="text-neutral-400 mt-0.5" size={16} />
              <div>
                <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Headquarters Address</h4>
                <p className="text-sm font-medium text-neutral-600 leading-relaxed">
                  {organization.address || "Addis Ababa, Ethiopia"}
                </p>
              </div>
            </div>

            {/* DYNAMIC CLASSIFICATION RENDER BLOCK */}
            <div className="flex gap-3 items-start pt-2 border-t border-dashed border-neutral-200/80">
              <IoLayersOutline className="text-neutral-400 mt-0.5" size={16} />
              <div className="w-full">
                <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Classification Structure</h4>
                
                {linkedCategoryName ? (
                  <div className="space-y-2">
                    <p className="text-xs font-extrabold text-neutral-800 uppercase tracking-wide flex items-center gap-1.5 bg-neutral-200/40 px-2.5 py-1.5 rounded-xl border border-neutral-200/20">
                      {linkedCategoryName}
                    </p>
                    
                    {targetSubcategories.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {targetSubcategories.map((sub: any) => (
                          <span 
                            key={sub.id || sub.name} 
                            className="inline-flex items-center gap-1 bg-white border border-neutral-200 text-neutral-600 font-bold text-[9px] px-2 py-0.5 rounded-md uppercase tracking-tight shadow-2xs"
                          >
                            <IoPricetagOutline size={8} className="text-neutral-400" /> {sub.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs italic text-neutral-400">No primary issue category mapped to this organization profile.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Staff Admins List */}
        <div className="w-full md:w-7/12 p-6 sm:p-8 overflow-y-auto flex flex-col justify-between">
          <div>
            <div className="hidden md:flex items-center justify-between mb-5">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Assigned Management Admins
              </h3>
              <button 
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 transition-all font-bold text-sm"
              >
                <IoCloseOutline size={16} />
              </button>
            </div>

            {fetchedAdmins.length > 0 ? (
              <div className="space-y-3.5">
                {fetchedAdmins.map((admin: any) => {
                  const adminDisplayName = admin.full_name || 
                    (admin.first_name || admin.last_name 
                      ? `${admin.first_name || ''} ${admin.last_name || ''}`.trim() 
                      : "Unnamed Admin");

                  const adminPic = admin.profile_picture
                    ? (admin.profile_picture.startsWith('http') ? admin.profile_picture : `${backendBaseUrl}${admin.profile_picture}`)
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(adminDisplayName)}&background=random&size=100`;

                  let displayStatus = 'Active';
                  let statusStyles = 'bg-emerald-50 text-emerald-700 border-emerald-100';

                  if (admin.id.toString().startsWith('pending') || admin.status === 'Pending') {
                    displayStatus = 'Pending';
                    statusStyles = 'bg-amber-50 text-amber-700 border-amber-100';
                  } else if (admin.is_active === false || admin.status === 'Blocked') {
                    displayStatus = 'Blocked';
                    statusStyles = 'bg-neutral-100 text-neutral-500 border-neutral-200';
                  }
                             
                  return (
                    <div 
                      key={admin.id} 
                      className="flex items-start sm:items-center gap-4 p-4 rounded-2xl border border-neutral-100 bg-neutral-50/40 hover:bg-neutral-50 transition-all shadow-sm"
                    >
                      <img 
                        src={adminPic} 
                        alt={adminDisplayName} 
                        className="w-12 h-12 rounded-full object-cover border border-neutral-200 shadow-inner"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-neutral-800 truncate">
                            {adminDisplayName}
                          </h4>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${statusStyles}`}>
                            {displayStatus}
                          </span>
                        </div>
                        
                        <p className="text-xs text-neutral-500 truncate mb-0.5 mt-0.5">📧 {admin.email}</p>
                        {(admin.phone_number || admin.phone) && (
                          <p className="text-xs text-neutral-400 flex items-center gap-1">
                            📞 {admin.phone_number || admin.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 border border-dashed border-neutral-200 rounded-2xl bg-neutral-50/50 my-auto flex flex-col items-center justify-center">
                <IoPeopleOutline size={32} className="text-neutral-300 mb-2" />
                <h4 className="text-sm font-bold text-neutral-700">No Admins Profile Linked</h4>
                <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto px-4 leading-relaxed">
                  This organization doesn't have administrative manager credentials mapped yet inside the database.
                </p>
              </div>
            )}

            {/* Add Organization Admin Action Section */}
            <div className="mt-6 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
              <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <IoPersonAddOutline size={12} /> Add New Organization Admin
              </h4>
              <form onSubmit={handleAddAdminSubmit} className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter admin's email address"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="flex-1 bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs font-medium placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-all"
                  disabled={isAddingAdmin}
                />
                <button
                  type="submit"
                  disabled={isAddingAdmin || !newAdminEmail.trim()}
                  className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isAddingAdmin ? 'Adding...' : 'Add Admin'}
                </button>
              </form>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-100 hidden md:flex justify-end">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-all"
            >
              Dismiss View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};