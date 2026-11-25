import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './components/landing/LandingPage';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { GeneratorPage } from './components/generator/GeneratorPage';
import { DatasetPreviewPage } from './components/preview/DatasetPreviewPage';
import { AnalyticsPage } from './components/analytics/AnalyticsPage';
import { HistoryPage } from './components/history/HistoryPage';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { AccountPage } from './components/account/AccountPage';
import { LoadingSpinner } from './components/common/LoadingSpinner';

import {
  HealthStatus,
  AnalyticsOverview,
  DatasetDetail,
  DatasetSummary
} from './types';
import { apiClient } from './api/client';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const queryTab = new URLSearchParams(window.location.search).get('tab');
  const [currentTab, setCurrentTab] = useState<string>(queryTab || 'landing');
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<DatasetDetail | null>(null);
  const [loadingDataset, setLoadingDataset] = useState<boolean>(false);

  // Poll health and load overview on mount and when auth state changes
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
  }, [isAuthenticated]);

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

  const handleNavigateTab = (tab: string) => {
    if (tab === 'account' && !isAuthenticated) {
      setCurrentTab('login');
      return;
    }
    setCurrentTab(tab);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#070A0F] flex items-center justify-center">
        <LoadingSpinner message="Initializing DiscoSynth AI cryptographic session..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A0F] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar
        health={health}
        onOpenGenerator={() => setCurrentTab('generator')}
        onNavigateTab={handleNavigateTab}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Only show sidebar if not in standalone login or register page */}
        {currentTab !== 'login' && currentTab !== 'register' && (
          <Sidebar
            currentTab={currentTab}
            setCurrentTab={handleNavigateTab}
            selectedDatasetId={selectedDatasetId}
          />
        )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {currentTab === 'landing' && (
            <LandingPage
              onStart={() => setCurrentTab('generator')}
              onExploreHistory={() => setCurrentTab('history')}
            />
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
                <div className="py-20 text-center text-slate-500 text-sm max-w-md mx-auto">
                  <p className="font-semibold text-slate-400">No Dataset Currently Loaded</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Select a dataset from the Repository or Dashboard, or generate a new batch to preview records.
                  </p>
                  <button
                    onClick={() => setCurrentTab('generator')}
                    className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium"
                  >
                    Open Synthetic Generator
                  </button>
                </div>
              )}
            </>
          )}

          {currentTab === 'analytics' && (
            <>
              {selectedDatasetId ? (
                <AnalyticsPage
                  datasetId={selectedDatasetId}
                  onBackToPreview={() => setCurrentTab('preview')}
                />
              ) : (
                <div className="py-20 text-center text-slate-500 text-sm max-w-md mx-auto">
                  <p className="font-semibold text-slate-400">No Active Dataset for Analytics</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Please select a dataset to view its privilege, responsiveness, and custodian distributions.
                  </p>
                </div>
              )}
            </>
          )}

          {currentTab === 'history' && (
            <HistoryPage
              datasets={datasets}
              onSelectDataset={(id) => loadDataset(id, true)}
              onRefresh={refreshAppData}
            />
          )}

          {currentTab === 'account' && (
            <AccountPage />
          )}

          {currentTab === 'login' && (
            <LoginPage
              onSuccess={() => setCurrentTab('dashboard')}
              onSwitchToRegister={() => setCurrentTab('register')}
            />
          )}

          {currentTab === 'register' && (
            <RegisterPage
              onSuccess={() => setCurrentTab('dashboard')}
              onSwitchToLogin={() => setCurrentTab('login')}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
