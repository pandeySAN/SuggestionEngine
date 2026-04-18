import axios from 'axios';
import type { AuthResponse, Issue, LoginInput, RegisterInput, CreateIssueInput } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  login: async (data: LoginInput) => {
    const response = await api.post<{ status: string; data: AuthResponse }>('/auth/login', data);
    return response.data.data;
  },

  register: async (data: RegisterInput) => {
    const response = await api.post<{ status: string; data: AuthResponse }>('/auth/register', data);
    return response.data.data;
  },

  getProfile: async () => {
    const response = await api.get<{ status: string; data: any }>('/auth/profile');
    return response.data.data;
  },
};

// Issues API
export const issuesApi = {
  create: async (data: CreateIssueInput) => {
    const formData = new FormData();
    formData.append('description', data.description);
    if (data.category) formData.append('category', data.category);
    if (data.urgency) formData.append('urgency', data.urgency);
    if (data.location) formData.append('location', JSON.stringify(data.location));
    
    if (data.images) {
      data.images.forEach((image) => {
        formData.append('images', image);
      });
    }

    const response = await api.post<{ status: string; data: Issue }>('/issues', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  getAll: async (filters?: { status?: string; category?: string; userId?: string; limit?: number }) => {
    const response = await api.get<{ status: string; data: { count: number; rows: Issue[] } }>('/issues', {
      params: filters,
    });
    return response.data.data;
  },

  getById: async (id: string) => {
    const response = await api.get<{ status: string; data: Issue }>(`/issues/${id}`);
    return response.data.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await api.patch<{ status: string; data: Issue }>(`/issues/${id}/status`, { status });
    return response.data.data;
  },

  selectSuggestion: async (issueId: string, suggestionId: string) => {
    const response = await api.post(`/issues/${issueId}/suggestions/${suggestionId}/select`);
    return response.data.data;
  },
};

export default api;