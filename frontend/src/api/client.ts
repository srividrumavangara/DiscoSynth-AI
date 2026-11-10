import axios from 'axios';
import { supabase } from '../lib/supabase';
import type {
  Dataset,
  DocumentMetadata,
  PaginatedResponse,
  AnalyticsData,
  QualityReport,
  GenerationRequest,
  HealthStatus,
} from '../types';

// Connect to backend URL: default to http://localhost:8000 if not specified
const BACKEND_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : '');

export const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000,
});

// Interceptor to inject verified Supabase JWT Bearer token on every request
api.interceptors.request.use(async (config) => {
  try {
    // 1. Try to get real Supabase session token
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
        return config;
      }
    }

    // 2. Fallback to stored token (e.g. isolated demo or restored session)
    const storedToken = localStorage.getItem('discosynth_auth_token');
    if (storedToken) {
      config.headers.Authorization = `Bearer ${storedToken}`;
    }
  } catch (err) {
    console.debug('Failed to attach auth token:', err);
  }
  return config;
});

export async function getHealth(): Promise<HealthStatus> {
  const { data } = await api.get<HealthStatus>('/api/health');
  return data;
}

export async function getDatasets(
  page = 1,
  pageSize = 50
): Promise<PaginatedResponse<Dataset>> {
  const { data } = await api.get<PaginatedResponse<Dataset>>('/api/datasets', {
    params: { page, page_size: pageSize },
  });
  return data;
}

export async function getDataset(id: string): Promise<Dataset> {
  const { data } = await api.get<Dataset>(`/api/datasets/${id}`);
  return data;
}

export async function getDatasetRecords(
  id: string,
  params: {
    page?: number;
    page_size?: number;
    document_type?: string;
    responsive?: string;
    privilege_status?: string;
    search?: string;
  } = {}
): Promise<PaginatedResponse<DocumentMetadata>> {
  const { data } = await api.get<PaginatedResponse<DocumentMetadata>>(
    `/api/datasets/${id}/records`,
    { params }
  );
  return data;
}

export async function getDatasetAnalytics(id: string): Promise<AnalyticsData> {
  const { data } = await api.get<AnalyticsData>(`/api/datasets/${id}/analytics`);
  return data;
}

export async function getDatasetQuality(id: string): Promise<QualityReport> {
  const { data } = await api.get<QualityReport>(`/api/datasets/${id}/quality`);
  return data;
}

export async function generateDataset(
  request: GenerationRequest
): Promise<Dataset> {
  const { data } = await api.post<Dataset>('/api/generate', request);
  return data;
}

export async function deleteDataset(id: string): Promise<void> {
  await api.delete(`/api/datasets/${id}`);
}

export function getExportUrl(id: string, format: 'csv' | 'json'): string {
  const token = localStorage.getItem('discosynth_auth_token') || '';
  const tokenParam = token ? `&token=${encodeURIComponent(token)}` : '';
  return `${BACKEND_URL}/api/datasets/${id}/export?format=${format}${tokenParam}`;
}
