import axios from 'axios';
import {
  GenerationConfig,
  NLScenarioResponse,
  DatasetDetail,
  DatasetSummary,
  AnalyticsOverview,
  DatasetAnalytics,
  HealthStatus,
  DocumentMetadata
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 2 minutes for LLM generation
});

export const apiClient = {
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
