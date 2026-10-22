import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TaxExemptedEntry, TaxExemptionType } from '../../types';
import { AmountInput } from '../../components/common/AmountInput';
import { SearchableSelect } from '../../components/common/SearchableSelect';
import { StepNavigationButtons } from '../../components/common/StepNavigationButtons';
import { formatBDT } from '../../i18n/formatters';
import { Plus, Trash2, Edit2, Check, X, ShieldAlert, AlertCircle } from 'lucide-react';

const EXEMPTION_TYPES: TaxExemptionType[] = [
  'Agricultural Income Exemption (statutory limit)',
  'Information Technology Enabled Services (ITES) Exemption',
  'Remittance / Foreign Inward Remittance Exemption',
  'Gratuity / Pension from Government / Recognized Fund',
  'Dividend Exemption up to statutory limit',
  'Income of Charitable / Religious Institutions',
  'Wage Earners\' Inward Remittance',
  'Software Development & Cloud Services',
  'Export of Handicrafts Exemption',
  'Income from Poultry / Fishery Exemption',
  'Other Statutory Exemptions (Sixth Schedule)',
];

export const TaxExemptedPage: React.FC = () => {
  const { language, t, income, setIncome, askConfirmation } = useApp();
  const [isEditing, setIsEditing] = useState(false);

  const [currentEntry, setCurrentEntry] = useState<TaxExemptedEntry>({
    id: '',
    exemptionType: 'Wage Earners\' Inward Remittance',
    particulars: '',
    amount: 0,
    statutoryReference: 'Sixth Schedule, Part 1',
  });

  const handleOpenAdd = () => {
    setCurrentEntry({
      id: `ex-${Date.now()}`,
      exemptionType: 'Wage Earners\' Inward Remittance',
      particulars: '',
      amount: 0,
      statutoryReference: 'Sixth Schedule, Part 1',
    });
    setIsEditing(true);
  };

  const handleEdit = (entry: TaxExemptedEntry) => {
    setCurrentEntry(entry);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!currentEntry.particulars.trim()) {
      alert('Please enter particulars of the tax exemption.');
      return;
    }
    setIncome((prev) => {
      const exists = prev.taxExemptedEntries.some((e) => e.id === currentEntry.id);
      return {
        ...prev,
        taxExemptedEntries: exists
          ? prev.taxExemptedEntries.map((e) => (e.id === currentEntry.id ? currentEntry : e))
          : [...prev.taxExemptedEntries, currentEntry],
      };
    });
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    askConfirmation({
      title: 'Remove Tax-Exempted Income Entry',
      message: 'Are you sure you want to remove this exemption line?',
      isDestructive: true,
      onConfirm: () => {
        setIncome((prev) => ({
          ...prev,
          taxExemptedEntries: prev.taxExemptedEntries.filter((e) => e.id !== id),
        }));
      },
    });
  };

  const totalExempt = income.taxExemptedEntries.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-blue-700" />
            <h2 className="text-xl font-bold text-ui-content-primary">
              {language === 'bn' ? 'করমুক্ত আয়ের বিবরণী' : 'Tax-Exempted Income (Sixth Schedule)'}
            </h2>
          </div>
          <p className="text-xs text-ui-content-muted mt-1">
            Reference route: <code className="font-mono bg-ui-surface-subtle px-1 py-0.5 rounded">#/user-panel/tax-exempted-income</code>
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 bg-ui-action-bg hover:bg-ui-action-hover text-white text-xs font-semibold px-3 py-2 rounded-md shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {language === 'bn' ? 'করমুক্ত আয় যোগ করুন' : 'Add Tax-Exempt Income'}
          </button>
        )}
      </div>

      {/* Statutory Guidance Warning */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5 flex items-start gap-2.5 text-xs text-blue-900">
        <AlertCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {language === 'bn'
            ? 'সতর্কতা: শুধুমাত্র শ্রেণী নির্বাচনের মাধ্যমে সংবিধিবদ্ধ কর অব্যাহতি স্বত্বাধিকার সৃষ্টি করে না। সংশ্লিষ্ট ব্যাংকিং প্রমাণক ও ষষ্ঠ তফসিলের শর্তাবলি পালন নিশ্চিত করতে হবে।'
            : 'Statutory Notice: Selection of exemption category does not automatically grant legal immunity. Taxpayer must retain banking proceeds encashment certificates and comply with Sixth Schedule conditions.'}
        </p>
      </div>

      {isEditing && (
        <div className="bg-ui-surface rounded-xl border border-emerald-300 shadow-md p-6 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-ui-stroke-subtle pb-2">
            <h3 className="text-sm font-bold text-ui-content-primary">
              {currentEntry.id ? 'Edit Tax-Exempt Income' : 'Add Tax-Exempt Income'}
            </h3>
            <button type="button" onClick={() => setIsEditing(false)} className="text-ui-content-muted hover:text-ui-content-secondary">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ui-content-secondary mb-1">
                Exemption Category (11 Observed Types)
              </label>
              <SearchableSelect
                options={EXEMPTION_TYPES}
                value={currentEntry.exemptionType}
                onChange={(val) => setCurrentEntry((p) => ({ ...p, exemptionType: val as TaxExemptionType }))}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ui-content-secondary mb-1">Particulars / Source *</label>
              <input
                type="text"
                value={currentEntry.particulars}
                onChange={(e) => setCurrentEntry((p) => ({ ...p, particulars: e.target.value }))}
                placeholder="e.g. Inward Remittance from Brother abroad via Sonali Bank"
                className="w-full rounded-md border border-ui-stroke-default py-1.5 px-3 text-xs focus:border-ui-focus focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-ui-content-secondary mb-1">Amount (BDT)</label>
                <AmountInput
                  value={currentEntry.amount}
                  onChange={(v) => setCurrentEntry((p) => ({ ...p, amount: v }))}
                />
              </div>

              <div>
                <label className="block text-xs text-ui-content-secondary mb-1">Statutory Clause / Reference</label>
                <input
                  type="text"
                  value={currentEntry.statutoryReference}
                  onChange={(e) => setCurrentEntry((p) => ({ ...p, statutoryReference: e.target.value }))}
                  placeholder="e.g. Sixth Schedule, Part 1, Para 18"
                  className="w-full rounded-md border border-ui-stroke-default py-1.5 px-3 text-xs focus:border-ui-focus focus:outline-none"
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
            {language === 'bn' ? 'প্রদর্শিত করমুক্ত আয়ের তালিকা' : 'Declared Tax-Exempt Incomes'}
          </h3>
          <span className="font-mono font-bold text-xs text-blue-800">
            {t('total')}: {formatBDT(totalExempt, language)}
          </span>
        </div>

        {income.taxExemptedEntries.length === 0 ? (
          <div className="p-8 text-center text-xs text-ui-content-muted">
            {t('noRecordsFound')}. Click "Add Tax-Exempt Income" to record exempt remittances, gratuities, or ITES earnings.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {income.taxExemptedEntries.map((entry) => (
              <div key={entry.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-ui-surface-subtle">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-ui-content-primary">{entry.exemptionType}</div>
                  <div className="text-xs text-ui-content-secondary">{entry.particulars}</div>
                  <div className="text-[11px] text-ui-content-muted">Ref: {entry.statutoryReference}</div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-ui-content-muted block">Exempted Amount:</span>
                    <span className="text-sm font-bold font-mono text-blue-900">
                      {formatBDT(entry.amount, language)}
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
