const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

export async function forumRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (response.status === 204) return null;
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Unable to complete the request. Please try again.");
  return result;
}

export function discussionPath(lessonId, suffix = "") {
  return `/lessons/${encodeURIComponent(lessonId)}/discussions${suffix}`;
}

export function notificationLink(notification) {
  const thread = /^discussion:\d+:thread:(\d+)$/.exec(notification.dedupe_key);
  if (thread && notification.course_id && notification.lesson_id) {
    return `/courses/${notification.course_id}/${notification.lesson_id}?discussion=${thread[1]}#lesson-discussions`;
  }
  return notification.course_id ? `/courses/${notification.course_id}` : null;
}

export function notificationsChanged() {
  window.dispatchEvent(new Event("notifications-changed"));
}
