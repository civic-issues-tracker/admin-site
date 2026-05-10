import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Table from '../../../components/ui/Table';
import { categoryApi } from '../../../features/auth/services/CategorySevice';
import { subcategoryApi } from '../../../features/auth/services/subcategoryService'; 
import {  Trash2, Edit,  X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

// Validation Schemas
const categorySchema = z.object({
  name: z.string().min(2, "Category name is too short"),
});

const subcategorySchema = z.object({
  category_id: z.string().min(1, "Please select a parent category"),
  name: z.string().min(2, "Subcategory name is too short"),
});

type CategoryFormData = z.infer<typeof categorySchema>;
type SubcategoryFormData = z.infer<typeof subcategorySchema>;

interface Subcategory {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  subcategories?: Subcategory[]; 
}

const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);

  const { 
    register: regCat, 
    handleSubmit: handleCatSubmit, 
    reset: resetCat, 
    setValue: setCatValue,
    formState: { errors: catErrors } 
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema)
  });

  const { 
    register: regSub, 
    handleSubmit: handleSubSubmit, 
    reset: resetSub, 
    setValue: setSubValue,
    formState: { errors: subErrors } 
  } = useForm<SubcategoryFormData>({
    resolver: zodResolver(subcategorySchema)
  });

  const loadData = async () => {
    try {
      const data = await categoryApi.getAll();
      setCategories([...data].reverse());
    } catch (error) {
      console.error("Failed to load data", error);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const data = await categoryApi.getAll();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load data", error);
      }
    };
    load();
  }, []);

  // --- CATEGORY ACTIONS ---
  const handleEditClick = (category: Category) => {
    setEditingId(category.id);
    setCatValue("name", category.name);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    resetCat();
  };

  const handleDelete = (id: string) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <div className="flex items-center gap-2 text-secondary font-bold text-sm">
          <AlertTriangle size={18} className="text-amber-500" />
          <span>Delete Category?</span>
        </div>
        <p className="text-[10px] text-secondary/60 uppercase font-black tracking-widest">This will remove all linked subcategories.</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await categoryApi.delete(id);
                toast.success("Category deleted");
                loadData();
              } catch { toast.error("Failed to delete"); }
            }}
            className="flex-1 bg-secondary text-white py-2 rounded-lg text-[10px] font-black uppercase"
          >
            Delete
          </button>
          <button onClick={() => toast.dismiss(t.id)} className="flex-1 bg-primary/20 text-secondary py-2 rounded-lg text-[10px] font-black uppercase">Cancel</button>
        </div>
      </div>
    ), { position: 'top-center' });
  };

  const onCategorySubmit = async (data: CategoryFormData) => {
    try {
      if (editingId) {
        await categoryApi.update(editingId, data.name);
        toast.success("Category updated!");
      } else {
        await categoryApi.create(data.name);
        toast.success("Category added!");
      }
      setEditingId(null);
      resetCat();
      loadData();
    } catch { toast.error("Failed to save category."); }
  };

  // --- SUBCATEGORY ACTIONS ---
  const handleSubEditClick = (sub: Subcategory, parentId: string) => {
    setEditingSubId(sub.id);
    setSubValue("category_id", parentId);
    setSubValue("name", sub.name);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelSubEdit = () => {
    setEditingSubId(null);
    resetSub();
  };

  const handleSubDelete = (id: string) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <div className="flex items-center gap-2 text-secondary font-bold text-sm">
          <AlertTriangle size={18} className="text-amber-500" />
          <span>Remove Subcategory?</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await subcategoryApi.delete(id);
                toast.success("Subcategory removed");
                loadData();
              } catch { toast.error("Failed to remove"); }
            }}
            className="flex-1 bg-red-500 text-white py-2 rounded-lg text-[10px] font-black uppercase"
          >
            Confirm
          </button>
          <button onClick={() => toast.dismiss(t.id)} className="flex-1 bg-primary/20 text-secondary py-2 rounded-lg text-[10px] font-black uppercase">Cancel</button>
        </div>
      </div>
    ), { position: 'top-center' });
  };

  const onSubcategorySubmit = async (data: SubcategoryFormData) => {
    try {
      if (editingSubId) {
        await subcategoryApi.update(editingSubId, data.name);
        toast.success("Subcategory updated!");
      } else {
        await subcategoryApi.create({ name: data.name, category_id: data.category_id });
        toast.success("Subcategory created!");
      }
      setEditingSubId(null);
      resetSub();
      loadData(); 
    } catch { toast.error("Action failed."); }
  };

  const columns = [
    { header: 'Category Name', key: 'name', render: (cat: Category) => <span className="font-bold text-secondary">{cat.name}</span> },
    { 
      header: 'Sub-Categories', 
      key: 'subcategories',
      render: (category: Category) => (
        <div className="flex flex-wrap gap-2 py-2">
          {category.subcategories && category.subcategories.length > 0 ? (
            category.subcategories.map((sub) => (
              <div key={sub.id} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-secondary/10 hover:border-secondary/30 transition-all rounded-full group">
                <span className="text-[10px] font-black text-secondary/70 uppercase tracking-tight">{sub.name}</span>
                <div className="flex items-center gap-1.5 ml-1 border-l border-secondary/10 pl-1.5">
                   <button onClick={() => handleSubEditClick(sub, category.id)} className="text-secondary/30 hover:text-blue-500 transition-colors">
                     <Edit size={12}/>
                   </button>
                   <button onClick={() => handleSubDelete(sub.id)} className="text-secondary/30 hover:text-red-500 transition-colors">
                     <X size={14}/>
                   </button>
                </div>
              </div>
            ))
          ) : (
            <span className="text-secondary/20 italic text-[10px] uppercase font-bold">No subcategories linked</span>
          )}
        </div>
      )
    },
    { 
      header: 'Actions', 
      key: 'actions',
      render: (category: Category) => (
        <div className="flex gap-4">
          <button onClick={() => handleEditClick(category)} className="text-secondary/20 hover:text-blue-500 transition-all"><Edit size={18}/></button>
          <button onClick={() => handleDelete(category.id)} className="text-secondary/20 hover:text-red-500 transition-all"><Trash2 size={18}/></button>
        </div>
      )
    },
  ];

  return (
    <div className="p-4 md:p-8 py-10 md:py-14 space-y-8">
      <h1 className="text-xl md:text-2xl font-black text-secondary uppercase tracking-tighter">Category Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Form */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase text-secondary/40 tracking-[0.2em] px-2">
            {editingId ? "Modify Category" : "Establish New Category"}
          </h3>
          <form onSubmit={handleCatSubmit(onCategorySubmit)} className={`p-6 rounded-4xl shadow-sm border flex flex-col gap-2 transition-all ${editingId ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-secondary/5'}`}>
            <div className="flex gap-3">
              <input 
                {...regCat("name")}
                type="text" 
                placeholder="Category Name"
                className={`flex-1 bg-primary/20 rounded-xl px-4 py-3 text-sm font-bold border-none outline-none focus:ring-2 ${catErrors.name ? 'ring-red-500' : 'ring-secondary/10'}`}
              />
              <button type="submit" className="bg-secondary text-primary px-6 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 hover:opacity-90">
                {editingId ? "Update" : "Add"}
              </button>
              {editingId && <button onClick={cancelEdit} className="p-3 bg-red-100 text-red-500 rounded-xl hover:bg-red-200"><X size={16}/></button>}
            </div>
            {catErrors.name && <span className="text-[10px] text-red-500 font-bold uppercase ml-2">{catErrors.name.message}</span>}
          </form>
        </div>

        {/* Subcategory Form */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase text-secondary/40 tracking-[0.2em] px-2">
             {editingSubId ? "Modify Subcategory" : "Establish New Subcategory"}
          </h3>
          <form onSubmit={handleSubSubmit(onSubcategorySubmit)} className={`p-6 rounded-4xl shadow-sm border flex flex-col gap-2 transition-all ${editingSubId ? 'bg-orange-50/50 border-orange-200' : 'bg-white border-secondary/5'}`}>
            <div className="flex flex-col sm:flex-row gap-0.5">
              <select 
                {...regSub("category_id")}
                disabled={!!editingSubId}
                className={`flex-1 w-1 bg-primary/20 rounded-xl px-4 py-3 text-sm border-none outline-none focus:ring-2 font-bold ${subErrors.category_id ? 'ring-red-500' : 'ring-secondary/10'}`}
              >
                <option value="">Select Parent</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
              <input 
                {...regSub("name")}
                type="text" 
                placeholder="Subcategory Name"
                className={`flex-1 w-2xs bg-primary/20 rounded-xl px-4 py-3 text-sm font-bold border-none outline-none focus:ring-2 ${subErrors.name ? 'ring-red-500' : 'ring-secondary/10'}`}
              />
              <button type="submit" className="bg-secondary text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2">
                {editingSubId ? "Update" : "Create"} 
              </button>
              {editingSubId && <button onClick={cancelSubEdit} className="p-3 bg-red-100 text-red-500 rounded-xl hover:bg-red-200"><X size={16}/></button>}
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] overflow-hidden border border-secondary/5 shadow-sm">
        <Table columns={columns} data={categories} />
      </div>
    </div>
  );
};

export default AdminCategoriesPage;