
const API_URL = "http://localhost:3000";

export async function saveLearningPreferences(preferences) {
  const response = await fetch(`${API_URL}/api/preferences`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(preferences),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to save learning preferences");
  }

  return data;
}
