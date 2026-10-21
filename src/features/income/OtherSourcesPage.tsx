import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OtherIncomeEntry, OtherIncomeType } from '../../types';
import { AmountInput } from '../../components/common/AmountInput';
import { SearchableSelect } from '../../components/common/SearchableSelect';
import { StepNavigationButtons } from '../../components/common/StepNavigationButtons';
import { formatBDT } from '../../i18n/formatters';
import { Plus, Trash2, Edit2, Check, X, Coins } from 'lucide-react';

const OTHER_INCOME_TYPES: OtherIncomeType[] = [
  'Cash Dividend',
  'Royalties & License Fees',
  'Lottery / Prize Bond / Game Winnings',
  'Deemed Income under Tax Law',
  'Director\'s Fees & Remuneration',
  'Commission & Brokerage',
  'Rental of Equipment / Chattels',
  'Honorarium & Lecture Fees',
  'Agricultural Income not assessed as Agriculture Head',
  'Casual / Non-recurring Receipts',
  'Miscellaneous Receipts',
];

export const OtherSourcesPage: React.FC = () => {
  const { language, t, income, setIncome, askConfirmation } = useApp();
  const [isEditing, setIsEditing] = useState(false);

  const [currentEntry, setCurrentEntry] = useState<OtherIncomeEntry>({
    id: '',
    incomeType: 'Cash Dividend',
    payerName: '',
    grossAmount: 0,
    allowableDeduction: 0,
    netAmount: 0,
  });

  const handleOpenAdd = () => {
    setCurrentEntry({
      id: `oth-${Date.now()}`,
      incomeType: 'Cash Dividend',
      payerName: '',
      grossAmount: 0,
      allowableDeduction: 0,
      netAmount: 0,
    });
    setIsEditing(true);
  };

  const handleEdit = (entry: OtherIncomeEntry) => {
    setCurrentEntry(entry);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!currentEntry.payerName.trim()) {
      alert('Please enter Payer / Source particulars.');
      return;
    }
    const net = Math.max(0, (currentEntry.grossAmount || 0) - (currentEntry.allowableDeduction || 0));
    const finalized = { ...currentEntry, netAmount: net };

    setIncome((prev) => {
      const exists = prev.otherIncomeEntries.some((e) => e.id === finalized.id);
      return {
        ...prev,
        otherIncomeEntries: exists
          ? prev.otherIncomeEntries.map((e) => (e.id === finalized.id ? finalized : e))
          : [...prev.otherIncomeEntries, finalized],
      };
    });
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    askConfirmation({
      title: 'Remove Other Income Entry',
      message: 'Are you sure you want to delete this record?',
      isDestructive: true,
      onConfirm: () => {
        setIncome((prev) => ({
          ...prev,
          otherIncomeEntries: prev.otherIncomeEntries.filter((e) => e.id !== id),
        }));
      },
    });
  };

  const totalNet = income.otherIncomeEntries.reduce((s, e) => s + e.netAmount, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-emerald-700" />
            <h2 className="text-xl font-bold text-gray-900">{t('otherTitle')}</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Reference route: <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">#/user-panel/income-from-other-sources</code>
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-2 rounded-md shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {language === 'bn' ? 'অন্যান্য আয় যোগ করুন' : 'Add Other Income'}
          </button>
        )}
      </div>

      {isEditing && (
        <div className="bg-white rounded-xl border border-emerald-300 shadow-md p-6 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h3 className="text-sm font-bold text-gray-900">
              {currentEntry.id ? 'Edit Other Income' : 'Add Other Income'}
            </h3>
            <button type="button" onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Income Category (11 Standard Options)
              </label>
              <SearchableSelect
                options={OTHER_INCOME_TYPES}
                value={currentEntry.incomeType}
                onChange={(val) => setCurrentEntry((p) => ({ ...p, incomeType: val as OtherIncomeType }))}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('payerOrSource')} *</label>
              <input
                type="text"
                value={currentEntry.payerName}
                onChange={(e) => setCurrentEntry((p) => ({ ...p, payerName: e.target.value }))}
                placeholder="e.g. University of Dhaka (Guest Lecture Honorarium)"
                className="w-full rounded-md border border-gray-300 py-1.5 px-3 text-xs focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Gross Amount Received</label>
                <AmountInput
                  value={currentEntry.grossAmount}
                  onChange={(v) => setCurrentEntry((p) => ({ ...p, grossAmount: v }))}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Allowable Expenses / Deduction</label>
                <AmountInput
                  value={currentEntry.allowableDeduction}
                  onChange={(v) => setCurrentEntry((p) => ({ ...p, allowableDeduction: v }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-1.5 rounded-md text-xs font-medium"
              >
                <Check className="w-3.5 h-3.5" />
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">
            {language === 'bn' ? 'অন্যান্য উৎস হতে আয়ের তালিকা' : 'Declared Other Sources of Income'}
          </h3>
          <span className="font-mono font-bold text-xs text-emerald-800">
            {t('total')}: {formatBDT(totalNet, language)}
          </span>
        </div>

        {income.otherIncomeEntries.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500">
            {t('noRecordsFound')}. Click "Add Other Income" to record honorarium, royalties, or winnings.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {income.otherIncomeEntries.map((entry) => (
              <div key={entry.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-gray-900">{entry.incomeType}</div>
                  <div className="text-xs text-gray-600">{entry.payerName}</div>
                  <div className="text-[11px] text-gray-400 font-mono">
                    Gross: {formatBDT(entry.grossAmount, language)} • Deduction: {formatBDT(entry.allowableDeduction, language)}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-gray-500 block">Net Taxable:</span>
                    <span className="text-sm font-bold font-mono text-gray-900">
                      {formatBDT(entry.netAmount, language)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleEdit(entry)}
                      className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(entry.id)}
                      className="p-1.5 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded"
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
