import { useCallback, useEffect, useState } from 'react';
import { privateApi } from '../features/auth/services/authService';

export interface NotificationItem {
	id: string;
	title: string;
	message: string;
	notification_type: string;
	is_read: boolean;
	created_at: string;
	issue?: string | null;
	issue_number?: string | null;
	metadata?: Record<string, unknown>;
}

interface UnreadCountResponse {
	unread_count: number;
}

export const useNotifications = () => {
	const [notifications, setNotifications] = useState<NotificationItem[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchUnreadCount = useCallback(async () => {
		const response = await privateApi.get<UnreadCountResponse>('/notifications/unread/count/');
		setUnreadCount(response.data.unread_count ?? 0);
	}, []);

	const fetchNotifications = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const response = await privateApi.get<NotificationItem[]>('/notifications/');
			setNotifications(response.data ?? []);
			await fetchUnreadCount();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load notifications.');
		} finally {
			setIsLoading(false);
		}
	}, [fetchUnreadCount]);

	const markRead = useCallback(async (notificationIds: string[]) => {
		if (notificationIds.length === 0) return;
		await privateApi.post('/notifications/mark-read/', { notification_ids: notificationIds });
		setNotifications((prev) =>
			prev.map((item) => (notificationIds.includes(item.id) ? { ...item, is_read: true } : item))
		);
		await fetchUnreadCount();
	}, [fetchUnreadCount]);

	const markAllRead = useCallback(async () => {
		await privateApi.post('/notifications/mark-read/', { read_all: true });
		setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
		await fetchUnreadCount();
	}, [fetchUnreadCount]);

	useEffect(() => {
		fetchNotifications();
	}, [fetchNotifications]);

	return {
		notifications,
		unreadCount,
		isLoading,
		error,
		refresh: fetchNotifications,
		markRead,
		markAllRead,
	};
};
