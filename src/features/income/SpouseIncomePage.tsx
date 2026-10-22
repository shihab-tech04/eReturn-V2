import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SpouseMinorIncomeEntry } from '../../types';
import { AmountInput } from '../../components/common/AmountInput';
import { StepNavigationButtons } from '../../components/common/StepNavigationButtons';
import { formatBDT } from '../../i18n/formatters';
import { Plus, Trash2, Edit2, Check, X, HeartHandshake } from 'lucide-react';

export const SpouseIncomePage: React.FC = () => {
  const { language, t, income, setIncome, askConfirmation } = useApp();
  const [isEditing, setIsEditing] = useState(false);

  const [currentEntry, setCurrentEntry] = useState<SpouseMinorIncomeEntry>({
    id: '',
    relationship: 'Spouse',
    name: '',
    nidOrBirthCert: '',
    natureOfIncome: '',
    grossIncome: 0,
    exemptedAmount: 0,
    netIncome: 0,
  });

  const handleOpenAdd = () => {
    setCurrentEntry({
      id: `sp-${Date.now()}`,
      relationship: 'Spouse',
      name: '',
      nidOrBirthCert: '',
      natureOfIncome: '',
      grossIncome: 0,
      exemptedAmount: 0,
      netIncome: 0,
    });
    setIsEditing(true);
  };

  const handleEdit = (entry: SpouseMinorIncomeEntry) => {
    setCurrentEntry(entry);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!currentEntry.name.trim()) {
      alert('Please enter Name of Spouse / Dependent Child.');
      return;
    }
    const net = Math.max(0, (currentEntry.grossIncome || 0) - (currentEntry.exemptedAmount || 0));
    const finalized = { ...currentEntry, netIncome: net };

    setIncome((prev) => {
      const exists = prev.spouseMinorEntries.some((e) => e.id === finalized.id);
      return {
        ...prev,
        spouseMinorEntries: exists
          ? prev.spouseMinorEntries.map((e) => (e.id === finalized.id ? finalized : e))
          : [...prev.spouseMinorEntries, finalized],
      };
    });
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    askConfirmation({
      title: 'Remove Spouse / Dependent Child Income Entry',
      message: 'Are you sure you want to delete this record?',
      isDestructive: true,
      onConfirm: () => {
        setIncome((prev) => ({
          ...prev,
          spouseMinorEntries: prev.spouseMinorEntries.filter((e) => e.id !== id),
        }));
      },
    });
  };

  const totalNet = income.spouseMinorEntries.reduce((s, e) => s + e.netIncome, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-purple-700" />
            <h2 className="text-xl font-bold text-ui-content-primary">{t('catSpouseMinor')}</h2>
          </div>
          <p className="text-xs text-ui-content-muted mt-1">
            Reference route: <code className="font-mono bg-ui-surface-subtle px-1 py-0.5 rounded">#/user-panel/spouse-income</code>
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 bg-ui-action-bg hover:bg-ui-action-hover text-white text-xs font-semibold px-3 py-2 rounded-md shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {language === 'bn' ? 'আরেকজন যুক্ত করুন' : 'Add Dependent Income'}
          </button>
        )}
      </div>

      {isEditing && (
        <div className="bg-ui-surface rounded-xl border border-emerald-300 shadow-md p-6 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-ui-stroke-subtle pb-2">
            <h3 className="text-sm font-bold text-ui-content-primary">
              {currentEntry.id ? 'Edit Spouse / Child Income' : 'Add Spouse / Child Income'}
            </h3>
            <button type="button" onClick={() => setIsEditing(false)} className="text-ui-content-muted hover:text-ui-content-secondary">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ui-content-secondary mb-2">
                Relationship (3 Observed Choices)
              </label>
              <div className="flex items-center gap-6">
                {(['Spouse', 'Daughter', 'Son'] as const).map((rel) => (
                  <label key={rel} className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-ui-content-primary">
                    <input
                      type="radio"
                      name="relationship"
                      value={rel}
                      checked={currentEntry.relationship === rel}
                      onChange={() => setCurrentEntry((p) => ({ ...p, relationship: rel }))}
                      className="text-ui-accent h-4 w-4"
                    />
                    <span>{rel}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ui-content-secondary mb-1">Full Name *</label>
                <input
                  type="text"
                  value={currentEntry.name}
                  onChange={(e) => setCurrentEntry((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Nasrin Sultana"
                  className="w-full rounded-md border border-ui-stroke-default py-1.5 px-3 text-xs focus:border-ui-focus focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ui-content-secondary mb-1">NID or Birth Certificate No.</label>
                <input
                  type="text"
                  value={currentEntry.nidOrBirthCert}
                  onChange={(e) => setCurrentEntry((p) => ({ ...p, nidOrBirthCert: e.target.value }))}
                  placeholder="e.g. 19882691234567890"
                  className="w-full rounded-md border border-ui-stroke-default py-1.5 px-3 text-xs focus:border-ui-focus focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ui-content-secondary mb-1">Nature of Income</label>
              <input
                type="text"
                value={currentEntry.natureOfIncome}
                onChange={(e) => setCurrentEntry((p) => ({ ...p, natureOfIncome: e.target.value }))}
                placeholder="e.g. Profit from Bank Savings Account / Sanchayapatra in Minor's name"
                className="w-full rounded-md border border-ui-stroke-default py-1.5 px-3 text-xs focus:border-ui-focus focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs text-ui-content-secondary mb-1">Gross Income (BDT)</label>
                <AmountInput
                  value={currentEntry.grossIncome}
                  onChange={(v) => setCurrentEntry((p) => ({ ...p, grossIncome: v }))}
                />
              </div>

              <div>
                <label className="block text-xs text-ui-content-secondary mb-1">Exempted Portion (BDT)</label>
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
            {language === 'bn' ? 'স্ত্রী / সন্তানের আয়ের তালিকা' : 'Declared Spouse / Child Incomes'}
          </h3>
          <span className="font-mono font-bold text-xs text-ui-accent">
            {t('total')}: {formatBDT(totalNet, language)}
          </span>
        </div>

        {income.spouseMinorEntries.length === 0 ? (
          <div className="p-8 text-center text-xs text-ui-content-muted">
            {t('noRecordsFound')}. Click "Add Dependent Income" to declare unassessed dependent incomes.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {income.spouseMinorEntries.map((entry) => (
              <div key={entry.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-ui-surface-subtle">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-ui-content-primary">{entry.name}</span>
                    <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded font-medium">
                      {entry.relationship}
                    </span>
                  </div>
                  <div className="text-xs text-ui-content-secondary">{entry.natureOfIncome || 'Unspecified'}</div>
                  <div className="text-[11px] text-ui-content-muted font-mono">
                    NID/BRN: {entry.nidOrBirthCert || 'N/A'} • Gross: {formatBDT(entry.grossIncome, language)}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-ui-content-muted block">Net Attributed:</span>
                    <span className="text-sm font-bold font-mono text-ui-content-primary">
                      {formatBDT(entry.netIncome, language)}
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
