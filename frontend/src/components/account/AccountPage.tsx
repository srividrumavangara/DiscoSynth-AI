import React, { useState } from 'react';
import { User, Mail, Shield, KeyRound, LogOut, CheckCircle2, AlertCircle, Calendar, Hash } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AccountPage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-slate-400">
        <p>No active user session found. Please sign in to access account settings.</p>
      </div>
    );
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (newPassword && newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMessage('New password and confirmation do not match.');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        full_name: fullName.trim() !== user.full_name ? fullName.trim() : undefined,
        password: newPassword ? newPassword : undefined,
      });
      setSuccessMessage('Account details successfully updated.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setErrorMessage(detail || 'Failed to update account details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-widest mb-1.5">
          <Shield className="w-3.5 h-3.5" />
          <span>Security & Identity</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Account Profile & Credentials
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage your researcher profile, cryptographic security settings, and session credentials.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3 text-emerald-300 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Account Identity Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-slate-900 border border-slate-800/80 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="w-16 h-16 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-2xl font-mono mb-4">
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <h3 className="text-lg font-semibold text-white tracking-tight">
              {user.full_name}
            </h3>
            <p className="text-xs text-slate-400 break-all mt-0.5">
              {user.email}
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
              <Shield className="w-3 h-3" />
              <span>Litigation Research Counsel</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-800 space-y-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Hash className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="font-mono text-[11px] truncate text-slate-300">
                UID: {user.user_id}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
            </div>
            <button
              onClick={logout}
              className="w-full mt-4 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Terminate Session (Sign Out)</span>
            </button>
          </div>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800/80 rounded-xl p-6 sm:p-8">
          <h3 className="text-base font-semibold text-white mb-1">
            Update Personal & Credential Details
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Modify your display name or update your secure password.
          </p>

          <form onSubmit={handleUpdate} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Full Legal / Researcher Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Registered Email (Institutional ID)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-600 absolute left-3 top-3" />
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full pl-9 pr-3 py-2 bg-slate-950/40 border border-slate-800 rounded-lg text-sm text-slate-500 cursor-not-allowed font-mono"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Institutional email acts as your immutable cryptographic identifier.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800/80 space-y-4">
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Change Password (Leave blank to keep existing)
              </h4>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {newPassword && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
