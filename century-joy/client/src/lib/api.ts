import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';
import type {
  AuditEntry,
  AuthUser,
  PresignedItem,
  Project,
  ProjectDetail,
  ProjectStatus,
  Role,
  UserRow,
} from '../types';

const BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

let accessToken: string | null = null;
export const setAccessToken = (t: string | null) => { accessToken = t; };
export const getAccessToken = () => accessToken;

export const api = axios.create({ baseURL: BASE, withCredentials: true });

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

let refreshing: Promise<string | null> | null = null;
async function doRefresh(): Promise<string | null> {
  try {
    const { data } = await axios.post(`${BASE}/auth/refresh`, {}, { withCredentials: true });
    accessToken = data.accessToken;
    return data.accessToken;
  } catch {
    accessToken = null;
    return null;
  }
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retried?: boolean };
    const url = original?.url ?? '';
    const isAuthCall = url.includes('/auth/login') || url.includes('/auth/refresh');
    if (error.response?.status === 401 && original && !original._retried && !isAuthCall) {
      original._retried = true;
      refreshing = refreshing ?? doRefresh();
      const token = await refreshing;
      refreshing = null;
      if (token) {
        original.headers = { ...original.headers, Authorization: `Bearer ${token}` };
        return api(original);
      }
    }
    return Promise.reject(error);
  },
);

/** Pull a human message out of an axios error. */
export function apiError(err: unknown): string {
  const e = err as AxiosError<{ error?: { message?: string } }>;
  return e.response?.data?.error?.message || e.message || 'Something went wrong.';
}

interface ListResponse<T> { projects: T[]; total: number; page: number; pageSize: number; }

export const endpoints = {
  // auth
  async login(email: string, password: string) {
    const { data } = await api.post<{ accessToken: string; user: AuthUser }>('/auth/login', { email, password });
    return data;
  },
  async refresh() {
    const { data } = await api.post<{ accessToken: string; user: AuthUser }>('/auth/refresh', {});
    return data;
  },
  async logout() { await api.post('/auth/logout', {}); },
  async setPassword(email: string, currentPassword: string, newPassword: string) {
    await api.post('/auth/set-password', { email, currentPassword, newPassword });
  },
  async forgotPassword(email: string) { await api.post('/auth/forgot-password', { email }); },
  async resetPassword(token: string, newPassword: string) {
    await api.post('/auth/reset-password', { token, newPassword });
  },

  // client projects
  async listMyProjects(page = 1) {
    const { data } = await api.get<ListResponse<Project>>('/projects', { params: { page } });
    return data;
  },
  async mySummary() {
    const { data } = await api.get<{ total: number; active: number; completed: number }>('/projects/summary');
    return data;
  },
  async createProject(body: {
    title: string; conceptNote: string; numberOfViews: number;
    files: { category: string; originalName: string; sizeBytes: number }[];
  }) {
    const { data } = await api.post<{ project: Project; uploads: PresignedItem[] }>('/projects', body);
    return data;
  },
  async confirmUpload(fileId: string) { await api.post('/upload/confirm', { fileId }); },
  async submitProject(id: string) { await api.post(`/projects/${id}/submit`, {}); },
  async getProject(id: string) {
    const { data } = await api.get<ProjectDetail>(`/projects/${id}`);
    return data;
  },
  async requestRevision(id: string, notes: string) {
    const { data } = await api.post(`/projects/${id}/revision`, { notes });
    return data;
  },

  // studio
  async studioProjects(params: { page?: number; status?: ProjectStatus; search?: string } = {}) {
    const { data } = await api.get<ListResponse<Project>>('/studio/projects', { params });
    return data;
  },
  async accept(id: string) { return (await api.patch(`/studio/projects/${id}/accept`, {})).data; },
  async studioStatus(id: string, toStatus: ProjectStatus) {
    return (await api.patch(`/studio/projects/${id}/status`, { toStatus })).data;
  },
  async presignDeliverables(id: string, views: { viewNumber: number; originalName: string; sizeBytes: number }[]) {
    const { data } = await api.post<{ uploads: PresignedItem[] }>(`/studio/projects/${id}/deliverables/presign`, { views });
    return data.uploads;
  },
  async confirmDeliverables(id: string, deliverableIds: string[]) {
    return (await api.post(`/studio/projects/${id}/deliverables/confirm`, { deliverableIds })).data;
  },
  async complete(id: string) { return (await api.patch(`/studio/projects/${id}/complete`, {})).data; },
  async close(id: string) { return (await api.patch(`/studio/projects/${id}/close`, {})).data; },
  async flag(id: string, reason: string) { return (await api.post(`/studio/projects/${id}/flag`, { reason })).data; },

  // admin
  async adminUsers() {
    const { data } = await api.get<{ users: UserRow[] }>('/admin/users');
    return data.users;
  },
  async adminCreateUser(body: { name: string; email: string; role: Role; companyName?: string; phone?: string }) {
    const { data } = await api.post<{ user: UserRow; tempPassword: string }>('/admin/users', body);
    return data;
  },
  async adminUpdateUser(id: string, body: Record<string, unknown>) {
    const { data } = await api.patch<{ user: UserRow }>(`/admin/users/${id}`, body);
    return data.user;
  },
  async adminResetPassword(id: string) {
    const { data } = await api.post<{ tempPassword: string }>(`/admin/users/${id}/reset-password`, {});
    return data;
  },
  async adminDeactivate(id: string) { return (await api.patch(`/admin/users/${id}/deactivate`, {})).data; },
  async adminReactivate(id: string) { return (await api.patch(`/admin/users/${id}/reactivate`, {})).data; },
  async adminProjects(params: { page?: number; status?: ProjectStatus; search?: string } = {}) {
    const { data } = await api.get<ListResponse<Project>>('/admin/projects', { params });
    return data;
  },
  async adminOverride(id: string, toStatus: ProjectStatus, reason: string) {
    return (await api.patch(`/admin/projects/${id}/status`, { toStatus, reason })).data;
  },
  async adminDelete(id: string) { return (await api.patch(`/admin/projects/${id}/delete`, {})).data; },
  async adminAudit(params: { page?: number; action?: string } = {}) {
    const { data } = await api.get<{ entries: AuditEntry[]; total: number; page: number; pageSize: number }>(
      '/admin/audit-log', { params },
    );
    return data;
  },
};
