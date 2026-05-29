/**
 * lib/api.ts
 * Axios instance pre-configured for the RAASPAL backend.
 *
 * - Base URL: http://localhost:8080 (overridable via NEXT_PUBLIC_API_URL)
 * - Request interceptor: attaches Authorization: Bearer <token> from localStorage
 * - Response interceptor: on 401 → clear stored token (but NOT auto-redirect
 *   because this code also runs on the server; redirects are handled by proxy.ts)
 */

import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

/* ─── Request interceptor ─────────────────────────────────────────────────── */

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('raaspal_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

/* ─── Response interceptor ────────────────────────────────────────────────── */

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Remove stale token — the proxy.ts will redirect to /login on the next navigation.
      localStorage.removeItem('raaspal_token');
    }
    return Promise.reject(error as Error);
  },
);

/* ─── Typed helpers ───────────────────────────────────────────────────────── */

import type {
  ApiResponse,
  AuthResponse,
  CreateUserRequest,
  FileUploadResponse,
  GenerateProposalRequest,
  GeneratedProposalResponse,
  LoginRequest,
  PagedResponse,
  RecommendationItemResponse,
  RecommendationResponse,
  RequirementResponse,
  RobotResponse,
  RobotType,
  UserResponse,
} from '@/types/api';

// Users
export const userApi = {
  getAll: (page = 0, size = 50) =>
    api.get<ApiResponse<PagedResponse<UserResponse>>>('/api/v1/users', { params: { page, size, sort: 'createdAt,asc' } }),

  create: (body: CreateUserRequest) =>
    api.post<ApiResponse<UserResponse>>('/api/v1/users', body),
};

// Robots
export const robotApi = {
  getAll: (page = 0, size = 100) =>
    api.get<ApiResponse<PagedResponse<RobotResponse>>>('/api/v1/robots', { params: { page, size, sort: 'brand,asc' } }),

  getById: (id: string) =>
    api.get<ApiResponse<RobotResponse>>(`/api/v1/robots/${id}`),
};

// Auth
export const authApi = {
  login: (body: LoginRequest) =>
    api.post<ApiResponse<AuthResponse>>('/api/v1/auth/login', body),

  me: () =>
    api.get<ApiResponse<UserResponse>>('/api/v1/auth/me'),
};

// File upload
export const fileApi = {
  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<ApiResponse<FileUploadResponse>>(
      '/api/v1/files/upload',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  },
};

// Requirements
export const requirementApi = {
  extractFromFile: (fileId: string, robotType: RobotType) =>
    api.post<ApiResponse<RequirementResponse>>(
      `/api/v1/requirements/extract-from-file/${fileId}`,
      { robotType },
    ),
};

// Recommendations
export const recommendationApi = {
  generate: (requirementId: string) =>
    api.post<ApiResponse<RecommendationResponse>>(
      `/api/v1/recommendations/generate/${requirementId}`,
    ),

  getAll: (page = 0, size = 20) =>
    api.get<ApiResponse<PagedResponse<RecommendationResponse>>>('/api/v1/recommendations', { params: { page, size, sort: 'createdAt,desc' } }),

  getById: (id: string) =>
    api.get<ApiResponse<RecommendationResponse>>(`/api/v1/recommendations/${id}`),
};

// Proposals
export const proposalApi = {
  generate: (body: GenerateProposalRequest) =>
    api.post<ApiResponse<GeneratedProposalResponse>>('/api/v1/proposals/generate', body),

  getAll: (page = 0, size = 20) =>
    api.get<ApiResponse<PagedResponse<GeneratedProposalResponse>>>('/api/v1/proposals', { params: { page, size, sort: 'createdAt,desc' } }),

  getById: (id: string) =>
    api.get<ApiResponse<GeneratedProposalResponse>>(`/api/v1/proposals/${id}`),
};
