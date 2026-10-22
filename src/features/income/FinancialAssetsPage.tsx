import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FinancialAssetEntry, FinancialAssetType } from '../../types';
import { AmountInput } from '../../components/common/AmountInput';
import { SearchableSelect } from '../../components/common/SearchableSelect';
import { StepNavigationButtons } from '../../components/common/StepNavigationButtons';
import { formatBDT } from '../../i18n/formatters';
import { Plus, Trash2, Edit2, Check, X, Landmark } from 'lucide-react';

const ASSET_TYPES: FinancialAssetType[] = [
  'Interest / Profit on Savings Certificates (Sanchayapatra)',
  'Profit / Dividend from Stock / Shares / Mutual Funds',
  'Interest from Bank Fixed Deposit (FDR) / Term Deposit',
  'Interest from Savings Bank Account / Special Deposit',
  'Profit from Islamic Banking / Mudaraba Deposit',
  'Interest on Debentures / Bonds / Securities',
  'Other Financial Assets',
];

export const FinancialAssetsPage: React.FC = () => {
  const { language, t, income, setIncome, askConfirmation } = useApp();
  const [isEditing, setIsEditing] = useState(false);

  const [currentEntry, setCurrentEntry] = useState<FinancialAssetEntry>({
    id: '',
    assetType: 'Interest / Profit on Savings Certificates (Sanchayapatra)',
    institutionName: '',
    accountOrCertificateNo: '',
    grossAmount: 0,
    taxDeductedAtSource: 0,
    exemptedAmount: 0,
    netTaxableAmount: 0,
  });

  const handleOpenAdd = () => {
    setCurrentEntry({
      id: `fin-${Date.now()}`,
      assetType: 'Interest / Profit on Savings Certificates (Sanchayapatra)',
      institutionName: '',
      accountOrCertificateNo: '',
      grossAmount: 0,
      taxDeductedAtSource: 0,
      exemptedAmount: 0,
      netTaxableAmount: 0,
    });
    setIsEditing(true);
  };

  const handleEdit = (entry: FinancialAssetEntry) => {
    setCurrentEntry(entry);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!currentEntry.institutionName.trim()) {
      alert('Please enter Institution / Bank name.');
      return;
    }
    const net = Math.max(0, (currentEntry.grossAmount || 0) - (currentEntry.exemptedAmount || 0));
    const finalized = { ...currentEntry, netTaxableAmount: net };

    setIncome((prev) => {
      const exists = prev.financialAssetEntries.some((e) => e.id === finalized.id);
      return {
        ...prev,
        financialAssetEntries: exists
          ? prev.financialAssetEntries.map((e) => (e.id === finalized.id ? finalized : e))
          : [...prev.financialAssetEntries, finalized],
      };
    });
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    askConfirmation({
      title: 'Remove Financial Asset',
      message: 'Are you sure you want to delete this financial asset record?',
      isDestructive: true,
      onConfirm: () => {
        setIncome((prev) => ({
          ...prev,
          financialAssetEntries: prev.financialAssetEntries.filter((e) => e.id !== id),
        }));
      },
    });
  };

  const totalNet = income.financialAssetEntries.reduce((s, e) => s + e.netTaxableAmount, 0);
  const totalTDS = income.financialAssetEntries.reduce((s, e) => s + e.taxDeductedAtSource, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-ui-accent" />
            <h2 className="text-xl font-bold text-ui-content-primary">{t('finTitle')}</h2>
          </div>
          <p className="text-xs text-ui-content-muted mt-1">
            Reference route: <code className="font-mono bg-ui-surface-subtle px-1 py-0.5 rounded">#/user-panel/financial-assets</code>
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 bg-ui-action-bg hover:bg-ui-action-hover text-white text-xs font-semibold px-3 py-2 rounded-md shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {language === 'bn' ? 'আর্থিক পরিসম্পদ যোগ করুন' : 'Add Financial Asset'}
          </button>
        )}
      </div>

      {isEditing && (
        <div className="bg-ui-surface rounded-xl border border-emerald-300 shadow-md p-6 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-ui-stroke-subtle pb-2">
            <h3 className="text-sm font-bold text-ui-content-primary">
              {currentEntry.id ? 'Edit Financial Asset' : 'New Financial Asset'}
            </h3>
            <button type="button" onClick={() => setIsEditing(false)} className="text-ui-content-muted hover:text-ui-content-secondary">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ui-content-secondary mb-1">
                {t('finAssetType')} (7 Standard Choices)
              </label>
              <SearchableSelect
                options={ASSET_TYPES}
                value={currentEntry.assetType}
                onChange={(val) => setCurrentEntry((p) => ({ ...p, assetType: val as FinancialAssetType }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ui-content-secondary mb-1">
                  {t('institutionName')} *
                </label>
                <input
                  type="text"
                  value={currentEntry.institutionName}
                  onChange={(e) => setCurrentEntry((p) => ({ ...p, institutionName: e.target.value }))}
                  placeholder="e.g. Sonali Bank PLC / National Savings Bureau"
                  className="w-full rounded-md border border-ui-stroke-default py-1.5 px-3 text-xs focus:border-ui-focus focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ui-content-secondary mb-1">
                  {t('accountOrCertNo')}
                </label>
                <input
                  type="text"
                  value={currentEntry.accountOrCertificateNo}
                  onChange={(e) => setCurrentEntry((p) => ({ ...p, accountOrCertificateNo: e.target.value }))}
                  placeholder="e.g. SC-849201 / FDR-0029"
                  className="w-full rounded-md border border-ui-stroke-default py-1.5 px-3 text-xs focus:border-ui-focus focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-ui-content-secondary mb-1">{t('grossReceived')}</label>
                <AmountInput
                  value={currentEntry.grossAmount}
                  onChange={(v) => setCurrentEntry((p) => ({ ...p, grossAmount: v }))}
                />
              </div>
              <div>
                <label className="block text-xs text-ui-content-secondary mb-1">{t('tdsAmount')}</label>
                <AmountInput
                  value={currentEntry.taxDeductedAtSource}
                  onChange={(v) => setCurrentEntry((p) => ({ ...p, taxDeductedAtSource: v }))}
                />
              </div>
              <div>
                <label className="block text-xs text-ui-content-secondary mb-1">{t('statutoryExempt')}</label>
                <AmountInput
                  value={currentEntry.exemptedAmount}
                  onChange={(v) => setCurrentEntry((p) => ({ ...p, exemptedAmount: v }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-ui-stroke-subtle">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 border border-ui-stroke-default rounded-md text-xs font-medium text-ui-content-secondary hover:bg-ui-surface-subtle"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 bg-ui-action-bg hover:bg-ui-action-hover text-white px-4 py-1.5 rounded-md text-xs font-medium"
              >
                <Check className="w-3.5 h-3.5" />
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-ui-surface rounded-xl border border-ui-stroke-subtle shadow-xs overflow-hidden">
        <div className="p-4 border-b border-ui-stroke-subtle flex items-center justify-between">
          <h3 className="text-sm font-bold text-ui-content-primary">
            {language === 'bn' ? 'আর্থিক পরিসম্পদের তালিকা' : 'Financial Assets Declared'}
          </h3>
          <div className="text-xs space-x-3">
            <span className="text-ui-content-muted font-mono">TDS Credit: {formatBDT(totalTDS, language)}</span>
            <span className="font-mono font-bold text-ui-accent">{t('total')}: {formatBDT(totalNet, language)}</span>
          </div>
        </div>

        {income.financialAssetEntries.length === 0 ? (
          <div className="p-8 text-center text-xs text-ui-content-muted">
            {t('noRecordsFound')}. Click "Add Financial Asset" to record savings certificates, FDRs, dividends, or interest.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {income.financialAssetEntries.map((entry) => (
              <div key={entry.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-ui-surface-subtle">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-ui-content-primary">{entry.assetType}</div>
                  <div className="text-xs text-ui-content-secondary">
                    {entry.institutionName} {entry.accountOrCertificateNo && `(${entry.accountOrCertificateNo})`}
                  </div>
                  <div className="text-[11px] text-ui-content-muted font-mono">
                    Gross: {formatBDT(entry.grossAmount, language)} • TDS Deducted: {formatBDT(entry.taxDeductedAtSource, language)}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-ui-content-muted block">Net Taxable:</span>
                    <span className="text-sm font-bold font-mono text-ui-content-primary">
                      {formatBDT(entry.netTaxableAmount, language)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleEdit(entry)}
                      className="p-1.5 text-ui-content-muted hover:text-ui-accent hover:bg-ui-accent-soft rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(entry.id)}
                      className="p-1.5 text-ui-content-muted hover:text-red-700 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <StepNavigationButtons
        backPath="/user-panel/income"
        nextPath="/user-panel/income"
        nextLabel="Done (Back to Income)"
      />
    </div>
  );
};
