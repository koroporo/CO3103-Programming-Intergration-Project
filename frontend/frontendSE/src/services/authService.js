const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";
const AUTH_TOKEN_KEY = "token";
const USER_KEY = "user";

export function hasActiveSession() {
  return Boolean(localStorage.getItem(AUTH_TOKEN_KEY));
}

export async function logout() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  if (!token) {
    throw new Error("You are not signed in.");
  }

  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message ?? "Could not log out. Please try again.");
  }

  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("auth:logout"));
}
