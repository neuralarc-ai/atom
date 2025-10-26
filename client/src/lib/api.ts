// Simple REST API client to replace tRPC functionality
// Uses fetch with proper error handling and authentication

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `/api${endpoint}`;
  
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new ApiError(response.status, errorData.error || 'Request failed');
  }

  return response.json();
}

// Auth API
export const authApi = {
  me: () => apiRequest('/auth/me'),
};

// Jobs API
export const jobsApi = {
  list: () => apiRequest('/jobs'),
  getById: (id: string) => apiRequest(`/jobs/${id}`),
  create: (data: { title: string; description: string; experience: string; skills: string[] }) =>
    apiRequest('/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<{ title: string; description: string; experience: string; skills: string[] }>) =>
    apiRequest(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest(`/jobs/${id}`, {
      method: 'DELETE',
    }),
};

// Tests API
export const testsApi = {
  list: () => apiRequest('/tests'),
  getById: (id: string) => apiRequest(`/tests/${id}`),
  getByShortCode: (shortCode: string) => apiRequest(`/tests/short-code/${shortCode}`),
  delete: (id: string) =>
    apiRequest(`/tests/${id}`, {
      method: 'DELETE',
    }),
};

// Candidates API
export const candidatesApi = {
  list: () => apiRequest('/candidates'),
  getById: (id: string) => apiRequest(`/candidates/${id}`),
  delete: (id: string) =>
    apiRequest(`/candidates/${id}`, {
      method: 'DELETE',
    }),
  start: (data: { testId: string; name: string; email: string }) =>
    apiRequest('/candidates/start', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  submit: (data: { candidateId: string; answers: number[] }) =>
    apiRequest('/candidates/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  lockout: (data: { candidateId: string; reason: string; answers?: number[] }) =>
    apiRequest('/candidates/lockout', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  requestReappearance: (data: { candidateId: string }) =>
    apiRequest('/candidates/request-reappearance', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  approveReappearance: (data: { candidateId: string }) =>
    apiRequest('/candidates/approve-reappearance', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// AI API
export const aiApi = {
  generateJobDetails: (data: { title: string }) =>
    apiRequest('/ai/generate-job-details', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  generateTest: (data: { jobId: string; complexity: 'low' | 'medium' | 'high' }) =>
    apiRequest('/ai/generate-test', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Export all APIs
export const api = {
  auth: authApi,
  jobs: jobsApi,
  tests: testsApi,
  candidates: candidatesApi,
  ai: aiApi,
};

export { ApiError };
