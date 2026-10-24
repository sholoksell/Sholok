// API base — /jobportal-api/ will be proxied by Nginx to the job portal backend when live.
// Falls back to local mock data when the backend is not yet available.
import { jobs as mockJobs, companies as mockCompanies, categories as mockCategories, locations as mockLocations } from '../data/mockData.js';

const API_BASE = '/jobportal-api';

const getHeaders = () => {
  const token = localStorage.getItem('sholok_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const request = async (url, options = {}) => {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: getHeaders(),
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

// ─── MOCK FALLBACK HELPERS ────────────────────────────────────────────────────

function mockGetApproved(params = '') {
  const p = new URLSearchParams(params);
  let result = [...mockJobs];
  const search = p.get('search');
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(j =>
      j.title.toLowerCase().includes(q) ||
      (j.titleEn || '').toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      (j.category || '').toLowerCase().includes(q)
    );
  }
  if (p.get('category')) result = result.filter(j => j.category === p.get('category'));
  if (p.get('location')) {
    const loc = p.get('location').toLowerCase();
    result = result.filter(j => j.location.toLowerCase().includes(loc));
  }
  if (p.get('jobType')) result = result.filter(j => j.type === p.get('jobType'));
  if (p.get('salaryMin')) result = result.filter(j => j.salaryMax >= Number(p.get('salaryMin')));
  if (p.get('salaryMax')) result = result.filter(j => j.salaryMin <= Number(p.get('salaryMax')));
  const sort = p.get('sort');
  if (sort === 'salary') result.sort((a, b) => b.salaryMax - a.salaryMax);
  else if (sort === 'featured') result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  return { jobs: result.map(j => ({ ...j, _id: String(j.id) })), total: result.length };
}

function mockGetJobById(id) {
  const job = mockJobs.find(j => String(j.id) === String(id));
  if (!job) throw new Error('Job not found');
  return { ...job, _id: String(job.id) };
}

function mockGetCompanyById(id) {
  const company = mockCompanies.find(c => String(c.id) === String(id));
  if (!company) throw new Error('Company not found');
  const jobs = mockJobs
    .filter(j => j.companyId === company.id)
    .map(j => ({ ...j, _id: String(j.id) }));
  return { company: { ...company, _id: String(company.id) }, jobs };
}

// ─── PUBLIC APIs ──────────────────────────────────────────────────────────────

export const jobsAPI = {
  getApproved: async (params = '') => {
    try { return await request(`/jobs?${params}`); }
    catch { return mockGetApproved(params); }
  },
  getById: async (id) => {
    try { return await request(`/jobs/${id}`); }
    catch { return mockGetJobById(id); }
  },
  create: (body) => request('/jobs', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/jobs/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => request(`/jobs/${id}`, { method: 'DELETE' }),
  getMyJobs: (params = '') => request(`/jobs/my-jobs?${params}`),
  getAll: (params = '') => request(`/jobs/all?${params}`),
  sendToSuperAdmin: (id) => request(`/jobs/send-to-super-admin/${id}`, { method: 'PUT' }),
  approve: (id) => request(`/jobs/approve/${id}`, { method: 'PUT' }),
  reject: (id, reason = '') => request(`/jobs/reject/${id}`, { method: 'PUT', body: JSON.stringify({ reason }) }),
};

export const companiesAPI = {
  getAll: async (params = '') => {
    try { return await request(`/companies?${params}`); }
    catch { return { companies: mockCompanies.map(c => ({ ...c, _id: String(c.id) })) }; }
  },
  getById: async (id) => {
    try { return await request(`/companies/${id}`); }
    catch { return mockGetCompanyById(id); }
  },
  create: (body) => request('/companies', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/companies/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => request(`/companies/${id}`, { method: 'DELETE' }),
};

export const metaAPI = {
  getCategories: async () => {
    try { return await request('/meta/categories'); }
    catch { return mockCategories; }
  },
  getLocations: async () => {
    try { return await request('/meta/locations'); }
    catch { return mockLocations; }
  },
  getPublicStats: async () => {
    try { return await request('/meta/stats'); }
    catch {
      return {
        totalJobs: mockJobs.length,
        totalCompanies: mockCompanies.length,
      };
    }
  },
};

export const authAPI = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),
  getUsers: (params = '') => request(`/auth/users?${params}`),
  createAdmin: (body) => request('/auth/create-admin', { method: 'POST', body: JSON.stringify(body) }),
  toggleUserStatus: (id) => request(`/auth/users/${id}/toggle-status`, { method: 'PUT' }),
  deleteUser: (id) => request(`/auth/users/${id}`, { method: 'DELETE' }),
};

export const dashboardAPI = {
  getStats: () => request('/dashboard/stats'),
};
