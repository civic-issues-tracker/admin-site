import { useMemo, useState } from 'react';
import { Bell, MoreHorizontal, Search, TriangleAlert, X } from 'lucide-react';
import { useNotifications, type NotificationItem } from '../../../hooks/useNotifications';

const getNotificationLevel = (type: string) => {
	if (['escalation', 'reopen', 'pending_review'].includes(type)) return 'critical';
	if (['assignment', 'release', 'status_change'].includes(type)) return 'warning';
	return 'info';
};

const formatTimestamp = (value: string) => {
	try {
		return new Date(value).toLocaleString();
	} catch {
		return value;
	}
};


const OrganizationAdminAlertsPage = () => {
	const { notifications, isLoading, error, markRead, markAllRead } = useNotifications();
	const [searchQuery, setSearchQuery] = useState('');
	const [levelFilter, setLevelFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
	const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
	const showResetFilter = levelFilter !== 'all';

	const filteredNotifications = useMemo(() => {
		const q = searchQuery.trim().toLowerCase();
		return notifications.filter((item) => {
			const level = getNotificationLevel(item.notification_type);
			if (levelFilter !== 'all' && level !== levelFilter) return false;
			if (!q) return true;
			return (
				item.id.toLowerCase().includes(q) ||
				item.title.toLowerCase().includes(q) ||
				item.message.toLowerCase().includes(q) ||
				(item.issue_number ?? '').toLowerCase().includes(q)
			);
		});
	}, [levelFilter, notifications, searchQuery]);

	const getBadgeClass = (level: string) => {
		if (level === 'critical') return 'bg-[#FFE7E8] text-[#B62935]';
		if (level === 'warning') return 'bg-[#FFF3DE] text-[#A16F12]';
		return 'bg-[#E5F4FF] text-[#22668F]';
	};

	const listContent = (() => {
		if (isLoading) {
			return (
				<div className="rounded-xl border border-dashed border-[#DDD0C2] bg-white p-4 text-sm text-[#7D6958]">
					Loading notifications...
				</div>
			);
		}
		if (error) {
			return (
				<div className="rounded-xl border border-dashed border-[#DDD0C2] bg-white p-4 text-sm text-[#7D6958]">
					{error}
				</div>
			);
		}
		return filteredNotifications.map((item) => {
			const level = getNotificationLevel(item.notification_type);
			const badgeClass = getBadgeClass(level);
			return (
				<button
					key={item.id}
					type="button"
					onClick={() => {
						setSelectedNotification(item);
						if (!item.is_read) {
							markRead([item.id]);
						}
					}}
					className={`w-full rounded-xl border bg-white p-3 text-left transition hover:border-[#C9A78A] hover:shadow-[0_8px_20px_rgba(106,72,52,0.08)] ${item.is_read ? 'border-[#DDD0C2]' : 'border-[#C9A78A]'}`}
				>
					<div className="flex items-start justify-between gap-3">
						<div className="flex items-start gap-2">
							<span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#F1E6DA] text-[#6A4834]">
								{level === 'critical' ? <TriangleAlert size={14} /> : <Bell size={14} />}
							</span>
							<div>
								<p className="text-[11px] font-bold uppercase tracking-wider text-[#8B7868]">{item.issue_number ?? item.id}</p>
								<h3 className="mt-1 text-sm font-bold text-[#3E2B1F]">{item.title}</h3>
								<p className="mt-1 text-sm text-[#6D5948]">{item.message}</p>
							</div>
						</div>
						<div className="text-right">
							<p className="text-xs text-[#8A7767]">{formatTimestamp(item.created_at)}</p>
							<span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${badgeClass}`}>
								{level}
							</span>
						</div>
					</div>
				</button>
			);
		});
	})();

	return (
		<section>
			<header className="mb-3 flex items-start justify-between">
				<div>
					<h2 className="text-[36px] font-black leading-tight text-[#3E2B1F]">Notifications</h2>
					<p className="text-sm text-[#857060]">Live operational alerts, escalations, and response reminders.</p>
				</div>
				<div className="flex items-center gap-2">
					<div className="flex items-center rounded-full border border-[#DDCFC0] bg-[#F8F6F2] px-3 py-1.5">
						<Search size={14} className="mr-1 text-[#9D8A78]" />
						<input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search notifications..." className="w-56 bg-transparent text-xs outline-none" />
					</div>
					{searchQuery ? (
						<button onClick={() => setSearchQuery('')} className="rounded-full border border-[#DDCFC0] bg-white px-3 py-1.5 text-xs font-semibold text-[#6A4834]" aria-label="Clear notification search">
							Clear
						</button>
					) : null}
					<button onClick={markAllRead} className="rounded-full border border-[#DDCFC0] bg-white px-3 py-1.5 text-xs font-semibold text-[#6A4834]" aria-label="Mark all notifications as read">
						Mark all read
					</button>
					<button type="button" className="rounded-full border border-[#DDCFC0] bg-[#F8F6F2] p-2 text-[#8B7B69]" title="More options" aria-label="More options">
						<MoreHorizontal size={14} />
					</button>
				</div>
			</header>

			<div className="min-h-[81vh] rounded-2xl border border-[#D8CCBD] bg-[#F6F2EC] p-4">
				<div className="mb-3 flex flex-wrap items-center gap-2">
					<button onClick={() => setLevelFilter('all')} className={`rounded-full px-3 py-1 text-xs font-semibold ${levelFilter === 'all' ? 'bg-[#6A4834] text-white' : 'border border-[#D8CCBD] bg-white text-[#6E5A49]'}`}>All</button>
					<button onClick={() => setLevelFilter('critical')} className={`rounded-full px-3 py-1 text-xs font-semibold ${levelFilter === 'critical' ? 'bg-[#6A4834] text-white' : 'border border-[#D8CCBD] bg-white text-[#6E5A49]'}`}>Critical</button>
					<button onClick={() => setLevelFilter('warning')} className={`rounded-full px-3 py-1 text-xs font-semibold ${levelFilter === 'warning' ? 'bg-[#6A4834] text-white' : 'border border-[#D8CCBD] bg-white text-[#6E5A49]'}`}>Warnings</button>
					<button onClick={() => setLevelFilter('info')} className={`rounded-full px-3 py-1 text-xs font-semibold ${levelFilter === 'info' ? 'bg-[#6A4834] text-white' : 'border border-[#D8CCBD] bg-white text-[#6E5A49]'}`}>Informational</button>
					{showResetFilter ? (
						<button onClick={() => setLevelFilter('all')} className="rounded-full border border-dashed border-[#D8CCBD] bg-white px-3 py-1 text-xs text-[#6E5A49]">Reset filter</button>
					) : null}
				</div>

				<div className="space-y-2">
					{listContent}
					{!isLoading && !error && filteredNotifications.length === 0 ? (
						<div className="rounded-xl border border-dashed border-[#DDD0C2] bg-white p-4 text-sm text-[#7D6958]">
							No notifications match your search or filter.
						</div>
					) : null}
				</div>
			</div>

			{selectedNotification ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
					<div className="w-full max-w-xl rounded-3xl border border-[#E5D7C6] bg-[#FCF8F2] p-5 shadow-2xl">
						<div className="flex items-start justify-between gap-4 border-b border-[#E8DCCD] pb-3">
							<div>
								<p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#8E7A69]">Notification Details</p>
								<h3 className="mt-1 text-2xl font-black text-[#3E2B1F]">{selectedNotification.issue_number ?? selectedNotification.id}</h3>
							</div>
							<button onClick={() => setSelectedNotification(null)} className="rounded-full border border-[#D8CCBD] bg-white p-2 text-[#7D6A59]" aria-label="Close notification details">
								<X size={16} />
							</button>
						</div>
						<div className="mt-4 rounded-2xl border border-[#E6D8C8] bg-white p-4">
							<p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8B7868]">{selectedNotification.notification_type.replace('_', ' ')}</p>
							<p className="mt-2 text-lg font-bold text-[#3A2A1E]">{selectedNotification.title}</p>
							<p className="mt-1 text-sm text-[#6B5646]">{selectedNotification.message}</p>
							<p className="mt-3 text-xs text-[#8A7767]">{formatTimestamp(selectedNotification.created_at)}</p>
						</div>
					</div>
				</div>
			) : null}
		</section>
	);
};

export default OrganizationAdminAlertsPage;