import { privateApi } from './authService';

export const subcategoryApi = {
  //  List active subcategories
  getAll: async () => {
    const response = await privateApi.get('/subcategories/');
    return response.data;
  },

  //  Create a subcategory
  create: async (data: { name: string; category_id: string }) => {
    const payload = {
    name: data.name,
    category: data.category_id 
  };
    const response = await privateApi.post('/subcategories/', payload);
    return response.data;
  },

  //  List deactivated subcategories
  getInactive: async () => {
    const response = await privateApi.get('/subcategories/inactive/');
    return response.data;
  },

  //  Get one subcategory detail
  getById: async (id: string) => {
    const response = await privateApi.get(`/subcategories/${id}/`);
    return response.data;
  },

  // 24/25. Update (Full/Partial)
  update: async (id: string, name: string) => {
    const response = await privateApi.patch(`/subcategories/${id}/`, { name });
    return response.data;
  },

  //  Soft-delete (Deactivate)
  delete: async (id: string) => {
    const response = await privateApi.delete(`/subcategories/${id}/`);
    return response.data;
  },

  //  Reactivate
  activate: async (id: string) => {
    const response = await privateApi.post(`/subcategories/${id}/activate/`);
    return response.data;
  }
};