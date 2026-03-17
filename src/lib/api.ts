import axios from 'axios';

// --- Environment Detection ---
export let IS_SANDBOX = true;
const productionHosts = [
  'kimelgrow.com',
  'www.kimelgrow.com',
  'kimlgrow.com',
  'marketing.stratosedges.com',
  'www.marketing.stratosedges.com',
  'branding.98miles.com',
  'www.branding.98miles.com',
  'www.kimlgrow.com',
  'masterclick.ltd',
  'www.masterclick.ltd',
  'masterclick_prod:3000',
];

if (typeof window !== 'undefined') {
  IS_SANDBOX = !productionHosts.includes(window.location.host);
}

const API_BASE_URL = IS_SANDBOX
  ? 'http://localhost:3001/dev'
  : 'https://api.kimelgrow.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
  params: {
    sandbox: IS_SANDBOX,
  },
});

// Request interceptor — attach JWT
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ---- API Service Functions ----

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/employee/signin', { email, password }),
  signup: (name: string, email: string, password: string, cpassword: string) =>
    api.post('/auth/employee/signup', { name, email, password, cpassword }),
  logout: () => api.post('/auth/logout'),
  resetPassword: (email: string) =>
    api.post('/auth/employee/forget-password', { email }),
  verifyOtp: (email: string, otp: string) =>
    api.post('/auth/employee/verify-otp', { email, otp }),
  updatePassword: (email: string, otp: string, password: string, cpassword: string) =>
    api.post('/auth/employee/reset-password', { email, otp, password, cpassword, sandbox: IS_SANDBOX }, { params: {} }),
};

// Attendance
export const attendanceApi = {
  checkIn: () => api.post('/attendance/checkin'),
  checkOut: () => api.put('/attendance/checkout'),
  getMyAttendance: (params?: Record<string, string>) =>
    api.get('/attendance/me', { params }),
  getTeamAttendance: (params?: Record<string, string>) =>
    api.get('/attendance/team', { params }),
  override: (id: string, data: { status: string; overrideReason: string }) =>
    api.put(`/attendance/${id}/override`, data),
  getSummary: (params?: Record<string, string>) =>
    api.get('/attendance/report', { params }), // JSON response for dashboard
  downloadReport: (params?: Record<string, string>) =>
    api.get('/attendance/report', { params, responseType: 'blob' }), // Blob response for downloads
};

// Leaves
export const leavesApi = {
  apply: (data: {
    leaveType: string;
    fromDate: string;
    toDate: string;
    reason: string;
    documentUrl?: string;
  }) => api.post('/leaves/apply', data),
  getMyLeaves: () => api.get('/leaves/me'),
  getBalance: () => api.get('/leaves/balance'),
  cancel: (id: string) => api.delete(`/leaves/${id}/cancel`),
  getPending: () => api.get('/leaves/pending'),
  approve: (id: string, comment: string) =>
    api.put(`/leaves/${id}/approve`, { comment }),
  decline: (id: string, comment: string) =>
    api.put(`/leaves/${id}/decline`, { comment }),
  getAll: (params?: Record<string, string>) =>
    api.get('/leaves/all', { params }),
  downloadReport: (params?: Record<string, string>) =>
    api.get('/leaves/report', { params, responseType: 'blob' }),
  getReportSummary: (params?: Record<string, string>) =>
    api.get('/leaves/report', { params }),
  getUploadUrl: (fileName: string, fileType: string) =>
    api.get('/leaves/upload-url', { params: { fileName, fileType } }),
};

// Notifications
export const notificationsApi = {
  getAll: () => api.get('/notifications'),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// Users
export const usersApi = {
  getAll: (params?: Record<string, string>) => api.get('/users', { params }),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
};

// Settings (Holidays, Policies)
export const settingsApi = {
  getHolidays: () => api.get('/settings/holidays'),
  getLeavePolicies: () => api.get('/settings/leave-policies'),
};


