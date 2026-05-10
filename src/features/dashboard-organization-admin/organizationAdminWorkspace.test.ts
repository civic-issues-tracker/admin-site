import { describe, it, expect, beforeEach } from 'vitest';

if (typeof (globalThis as any).localStorage === 'undefined') {
  const _store = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (k: string) => (_store.has(k) ? _store.get(k) as string : null),
    setItem: (k: string, v: string) => _store.set(k, String(v)),
    removeItem: (k: string) => _store.delete(k),
  };
}
import {
  buildOrganizationAdminWorkspace,
  getOrganizationAdminWorkspace,
  resetOrganizationAdminWorkspace,
  updateTicketStatus,
  assignTicket,
  addMessageToThread,
} from './organizationAdminWorkspace';

describe('organizationAdminWorkspace helpers', () => {
  const seed = 'test-seed@example.com';

  beforeEach(() => {
    resetOrganizationAdminWorkspace(seed);
  });

  it('builds a workspace and persists via get/save', () => {
    const built = buildOrganizationAdminWorkspace(seed);
    expect(built.seed).toBe(seed);
    const ws = getOrganizationAdminWorkspace(seed);
    expect(ws.seed).toBe(seed);
    expect(Array.isArray(ws.organizationAdminTickets)).toBe(true);
  });

  it('updates ticket status and persists', () => {
    const ws = getOrganizationAdminWorkspace(seed);
    const ticket = ws.organizationAdminTickets[0];
    expect(ticket).toBeTruthy();
    const updated = updateTicketStatus(seed, ticket.id, 'In Progress');
    expect(updated).not.toBeNull();
    expect(updated?.status).toBe('In Progress');
    const ws2 = getOrganizationAdminWorkspace(seed);
    const t2 = ws2.organizationAdminTickets.find((t) => t.id === ticket.id);
    expect(t2?.status).toBe('In Progress');
  });

  it('assigns a ticket to a unit', () => {
    const ws = getOrganizationAdminWorkspace(seed);
    const ticket = ws.organizationAdminTickets[0];
    const updated = assignTicket(seed, ticket.id, 'Unit 99');
    expect(updated).not.toBeNull();
    expect((updated as any).assignedUnit).toBe('Unit 99');
    const ws2 = getOrganizationAdminWorkspace(seed);
    const t2 = ws2.organizationAdminTickets.find((t) => t.id === ticket.id) as any;
    expect(t2.assignedUnit).toBe('Unit 99');
  });

  it('adds a message to a thread', () => {
    const ws = getOrganizationAdminWorkspace(seed);
    const thread = ws.chatThreads[0];
    const before = thread.messages.length;
    const msg = { id: 'm-test', from: 'organization_admin' as const, text: 'hello', at: 'now' };
    const updatedThread = addMessageToThread(seed, thread.id, msg);
    expect(updatedThread).not.toBeNull();
    expect(updatedThread?.messages.length).toBe(before + 1);
    const ws2 = getOrganizationAdminWorkspace(seed);
    const t2 = ws2.chatThreads.find((c) => c.id === thread.id);
    expect(t2?.messages[t2.messages.length - 1].id).toBe('m-test');
  });
});
