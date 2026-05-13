import { Suspense, lazy, useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useOrganizationAdminIssues } from '../hooks/useOrganizationAdminIssues';


const LazyMap = lazy(() => import('../components/OrganizationAdminMap'));

const boleCenter: [number, number] = [8.9907, 38.7991];

// ── helpers ────────────────────────────────────────────────────────────────
const hashToOffset = (input: string, magnitude = 0.025) => {
	let hash = 0;
	for (let i = 0; i < input.length; i += 1) {
		hash = (hash * 31 + input.charCodeAt(i)) % 100000;
	}
	const normalized = (hash % 1000) / 1000;
	const angle = normalized * Math.PI * 2;
	const radius = magnitude * (0.35 + (hash % 100) / 100);
	return {
		latOffset: Math.sin(angle) * radius,
		lngOffset: Math.cos(angle) * radius,
	};
};

// ── component ──────────────────────────────────────────────────────────────
const OrganizationAdminIssuesPage = () => {
	const { user, showToast } = useAuth();
	const seed = user?.email ?? user?.id ?? user?.full_name;
	const [searchQuery, setSearchQuery] = useState('');
	const { tickets, resolvedTickets, isLoading, error } = useOrganizationAdminIssues(seed);

	const allTickets = tickets.concat(resolvedTickets);
	const visibleTickets = allTickets.filter((t) => {
		const q = searchQuery.trim().toLowerCase();
		if (!q) return true;
		return (
			(t.issueNumber ?? '').toLowerCase().includes(q) ||
			(t.location ?? '').toLowerCase().includes(q) ||
			(t.title ?? '').toLowerCase().includes(q)
		);
	});

	// Use backend coordinates when present; otherwise derive stable offsets so every ticket appears on the map.
	const boleSites = visibleTickets.map((t) => {
		const hasCoords = typeof t.lat === 'number' && typeof t.lng === 'number';
		if (hasCoords) {
			return {
				ticket: t,
				name: t.location || 'Reported Location',
				lat: t.lat as number,
				lng: t.lng as number,
			};
		}
		const key = String(t.id ?? t.issueNumber ?? t.title ?? 'ticket');
		const { latOffset, lngOffset } = hashToOffset(key);
		return {
			ticket: t,
			name: t.location || 'Reported Location',
			lat: boleCenter[0] + latOffset,
			lng: boleCenter[1] + lngOffset,
		};
	});

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
						<li><span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#2563EB]" /> Submitted</li>
						<li><span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#F59E0B]" /> In Progress</li>
						<li><span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#16A34A]" /> Resolved</li>
						<li><span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#DC2626]" /> Rejected</li>
					</ul>
				</div>
			</div>
		</section>
	);
};

export default OrganizationAdminIssuesPage;
