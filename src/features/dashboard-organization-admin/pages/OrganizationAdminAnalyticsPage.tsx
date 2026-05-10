import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useOrganizationAdminIssues } from '../hooks/useOrganizationAdminIssues';

const OrganizationAdminAnalyticsPage = () => {
	const { user } = useAuth();
	const seed = user?.email ?? user?.id ?? user?.full_name;
	const { tickets, resolvedTickets, isLoading } = useOrganizationAdminIssues(seed);
	const [activeReportId, setActiveReportId] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [reportFilter, setReportFilter] = useState('');
	const [showFilterInput, setShowFilterInput] = useState(false);

	const kpis = useMemo(() => {
		const highPriority = tickets.filter(t => t.priority === 'High').length;
		
		let totalResolveTimeMs = 0;
		let ticketsWithTime = 0;
		resolvedTickets.forEach(t => {
			if (t.createdAt && t.resolutionDate) {
				const start = new Date(t.createdAt).getTime();
				const end = new Date(t.resolutionDate).getTime();
				if (end > start) {
					totalResolveTimeMs += (end - start);
					ticketsWithTime++;
				}
			}
		});
		const avgTimeDays = ticketsWithTime > 0 
			? (totalResolveTimeMs / ticketsWithTime / (1000 * 60 * 60 * 24)).toFixed(1) + 'd'
			: 'N/A';

		return [
			{ label: 'Total Resolved', value: resolvedTickets.length.toString() },
			{ label: 'Avg Resolve Time', value: avgTimeDays },
			{ label: 'Active Issues', value: tickets.length.toString() },
			{ label: 'High Priority (Active)', value: highPriority.toString() },
		];
	}, [tickets, resolvedTickets]);
	const filteredReports = useMemo(() => {
		const q = `${searchQuery} ${reportFilter}`.trim().toLowerCase();
		if (!q) return resolvedTickets;
		return resolvedTickets.filter((ticket) => {
			return (
				ticket.issueNumber.toLowerCase().includes(q) ||
				ticket.title.toLowerCase().includes(q) ||
				ticket.location.toLowerCase().includes(q) ||
				(ticket.category ?? '').toLowerCase().includes(q) ||
				(ticket.resolutionDate ?? '').toLowerCase().includes(q)
			);
		});
	}, [reportFilter, searchQuery, resolvedTickets]);
	const activeReport = activeReportId
		? filteredReports.find((ticket) => ticket.id === activeReportId) ?? resolvedTickets.find((ticket) => ticket.id === activeReportId) ?? null
		: null;

	if (isLoading && resolvedTickets.length === 0) {
		return (
			<section>
				<div className="rounded-2xl border border-[#D8CCBD] bg-[#F6F2EC] p-4 text-sm text-[#857060]">
					Loading resolved issues...
				</div>
			</section>
		);
	}

	return (
		<section>
			<header className="mb-3 flex items-start justify-between">
				<div>
					<h2 className="text-[30px] font-black leading-tight text-[#3E2B1F]">Resolved Tickets</h2>
					<p className="text-sm text-[#857060]">Archive of previously resolved and closed issues.</p>
				</div>
				<div className="flex items-center gap-2">
					<div className="flex items-center rounded-full border border-[#DDCFC0] bg-[#F8F6F2] px-3 py-1.5">
						<Search size={14} className="mr-1 text-[#9D8A78]" />
						<input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search resolved tickets..." className="w-56 bg-transparent text-xs outline-none" />
					</div>
					<button type="button" onClick={() => setSearchQuery('')} className="rounded-full border border-[#DDCFC0] bg-[#F8F6F2] p-2 text-[#8B7B69]" aria-label="Clear search">
						<X size={14} />
					</button>
				</div>
			</header>

			<div className="min-h-[81vh] rounded-2xl border border-[#D8CCBD] bg-[#F6F2EC] p-4">
				<div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-4">
					{kpis.map((kpi) => (
						<div key={kpi.label} className="rounded-xl border border-[#DDD0C2] bg-white p-3">
							<p className="text-[10px] uppercase tracking-widest text-[#8D7968]">{kpi.label}</p>
							<p className="mt-1 text-2xl font-black text-[#3E2B1F]">{kpi.value}</p>
						</div>
					))}
				</div>

				<div className="mb-3 flex items-center justify-between">
					<div>
						<h3 className="text-xl font-bold text-[#3C2A1D]">Archived & Resolved</h3>
						<p className="text-sm text-[#8B7868]">Review past issues and view their resolution reports for {user?.full_name || 'the current organization admin'}.</p>
					</div>
					<div className="flex gap-2 text-xs">
							<div className="relative">
								<button onClick={() => setShowFilterInput((s) => !s)} className="rounded-full border border-[#D8CCBD] bg-white px-3 py-1">Filter</button>
								{showFilterInput ? (
									<div className="absolute right-0 mt-2 w-56 rounded-md border bg-white p-2">
										<input value={reportFilter} onChange={(e) => setReportFilter(e.target.value)} placeholder="Filter by resolution text (e.g., Oct)" className="w-full border p-1 text-sm" />
										<div className="mt-2 flex justify-end gap-2">
											<button onClick={() => setReportFilter('')} className="rounded-full border px-2 py-1 text-xs">Clear</button>
											<button onClick={() => setShowFilterInput(false)} className="rounded-full bg-[#6A4834] px-2 py-1 text-xs text-white">Done</button>
										</div>
									</div>
								) : null}
							</div>
							<button onClick={() => {
										const rows = filteredReports;
										const header = ['issueNumber','title','location','category','resolutionDate'];
										const csv = [header.join(',')].concat(rows.map(r => [r.issueNumber, `"${(r.title ?? '').replaceAll('"', '""')}"`, `"${(r.location ?? '').replaceAll('"', '""')}"`, `"${(r.category ?? '')}"`, `"${(r.resolutionDate ?? '')}"`].join(','))).join('\n');
								const blob = new Blob([csv], { type: 'text/csv' });
								const url = URL.createObjectURL(blob);
								const a = document.createElement('a');
								a.href = url;
								a.download = 'organization_admin_resolved_tickets.csv';
								a.click();
								URL.revokeObjectURL(url);
							}} className="rounded-full bg-[#6A4834] px-3 py-1 text-white">Export Report</button>
						</div>
				</div>

				<div className="overflow-hidden rounded-xl border border-[#DDD0C2] bg-white">
					<table className="w-full text-left text-sm">
						<thead className="bg-[#F4EEE6] text-xs uppercase tracking-wide text-[#7D6A59]">
							<tr>
								<th className="px-4 py-3">Ticket ID</th>
								<th className="px-4 py-3">Issue Description</th>
								<th className="px-4 py-3">Category</th>
								<th className="px-4 py-3">Resolution Date</th>
								<th className="px-4 py-3">Action</th>
							</tr>
						</thead>
						<tbody>
							{filteredReports.map((ticket) => (
								<tr key={ticket.id} className="border-t border-[#EFE4D8] text-[#3B2A1E]">
									<td className="px-4 py-3 font-bold">{ticket.issueNumber}</td>
									<td className="px-4 py-3 font-semibold">{ticket.title}</td>
									<td className="px-4 py-3">
										<span className="rounded-full bg-[#EEE6DB] px-2 py-1 text-xs">{ticket.category}</span>
									</td>
									<td className="px-4 py-3 text-[#7D6958]">{ticket.resolutionDate}</td>
									<td className="px-4 py-3">
										<button
											onClick={() => setActiveReportId(ticket.id)}
											className="rounded-full border border-[#DCCFC1] px-3 py-1 text-xs font-semibold"
										>
											View Report
										</button>
									</td>
								</tr>
							))}
							{filteredReports.length === 0 ? (
								<tr>
									<td className="px-4 py-6 text-sm text-[#7D6958]" colSpan={5}>No resolved tickets match your search or filter.</td>
								</tr>
							) : null}
						</tbody>
					</table>
				</div>

				<div className="mt-3 rounded-xl border border-[#DDD0C2] bg-white p-3">
					<h4 className="mb-2 text-sm font-bold text-[#3E2B1F]">Resolution Trend Notes</h4>
					<p className="text-sm text-[#6B5646]">
						Roads & Infrastructure and Lighting categories are trending faster than last month. Three tickets were escalated due to delayed third-party dependencies.
					</p>
				</div>

				{activeReport ? (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
						<div className="w-full max-w-2xl rounded-3xl border border-[#E5D7C6] bg-[#FCF8F2] p-5 shadow-2xl">
							<div className="flex items-start justify-between gap-4 border-b border-[#E8DCCD] pb-3">
								<div>
									<p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#8E7A69]">Resolution Report</p>
									<h3 className="mt-1 text-2xl font-black text-[#3E2B1F]">{activeReport.issueNumber}</h3>
								</div>
								<button onClick={() => setActiveReportId('')} className="rounded-full border border-[#D8CCBD] bg-white p-2 text-[#7D6A59]" aria-label="Close report">
									<X size={16} />
								</button>
							</div>
							<div className="mt-4 grid gap-3 md:grid-cols-2">
								<div className="rounded-2xl border border-[#E6D8C8] bg-white p-4">
									<p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8B7868]">Issue</p>
									<p className="mt-2 text-lg font-bold text-[#3A2A1E]">{activeReport.title}</p>
									<p className="mt-1 text-sm text-[#6B5646]">{activeReport.location}</p>
								</div>
								<div className="rounded-2xl border border-[#E6D8C8] bg-white p-4">
									<p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8B7868]">Resolution</p>
									<p className="mt-2 text-lg font-bold text-[#3A2A1E]">{activeReport.resolutionDate}</p>
									<p className="mt-1 text-sm text-[#6B5646]">Category: {activeReport.category}</p>
								</div>
								<div className="rounded-2xl border border-[#E6D8C8] bg-white p-4 md:col-span-2">
									<p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8B7868]">Organization Admin Notes</p>
									<p className="mt-2 text-sm text-[#5E4A3A]">
										This report view is currently driven by organization-admin dashboard data. When backend reports are available, this panel should open the resolved issue record with photos, timeline, crew assignments, and public feedback.
									</p>
								</div>
							</div>
						</div>
					</div>
				) : null}
			</div>
		</section>
	);
};

export default OrganizationAdminAnalyticsPage;