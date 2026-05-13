// 1. Import privateApi instead of the raw axios library
import { privateApi } from './authService'; 

export const categoryApi = {
  // GET all active categories
  getAll: async () => {
    const response = await privateApi.get('/orgs/categories/');
    return response.data;
  },

  // POST create a new category
  create: async (name: string) => {
    const response = await privateApi.post('/orgs/categories/', { name });
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