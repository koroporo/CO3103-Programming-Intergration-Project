import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/Authentication/useAuth';
import { forumRequest } from '../../services/discussionService';
import SvgIcon from '../../components/Common/SvgIcon';
import './NotificationBell.css';

export default function NotificationBell() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    async function refresh() {
      try {
        const result = await forumRequest('/notification/get?limit=1', { signal: controller.signal });
        if (!controller.signal.aborted) setCount(result.unread_count);
      } catch {
        // Keep the navigation link usable if a background refresh fails.
      }
    }
    refresh();
    const timer = window.setInterval(refresh, 30000);
    window.addEventListener('notifications-changed', refresh);
    return () => {
      controller.abort();
      window.clearInterval(timer);
      window.removeEventListener('notifications-changed', refresh);
    };
  }, [user]);

  if (!user) return null;
  return (
    <Link to="/notifications" className="notification-bell-btn" aria-label={`Notifications, ${count} unread`}>
      <SvgIcon name="bell" size={20} />
      {count > 0 && <span className="notification-bell-count">{count > 99 ? '99+' : count}</span>}
    </Link>
  );
}
