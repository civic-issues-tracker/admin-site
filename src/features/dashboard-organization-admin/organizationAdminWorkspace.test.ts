import { describe, it, expect, beforeEach } from 'vitest';

const storageHost = globalThis as typeof globalThis & { localStorage?: Storage };

if (typeof storageHost.localStorage === 'undefined') {
  const store = new Map<string, string>();
  storageHost.localStorage = {
    getItem: (key: string) => (store.has(key) ? store.get(key) ?? null : null),
    setItem: (key: string, value: string) => store.set(key, String(value)),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  } as Storage;
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
    const updated = updateTicketStatus(seed, ticket.id, 'in_progress');
    expect(updated).not.toBeNull();
    expect(updated?.status).toBe('in_progress');
    const ws2 = getOrganizationAdminWorkspace(seed);
    const t2 = ws2.organizationAdminTickets.find((t) => t.id === ticket.id);
    expect(t2?.status).toBe('in_progress');
  });

  it('assigns a ticket to a unit', () => {
    const ws = getOrganizationAdminWorkspace(seed);
    const ticket = ws.organizationAdminTickets[0];
    const updated = assignTicket(seed, ticket.id, 'Unit 99');
    expect(updated).not.toBeNull();
    expect(updated?.assignedUnit).toBe('Unit 99');
    const ws2 = getOrganizationAdminWorkspace(seed);
    const t2 = ws2.organizationAdminTickets.find((item) => item.id === ticket.id);
    expect(t2?.assignedUnit).toBe('Unit 99');
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
