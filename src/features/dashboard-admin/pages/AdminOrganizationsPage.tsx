import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Table from '../../../components/ui/Table';
import { organizationApi } from '../../../features/auth/services/OrganizationService';
import {  Trash2, Edit, Building2, X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';


// Validation Schema
const organizationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number too long")
    .regex(/^(?:\+251|0)[79]\d{8}$/, "Invalid Ethiopian phone number (e.g., +2519... or 09...)")
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

interface Organization {
  id: string;
  name: string;
  contact_email: string; 
  contact_phone: string; 
  is_active: boolean;
  description?: string;
}

const AdminOrganizationsPage = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: { name: "", email: "", phone: "" }
  });

  const loadOrgs = async () => {
    try {
      const data = await organizationApi.getAll();
      const sortedData = [...data].sort((a, b) => {
        return b.id.localeCompare(a.id);
      });
      
      setOrganizations(sortedData);
    } catch (error) {
      console.error("Failed to load organizations", error);
    }
  };

  useEffect(() => {
    const fetchOrgs = async () => {
      await loadOrgs();
    };

    fetchOrgs();
  }, []);

  const handleEditClick = (org: Organization) => {
    setEditingId(org.id);
    setValue("name", org.name);
    setValue("email", org.contact_email);
    setValue("phone", org.contact_phone);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    reset({ name: "", email: "", phone: "" });
  };


  const onSubmit = async (data: OrganizationFormData) => {
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
      if (editingId) {
        await organizationApi.update(editingId, updatePayload);
        toast.success("Organization updated successfully!");
      } else {
        await organizationApi.create(createPayload);
        toast.success("Organization created successfully!");
      }
      resetForm();
      loadOrgs();
    } catch {
      toast.error("Action failed. Check your permissions or network.");
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
                loadOrgs();
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
    { header: 'Organization Name', key: 'name' },
    { 
      header: 'Email', 
      key: 'contact_email', 
      render: (item: Organization) => (
        <span className="text-secondary/60">{item.contact_email || "N/A"}</span>
      )
    },
    { 
      header: 'Phone', 
      key: 'contact_phone', 
      render: (item: Organization) => (
        <span className="text-secondary/60">{item.contact_phone || "N/A"}</span>
      )
    },
    { 
      header: 'Status', 
      key: 'is_active',
      render: (item: Organization) => (
        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {item.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    },
    { 
      header: 'Actions', 
      key: 'actions',
      render: (item: Organization) => (
        <div className="flex gap-4">
          <button 
            onClick={(e) => { e.stopPropagation(); handleEditClick(item); }} 
            className="text-blue-500 hover:text-blue-700 transition-colors"
          >
            <Edit size={16}/>
          </button>
          <button 
            onClick={(e) => handleDelete(e, item.id)} 
            className="text-red-500 hover:text-red-700 transition-colors"
          >
            <Trash2 size={16}/>
          </button>
        </div>
      )
    },
  ];

  return (
    <div className="p-4 md:p-8 py-10 md:py-14 space-y-6 md:space-y-8">
      <h1 className="text-xl md:text-2xl font-header text-secondary uppercase tracking-tighter">Organization Management</h1>

      <div className={`p-6 md:p-8 rounded-4xl md:rounded-[2.5rem] shadow-sm border transition-all ${editingId ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-secondary/5'}`}>
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
        
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
          <div className="space-y-1">
            <input 
              {...register("name")}
              type="text" 
              placeholder="Organization Name"
              className={`w-full bg-primary/20 rounded-xl px-4 py-3 text-sm font-bold border-none outline-none focus:ring-2 ${errors.name ? 'ring-red-500' : 'ring-secondary/10'}`}
            />
            {errors.name && <p className="text-[10px] text-red-500 font-bold ml-2 uppercase">{errors.name.message}</p>}
          </div>
          
          <div className="space-y-1">
            <input 
              {...register("email")}
              type="email" 
              placeholder="Official Email"
              className={`w-full bg-primary/20 rounded-xl px-4 py-3 text-sm font-bold border-none outline-none focus:ring-2 ${errors.email ? 'ring-red-500' : 'ring-secondary/10'}`}
            />
            {errors.email && <p className="text-[10px] text-red-500 font-bold ml-2 uppercase">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-0.5">
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                {...register("phone")}
                type="text" 
                placeholder="Phone Number"
                className={`flex-1 bg-primary/20 rounded-xl px-4 py-3 text-sm font-bold border-none outline-none focus:ring-2 ${errors.phone ? 'ring-red-500' : 'ring-secondary/10'}`}
              />
              <button type="submit" className="w-full md:w-auto bg-secondary text-primary md:px-4 md:py-2 px-2 py-2 rounded-xl font-black text-[10px] uppercase hover:opacity-90 transition-all shadow-lg shadow-secondary/10 whitespace-nowrap">
                {editingId ? "Update" : "Register"}
              </button>
            </div>
            {errors.phone && <p className="text-[10px] text-red-500 font-bold ml-2 uppercase">{errors.phone.message}</p>}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-4xl md:rounded-[2.5rem] overflow-x-auto border border-secondary/5 shadow-sm">
        <Table columns={columns} data={organizations} />
      </div>
    </div>
  );
};

export default AdminOrganizationsPage;