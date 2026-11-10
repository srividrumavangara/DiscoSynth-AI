import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Public Layout & Pages
import PublicLayout from './components/public/PublicLayout';
import HomePage from './pages/public/HomePage';
import PlatformPage from './pages/public/PlatformPage';
import HowItWorksPage from './pages/public/HowItWorksPage';
import FeaturesPage from './pages/public/FeaturesPage';
import DocumentationPage from './pages/public/DocumentationPage';
import AboutPage from './pages/public/AboutPage';

// Authentication Pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import AuthCallbackPage from './pages/auth/AuthCallbackPage';

// Workspace Layout & Pages
import Layout from './components/Layout';
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
        {/* Public Editorial Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/platform" element={<PlatformPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/documentation" element={<DocumentationPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Route>

        {/* Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* Application Workspace Routes */}
        <Route path="/app" element={<Layout />}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="generate" element={<Generate />} />
          <Route path="datasets" element={<DatasetExplorer />} />
          <Route path="datasets/:id" element={<DatasetExplorer />} />
          <Route path="datasets/:id/explorer" element={<DatasetExplorer />} />
          <Route path="datasets/:id/analytics" element={<Analytics />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="analytics/:id" element={<Analytics />} />
          <Route path="history" element={<History />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Backward-Compatible Shortcuts & Direct Navigation */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="/generate" element={<Navigate to="/app/generate" replace />} />
          <Route path="/explorer" element={<Navigate to="/app/datasets" replace />} />
          <Route path="/explorer/:datasetId" element={<DatasetExplorer />} />
          <Route path="/analytics" element={<Navigate to="/app/analytics" replace />} />
          <Route path="/analytics/:datasetId" element={<Analytics />} />
          <Route path="/history" element={<Navigate to="/app/history" replace />} />
          <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
        </Route>

        {/* Catch-all redirect to public homepage */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
