import { useCallback, useEffect, useMemo, useState } from 'react';
import { organizationAdminIssueApi } from '../services/organizationAdminIssueService';
import {
  getOrganizationAdminWorkspace,
  updateTicketStatus as updateLocalTicketStatus,
} from '../organizationAdminWorkspace';
import {
  toOrganizationAdminTicket,
  type OrganizationAdminIssue,
  type OrganizationAdminTicket,
  type IssueStatus,
} from '../organizationAdminMockData';

interface UseOrganizationAdminIssuesResult {
  tickets: OrganizationAdminTicket[];
  resolvedTickets: OrganizationAdminTicket[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  updateStatus: (ticketId: string, status: IssueStatus) => Promise<void>;
  updateInternalNotes: (ticketId: string, notes: string) => Promise<void>;
  assignUnit: (ticketId: string, unit: string) => void;
  releaseIssue: (ticketId: string, note?: string) => Promise<void>;
  escalateIssue: (ticketId: string, reason: string) => Promise<void>;
}

const isResolvedStatus = (status: OrganizationAdminTicket['status']) => status === 'resolved';

const splitResolved = (tickets: OrganizationAdminTicket[]) => {
  const resolved = tickets.filter((ticket) => isResolvedStatus(ticket.status));
  const active = tickets.filter((ticket) => !isResolvedStatus(ticket.status));
  return { active, resolved };
};

export const useOrganizationAdminIssues = (seedValue?: string | null): UseOrganizationAdminIssuesResult => {
  const seed = seedValue?.trim() || 'organization-admin-default';
  const fallbackWorkspace = useMemo(() => getOrganizationAdminWorkspace(seed), [seed]);
  const [tickets, setTickets] = useState<OrganizationAdminTicket[]>(fallbackWorkspace.organizationAdminTickets);
  const [resolvedTickets, setResolvedTickets] = useState<OrganizationAdminTicket[]>(fallbackWorkspace.resolvedTickets);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const refresh = useCallback(() => {
    setReloadKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadIssues = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const issues = await organizationAdminIssueApi.getAll();
        if (!isActive) return;

        const mapped = issues.map((issue: OrganizationAdminIssue) => toOrganizationAdminTicket(issue));
        const { active, resolved } = splitResolved(mapped);
        setTickets(active);
        setResolvedTickets(resolved);
      } catch (err) {
        if (!isActive) return;
        setError(err instanceof Error ? err.message : 'Failed to load issues from the server. Using local cache.');
        setTickets(fallbackWorkspace.organizationAdminTickets);
        setResolvedTickets(fallbackWorkspace.resolvedTickets);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadIssues();
    return () => {
      isActive = false;
    };
  }, [fallbackWorkspace.organizationAdminTickets, fallbackWorkspace.resolvedTickets, reloadKey]);

  const updateStatus = useCallback(
    async (ticketId: string, status: IssueStatus) => {
      try {
        const updated = await organizationAdminIssueApi.updateStatus(ticketId, status);
        const hasFullPayload = Boolean(updated && 'issue_number' in updated);
        const updatedTicket = hasFullPayload
          ? toOrganizationAdminTicket(updated as OrganizationAdminIssue)
          : null;

        if (updatedTicket && isResolvedStatus(updatedTicket.status)) {
          // Moving TO resolved: remove from active, add to resolved
          setTickets((prev) => prev.filter((t) => t.id !== ticketId));
          setResolvedTickets((prev) => [updatedTicket, ...prev.filter((t) => t.id !== ticketId)]);
        } else if (updatedTicket) {
          // Moving AWAY from resolved (or between active statuses):
          // remove from resolved list and ensure it exists in active list
          setResolvedTickets((prev) => prev.filter((t) => t.id !== ticketId));
          setTickets((prev) => {
            const exists = prev.some((t) => t.id === ticketId);
            if (exists) {
              return prev.map((t) => (t.id === ticketId ? updatedTicket : t));
            }
            // Ticket was in resolvedTickets — bring it back to active
            return [updatedTicket, ...prev];
          });
        } else {
          setResolvedTickets((prev) => prev.filter((t) => t.id !== ticketId));
          setTickets((prev) =>
            prev.map((t) => (t.id === ticketId ? { ...t, status } : t))
          );
        }
      } catch {
        updateLocalTicketStatus(seed, ticketId, status);
        const ws = getOrganizationAdminWorkspace(seed);
        setTickets(ws.organizationAdminTickets);
        setResolvedTickets(ws.resolvedTickets);
      }
    },
    [seed],
  );

  const assignUnit = useCallback((ticketId: string, unit: string) => {
    setTickets((prev) =>
      prev.map((ticket) => (ticket.id === ticketId ? { ...ticket, assignedUnit: unit } : ticket)),
    );
  }, []);

  const updateInternalNotes = useCallback(
    async (ticketId: string, notes: string) => {
      try {
        const updated = await organizationAdminIssueApi.updateInternalNotes(ticketId, notes);
        const hasFullPayload = Boolean(updated && 'issue_number' in updated);
        const updatedTicket = hasFullPayload
          ? toOrganizationAdminTicket(updated as OrganizationAdminIssue)
          : null;
        if (updatedTicket) {
          setTickets((prev) => prev.map((ticket) => (ticket.id === ticketId ? updatedTicket : ticket)));
          setResolvedTickets((prev) => prev.map((ticket) => (ticket.id === ticketId ? updatedTicket : ticket)));
        } else {
          setTickets((prev) => prev.map((ticket) => (ticket.id === ticketId ? { ...ticket, internalNotes: notes } : ticket)));
          setResolvedTickets((prev) =>
            prev.map((ticket) => (ticket.id === ticketId ? { ...ticket, internalNotes: notes } : ticket))
          );
        }
      } catch (err) {
        console.error('Failed to update internal notes', err);
        throw err;
      }
    },
    []
  );

  const releaseIssue = useCallback(
    async (ticketId: string, note?: string) => {
      await organizationAdminIssueApi.release(ticketId, note);
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId
            ? { ...ticket, status: 'submitted', assignedAdminName: undefined }
            : ticket
        )
      );
      setResolvedTickets((prev) => prev.filter((ticket) => ticket.id !== ticketId));
    },
    []
  );

  const escalateIssue = useCallback(
    async (ticketId: string, reason: string) => {
      await organizationAdminIssueApi.escalate(ticketId, reason);
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId
            ? { ...ticket, status: 'escalated', assignedAdminName: undefined }
            : ticket
        )
      );
      setResolvedTickets((prev) => prev.filter((ticket) => ticket.id !== ticketId));
    },
    []
  );

  return {
    tickets,
    resolvedTickets,
    isLoading,
    error,
    refresh,
    updateStatus,
    updateInternalNotes,
    releaseIssue,
    escalateIssue,
    assignUnit,
  };
};
