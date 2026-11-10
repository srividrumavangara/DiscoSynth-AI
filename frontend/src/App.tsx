import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Generate from './pages/Generate';
import DatasetExplorer from './pages/DatasetExplorer';
import Analytics from './pages/Analytics';
import History from './pages/History';
import Settings from './pages/Settings';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Website & Marketing Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Authenticated Workspace Routes */}
        <Route path="/app" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="generate" element={<Generate />} />
          <Route path="explorer" element={<DatasetExplorer />} />
          <Route path="explorer/:datasetId" element={<DatasetExplorer />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="analytics/:datasetId" element={<Analytics />} />
          <Route path="history" element={<History />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Direct Backward-Compatible Shortcuts to Workspace */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/generate" element={<Generate />} />
          <Route path="/explorer" element={<DatasetExplorer />} />
          <Route path="/explorer/:datasetId" element={<DatasetExplorer />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/analytics/:datasetId" element={<Analytics />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
