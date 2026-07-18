/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const API_BASE = '/api';

// Retrieve token from storage
export function getToken(): string | null {
  return localStorage.getItem('pms_jwt_token');
}

// Save token and user details to storage
export function setSession(token: string, user: any) {
  localStorage.setItem('pms_jwt_token', token);
  localStorage.setItem('pms_user', JSON.stringify(user));
}

// Clear session
export function clearSession() {
  localStorage.removeItem('pms_jwt_token');
  localStorage.removeItem('pms_user');
}

// Base Fetch request helper
async function request(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errMsg = `Request failed with status ${response.status}`;
    try {
      const errData = await response.json();
      errMsg = errData.error?.message || errMsg;
    } catch (e) {}
    throw new Error(errMsg);
  }

  return response.json();
}

export const api = {
  get: (endpoint: string) => request(endpoint, { method: 'GET' }),
  post: (endpoint: string, data: any) => request(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint: string, data: any) => request(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint: string) => request(endpoint, { method: 'DELETE' }),

  // Auth Specific
  login: async (email: string, password: string): Promise<any> => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.success && res.token) {
      setSession(res.token, res.user);
    }
    return res;
  },
  forgotPassword: async (email: string): Promise<any> => {
    return request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },
  resetPassword: async (data: { email: string; code: string; newPassword: string }): Promise<any> => {
    return request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<any> => {
    return request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  verifySession: async (): Promise<any> => {
    return request('/auth/verify', { method: 'GET' });
  },
  extendSession: async (): Promise<any> => {
    const res = await request('/auth/extend-session', { method: 'POST' });
    if (res && res.success && res.token) {
      setSession(res.token, res.user);
    }
    return res;
  },
  getActivityLogs: async (): Promise<any[]> => {
    const res = await request('/activity-logs');
    return res.logs || [];
  },

  // Rooms API
  getRooms: async (): Promise<any[]> => {
    const res = await request('/rooms');
    return res.rooms || [];
  },
  createRoom: (data: any) => request('/rooms', { method: 'POST', body: JSON.stringify(data) }),
  updateRoom: (id: string, data: any) => request(`/rooms/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateRoomStatus: (id: string, data: { current_status?: string; housekeeping_status?: string; maintenance_status?: string }) =>
    request(`/rooms/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRoom: (id: string) => request(`/rooms/${id}`, { method: 'DELETE' }),

  getRoomCategories: async (): Promise<any[]> => {
    const res = await request('/room_categories');
    return res.categories || [];
  },
  updateRoomCategories: (categories: any[]) => request('/room_categories', { method: 'PUT', body: JSON.stringify({ categories }) }),

  // Guests API
  getGuests: async (): Promise<any[]> => {
    const res = await request('/guests');
    return res.guests || [];
  },
  createGuest: (data: any) => request('/guests', { method: 'POST', body: JSON.stringify(data) }),
  updateGuest: (id: string, data: any) => request(`/guests/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getGuestHistory: async (id: string): Promise<any[]> => {
    const res = await request(`/guests/history/${id}`);
    return res.history || [];
  },

  // Reservations API
  getReservations: async (): Promise<any[]> => {
    const res = await request('/reservations');
    return res.reservations || [];
  },
  createReservation: (data: any) => request('/reservations', { method: 'POST', body: JSON.stringify(data) }),
  checkInReservation: (id: string) => request(`/reservations/${id}/check-in`, { method: 'POST' }),
  checkOutReservation: (id: string) => request(`/reservations/${id}/check-out`, { method: 'POST' }),

  // HRMS API
  getEmployees: async (): Promise<any[]> => {
    const res = await request('/hrms/employees');
    return res.employees || [];
  },
  createEmployee: (data: any) => request('/hrms/employees', { method: 'POST', body: JSON.stringify(data) }),
  updateEmployee: (id: string, data: any) => request(`/hrms/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  getDepartments: async (): Promise<any[]> => {
    const res = await request('/hrms/departments');
    return res.departments || [];
  },
  createDepartment: (data: any) => request('/hrms/departments', { method: 'POST', body: JSON.stringify(data) }),

  getJobs: async (): Promise<any[]> => {
    const res = await request('/hrms/jobs');
    return res.jobs || [];
  },
  createJob: (data: any) => request('/hrms/jobs', { method: 'POST', body: JSON.stringify(data) }),

  getTeams: async (): Promise<any[]> => {
    const res = await request('/hrms/teams');
    return res.teams || [];
  },
  createTeam: (data: any) => request('/hrms/teams', { method: 'POST', body: JSON.stringify(data) }),

  getContracts: async (): Promise<any[]> => {
    const res = await request('/hrms/contracts');
    return res.contracts || [];
  },
  createContract: (data: any) => request('/hrms/contracts', { method: 'POST', body: JSON.stringify(data) }),
  updateContract: (id: string, data: any) => request(`/hrms/contracts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  getOnboardingTasks: async (): Promise<any[]> => {
    const res = await request('/hrms/onboarding-tasks');
    return res.onboardingTasks || [];
  },
  updateOnboardingTask: (id: string, data: any) => request(`/hrms/onboarding-tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  getSkills: async (): Promise<any[]> => {
    const res = await request('/hrms/skills');
    return res.skills || [];
  },

  getEmployeeSkills: async (): Promise<any[]> => {
    const res = await request('/hrms/employee-skills');
    return res.employeeSkills || [];
  },

  getPayrollRules: async (): Promise<any[]> => {
    const res = await request('/hrms/payroll-rules');
    return res.payrollRules || [];
  },

  getBusinessEvents: async (): Promise<any[]> => {
    const res = await request('/hrms/business-events');
    return res.businessEvents || [];
  },

  // Users Management API
  getUsers: async (): Promise<any[]> => {
    const res = await request('/users');
    return res.users || [];
  },
  createUser: (data: any) => request('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: string | number, data: any) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id: string | number) => request(`/users/${id}`, { method: 'DELETE' }),

  // Administration & Diagnostics API
  getDbDiagnostics: () => request('/admin/db-diagnostics'),
  getDebugUserCreation: () => request('/admin/debug-user-creation'),
  getBackupData: () => request('/admin/backup'),
  restoreDb: (data: any) => request('/admin/restore', { method: 'POST', body: JSON.stringify(data) }),
  getBackupConfigData: () => request('/admin/backup-config'),
  restoreConfig: (data: any) => request('/admin/restore-config', { method: 'POST', body: JSON.stringify(data) })
};
