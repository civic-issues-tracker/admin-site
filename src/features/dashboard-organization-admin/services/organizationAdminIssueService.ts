import { privateApi } from '../../auth/services/authService';
import type { OrganizationAdminIssue, IssueStatus } from '../organizationAdminMockData';

export const organizationAdminIssueApi = {
  getAll: async (): Promise<OrganizationAdminIssue[]> => {
    const response = await privateApi.get('/issues/');
    return response.data as OrganizationAdminIssue[];
  },
  updateStatus: async (id: string, status: IssueStatus): Promise<OrganizationAdminIssue> => {
    const response = await privateApi.patch(`/issues/${id}/`, { status });
    return response.data as OrganizationAdminIssue;
  },
  updateInternalNotes: async (id: string, internalNotes: string): Promise<OrganizationAdminIssue> => {
    const response = await privateApi.patch(`/issues/${id}/`, { internal_notes: internalNotes });
    return response.data as OrganizationAdminIssue;
  },
};
