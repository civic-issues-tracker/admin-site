import { useEffect, useMemo, useState } from 'react';
import { Phone, Search, Send } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { getOrganizationAdminWorkspace, addMessageToThread } from '../organizationAdminWorkspace';

const getThreadSourceLabel = (threadId: string) => {
	if (threadId === 'dispatch') return 'Dispatch / Admin';
	if (threadId === 'city-alerts') return 'City Hall Alerts';
	return 'Reporter follow-up';
};

const OrganizationAdminNotificationsPage = () => {
	const { user, showToast } = useAuth();
	const seed = user?.email ?? user?.id ?? user?.full_name;
	const workspace = useMemo(() => getOrganizationAdminWorkspace(seed), [seed]);
	const [activeThreadId, setActiveThreadId] = useState(workspace.chatThreads[0]?.id ?? '');
	const [threadSearch, setThreadSearch] = useState('');
	const [messageText, setMessageText] = useState('');
	const [localMessages, setLocalMessages] = useState<Record<string, { id: string; from: 'dispatch' | 'organization_admin'; text: string; at: string }[]>>({});
	const [selectedThreadOnly, setSelectedThreadOnly] = useState(false);
	const [threadTypeFilter, setThreadTypeFilter] = useState<'all' | 'dispatch' | 'city-alerts' | 'reporter'>('all');
	const [isFilterOpen, setIsFilterOpen] = useState(false);

	const filteredThreads = useMemo(() => {
		const q = threadSearch.trim().toLowerCase();
		return workspace.chatThreads.filter((thread) => {
			if (threadTypeFilter !== 'all' && thread.id !== threadTypeFilter) return false;
			if (!q) return true;
			return (
				thread.name.toLowerCase().includes(q) ||
				(thread.preview ?? '').toLowerCase().includes(q) ||
				thread.messages.some((message) => message.text.toLowerCase().includes(q))
			);
		});
	}, [threadSearch, threadTypeFilter, workspace.chatThreads]);

	useEffect(() => {
		if (!filteredThreads.some((thread) => thread.id === activeThreadId)) {
			setActiveThreadId(filteredThreads[0]?.id ?? workspace.chatThreads[0]?.id ?? '');
		}
	}, [activeThreadId, filteredThreads, workspace.chatThreads]);

	const activeThread = useMemo(() => {
		const found = filteredThreads.find((thread) => thread.id === activeThreadId) ?? filteredThreads[0] ?? workspace.chatThreads[0];
		return found;
	}, [activeThreadId, filteredThreads, workspace.chatThreads]);

	const messages = localMessages[activeThread.id] ?? activeThread.messages;
	const visibleThreads = selectedThreadOnly ? filteredThreads.filter((thread) => thread.id === activeThread.id) : filteredThreads;

	const sendMessage = () => {
		if (!messageText.trim()) return;
		const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
		const msg = { id: `local-${Date.now()}`, from: 'organization_admin' as const, text: messageText.trim(), at: time };
		const thread = addMessageToThread(seed, activeThread.id, msg);
		if (thread) {
			setLocalMessages((prev) => ({ ...prev, [activeThread.id]: thread.messages }));
			setMessageText('');
			showToast('Message saved to local thread.', 'success');
		} else {
			showToast('Failed to save message locally.', 'error');
		}
	};

	return (
		<section>
			<header className="mb-3 flex items-start justify-between">
				<div>
					<h2 className="text-[42px] font-black leading-tight text-[#3E2B1F]">Message Center</h2>
					<p className="text-sm text-[#857060]">Communicate with citizens and dispatch centers.</p>
					<p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#B08E6A]">
						Seeded for {user?.full_name || workspace.displayName} • {workspace.departmentLabel}
					</p>
				</div>
				<div className="flex items-center gap-2">
					<div className="flex items-center rounded-full border border-[#DDCFC0] bg-[#F8F6F2] px-3 py-1.5">
						<Search size={14} className="mr-1 text-[#9D8A78]" />
						<input value={threadSearch} onChange={(e) => setThreadSearch(e.target.value)} placeholder="Search conversations, dispatch, or message text..." className="w-64 bg-transparent text-xs outline-none" />
					</div>
					{threadSearch ? (
						<button onClick={() => setThreadSearch('')} className="rounded-full border border-[#DDCFC0] bg-white px-3 py-1.5 text-xs font-semibold text-[#6A4834]" aria-label="Clear conversation search">
							Clear
						</button>
					) : null}
					<button onClick={() => setIsFilterOpen((s) => !s)} className="rounded-full border border-[#DDCFC0] bg-[#F8F6F2] px-3 py-1.5 text-xs font-semibold text-[#6A4834]" aria-label="Open notification filters">
						Filters
					</button>
					<button onClick={() => setSelectedThreadOnly((s) => !s)} className="rounded-full border border-[#DDCFC0] bg-[#F8F6F2] px-3 py-1.5 text-xs font-semibold text-[#6A4834]" title="Toggle focused thread view" aria-label="Toggle focused thread view">
						{selectedThreadOnly ? 'Focused' : 'Focus active'}
					</button>
				</div>
			</header>

			{isFilterOpen ? (
				<div className="mb-3 flex flex-wrap items-center gap-2 rounded-2xl border border-[#E1D4C6] bg-white px-3 py-2 text-xs">
					<span className="font-semibold text-[#725E4D]">Filter by type:</span>
					{([
						{ label: 'All', value: 'all' },
						{ label: 'Dispatch', value: 'dispatch' },
						{ label: 'City Hall', value: 'city-alerts' },
						{ label: 'Reporter', value: 'reporter' },
					] as const).map((option) => (
						<button
							key={option.value}
							onClick={() => {
								setThreadTypeFilter(option.value);
								setIsFilterOpen(false);
							}}
							className={`rounded-full border px-3 py-1 font-semibold ${
								threadTypeFilter === option.value ? 'border-[#6A4834] bg-[#6A4834] text-white' : 'border-[#DDCFC0] bg-white text-[#6A4834]'
							}`}
						>
							{option.label}
						</button>
					))}
					{threadTypeFilter !== 'all' ? (
						<button onClick={() => setThreadTypeFilter('all')} className="rounded-full border border-dashed border-[#DDCFC0] bg-[#FCFAF7] px-3 py-1 font-semibold text-[#6A4834]">
							Reset filter
						</button>
					) : null}
				</div>
			) : null}

			<div className="grid min-h-[81vh] grid-cols-1 gap-3 rounded-2xl border border-[#D8CCBD] bg-[#F6F2EC] p-3 xl:grid-cols-12">
				<aside className="rounded-xl border border-[#DDD0C2] bg-[#F8F4EE] p-3 xl:col-span-4">
					<div className="mb-2 flex items-center justify-between">
						<h3 className="text-lg font-bold text-[#3D2A1E]">Conversations</h3>
						<span className="rounded-full bg-[#ECE2D6] px-2 py-0.5 text-[11px] font-semibold text-[#725E4D]">{visibleThreads.length} shown</span>
					</div>
					<div className="mb-2 rounded-full border border-[#E1D4C6] bg-white px-3 py-1.5 text-xs text-[#907D6D]">
						<input value={threadSearch} onChange={(e) => setThreadSearch(e.target.value)} placeholder="Search conversations..." className="w-full bg-transparent text-xs outline-none" />
					</div>
					<div className="space-y-1">
						{visibleThreads.map((thread) => (
							<button
								key={thread.id}
								onClick={() => setActiveThreadId(thread.id)}
								className={`w-full rounded-lg border p-2 text-left ${
									activeThreadId === thread.id ? 'border-[#BAA592] bg-white' : 'border-transparent hover:bg-white/80'
								}`}
							>
								<div className="mb-1 flex items-center justify-between text-xs">
									<span className="font-semibold text-[#3A2B20]">{thread.name}</span>
									<span className="text-[#8B7868]">{thread.time}</span>
								</div>
								<div className="flex items-center justify-between">
									<p className="text-xs text-[#786453]">{thread.preview}</p>
									{thread.unread > 0 ? (
										<span className="ml-2 rounded-full bg-[#6A4834] px-2 py-0.5 text-[10px] text-white">{thread.unread}</span>
									) : null}
								</div>
							</button>
						))}
						{visibleThreads.length === 0 ? (
							<div className="rounded-lg border border-dashed border-[#D8CABB] bg-white/70 p-3 text-xs text-[#8A7767]">
								No conversations match your search or filter. Try a different type, name, preview text, or message body.
							</div>
						) : null}
					</div>
				</aside>

				<div className="rounded-xl border border-[#DDD0C2] bg-white xl:col-span-8">
					<div className="flex items-center justify-between border-b border-[#E9DCD0] p-3">
						<div className="flex items-center gap-2">
							<span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#5E4331] text-sm font-bold text-white">D</span>
							<div>
								<h4 className="font-semibold text-[#3A2A1E]">{activeThread.name}</h4>
								<p className="text-[11px] text-[#2F9F55]">{activeThread.online ? 'ONLINE' : 'ACTIVE'}</p>
								<p className="text-[10px] uppercase tracking-[0.24em] text-[#8C7867]">Source: {getThreadSourceLabel(activeThread.id)}</p>
							</div>
						</div>
						<div className="flex items-center gap-3 text-[#8D7A69]">
							<button type="button" onClick={() => showToast(`Calling ${activeThread.name}...`, 'success')} className="rounded-full p-1 hover:bg-[#F4EEE6]" aria-label="Call conversation">
								<Phone size={15} />
							</button>
							<button type="button" onClick={() => showToast(`Conversation actions opened for ${activeThread.name}.`, 'success')} className="rounded-full px-2 py-1 hover:bg-[#F4EEE6]" aria-label="Conversation actions menu">
								⋮
							</button>
						</div>
					</div>

					<div className="space-y-3 p-4 text-sm">
						<div className="mx-auto w-fit rounded-full bg-[#ECE2D6] px-3 py-1 text-xs text-[#725E4D]">Today</div>

						{messages.map((message) => (
							<div key={message.id} className={message.from === 'organization_admin' ? 'ml-auto max-w-[70%]' : 'max-w-[70%]'}>
								<div
									className={
										message.from === 'organization_admin'
											? 'rounded-2xl bg-[#6A4834] p-3 text-[#FFF6EC]'
											: 'rounded-2xl border border-[#E8DBCF] bg-[#F8F2EA] p-3 text-[#4B3A2D]'
									}
								>
									{message.text}
								</div>
								<p className={`mt-1 text-xs text-[#978473] ${message.from === 'organization_admin' ? 'text-right' : ''}`}>{message.at}</p>
							</div>
						))}
					</div>

					<div className="mt-6 flex items-center gap-2 border-t border-[#E9DCD0] p-3">
						<input
							placeholder="Type a message to Dispatch..."
							value={messageText}
							onChange={(e) => setMessageText(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') sendMessage();
							}}
							className="flex-1 rounded-full border border-[#E1D4C6] bg-[#F7F2EB] px-4 py-2 text-sm outline-none"
						/>
						<button
							className="rounded-full bg-[#6A4834] p-2 text-white disabled:opacity-40"
							onClick={sendMessage}
							disabled={!messageText.trim()}
							title="Send message"
							aria-label="Send message"
						>
							<Send size={14} />
						</button>
					</div>
				</div>
			</div>
		</section>
	);
};

export default OrganizationAdminNotificationsPage;