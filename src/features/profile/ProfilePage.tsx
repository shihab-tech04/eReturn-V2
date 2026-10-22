import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserCheck, RefreshCw, Save, CheckCircle2 } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { language, t, profile, setProfile } = useApp();
  const [formData, setFormData] = useState(profile);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handleSync = () => {
    setIsSyncing(true);
    setSyncMessage(null);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncMessage('eTIN Central Registry verified: TIN status Active (Circle 072, Zone 04 Dhaka).');
    }, 1000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(formData);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-ui-accent" />
            <h2 className="text-xl font-bold text-ui-content-primary">{t('profileTitle')}</h2>
          </div>
          <p className="text-xs text-ui-content-muted mt-1">{t('profileSubtitle')}</p>
        </div>

        <button
          type="button"
          disabled={isSyncing}
          onClick={handleSync}
          className="inline-flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-3.5 py-2 rounded-md shadow-xs cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : t('syncWithEtin')}</span>
        </button>
      </div>

      {syncMessage && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-lg p-3 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0" />
          <span>{syncMessage}</span>
        </div>
      )}

      {showSavedToast && (
        <div className="bg-ui-accent-soft border border-ui-accent-border text-ui-content-primary rounded-lg p-3 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-ui-accent shrink-0" />
          <span>Taxpayer profile saved successfully in local session.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Identity & Statutory Parameters (Read Only from eTIN) */}
        <div className="bg-ui-surface rounded-xl border border-ui-stroke-subtle shadow-xs p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ui-accent border-b border-ui-stroke-subtle pb-2">
            Taxpayer Identification & Legal Entity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-ui-content-muted mb-1">TIN (12-Digit)</label>
              <input
                type="text"
                value={formData.tin}
                disabled
                className="w-full rounded-md border border-ui-stroke-subtle bg-ui-surface-subtle py-1.5 px-3 font-mono font-bold text-ui-content-primary"
              />
            </div>

            <div>
              <label className="block text-ui-content-muted mb-1">National ID (NID)</label>
              <input
                type="text"
                value={formData.nid}
                disabled
                className="w-full rounded-md border border-ui-stroke-subtle bg-ui-surface-subtle py-1.5 px-3 font-mono text-ui-content-primary"
              />
            </div>

            <div>
              <label className="block text-ui-content-muted mb-1">Taxpayer Status</label>
              <input
                type="text"
                value={formData.status}
                disabled
                className="w-full rounded-md border border-ui-stroke-subtle bg-ui-surface-subtle py-1.5 px-3 text-ui-content-primary font-semibold"
              />
            </div>

            <div>
              <label className="block text-ui-content-muted mb-1">Taxes Zone</label>
              <input
                type="text"
                value={formData.taxesZone}
                disabled
                className="w-full rounded-md border border-ui-stroke-subtle bg-ui-surface-subtle py-1.5 px-3 text-ui-content-primary"
              />
            </div>

            <div>
              <label className="block text-ui-content-muted mb-1">Taxes Circle</label>
              <input
                type="text"
                value={formData.taxesCircle}
                disabled
                className="w-full rounded-md border border-ui-stroke-subtle bg-ui-surface-subtle py-1.5 px-3 text-ui-content-primary"
              />
            </div>

            <div>
              <label className="block text-ui-content-muted mb-1">Date of Birth</label>
              <input
                type="text"
                value={formData.dob}
                disabled
                className="w-full rounded-md border border-ui-stroke-subtle bg-ui-surface-subtle py-1.5 px-3 text-ui-content-primary font-mono"
              />
            </div>
          </div>
        </div>

        {/* Personal & Family Particulars */}
        <div className="bg-ui-surface rounded-xl border border-ui-stroke-subtle shadow-xs p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ui-content-secondary border-b border-ui-stroke-subtle pb-2">
            Personal & Family Particulars
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-ui-content-secondary mb-1">Full Name (English)</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                className="w-full rounded-md border border-ui-stroke-default py-1.5 px-3 focus:border-ui-focus focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-ui-content-secondary mb-1">পূর্ণ নাম (বাংলা)</label>
              <input
                type="text"
                value={formData.nameBn}
                onChange={(e) => setFormData((p) => ({ ...p, nameBn: e.target.value }))}
                className="w-full rounded-md border border-ui-stroke-default py-1.5 px-3 focus:border-ui-focus focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-ui-content-secondary mb-1">Father's Name</label>
              <input
                type="text"
                value={formData.fatherName}
                onChange={(e) => setFormData((p) => ({ ...p, fatherName: e.target.value }))}
                className="w-full rounded-md border border-ui-stroke-default py-1.5 px-3 focus:border-ui-focus focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-ui-content-secondary mb-1">Mother's Name</label>
              <input
                type="text"
                value={formData.motherName}
                onChange={(e) => setFormData((p) => ({ ...p, motherName: e.target.value }))}
                className="w-full rounded-md border border-ui-stroke-default py-1.5 px-3 focus:border-ui-focus focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-ui-content-secondary mb-1">Spouse Name</label>
              <input
                type="text"
                value={formData.spouseName}
                onChange={(e) => setFormData((p) => ({ ...p, spouseName: e.target.value }))}
                className="w-full rounded-md border border-ui-stroke-default py-1.5 px-3 focus:border-ui-focus focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-ui-content-secondary mb-1">Spouse TIN (if any)</label>
              <input
                type="text"
                value={formData.spouseTin}
                onChange={(e) => setFormData((p) => ({ ...p, spouseTin: e.target.value }))}
                placeholder="e.g. 5421-9876-3142"
                className="w-full rounded-md border border-ui-stroke-default py-1.5 px-3 font-mono focus:border-ui-focus focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Contact & Correspondence */}
        <div className="bg-ui-surface rounded-xl border border-ui-stroke-subtle shadow-xs p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ui-content-secondary border-b border-ui-stroke-subtle pb-2">
            Contact & Address Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-ui-content-secondary mb-1">Mobile Number</label>
              <input
                type="text"
                value={formData.mobile}
                onChange={(e) => setFormData((p) => ({ ...p, mobile: e.target.value }))}
                className="w-full rounded-md border border-ui-stroke-default py-1.5 px-3 font-mono focus:border-ui-focus focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-ui-content-secondary mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                className="w-full rounded-md border border-ui-stroke-default py-1.5 px-3 focus:border-ui-focus focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-ui-content-secondary mb-1">Current Present Address</label>
              <input
                type="text"
                value={formData.currentAddress}
                onChange={(e) => setFormData((p) => ({ ...p, currentAddress: e.target.value }))}
                className="w-full rounded-md border border-ui-stroke-default py-1.5 px-3 focus:border-ui-focus focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-ui-content-secondary mb-1">Permanent Address</label>
              <input
                type="text"
                value={formData.permanentAddress}
                onChange={(e) => setFormData((p) => ({ ...p, permanentAddress: e.target.value }))}
                className="w-full rounded-md border border-ui-stroke-default py-1.5 px-3 focus:border-ui-focus focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 bg-ui-action-bg hover:bg-ui-action-hover text-white font-semibold py-2 px-4 rounded-md text-xs shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
