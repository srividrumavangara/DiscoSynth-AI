import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './components/landing/LandingPage';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { GeneratorPage } from './components/generator/GeneratorPage';
import { DatasetPreviewPage } from './components/preview/DatasetPreviewPage';
import { AnalyticsPage } from './components/analytics/AnalyticsPage';
import { HistoryPage } from './components/history/HistoryPage';
import { LoadingSpinner } from './components/common/LoadingSpinner';

import {
  HealthStatus,
  AnalyticsOverview,
  DatasetDetail,
  DatasetSummary
} from './types';
import { apiClient } from './api/client';

export const App: React.FC = () => {
  const queryTab = new URLSearchParams(window.location.search).get('tab');
  const [currentTab, setCurrentTab] = useState<string>(queryTab || 'landing');
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<DatasetDetail | null>(null);
  const [loadingDataset, setLoadingDataset] = useState<boolean>(false);

  // Poll health and load overview on mount
  const refreshAppData = async () => {
    try {
      const [h, ov, dsList] = await Promise.all([
        apiClient.getHealth().catch(() => null),
        apiClient.getAnalyticsOverview().catch(() => null),
        apiClient.getDatasets().catch(() => [])
      ]);
      if (h) setHealth(h);
      if (ov) setOverview(ov);
      setDatasets(dsList);

      // If datasets exist and none selected, auto-select the most recent
      if (dsList.length > 0 && !selectedDatasetId) {
        loadDataset(dsList[0].dataset_id);
      }
    } catch (e) {
      console.error('Initial data fetch error:', e);
    }
  };

  useEffect(() => {
    refreshAppData();
  }, []);

  const loadDataset = async (id: string, switchTabToPreview: boolean = false) => {
    setLoadingDataset(true);
    setSelectedDatasetId(id);
    try {
      const full = await apiClient.getDatasetById(id);
      setSelectedDataset(full);
      if (switchTabToPreview) {
        setCurrentTab('preview');
      }
    } catch (err) {
      console.error('Failed to load dataset:', err);
    } finally {
      setLoadingDataset(false);
    }
  };

  const handleDatasetGenerated = (newDataset: DatasetDetail) => {
    setSelectedDatasetId(newDataset.dataset_id);
    setSelectedDataset(newDataset);
    setCurrentTab('preview');
    refreshAppData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        health={health}
        onOpenGenerator={() => setCurrentTab('generator')}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          selectedDatasetId={selectedDatasetId}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {currentTab === 'landing' && (
            <LandingPage onStart={() => setCurrentTab('generator')} />
          )}

          {currentTab === 'dashboard' && (
            <DashboardPage
              overview={overview}
              health={health}
              onOpenGenerator={() => setCurrentTab('generator')}
              onSelectDataset={(id) => loadDataset(id, true)}
              onRefresh={refreshAppData}
            />
          )}

          {currentTab === 'generator' && (
            <GeneratorPage onDatasetGenerated={handleDatasetGenerated} />
          )}

          {currentTab === 'preview' && (
            <>
              {loadingDataset ? (
                <LoadingSpinner message="Fetching dataset records from MongoDB..." />
              ) : selectedDataset ? (
                <DatasetPreviewPage
                  dataset={selectedDataset}
                  onRefresh={() => loadDataset(selectedDataset.dataset_id, false)}
                  onViewAnalytics={() => setCurrentTab('analytics')}
                />
              ) : (
                <div className="py-16 text-center text-slate-500 text-sm">
                  Please generate or select a dataset from the Dashboard or History.
                </div>
              )}
            </>
          )}

          {currentTab === 'analytics' && selectedDatasetId && (
            <AnalyticsPage
              datasetId={selectedDatasetId}
              onBackToPreview={() => setCurrentTab('preview')}
            />
          )}

          {currentTab === 'history' && (
            <HistoryPage
              datasets={datasets}
              onSelectDataset={(id) => loadDataset(id, true)}
              onRefresh={refreshAppData}
            />
          )}
        </main>
      </div>
    </div>
  );
};
export default App;
