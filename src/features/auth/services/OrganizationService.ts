import { privateApi } from '../../auth/services/authService';

export const organizationApi = {
  //  List all active organizations
  getAll: async () => {
    const response = await privateApi.get('/orgs/organizations/');
    return response.data;
  },

  // Create a new organization (System Admin Only)
  create: async (orgData: { name: string; contact_email: string; contact_phone: string }) => {
    const response = await privateApi.post('/orgs/organizations/', orgData);
    return response.data;
  },

  //List deactivated organizations
  getInactive: async () => {
    const response = await privateApi.get('/orgs/organizations/inactive/');
    return response.data;
  },

  //  Get one organization detail
  getById: async (id: string) => {
    const response = await privateApi.get(`/orgs/organizations/${id}/`);
    return response.data;
  },

  //  Update organization
  update: async (
    id: string,
    data: { name?: string; email?: string; phone?: string }
  ) => {
    const response = await privateApi.patch(`/orgs/organizations/${id}/`, data);
    return response.data;
  },

  // Soft-delete
  delete: async (id: string) => {
    const response = await privateApi.delete(`/orgs/organizations/${id}/`);
    return response.data;
  },

  //  Reactivate
  activate: async (id: string) => {
    const response = await privateApi.post(`/orgs/organizations/${id}/activate/`);
    return response.data;
  },

  // List organizations linked to category
  getByCategory: async (categoryId: string) => {
    const response = await privateApi.get(`/orgs/categories/${categoryId}/organizations/`);
    return response.data;
  },

  // Link organization to category
  linkToCategory: async (categoryId: string, organizationId: string) => {
    const response = await privateApi.post(`/orgs/categories/${categoryId}/organizations/`, {
      organization_id: organizationId
    });
    return response.data;
  },
  createAdmin: async (email: string, organizationId: string) => {
    const response = await privateApi.post('/auth/admin/create-org-admin/', {
      email,
      organization_id: organizationId
    });
    return response.data;
  },

  // Complete organization admin registration using token/credentials
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  completeAdminRegistration: async (registrationData: Record<string, any>) => {
    const response = await privateApi.post('/auth/complete-registration/', registrationData);
    return response.data;
  }
};