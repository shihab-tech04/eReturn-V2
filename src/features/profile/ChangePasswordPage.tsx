import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';

export const ChangePasswordPage: React.FC = () => {
  const { language, t } = useApp();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword) {
      setStatusMessage({ type: 'error', text: 'Please enter your current account password.' });
      return;
    }
    if (newPassword.length < 8) {
      setStatusMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'New password and confirm password do not match.' });
      return;
    }

    setStatusMessage({
      type: 'success',
      text: 'Password updated successfully in development session!',
    });
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-ui-content-secondary" />
          <h2 className="text-xl font-bold text-ui-content-primary">{t('changePasswordTitle')}</h2>
        </div>
        <p className="text-xs text-ui-content-muted mt-1">
          Keep your taxpayer credentials secure.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center gap-2 animate-in fade-in ${
            statusMessage.type === 'success'
              ? 'bg-ui-accent-soft border border-ui-accent-border text-ui-content-primary'
              : 'bg-red-50 border border-red-200 text-red-900'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-ui-accent shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-ui-surface rounded-xl border border-ui-stroke-subtle shadow-xs p-6 space-y-4 text-xs">
        {/* Old Password */}
        <div>
          <label className="block font-semibold text-ui-content-secondary mb-1">{t('oldPassword')} *</label>
          <div className="relative">
            <input
              type={showOld ? 'text' : 'password'}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full rounded-md border border-ui-stroke-default py-2 pl-3 pr-10 focus:border-ui-focus focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowOld(!showOld)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-ui-content-muted hover:text-ui-content-secondary cursor-pointer"
            >
              {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block font-semibold text-ui-content-secondary mb-1">{t('newPassword')} *</label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters with numbers"
              className="w-full rounded-md border border-ui-stroke-default py-2 pl-3 pr-10 focus:border-ui-focus focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-ui-content-muted hover:text-ui-content-secondary cursor-pointer"
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block font-semibold text-ui-content-secondary mb-1">{t('confirmPassword')} *</label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-type new password"
              className="w-full rounded-md border border-ui-stroke-default py-2 pl-3 pr-10 focus:border-ui-focus focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-ui-content-muted hover:text-ui-content-secondary cursor-pointer"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full bg-ui-action-bg hover:bg-ui-action-hover text-white font-semibold py-2 px-4 rounded-md shadow-xs cursor-pointer"
          >
            {t('updatePassword')}
          </button>
        </div>
      </form>
    </div>
  );
};
