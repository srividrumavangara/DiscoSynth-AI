import axios from 'axios';
import type {
  Dataset,
  DocumentMetadata,
  PaginatedResponse,
  AnalyticsData,
  QualityReport,
  GenerationRequest,
  HealthStatus,
} from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
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
  const baseURL = import.meta.env.VITE_API_URL || '';
  return `${baseURL}/api/datasets/${id}/export?format=${format}`;
}
