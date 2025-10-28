// Simple REST API client to replace tRPC functionality
// Uses fetch with proper error handling and authentication

class ApiError extends Error {
  public data?: any;
  constructor(public status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.data = data;
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
    throw new ApiError(response.status, errorData.error || 'Request failed', errorData);
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
  list: () => apiRequest<any[]>('/tests'),
  getById: (id: string) => apiRequest<{ id: string; job_id: string; questions: string; complexity: 'low' | 'medium' | 'high'; short_code: string; created_at: string }>(`/tests/${id}`),
  getByShortCode: (shortCode: string) => apiRequest(`/tests/short-code/${shortCode}`),
  delete: (id: string) =>
    apiRequest(`/tests/${id}`, {
      method: 'DELETE',
    }),
  generate: (data: { jobId: string; complexity: 'low' | 'medium' | 'high' }) =>
    apiRequest('/ai/generate-test', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Candidates API
export const candidatesApi = {
  list: () => apiRequest<any[]>('/candidates'),
  getById: (id: string) => apiRequest<{ id: string; test_id: string; name: string; email: string; questions: string; status: string; answers: string | null; score: number | null; total_questions: number | null; lockout_reason: string | null; reappearance_approved_at: string | null; created_at: string; started_at: string | null; completed_at: string | null }>(`/candidates/${id}`),
  getPublic: (id: string) => apiRequest<{ id: string; test_id: string; name: string; email: string; questions: string; status: string; answers: string | null; score: number | null; total_questions: number | null; lockout_reason: string | null; reappearance_approved_at: string | null; created_at: string; started_at: string | null; completed_at: string | null }>(`/candidates/public/${id}`),
  delete: (id: string) =>
    apiRequest(`/candidates/${id}`, {
      method: 'DELETE',
    }),
  checkStatus: (data: { testId: string; email: string }) =>
    apiRequest<{ exists: boolean; candidate?: { id: string; status: string; lockout_reason?: string; reappearance_approved_at?: string | null } }>('/candidates/check-status', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  start: (data: { testId: string; name: string; email: string }) =>
    apiRequest<{ candidateId: string }>('/candidates/start', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  submit: (data: { candidateId: string; answers: number[] }) =>
    apiRequest<{ success: boolean; score: number; total: number; percentage: number; passed: boolean }>('/candidates/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  lockout: (data: { candidateId: string; reason: string; answers?: number[] }) =>
    apiRequest<{ success: boolean }>('/candidates/lockout', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  requestReappearance: (data: { candidateId: string }) =>
    apiRequest<{ success: boolean }>('/candidates/request-reappearance', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  approveReappearance: (data: { candidateId: string }) =>
    apiRequest<{ success: boolean }>('/candidates/approve-reappearance', {
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
