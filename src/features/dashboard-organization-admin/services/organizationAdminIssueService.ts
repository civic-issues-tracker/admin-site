import { privateApi } from '../../auth/services/authService';
import type { OrganizationAdminIssue, IssueStatus } from '../organizationAdminMockData';

export const organizationAdminIssueApi = {
  getAll: async (): Promise<OrganizationAdminIssue[]> => {
    const response = await privateApi.get('/issues/');
    return response.data as OrganizationAdminIssue[];
  },
  updateStatus: async (id: string, status: IssueStatus): Promise<Partial<OrganizationAdminIssue>> => {
    const formData = new FormData();
    formData.append('status', status);
    const response = await privateApi.patch(`/issues/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data as Partial<OrganizationAdminIssue>;
  },
  updateInternalNotes: async (id: string, internalNotes: string): Promise<Partial<OrganizationAdminIssue>> => {
    const formData = new FormData();
    formData.append('internal_notes', internalNotes);
    const response = await privateApi.patch(`/issues/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data as Partial<OrganizationAdminIssue>;
  },
  release: async (id: string, note?: string): Promise<{ status: string; message?: string }> => {
    const formData = new FormData();
    if (note) {
      formData.append('note', note);
    }
    const response = await privateApi.post(`/issues/${id}/release/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data as { status: string; message?: string };
  },
  escalate: async (id: string, reason: string): Promise<{ status: string; message?: string }> => {
    const formData = new FormData();
    formData.append('reason', reason);
    const response = await privateApi.post(`/issues/${id}/escalate/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data as { status: string; message?: string };
  },
};
