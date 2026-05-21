import {
	chatThreads,
	organizationAdminIssues,
	resolvedOrganizationAdminIssues,
	toOrganizationAdminTicket,
	type OrganizationAdminConversation,
	type OrganizationAdminTicket,
} from './organizationAdminMockData';

export interface OrganizationAdminWorkspace {
	seed: string;
	displayName: string;
	organizationAdminTickets: OrganizationAdminTicket[];
	resolvedTickets: OrganizationAdminTicket[];
	chatThreads: OrganizationAdminConversation[];
	departmentLabel: string;
}

const rotateList = <T,>(items: T[], shift: number): T[] => {
	if (items.length === 0) return [];
	const offset = ((shift % items.length) + items.length) % items.length;
	return [...items.slice(offset), ...items.slice(0, offset)];
};

const hashSeed = (value: string) => {
	let hash = 0;
	for (let index = 0; index < value.length; index += 1) {
		hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
	}
	return hash;
};

const sliceCount = (base: number, available: number, seed: number) => {
	if (available <= base) return available;
	return Math.min(available, base + (seed % Math.max(1, available - base + 1)));
};

export const buildOrganizationAdminWorkspace = (seedValue?: string | null): OrganizationAdminWorkspace => {
	const seed = seedValue?.trim() || 'organization-admin-default';
	const seedHash = hashSeed(seed);
	const ticketCount = sliceCount(2, organizationAdminIssues.length, seedHash % organizationAdminIssues.length);
	const resolvedCount = sliceCount(4, resolvedOrganizationAdminIssues.length, (seedHash >> 2) % resolvedOrganizationAdminIssues.length);
	const threadCount = sliceCount(3, chatThreads.length, (seedHash >> 3) % chatThreads.length);
	const tickets = organizationAdminIssues.map(toOrganizationAdminTicket);
	const resolvedTickets = resolvedOrganizationAdminIssues.map(toOrganizationAdminTicket);

	return {
		seed,
		displayName: seed,
		departmentLabel: 'Bole Operations',
		organizationAdminTickets: rotateList(tickets, seedHash).slice(0, ticketCount),
		resolvedTickets: rotateList(resolvedTickets, seedHash >> 1).slice(0, resolvedCount),
		chatThreads: rotateList(chatThreads, seedHash >> 2).slice(0, threadCount),
	};
};

const LOCAL_KEY = (seed: string) => `org_admin_ws:${seed}`;

export const getOrganizationAdminWorkspace = (seedValue?: string | null): OrganizationAdminWorkspace => {
	const seed = seedValue?.trim() || 'organization-admin-default';
	const key = LOCAL_KEY(seed);
	try {
		const raw = localStorage.getItem(key);
		if (raw) {
			return JSON.parse(raw) as OrganizationAdminWorkspace;
		}
	} catch (error) {
		console.warn('Failed to load organization admin workspace from localStorage', error);
	}
	const ws = buildOrganizationAdminWorkspace(seed);
	localStorage.setItem(key, JSON.stringify(ws));
	return ws;
};

export const saveOrganizationAdminWorkspace = (ws: OrganizationAdminWorkspace) => {
	try {
		localStorage.setItem(LOCAL_KEY(ws.seed), JSON.stringify(ws));
	} catch (error) {
		console.warn('Failed to save organization admin workspace to localStorage', error);
	}
};

export const resetOrganizationAdminWorkspace = (seedValue?: string | null) => {
	const seed = seedValue?.trim() || 'organization-admin-default';
	const key = LOCAL_KEY(seed);
	localStorage.removeItem(key);
	const ws = buildOrganizationAdminWorkspace(seed);
	localStorage.setItem(key, JSON.stringify(ws));
	return ws;
};

export const updateTicketStatus = (seedValue: string | null | undefined, ticketId: string, status: OrganizationAdminTicket['status']) => {
	const ws = getOrganizationAdminWorkspace(seedValue);
	const idx = ws.organizationAdminTickets.findIndex((t) => t.id === ticketId);
	if (idx >= 0) {
		ws.organizationAdminTickets[idx].status = status;
		saveOrganizationAdminWorkspace(ws);
		return ws.organizationAdminTickets[idx];
	}
	const ridx = ws.resolvedTickets.findIndex((t) => t.id === ticketId);
	if (ridx >= 0) {
		ws.resolvedTickets[ridx].status = status;
		saveOrganizationAdminWorkspace(ws);
		return ws.resolvedTickets[ridx];
	}
	return null;
};

export const assignTicket = (seedValue: string | null | undefined, ticketId: string, assignee: string) => {
	const ws = getOrganizationAdminWorkspace(seedValue);
	const t = ws.organizationAdminTickets.find((t) => t.id === ticketId) ?? ws.resolvedTickets.find((t) => t.id === ticketId);
	if (t) {
		t.assignedUnit = assignee;
		saveOrganizationAdminWorkspace(ws);
		return t;
	}
	return null;
};

export const addMessageToThread = (
	seedValue: string | null | undefined,
	threadId: string,
	message: { id: string; from: 'organization_admin' | 'dispatch'; text: string; at: string },
) => {
	const ws = getOrganizationAdminWorkspace(seedValue);
	const thread = ws.chatThreads.find((c) => c.id === threadId);
	if (thread) {
		thread.messages = [...thread.messages, message];
		saveOrganizationAdminWorkspace(ws);
		return thread;
	}
	return null;
};
