const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export async function getCourses({ search = "", page = 1, limit = 20, signal } = {}) {
  const query = new URLSearchParams();

  if (search.trim()) {
    query.set("search", search.trim());
  }
  query.set("page", String(page));
  query.set("limit", String(limit));

  const queryString = query.toString();
  const response = await fetch(
    `${API_BASE_URL}/courses${queryString ? `?${queryString}` : ""}`,
    { signal },
  );

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? "Could not load courses.");
  }

  const body = await response.json();
  if (
    !Array.isArray(body.courses) ||
    !Number.isInteger(body.page) ||
    !Number.isInteger(body.limit) ||
    !Number.isInteger(body.total)
  ) {
    throw new Error("The course catalogue returned an invalid response.");
  }

  return body;
}
