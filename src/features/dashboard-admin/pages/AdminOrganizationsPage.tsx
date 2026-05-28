/* eslint-disable react-hooks/incompatible-library */
import React, { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Table from '../../../components/ui/Table';
import { organizationApi } from '../../../features/auth/services/OrganizationService';
import { categoryApi } from '../../../features/auth/services/CategorySevice'; 
import { subcategoryApi } from '../../../features/auth/services/subcategoryService'; 
import { Trash2, Edit, Building2, X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { OrganizationDetailModal } from './OrganizationDetailModal';

// 1. Zod schema representing the strict data contract
const organizationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number too long")
    .regex(/^(?:\+251|0)[79]\d{8}$/, "Invalid Ethiopian phone number (e.g., +2519... or 09...)"),
  categorySelection: z.string().min(1, "Please select or create a category"),
  newCategoryName: z.string().optional(),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

interface CategoryItem {
  id: string;
  name: string;
}

interface Organization {
  id: string;
  name: string;
  contact_email: string; 
  contact_phone: string; 
  is_active: boolean;
  description?: string;
  category?: { id: string; name: string } | null;
  subcategories?: Array<{ id: string; name: string }> | null;
}

const AdminOrganizationsPage = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [existingCategories, setExistingCategories] = useState<CategoryItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  const [subcategoriesList, setSubcategoriesList] = useState<string[]>([]);
  // const [subInput, setSubInput] = useState<string>("");

  const handleRowClick = async (org: Organization) => {
    try {
      const completeOrgObject = await organizationApi.getById(org.id);
      setSelectedOrg(completeOrgObject);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Could not stream admin profiles:", error);
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: { 
      name: "", 
      email: "", 
      phone: "", 
      categorySelection: "", 
      newCategoryName: "" 
    }
  });

  const selectedCategoryValue = watch("categorySelection");
  const isCreatingCustomCategory = selectedCategoryValue === "NEW_CATEGORY";

  const loadDataPipeline = async () => {
    try {
      const [orgsData, categoriesData] = await Promise.all([
        organizationApi.getAll(),
        categoryApi.getAll ? await categoryApi.getAll() : [] 
      ]);
      
      const sortedOrgs = [...orgsData].sort((a, b) => b.id.localeCompare(a.id));
      setOrganizations(sortedOrgs);
      setExistingCategories(categoriesData || []);
    } catch (error) {
      console.error("Failed to compile layout data dependencies", error);
    }
  };

  useEffect(() => {
    loadDataPipeline();
  }, []);

  const handleEditClick = (org: Organization) => {
    setEditingId(org.id);
    setValue("name", org.name);
    setValue("email", org.contact_email);
    setValue("phone", org.contact_phone);
    if (org.category?.id) {
      setValue("categorySelection", org.category.id);
    } else {
      setValue("categorySelection", "");
    }
    setValue("newCategoryName", "");
    setSubcategoriesList(org.subcategories?.map(sub => sub.name) || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setSubcategoriesList([]);
    // setSubInput("");
    reset({ 
      name: "", 
      email: "", 
      phone: "", 
      categorySelection: "", 
      newCategoryName: "" 
    });
  };

  // const addSubcategoryTag = () => {
  //   if (!subInput.trim()) return;
  //   if (subcategoriesList.includes(subInput.trim())) {
  //     toast.error("Subcategory already added to this temporary list.");
  //     return;
  //   }
  //   setSubcategoriesList([...subcategoriesList, subInput.trim()]);
  //   setSubInput("");
  // };

  // const removeSubcategoryTag = (indexToRemove: number) => {
  //   setSubcategoriesList(subcategoriesList.filter((_, idx) => idx !== indexToRemove));
  // };

  const onSubmit: SubmitHandler<OrganizationFormData> = async (data) => {
    if (isCreatingCustomCategory && !data.newCategoryName?.trim()) {
      toast.error("Please provide a name for the new profile category.");
      return;
    }

    const updatePayload = {
      name: data.name,
      contact_email: data.email,
      contact_phone: data.phone
    };
    
    const createPayload = {
      name: data.name,
      contact_email: data.email, 
      contact_phone: data.phone  
    };

    try {
      let activeCategoryId = isCreatingCustomCategory ? null : data.categorySelection;

      if (editingId) {
        if (isCreatingCustomCategory && data.newCategoryName) {
          const freshCategory = await categoryApi.create(data.newCategoryName.trim());
          activeCategoryId = freshCategory.id;
        }

        await organizationApi.update(editingId, updatePayload);
        
        if (activeCategoryId) {
          await organizationApi.linkToCategory(activeCategoryId, editingId);
          if (subcategoriesList.length > 0 && subcategoryApi.create) {
            await Promise.all(
              subcategoriesList.map(subName => 
                subcategoryApi.create({ name: subName, category_id: activeCategoryId! })
              )
            );
          }
        }
        toast.success("Organization updated successfully!");
      } else {
        const newOrg = await organizationApi.create(createPayload);
        
        if (isCreatingCustomCategory && data.newCategoryName) {
          const newCategory = await categoryApi.create(data.newCategoryName.trim());
          activeCategoryId = newCategory.id;
        }

        if (activeCategoryId) {
          await organizationApi.linkToCategory(activeCategoryId, newOrg.id);

          if (subcategoriesList.length > 0) {
            await Promise.all(
              subcategoriesList.map(subName => 
                subcategoryApi.create({ name: subName, category_id: activeCategoryId! })
              )
            );
          }
          toast.success("Organization configuration deployed successfully!");
        } else {
          toast.success("Organization created successfully!");
        }
      }
      resetForm();
      loadDataPipeline();
    } catch (error) {
      console.error("Pipeline submission error:", error);
      toast.error("Action failed. Check your network configuration or constraints.");
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();

    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <div className="flex items-center gap-2 text-secondary font-bold text-sm">
          <AlertTriangle size={18} className="text-amber-500" />
          <span>Deactivate Organization?</span>
        </div>
        <p className="text-[10px] text-secondary/60 uppercase font-black tracking-widest">
          This will disable their access to the system.
        </p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await organizationApi.delete(id);
                toast.success("Deactivated successfully");
                loadDataPipeline();
              } catch {
                toast.error("Failed to deactivate");
              }
            }}
            className="flex-1 bg-secondary text-white py-2 rounded-lg text-[10px] font-black uppercase tracking-tighter"
          >
            Yes, Deactivate
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-1 bg-primary/20 text-secondary py-2 rounded-lg text-[10px] font-black uppercase tracking-tighter"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      position: 'top-center',
      style: {
        borderRadius: '20px',
        background: '#fff',
        color: '#1a1a1a',
        border: '1px solid rgba(0,0,0,0.05)',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
      }
    });
  };

  const columns = [
    { 
      header: 'Organization Name', 
      key: 'name',
      render: (item: Organization) => (
        <span className="font-extrabold text-[#2C0901] tracking-tight text-[13px]">
          {item.name}
        </span>
      )
    },
    { 
      header: 'Email', 
      key: 'contact_email', 
      render: (item: Organization) => {
        const rawEmail = item.contact_email;
        const hasEmail = rawEmail && typeof rawEmail === 'string' && rawEmail.trim().length > 0;
        return (
          <span className={`text-[12px] font-medium ${hasEmail ? 'text-neutral-600' : 'text-neutral-400 font-bold opacity-60'}`}>
            {hasEmail ? rawEmail : "N/A"}
          </span>
        );
      }
    },
    { 
      header: 'Phone', 
      key: 'contact_phone', 
      render: (item: Organization) => {
        const rawPhone = item.contact_phone;
        const hasPhone = rawPhone && typeof rawPhone === 'string' && rawPhone.trim().length > 0;
        return (
          <span className={`text-[12px] font-medium ${hasPhone ? 'text-neutral-600' : 'text-neutral-400 font-bold opacity-60'}`}>
            {hasPhone ? rawPhone : "N/A"}
          </span>
        );
      }
    },
    // {
    //   header: 'Category',
    //   key: 'classification',
    //   render: (item: Organization) => {
    //   // Cross-reference with existingCategories if item.category?.name is missing
    //   const matchedCategory = existingCategories.find(
    //     (cat) => cat.id === (item as any).category_id || cat.id === item.category?.id
    //   );
    //   const categoryName = item.category?.name || matchedCategory?.name;

    //   return (
    //     <div className="flex flex-col gap-1.5 max-w-xs py-1">
    //       {categoryName ? (
    //         <span className="text-[11px] font-black text-secondary uppercase tracking-wider flex items-center gap-1">
    //           <Layers size={11} className="text-[#A07156]" /> {categoryName}
    //         </span>
    //       ) : (
    //         <span className="text-[11px] text-neutral-400 italic">No category linked</span>
    //       )}
    //       {item.subcategories && item.subcategories.length > 0 && (
    //         <div className="flex flex-wrap gap-1">
    //           {item.subcategories.map((sub) => (
    //             <span key={sub.id} className="bg-primary/30 text-[#A07156] font-bold text-[9px] px-1.5 py-0.5 rounded-md uppercase tracking-tight">
    //               {sub.name}
    //             </span>
    //           ))}
    //         </div>
    //       )}
    //     </div>
    //   );
    // }
    // },
    { 
      header: 'Status', 
      key: 'is_active',
      render: (item: Organization) => (
        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
          item.is_active 
            ? 'bg-[#E5D3B3]/20 text-[#A07156] border border-[#E5D3B3]/30' 
            : 'bg-red-50 text-red-600 border border-red-100'
        }`}>
          {item.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    },
    { 
      header: 'Actions', 
      key: 'actions',
      render: (item: Organization) => (
        <div className="flex gap-3.5">
          <button 
            onClick={(e) => { e.stopPropagation(); handleEditClick(item); }} 
            className="text-[#A07156] hover:text-[#2C0901] transition-colors p-1 hover:bg-neutral-50 rounded-lg"
          >
            <Edit size={15}/>
          </button>
          <button 
            onClick={(e) => handleDelete(e, item.id)} 
            className="text-neutral-400 hover:text-red-600 transition-colors p-1 hover:bg-red-50 rounded-lg"
          >
            <Trash2 size={15}/>
          </button>
        </div>
      )
    },
  ];

  return (
    <div className="p-4 md:p-8 py-10 md:py-14 space-y-6 md:space-y-8">
      <header className="mb-10">
        <h1 className="font-header text-4xl font-black text-secondary tracking-tighter uppercase">
          Organization <span className="font-light">Management</span>
        </h1>
        <p className="font-body text-[10px] text-secondary/40 uppercase tracking-[0.4em] mt-2 font-bold">Admin Control Center</p>
      </header>

      <div className={`p-6 md:p-8 rounded-4xl md:rounded-[2.5rem] shadow-sm border transition-all duration-300 ${editingId ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-secondary/5'}`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs md:text-sm font-header uppercase text-secondary flex items-center gap-2">
            <Building2 size={18} /> {editingId ? "Update Organization" : "Register New Organization"}
          </h3>
          {editingId && (
            <button onClick={resetForm} className="text-secondary/40 hover:text-red-500 flex items-center gap-1 text-[10px] font-bold uppercase">
              <X size={14} /> Cancel Edit
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Balanced 2-Column Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Organization Name Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-black tracking-widest text-neutral-400 uppercase ml-1">Organization Name</label>
            <input 
              {...register("name")}
              type="text" 
              placeholder="Company or Bureau Name"
              className={`w-full bg-primary/20 rounded-xl px-4 py-3 text-sm font-bold border-none outline-none focus:ring-2 ${errors.name ? 'ring-red-500' : 'ring-secondary/10'}`}
            />
            {errors.name && <p className="text-[10px] text-red-500 font-bold ml-2 uppercase">{errors.name.message}</p>}
          </div>
          
          {/* Official Email Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-black tracking-widest text-neutral-400 uppercase ml-1">Official Email</label>
            <input 
              {...register("email")}
              type="email" 
              placeholder="official@domain.com"
              className={`w-full bg-primary/20 rounded-xl px-4 py-3 text-sm font-bold border-none outline-none focus:ring-2 ${errors.email ? 'ring-red-500' : 'ring-secondary/10'}`}
            />
            {errors.email && <p className="text-[10px] text-red-500 font-bold ml-2 uppercase">{errors.email.message}</p>}
          </div>

          {/* Phone Number Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-black tracking-widest text-neutral-400 uppercase ml-1">Phone Number</label>
            <input 
              {...register("phone")}
              type="text" 
              placeholder="e.g. 0911223344"
              className={`w-full bg-primary/20 rounded-xl px-4 py-3 text-sm font-bold border-none outline-none focus:ring-2 ${errors.phone ? 'ring-red-500' : 'ring-secondary/10'}`}
            />
            {errors.phone && <p className="text-[10px] text-red-500 font-bold ml-2 uppercase">{errors.phone.message}</p>}
          </div>

          {/* Core Category Dropdown */}
          <div className="space-y-1">
            <label className="text-[10px] font-black tracking-widest text-neutral-400 uppercase ml-1">Issue Category</label>
            <select
              {...register("categorySelection")}
              className={`w-full bg-primary/20 rounded-xl px-4 py-3 text-sm font-bold border-none outline-none focus:ring-2 ${errors.categorySelection ? 'ring-red-500' : 'ring-secondary/10'}`}
            >
              <option value="">-- Choose Category --</option>
              <option value="NEW_CATEGORY" className="text-secondary font-bold">+ Create New Category</option>
              {existingCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {errors.categorySelection && <p className="text-[10px] text-red-500 font-bold ml-2 uppercase">{errors.categorySelection.message}</p>}
          </div>
        </div>

        {/* Conditional Custom Category Input (Appears only if "+ Create New Category" is selected) */}
        {isCreatingCustomCategory && (
          <div className="p-5 bg-amber-50/40 rounded-2xl border border-amber-200/50 space-y-2 animate-fadeIn max-w-md">
            <label className="text-[10px] font-black tracking-widest text-amber-800 uppercase ml-1">New Category Title</label>
            <input 
              {...register("newCategoryName")}
              type="text"
              placeholder="e.g., Water Infrastructure & Plumbing Operations"
              className="w-full bg-white rounded-xl px-4 py-2.5 text-xs font-bold border border-neutral-200 focus:outline-none focus:border-neutral-900 transition-colors"
            />
          </div>
        )}

        {/* Form Action Button Submission Row */}
        <div className="flex justify-end pt-2">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full md:w-auto bg-secondary text-primary md:px-8 py-3 rounded-xl font-black text-xs uppercase hover:opacity-90 transition-all shadow-lg shadow-secondary/10 tracking-wider disabled:opacity-50"
          >
            {isSubmitting ? "Processing..." : (editingId ? "Update Organization" : "Register Organization")}
          </button>
        </div>
      </form>
      </div>

      <div className="bg-white rounded-4xl md:rounded-[2.5rem] overflow-x-auto border border-secondary/5 shadow-sm">
        <Table 
          columns={columns} 
          data={organizations}
          onRowClick={handleRowClick}  
        />
        
        <OrganizationDetailModal 
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedOrg(null);
          }}
          organization={selectedOrg}
          setOrganizationsList={setOrganizations}
        />
      </div>
    </div>
  );
};

export default AdminOrganizationsPage;