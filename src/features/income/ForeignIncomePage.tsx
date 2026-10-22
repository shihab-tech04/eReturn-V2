import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ForeignIncomeEntry } from '../../types';
import { AmountInput } from '../../components/common/AmountInput';
import { SearchableSelect } from '../../components/common/SearchableSelect';
import { StepNavigationButtons } from '../../components/common/StepNavigationButtons';
import { formatBDT } from '../../i18n/formatters';
import { Plus, Trash2, Edit2, Check, X, Globe2 } from 'lucide-react';

const STANDARD_COUNTRIES = [
  'United States (USA)',
  'United Kingdom (UK)',
  'United Arab Emirates (UAE)',
  'Saudi Arabia (KSA)',
  'Canada',
  'Australia',
  'Singapore',
  'Malaysia',
  'Germany',
  'Japan',
  'Qatar',
  'Kuwait',
  'Oman',
  'Netherlands',
  'Sweden',
  'Switzerland',
  'India',
  'China',
  'Other Country',
];

export const ForeignIncomePage: React.FC = () => {
  const { language, t, income, setIncome, askConfirmation } = useApp();
  const [isEditing, setIsEditing] = useState(false);

  const [currentEntry, setCurrentEntry] = useState<ForeignIncomeEntry>({
    id: '',
    country: 'United States (USA)',
    natureOfIncome: '',
    amountForeignCurrency: 0,
    exchangeRate: 120,
    amountInBDT: 0,
    taxPaidAbroadBDT: 0,
    creditClaimed: 0,
  });

  const handleOpenAdd = () => {
    setCurrentEntry({
      id: `for-${Date.now()}`,
      country: 'United States (USA)',
      natureOfIncome: '',
      amountForeignCurrency: 0,
      exchangeRate: 120,
      amountInBDT: 0,
      taxPaidAbroadBDT: 0,
      creditClaimed: 0,
    });
    setIsEditing(true);
  };

  const handleEdit = (entry: ForeignIncomeEntry) => {
    setCurrentEntry(entry);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!currentEntry.natureOfIncome.trim()) {
      alert('Please specify nature of foreign income.');
      return;
    }
    const bdt =
      currentEntry.amountInBDT > 0
        ? currentEntry.amountInBDT
        : Math.round((currentEntry.amountForeignCurrency || 0) * (currentEntry.exchangeRate || 1));

    const finalized = { ...currentEntry, amountInBDT: bdt };

    setIncome((prev) => {
      const exists = prev.foreignIncomeEntries.some((e) => e.id === finalized.id);
      return {
        ...prev,
        foreignIncomeEntries: exists
          ? prev.foreignIncomeEntries.map((e) => (e.id === finalized.id ? finalized : e))
          : [...prev.foreignIncomeEntries, finalized],
      };
    });
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    askConfirmation({
      title: 'Remove Foreign Income Entry',
      message: 'Are you sure you want to remove this foreign income entry?',
      isDestructive: true,
      onConfirm: () => {
        setIncome((prev) => ({
          ...prev,
          foreignIncomeEntries: prev.foreignIncomeEntries.filter((e) => e.id !== id),
        }));
      },
    });
  };

  const totalNet = income.foreignIncomeEntries.reduce((s, e) => s + e.amountInBDT, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-purple-700" />
            <h2 className="text-xl font-bold text-ui-content-primary">{t('catForeign')}</h2>
          </div>
          <p className="text-xs text-ui-content-muted mt-1">
            Reference route: <code className="font-mono bg-ui-surface-subtle px-1 py-0.5 rounded">#/user-panel/foreign-income</code>
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 bg-ui-action-bg hover:bg-ui-action-hover text-white text-xs font-semibold px-3 py-2 rounded-md shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {language === 'bn' ? 'বৈদেশিক আয় যোগ করুন' : 'Add Foreign Income'}
          </button>
        )}
      </div>

      {isEditing && (
        <div className="bg-ui-surface rounded-xl border border-emerald-300 shadow-md p-6 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-ui-stroke-subtle pb-2">
            <h3 className="text-sm font-bold text-ui-content-primary">
              {currentEntry.id ? 'Edit Foreign Income' : 'Add Foreign Income'}
            </h3>
            <button type="button" onClick={() => setIsEditing(false)} className="text-ui-content-muted hover:text-ui-content-secondary">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ui-content-secondary mb-1">Country of Source *</label>
                <SearchableSelect
                  options={STANDARD_COUNTRIES}
                  value={currentEntry.country}
                  onChange={(val) => setCurrentEntry((p) => ({ ...p, country: val }))}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ui-content-secondary mb-1">Nature of Income *</label>
                <input
                  type="text"
                  value={currentEntry.natureOfIncome}
                  onChange={(e) => setCurrentEntry((p) => ({ ...p, natureOfIncome: e.target.value }))}
                  placeholder="e.g. Remote Software Consultancy / Overseas Dividends"
                  className="w-full rounded-md border border-ui-stroke-default py-1.5 px-3 text-xs focus:border-ui-focus focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-ui-content-secondary mb-1">Foreign Currency Amount</label>
                <AmountInput
                  value={currentEntry.amountForeignCurrency}
                  onChange={(v) =>
                    setCurrentEntry((p) => ({
                      ...p,
                      amountForeignCurrency: v,
                      amountInBDT: Math.round(v * p.exchangeRate),
                    }))
                  }
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-xs text-ui-content-secondary mb-1">Exchange Rate to BDT</label>
                <input
                  type="number"
                  value={currentEntry.exchangeRate}
                  onChange={(e) => {
                    const rate = parseFloat(e.target.value) || 1;
                    setCurrentEntry((p) => ({
                      ...p,
                      exchangeRate: rate,
                      amountInBDT: Math.round(p.amountForeignCurrency * rate),
                    }));
                  }}
                  className="w-full rounded-md border border-ui-stroke-default py-1.5 px-3 text-xs focus:border-ui-focus focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-ui-content-secondary mb-1">Converted Amount in BDT</label>
                <AmountInput
                  value={currentEntry.amountInBDT}
                  onChange={(v) => setCurrentEntry((p) => ({ ...p, amountInBDT: v }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs text-ui-content-secondary mb-1">Tax Paid Abroad (in BDT)</label>
                <AmountInput
                  value={currentEntry.taxPaidAbroadBDT}
                  onChange={(v) => setCurrentEntry((p) => ({ ...p, taxPaidAbroadBDT: v }))}
                />
              </div>

              <div>
                <label className="block text-xs text-ui-content-secondary mb-1">Double Taxation Relief Claimed</label>
                <AmountInput
                  value={currentEntry.creditClaimed}
                  onChange={(v) => setCurrentEntry((p) => ({ ...p, creditClaimed: v }))}
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
            {language === 'bn' ? 'বৈদেশিক আয়ের তালিকা' : 'Declared Foreign Income Records'}
          </h3>
          <span className="font-mono font-bold text-xs text-ui-accent">
            {t('total')}: {formatBDT(totalNet, language)}
          </span>
        </div>

        {income.foreignIncomeEntries.length === 0 ? (
          <div className="p-8 text-center text-xs text-ui-content-muted">
            {t('noRecordsFound')}. Click "Add Foreign Income" to declare earnings outside Bangladesh.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {income.foreignIncomeEntries.map((entry) => (
              <div key={entry.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-ui-surface-subtle">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-ui-content-primary">{entry.country}</div>
                  <div className="text-xs text-ui-content-secondary">{entry.natureOfIncome}</div>
                  <div className="text-[11px] text-ui-content-muted font-mono">
                    Foreign: {entry.amountForeignCurrency} @ {entry.exchangeRate} • Tax Paid Abroad: {formatBDT(entry.taxPaidAbroadBDT, language)}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-ui-content-muted block">Total BDT:</span>
                    <span className="text-sm font-bold font-mono text-ui-content-primary">
                      {formatBDT(entry.amountInBDT, language)}
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
