import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export const ChangePasswordPage: React.FC = () => {
  const { language, t } = useApp();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Defense in depth: no client-only credential mutation or simulated success.
    setStatusMessage(language === 'bn'
      ? 'নিরাপদ অ্যাকাউন্ট সেবা সংযুক্ত না থাকায় পাসওয়ার্ড পরিবর্তন করা যাচ্ছে না।'
      : 'Password update unavailable: no verified authenticated account service is connected.');
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

      <div id="password-unavailable-note" role="status" className="bg-amber-50 border border-amber-300 text-amber-950 rounded-lg p-3 text-xs">
        {language === 'bn'
          ? 'পাসওয়ার্ড পরিবর্তনের জন্য যাচাইকৃত অ্যাকাউন্ট সেবা প্রয়োজন। এই পৃষ্ঠায় কোনো পাসওয়ার্ড সংরক্ষণ বা পরিবর্তন করা হয় না।'
          : 'Password changes require a verified account service. This page does not save or change passwords.'}
      </div>
      {statusMessage && <div role="alert" className="bg-red-50 border border-red-200 text-red-900 rounded-lg p-3 text-xs">
        <AlertCircle className="inline-block w-4 h-4 mr-2" />{statusMessage}
      </div>}

      <form onSubmit={handleSubmit} className="bg-ui-surface rounded-xl border border-ui-stroke-subtle shadow-xs p-6 space-y-4 text-xs">
        {/* Old Password */}
        <div>
          <label className="block font-semibold text-ui-content-secondary mb-1">{t('oldPassword')} *</label>
          <div className="relative">
            <input
              type={showOld ? 'text' : 'password'}
              disabled
              aria-describedby="password-unavailable-note"
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
              disabled
              aria-describedby="password-unavailable-note"
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
              disabled
              aria-describedby="password-unavailable-note"
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
            disabled
            aria-disabled="true"
            className="w-full bg-ui-action-bg hover:bg-ui-action-hover text-white font-semibold py-2 px-4 rounded-md shadow-xs cursor-pointer"
          >
            {t('updatePassword')}
          </button>
        </div>
      </form>
    </div>
  );
};
