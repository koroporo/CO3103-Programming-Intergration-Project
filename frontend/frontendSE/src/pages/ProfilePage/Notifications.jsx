import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/Authentication/useAuth";
import { forumRequest, notificationLink, notificationsChanged } from "../../services/discussionService";
import Header from "../../components/Homepage/Header";
import "./Notifications.css";

export default function Notifications() {
  const { user, isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = await forumRequest(`/notification/get?limit=20&offset=${offset}&unread=${unread}`, { signal: controller.signal });
        if (controller.signal.aborted) return;
        setNotifications(result.notifications);
        setUnreadCount(result.unread_count);
        setHasMore(result.pagination.has_more);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [user, unread, offset, revision]);

  async function markRead(notification) {
    setBusy(true);
    setError("");
    try {
      await forumRequest(notification ? `/notification/${notification.id}/read` : "/notification/read-all", { method: "PATCH" });
      notificationsChanged();
      const target = notification && notificationLink(notification);
      if (target) navigate(target);
      else { setOffset(0); setRevision((value) => value + 1); }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return <><Header /><div className="noti-page-wrapper"><div className="noti-container">
    <div className="noti-header-section">
      <div className="noti-header-left"><h1>Notifications</h1><p>Discussion replies and updates from your courses.</p></div>
      {user && <button className="mark-all-btn" onClick={() => markRead(null)} disabled={busy || !unreadCount}>Mark all as read</button>}
    </div>
    {isAuthLoading ? <p role="status">Loading your session…</p> : !user ? <p><Link to="/login-page">Log in</Link> to view your notifications.</p> : <>
      <div className="noti-filters">
        {[false, true].map((filter) => <button key={String(filter)}
          className={`filter-tab-btn ${unread === filter ? "active" : ""}`}
          onClick={() => { setUnread(filter); setOffset(0); }}>
          {filter ? `Unread (${unreadCount})` : "All"}
        </button>)}
        <button className="filter-tab-btn" disabled={loading} onClick={() => setRevision((value) => value + 1)}>Refresh</button>
      </div>
      {error && <p role="alert">{error}</p>}
      {loading ? <p role="status">Loading notifications…</p> : <div className="noti-list">
        {notifications.map((notification) => <button type="button" key={notification.id}
          className={`noti-card ${notification.read_at ? "read" : "unread"}`}
          disabled={busy} onClick={() => markRead(notification)}>
          <span className="noti-content">
            <strong>{notification.title}</strong>
            <span className="noti-text-desc">{notification.body}</span>
            <time className="noti-time" dateTime={notification.created_at}>{new Date(notification.created_at).toLocaleString()}</time>
          </span>
          {!notification.read_at && <span className="unread-indicator" aria-label="Unread" />}
        </button>)}
        {!error && notifications.length === 0 && <div className="empty-noti-state">No notifications here yet.</div>}
      </div>}
      <div className="noti-pagination">
        <button className="mark-all-btn" disabled={loading || offset === 0} onClick={() => setOffset((value) => Math.max(0, value - 20))}>Previous</button>
        <span>Page {offset / 20 + 1}</span>
        <button className="mark-all-btn" disabled={loading || !hasMore} onClick={() => setOffset((value) => value + 20)}>Next</button>
      </div>
    </>}
  </div></div></>;
}
