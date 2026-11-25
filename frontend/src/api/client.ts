import axios from 'axios';
import {
  GenerationConfig,
  NLScenarioResponse,
  DatasetDetail,
  DatasetSummary,
  AnalyticsOverview,
  DatasetAnalytics,
  HealthStatus,
  DocumentMetadata,
  UserProfile,
  TokenResponse,
  UserRegisterRequest,
  UserLoginRequest,
  UpdateProfileRequest
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 2 minutes for LLM generation
});

// Attach JWT token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('discosynth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiClient = {
  // Authentication
  register: async (data: UserRegisterRequest): Promise<TokenResponse> => {
    const res = await api.post<TokenResponse>('/auth/register', data);
    return res.data;
  },

  login: async (data: UserLoginRequest): Promise<TokenResponse> => {
    const res = await api.post<TokenResponse>('/auth/login', data);
    return res.data;
  },

  getCurrentUser: async (): Promise<UserProfile> => {
    const res = await api.get<UserProfile>('/auth/me');
    return res.data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const res = await api.post<{ message: string }>('/auth/forgot-password', { email });
    return res.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    const res = await api.put<UserProfile>('/auth/profile', data);
    return res.data;
  },

  // Health
  getHealth: async (): Promise<HealthStatus> => {
    const res = await api.get<HealthStatus>('/health');
    return res.data;
  },

  // Scenario interpretation
  interpretScenario: async (prompt: string): Promise<NLScenarioResponse> => {
    const res = await api.post<NLScenarioResponse>('/scenario/interpret', { prompt });
    return res.data;
  },

  // Dataset generation
  generateDataset: async (config: GenerationConfig): Promise<DatasetDetail> => {
    const res = await api.post<DatasetDetail>('/generation/generate', config);
    return res.data;
  },

  // Datasets CRUD
  getDatasets: async (scenario?: string): Promise<DatasetSummary[]> => {
    const params = scenario && scenario !== 'All' ? { scenario } : {};
    const res = await api.get<DatasetSummary[]>('/datasets', { params });
    return res.data;
  },

  getDatasetById: async (id: string): Promise<DatasetDetail> => {
    const res = await api.get<DatasetDetail>(`/datasets/${id}`);
    return res.data;
  },

  updateRecord: async (datasetId: string, docId: string, updateData: Partial<DocumentMetadata>): Promise<void> => {
    await api.patch(`/datasets/${datasetId}/records/${docId}`, updateData);
  },

  deleteDataset: async (id: string): Promise<void> => {
    await api.delete(`/datasets/${id}`);
  },

  // Analytics
  getAnalyticsOverview: async (): Promise<AnalyticsOverview> => {
    const res = await api.get<AnalyticsOverview>('/analytics/overview');
    return res.data;
  },

  getDatasetAnalytics: async (datasetId: string): Promise<DatasetAnalytics> => {
    const res = await api.get<DatasetAnalytics>(`/analytics/${datasetId}`);
    return res.data;
  },

  // Export URLs
  getExportCsvUrl: (datasetId: string): string => `${API_BASE_URL}/export/${datasetId}/csv`,
  getExportJsonUrl: (datasetId: string): string => `${API_BASE_URL}/export/${datasetId}/json`,
};
