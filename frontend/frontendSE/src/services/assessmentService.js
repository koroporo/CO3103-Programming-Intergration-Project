const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function request(path, token, options = {}) {
  const response = await fetch(`${API_BASE_URL}/assessments${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  const body = await response.json()

  if (!response.ok) {
    throw new Error(body.message || 'The assessment request failed.')
  }

  return body.data
}

export function getAuthoringData(token) {
  return request('/authoring-data', token)
}

export function createAssessment(token, assessment) {
  return request('/', token, {
    method: 'POST',
    body: JSON.stringify(assessment),
  })
}

export function getAvailableAssessments(token) {
  return request('/', token)
}

export function startAttempt(token, assessmentId) {
  return request(`/${assessmentId}/attempts`, token, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export function saveAttemptAnswer(token, attemptId, answer) {
  return request(`/attempts/${attemptId}/answers`, token, {
    method: 'PUT',
    body: JSON.stringify({ answers: [answer] }),
  })
}

export function submitAttempt(token, attemptId, answers) {
  return request(`/attempts/${attemptId}/submit`, token, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  })
}

export function getAttemptResult(token, attemptId) {
  return request(`/attempts/${attemptId}/result`, token)
}

export function getAttemptHistory(token) {
  return request('/attempts/history', token)
}
