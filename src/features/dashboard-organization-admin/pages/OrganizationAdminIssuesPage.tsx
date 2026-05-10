import { Suspense, lazy, useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useOrganizationAdminIssues } from '../hooks/useOrganizationAdminIssues';
import type { OrganizationAdminTicket } from '../organizationAdminMockData';

const LazyMap = lazy(() => import('../components/OrganizationAdminMap'));

const boleCenter: [number, number] = [8.9907, 38.7991];

// ── helpers ────────────────────────────────────────────────────────────────
const priorityClass = (priority: OrganizationAdminTicket['priority']) => {
	if (priority === 'High') return 'text-[#C03E3E]';
	if (priority === 'Medium') return 'text-[#AF7A1E]';
	return 'text-[#2E8D56]';
};

const statusTone = (status: OrganizationAdminTicket['status']) => {
	if (status === 'Submitted') return 'bg-[#FFE9EA] text-[#D63945]';
	if (status === 'In Progress') return 'bg-[#FFF4D8] text-[#9A6F16]';
	if (status === 'Resolved') return 'bg-[#DCF5E4] text-[#20844A]';
	return 'bg-[#EDEDED] text-[#6A6A6A]'; // Rejected
};

const ALL_STATUSES = ['Submitted', 'In Progress', 'Resolved', 'Rejected'] as const;

// ── component ──────────────────────────────────────────────────────────────
const OrganizationAdminIssuesPage = () => {
	const { user, showToast } = useAuth();
	const seed = user?.email ?? user?.id ?? user?.full_name;
	const [searchQuery, setSearchQuery] = useState('');
	const { tickets, isLoading, error, updateStatus, assignUnit } = useOrganizationAdminIssues(seed);

	const setTicketStatus = async (ticketId: string, newStatus: OrganizationAdminTicket['status']) => {
		const ticket = tickets.find((t) => t.id === ticketId);
		if (!ticket || ticket.status === newStatus) return;
		await updateStatus(ticketId, newStatus);
		showToast(`${ticket.issueNumber} → ${newStatus}`, 'success');
	};

	const assignTicketToUnit = (ticketId: string, unit = 'Unit 4') => {
		const ticket = tickets.find((t) => t.id === ticketId);
		if (!ticket) return;
		assignUnit(ticketId, unit);
		showToast(`Assigned ${unit} to ${ticket.issueNumber}`, 'success');
	};

	const visibleTickets = tickets.filter((t) => {
		const q = searchQuery.trim().toLowerCase();
		if (!q) return true;
		return (
			t.issueNumber.toLowerCase().includes(q) ||
			(t.location ?? '').toLowerCase().includes(q) ||
			(t.title ?? '').toLowerCase().includes(q)
		);
	});

	// Use coordinates from backend tickets or fallback coordinates if none exist
	const mapSites = visibleTickets
		.filter((t) => typeof t.lat === 'number' && typeof t.lng === 'number')
		.map((t) => ({
			ticket: t,
			name: t.location || 'Reported Location',
			lat: t.lat as number,
			lng: t.lng as number,
		}));

	// If no tickets have coords, show a fallback (e.g. initial testing)
	const boleSites = mapSites.length > 0 ? mapSites : [
		{ ticket: visibleTickets[0] ?? tickets[0], name: 'Bole Medhanialem (Fallback)', lat: 8.9908, lng: 38.7915 },
	];

	useEffect(() => {
		if (error) showToast(error, 'error');
	}, [error, showToast]);

	if (isLoading && tickets.length === 0) {
		return (
			<section>
				<div className="rounded-2xl border border-[#D8CCBD] bg-[#F6F2EC] p-4 text-sm text-[#857060]">
					Loading map data...
				</div>
			</section>
		);
	}

	return (
		<section>
			<header className="mb-3 flex items-start justify-between">
				<div>
					<h2 className="text-[42px] font-black leading-tight text-[#3E2B1F]">Bole Subcity Map</h2>
					<p className="text-sm text-[#857060]">Live location of reported issues in Bole, Addis Ababa.</p>
				</div>
				<div className="flex items-center gap-2">
					<div className="flex items-center rounded-full border border-[#DDCFC0] bg-[#F8F6F2] px-3 py-1.5">
						<Search size={14} className="mr-1 text-[#9D8A78]" />
						<input
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search ticket ID or address..."
							className="w-56 bg-transparent text-xs outline-none"
						/>
					</div>
					<button
						type="button"
						onClick={() => setSearchQuery('')}
						className="rounded-full border border-[#DDCFC0] bg-[#F8F6F2] p-2 text-[#8B7B69]"
						aria-label="Clear search"
					>
						<X size={14} />
					</button>
				</div>
			</header>

			<div className="relative min-h-[81vh] overflow-hidden rounded-4xl border border-[#D8CCBD] bg-[#DACEB8]">
				{/* Map layer */}
				<div className="absolute inset-0 z-0">
					<Suspense fallback={<div className="h-full w-full bg-gray-100" />}>
						<LazyMap center={boleCenter} sites={boleSites} />
					</Suspense>
				</div>
				<div className="absolute inset-0 z-1 bg-linear-to-t from-[#DACEB8]/20 via-transparent to-[#DACEB8]/10 pointer-events-none" />

				{/* Top-left: district overview */}
				<div className="absolute left-4 top-4 z-20 w-[320px] rounded-3xl border border-white/70 bg-white/95 p-4 shadow-[0_24px_60px_rgba(68,43,24,0.18)] backdrop-blur-md">
					<p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8F7B69]">Bole District Overview</p>
					<h3 className="mt-2 text-lg font-bold text-[#3A2A20]">Active units and live coverage</h3>
					<div className="mt-3 space-y-2 text-sm">
						<div className="flex items-center justify-between rounded-xl border border-[#E7DCCF] bg-[#F8F4EE] px-3 py-2">
							<span>Unit 4 (Edna Mall)</span>
							<span className="text-xs text-[#7E8A95]">2 mins away</span>
						</div>
						<div className="flex items-center justify-between rounded-xl border border-[#E7DCCF] bg-[#F8F4EE] px-3 py-2">
							<span>Unit 7</span>
							<span className="text-xs text-[#7E8A95]">Patrol (Bole)</span>
						</div>
					</div>
				</div>

				{/* Top-right: legend */}
				<div className="absolute right-4 top-4 z-20 w-55 rounded-3xl border border-white/70 bg-white/95 p-4 shadow-[0_24px_60px_rgba(68,43,24,0.18)] backdrop-blur-md">
					<p className="mb-2 text-[11px] font-bold uppercase text-[#7A6756]">Map Legend</p>
					<ul className="space-y-1 text-xs text-[#4F3A2A]">
						<li><span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#EF4444]" /> High Priority Issue</li>
						<li><span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#F59E0B]" /> Medium Priority Issue</li>
						<li><span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#10B981]" /> Low Priority / Resolved</li>
					</ul>
				</div>

				{/* Bottom: incident feed with direct-status controls */}
				<div className="absolute bottom-4 left-4 right-4 z-20 rounded-[1.6rem] border border-white/70 bg-white/96 p-4 shadow-[0_24px_60px_rgba(68,43,24,0.18)] backdrop-blur-md">
					<div className="mb-3 flex items-center justify-between">
						<h4 className="text-sm font-bold text-[#3A2A20]">Active Incident Feed</h4>
						<span className="rounded-full bg-[#F0E7DB] px-2 py-0.5 text-[10px] text-[#6E5A49]">
							{tickets.length} Live
						</span>
					</div>

					{tickets.length === 0 ? (
						<p className="text-xs text-[#9D8A78]">No active incidents right now.</p>
					) : (
						<div className="max-h-52 space-y-2 overflow-y-auto pr-1">
							{tickets.map((t) => (
								/* Bug fix: key goes on the outer element, not a keyless Fragment */
								<div
									key={t.id}
									className="rounded-2xl border border-[#E7DCCF] bg-[#F9F5EF] p-3"
								>
									{/* Ticket summary row */}
									<div className="flex flex-wrap items-center gap-2 text-xs">
										<span className="font-bold text-[#3A2A20]">{t.issueNumber}</span>
										<span className="flex-1 truncate text-[#6D5A48]">{t.location ?? '—'}</span>
										<span className={`font-semibold ${priorityClass(t.priority)}`}>{t.priority}</span>
										<span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusTone(t.status)}`}>
											{t.status}
										</span>
									</div>

									{/* Direct-status buttons — any status can be set from any state */}
									<div className="mt-2 flex flex-wrap items-center gap-1.5">
										<span className="text-[10px] text-[#9D8A78]">Set status:</span>
										{ALL_STATUSES.map((s) => (
											<button
												key={s}
												type="button"
												disabled={t.status === s}
												onClick={() => setTicketStatus(t.id, s)}
												className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold transition ${
													t.status === s
														? 'border-[#C9A78A] bg-[#EFE4D6] text-[#6B4C33] cursor-default opacity-70'
														: 'border-[#DCCFC1] bg-white text-[#6D5A48] hover:border-[#C9A78A] hover:bg-[#F5EDE3]'
												}`}
											>
												{s}
											</button>
										))}
										<button
											type="button"
											onClick={() => assignTicketToUnit(t.id)}
											className="ml-auto rounded-full border border-[#DCCFC1] bg-white px-2 py-0.5 text-[10px] text-[#6D5A48] hover:border-[#C9A78A]"
										>
											Assign Unit
										</button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</section>
	);
};

export default OrganizationAdminIssuesPage;