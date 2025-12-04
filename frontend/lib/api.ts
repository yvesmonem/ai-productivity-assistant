import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const AI_API_URL = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:8000';

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

export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

export interface Document {
  id: string;
  title: string;
  type: 'PDF' | 'AUDIO' | 'VIDEO' | 'TEXT';
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  summary?: string;
  keyPoints?: string[];
  actionItems?: string[];
  transcript?: string;
  highlights?: string[];
  decisions?: string[];
  followUpEmail?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth
export const authApi = {
  register: async (email: string, password: string, name?: string) => {
    const { data } = await api.post('/api/auth/register', { email, password, name });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },
  login: async (email: string, password: string) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

// Documents
export const documentsApi = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post('/api/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  getAll: async (): Promise<Document[]> => {
    const { data } = await api.get('/api/documents');
    return data;
  },
  getById: async (id: string): Promise<Document> => {
    const { data } = await api.get(`/api/documents/${id}`);
    return data;
  },
  delete: async (id: string) => {
    await api.delete(`/api/documents/${id}`);
  },
};

// Chat
export const chatApi = {
  send: async (message: string, documentId?: string) => {
    const { data } = await api.post('/api/chat/send', { message, documentId });
    return data;
  },
  getHistory: async (documentId?: string) => {
    const { data } = await api.get('/api/chat', { params: { documentId } });
    return data;
  },
};

// Reports
export const reportsApi = {
  generate: async (topic: string) => {
    const { data } = await api.post('/api/reports', { topic });
    return data;
  },
  getAll: async () => {
    const { data } = await api.get('/api/reports');
    return data;
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/api/reports/${id}`);
    return data;
  },
};

export default api;

