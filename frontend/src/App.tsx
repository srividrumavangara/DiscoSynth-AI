import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Generate from './pages/Generate';
import DatasetExplorer from './pages/DatasetExplorer';
import Analytics from './pages/Analytics';
import History from './pages/History';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/generate" element={<Generate />} />
        <Route path="/explorer" element={<DatasetExplorer />} />
        <Route path="/explorer/:datasetId" element={<DatasetExplorer />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/analytics/:datasetId" element={<Analytics />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
