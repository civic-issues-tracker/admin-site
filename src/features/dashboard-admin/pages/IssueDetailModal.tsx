/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { privateApi } from '../../auth/services/authService'; 

// Integrated clean categoryApi routing rules
const categoryApi = {
  // GET all active categories
  getAll: async () => {
    const response = await privateApi.get('/orgs/categories/');
    return response.data;
  },

  // PATCH update a category
  update: async (id: string, name: string) => {
    const response = await privateApi.patch(`/orgs/categories/${id}/`, { name });
    return response.data;
  },

  // DELETE (Soft-delete)
  delete: async (id: string) => {
    const response = await privateApi.delete(`/orgs/categories/${id}/`);
    return response.data;
  }
};

interface Category {
  id: string;
  name: string;
  [key: string]: any;
}

interface IssueDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: any; 
  setIssues: React.Dispatch<React.SetStateAction<any[]>>; 
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  isOpen,
  onClose,
  issue,
  setIssues,
}) => {
  const [notes, setNotes] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  // const [isApproving, setIsApproving] = useState(false);
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);
  const [fetchingCats, setFetchingCats] = useState<boolean>(false);

  // Load baseline issue notes and configuration
  useEffect(() => {
    if (issue) {
      setNotes(issue.internal_notes || '');
      setSelectedCategoryId(issue.category ? String(issue.category) : '');
    }
  }, [issue]);

  // CATEGORY FETCHING (Synced with working reporting form implementation)
  useEffect(() => {
    const fetchCategories = async () => {
      if (!isOpen) return;
      try {
        setFetchingCats(true);
        const [cats] = await Promise.all([categoryApi.getAll()]);
        
        // Handle variations in backend return formats (paginated .results array vs raw list)
        const rawList = cats.results || cats;
        const mergedData: Category[] = Array.isArray(rawList)
          ? rawList.map((cat: any) => ({ ...cat }))
          : [];
          
        setCategories(mergedData);
      } catch (error) {
        console.error("Failed to sync system categories:", error);
        setCategories([]);
      } finally {
        setFetchingCats(false);
      }
    };
    
    fetchCategories();
  }, [isOpen]);

  useEffect(() => {
    if (issue?.images) {
      console.log("CRITICAL IMAGE DATA LOG:", issue.images);
    }
  }, [issue]);

  // --- HOOKS ARE ABOVE THIS LINE, CONDITIONAL RENDER BELOW ---
  if (!isOpen || !issue) return null;

  // UPDATED: Strict logic for status interaction
  const canEditInternalNotes = issue.status === 'pending_admin' || issue.status === 'escalated';

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('internal_notes', notes);

      await privateApi.patch(`/issues/${issue.id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success("Internal notes updated.");
      
      const response = await privateApi.get('/issues/');
      const freshData = response.data.results || response.data;
      setIssues(freshData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save notes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategoryId) {
      toast.error("Please select a category first.");
      return;
    }
    setIsUpdatingCategory(true);
    try {
      const formData = new FormData();
      formData.append('category', selectedCategoryId);

      await privateApi.patch(`/issues/${issue.id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success("Issue category updated successfully.");

      const response = await privateApi.get('/issues/');
      setIssues(response.data.results || response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update issue category allocation.");
    } finally {
      setIsUpdatingCategory(false);
    }
  };

  // const handleApproveIssue = async () => {
  //   setIsApproving(true);
  //   try {
  //     const formData = new FormData();
  //     formData.append('status', 'submitted');

  //     await privateApi.patch(`/issues/${issue.id}/`, formData, {
  //       headers: {
  //         'Content-Type': 'multipart/form-data',
  //       },
  //     });
  //     toast.success("Issue approved and moved to submitted.");
      
  //     const response = await privateApi.get('/issues/');
  //     setIssues(response.data.results || response.data);
  //     onClose(); 
  //   } catch (error) {
  //     console.error(error);
  //     toast.error("Failed to approve issue.");
  //   } finally {
  //     setIsApproving(false);
  //   }
  // };

  const handleRejectIssue = async () => {
    setIsRejecting(true);
    try {
      const formData = new FormData();
      formData.append('reason', notes);

      await privateApi.patch(`/issues/${issue.id}/reject/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success("Issue has been rejected successfully.");
      
      const response = await privateApi.get('/issues/');
      setIssues(response.data.results || response.data);
      onClose(); 
    } catch (error) {
      console.error(error);
      toast.error("Failed to reject issue.");
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4 animate-fadeIn">
      
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      <div className="bg-white w-full max-w-5xl h-full max-h-[90vh] md:h-[85vh] rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-neutral-100 transition-all">
        
        {/* Header Section */}
        <div className="p-4 sm:p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50 shrink-0">
          <div>
            <span className="text-[10px] sm:text-xs font-black tracking-widest text-neutral-400 uppercase">Issue Reference</span>
            <h2 className="text-base sm:text-xl font-mono font-black text-neutral-800">{issue.issue_number}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-500 font-bold transition-all flex items-center justify-center cursor-pointer text-xs sm:text-sm"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Split Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden min-h-0">
          
          {/* LEFT SIDE: Details Feed Card */}
          <div className="flex-1 p-5 sm:p-8 overflow-y-auto border-b md:border-b-0 md:border-r border-neutral-100 space-y-5 sm:space-y-6 bg-white min-h-0">
            <div>
              <h4 className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Resident Contact</h4>
              <p className="text-xs sm:text-sm font-semibold text-neutral-700 bg-neutral-50 p-3 rounded-xl border border-neutral-100 wrap-break-words">
                {issue.resident_name || "Anonymous Resident"}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Category</h4>
                <p className="text-xs sm:text-sm font-bold text-neutral-800">{issue.category_name}</p>
              </div>
              <div>
                <h4 className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Subcategory</h4>
                <p className="text-xs sm:text-sm font-medium text-neutral-600">{issue.subcategory_name || "None Specified"}</p>
              </div>
            </div>

            <div>
              <h4 className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Location Address</h4>
              <p className="text-xs sm:text-sm text-neutral-700 font-medium wrap-break-words">{issue.location_address}</p>
            </div>

            <div>
              <h4 className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Issue Description</h4>
              <div className="bg-[#E5D3B3]/10 border border-[#E5D3B3]/20 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-[#2C0901] leading-relaxed whitespace-pre-wrap font-medium max-h-48 overflow-y-auto">
                {issue.description}
              </div>
            </div>

            {/* Evidence Image Attachments */}
            <div>
              <h4 className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                Attached Attachments
              </h4>
              
              {(() => {
                let normalizedImages: any[] = [];
                if (issue.images && issue.images.length > 0) {
                  normalizedImages = issue.images;
                } else if (issue.image_url) {
                  normalizedImages = [issue.image_url];
                }

                if (normalizedImages.length === 0) {
                  return (
                    <p className="text-[10px] sm:text-xs italic text-neutral-400 bg-neutral-50 p-4 rounded-xl text-center border border-dashed">
                      No images attached by resident.
                    </p>
                  );
                }

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:w-3xl md:h-48 lg:w-4xl overflow-hidden ">
                    {normalizedImages.map((img: any, idx: number) => {
                      const backendBaseUrl = import.meta.env.VITE_BASE_URL || "";
                      let imgSrcString = "";
                      if (typeof img === 'string') {
                        imgSrcString = img;
                      } else if (img && typeof img === 'object') {
                        imgSrcString = img.image_url || img.url || img.file || img.image || "";
                      }

                      if (!imgSrcString) {
                        return (
                          <div key={idx} className="w-full h-20 sm:h-24 bg-neutral-50 flex items-center justify-center rounded-xl border border-neutral-200 text-[10px] text-neutral-400 italic">
                            Invalid Ref
                          </div>
                        );
                      }

                      const fullImgUrl = imgSrcString.startsWith('http') 
                        ? imgSrcString 
                        : `${backendBaseUrl}${imgSrcString.startsWith('/') ? '' : '/'}${imgSrcString}`;

                      return (
                        <img 
                          key={idx} 
                          src={fullImgUrl} 
                          alt="Evidence Document" 
                          className="w-full md:h-full sm:h-24 object-cover rounded-xl border border-neutral-200 shadow-sm hover:scale-[1.02] transition-all duration-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=60';
                          }}
                        />
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* RIGHT SIDE: Interactive Admin Panel */}
          <div className="w-full md:w-90 lg:w-95 bg-neutral-50/60 p-5 sm:p-8 flex flex-col justify-between md:overflow-y-auto shrink-0 space-y-6 md:space-y-0">
            <div className="space-y-5 sm:space-y-6">
              <div>
                <h4 className="text-[10px] sm:text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">System Controls</h4>
                <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-neutral-100 shadow-sm space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] sm:text-xs font-bold text-neutral-400">Status:</span>
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      {issue.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] sm:text-xs font-bold text-neutral-400">Priority:</span>
                    <span className="text-[10px] sm:text-xs font-bold text-neutral-700">{issue.priority || "Medium"}</span>
                  </div>
                </div>
              </div>

              {/* Triage Category Selection Section */}
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-1.5">
                  <h4 className="text-[10px] sm:text-xs font-bold text-neutral-500 uppercase tracking-wider">Assign Triage Category</h4>
                </div>

                <div className="space-y-2">
                  <select
                    value={selectedCategoryId}
                    disabled={isUpdatingCategory || fetchingCats || !canEditInternalNotes}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="w-full p-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-medium text-neutral-800 outline-none shadow-sm focus:border-[#A07156] disabled:opacity-60 cursor-pointer"
                  >
                    <option value="">{fetchingCats ? "Loading Category Data..." : "-- Choose Existing Category --"}</option>
                    {categories.map((cat) => (
                      <option key={String(cat.id)} value={String(cat.id)}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleUpdateCategory}
                    disabled={isUpdatingCategory || !selectedCategoryId || !canEditInternalNotes}
                    className="w-full py-2 bg-[#A07156] hover:bg-[#2C0901] disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-bold text-[11px] rounded-xl shadow-sm transition-all cursor-pointer transform active:scale-[0.99]"
                  >
                    {isUpdatingCategory ? "Assigning..." : "Assign Category"}
                  </button>
                </div>
              </div>

              {/* Administrative Note Area */}
              <div className="flex flex-col">
                <h4 className="text-[10px] sm:text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Internal Admin Notes</h4>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={!canEditInternalNotes}
                  placeholder={canEditInternalNotes ? "Type internal notes, logs, or updates here..." : "Notes are locked for this issue status."}
                  className={`w-full h-32 sm:h-40 p-3 sm:p-4 text-xs font-medium bg-white border border-neutral-200 rounded-xl sm:rounded-2xl shadow-inner focus:border-[#A07156] outline-none resize-none transition-all leading-relaxed text-neutral-800 ${
                    !canEditInternalNotes ? "opacity-60 cursor-not-allowed bg-neutral-100" : ""
                  }`}
                />
                <button
                  onClick={handleSaveNotes}
                  disabled={isSaving || !canEditInternalNotes}
                  className="mt-2 w-full py-2.5 sm:py-3 bg-[#2C0901] hover:bg-[#A07156] disabled:bg-neutral-300 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer transform active:scale-[0.98]"
                >
                  {isSaving ? "Saving Note..." : "Save Internal Note"}
                </button>
              </div>
            </div>

            {/* Action Buttons Box */}
            <div className="pt-4 sm:pt-6 border-t border-neutral-200/60 md:mt-6 shrink-0 space-y-2">
              {/* <button
                onClick={handleApproveIssue}
                disabled={isApproving || !canEditInternalNotes}
                className={`w-full py-2.5 border border-green-500/30 text-green-700 bg-green-50/50 hover:bg-green-50 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 transform active:scale-[0.98] cursor-pointer ${
                  !canEditInternalNotes ? "opacity-40 cursor-not-allowed grayscale" : ""
                }`}
              >
                ✅ {isApproving ? "Approving..." : "Approve Issue"}
              </button> */}
              <button
                onClick={handleRejectIssue}
                disabled={isRejecting || !canEditInternalNotes}
                className={`w-full py-2.5 border border-red-500/30 text-red-700 bg-red-50/50 hover:bg-red-50 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 transform active:scale-[0.98] cursor-pointer ${
                  !canEditInternalNotes ? "opacity-40 cursor-not-allowed grayscale" : ""
                }`}
              >
                🛑 {isRejecting ? "Rejecting..." : "Reject Issue"}
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};