
const API_URL = 'http://localhost:3000';

// Fetch all registered accounts
export async function getAllAccounts() {
  const response = await fetch(`${API_URL}/accounts`);

  if (!response.ok) {
    throw new Error('Failed to fetch accounts');
  }

  const result = await response.json();

  return result.accounts;
}

// Fetch all courses
export async function getAllCourses() {
  const response = await fetch(`${API_URL}/courses`);

  if (!response.ok) {
    throw new Error('Failed to fetch courses');
  }

  const result = await response.json();

  return result.courses;
}
