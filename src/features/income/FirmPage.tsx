import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FirmEntry } from '../../types';
import { AmountInput } from '../../components/common/AmountInput';
import { StepNavigationButtons } from '../../components/common/StepNavigationButtons';
import { formatBDT } from '../../i18n/formatters';
import { Plus, Trash2, Edit2, Check, X, Users } from 'lucide-react';

export const FirmPage: React.FC = () => {
  const { language, t, income, setIncome, askConfirmation } = useApp();
  const [isEditing, setIsEditing] = useState(false);

  const [currentEntry, setCurrentEntry] = useState<FirmEntry>({
    id: '',
    firmName: '',
    firmTIN: '',
    sharePercentage: 50,
    shareOfProfit: 0,
    salaryFromFirm: 0,
    interestOnCapital: 0,
    totalIncomeFromFirm: 0,
  });

  const handleOpenAdd = () => {
    setCurrentEntry({
      id: `firm-${Date.now()}`,
      firmName: '',
      firmTIN: '',
      sharePercentage: 50,
      shareOfProfit: 0,
      salaryFromFirm: 0,
      interestOnCapital: 0,
      totalIncomeFromFirm: 0,
    });
    setIsEditing(true);
  };

  const handleEdit = (entry: FirmEntry) => {
    setCurrentEntry(entry);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!currentEntry.firmName.trim()) {
      alert('Please enter Partnership Firm Name.');
      return;
    }
    const total =
      (currentEntry.shareOfProfit || 0) +
      (currentEntry.salaryFromFirm || 0) +
      (currentEntry.interestOnCapital || 0);

    const finalized = { ...currentEntry, totalIncomeFromFirm: total };

    setIncome((prev) => {
      const exists = prev.firmEntries.some((e) => e.id === finalized.id);
      return {
        ...prev,
        firmEntries: exists
          ? prev.firmEntries.map((e) => (e.id === finalized.id ? finalized : e))
          : [...prev.firmEntries, finalized],
      };
    });
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    askConfirmation({
      title: 'Remove Partnership Firm Entry',
      message: 'Are you sure you want to delete this firm record?',
      isDestructive: true,
      onConfirm: () => {
        setIncome((prev) => ({
          ...prev,
          firmEntries: prev.firmEntries.filter((e) => e.id !== id),
        }));
      },
    });
  };

  const totalNet = income.firmEntries.reduce((s, e) => s + e.totalIncomeFromFirm, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-700" />
            <h2 className="text-xl font-bold text-gray-900">{t('catFirm')}</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Reference route: <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">#/user-panel/firm-etc</code>
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-2 rounded-md shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {language === 'bn' ? 'অংশীদারি ফার্ম যোগ করুন' : 'Add Partnership Firm'}
          </button>
        )}
      </div>

      {isEditing && (
        <div className="bg-white rounded-xl border border-emerald-300 shadow-md p-6 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h3 className="text-sm font-bold text-gray-900">
              {currentEntry.id ? 'Edit Partnership Firm' : 'Add Partnership Firm'}
            </h3>
            <button type="button" onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Firm Name *</label>
                <input
                  type="text"
                  value={currentEntry.firmName}
                  onChange={(e) => setCurrentEntry((p) => ({ ...p, firmName: e.target.value }))}
                  placeholder="e.g. Standard Trading Associates"
                  className="w-full rounded-md border border-gray-300 py-1.5 px-3 text-xs focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Firm TIN</label>
                <input
                  type="text"
                  value={currentEntry.firmTIN}
                  onChange={(e) => setCurrentEntry((p) => ({ ...p, firmTIN: e.target.value }))}
                  placeholder="e.g. 1928-3849-0021"
                  className="w-full rounded-md border border-gray-300 py-1.5 px-3 text-xs focus:border-emerald-600 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Share Percentage (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={currentEntry.sharePercentage}
                  onChange={(e) => setCurrentEntry((p) => ({ ...p, sharePercentage: parseFloat(e.target.value) || 0 }))}
                  className="w-full rounded-md border border-gray-300 py-1.5 px-3 text-xs focus:border-emerald-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Share of Profit</label>
                <AmountInput
                  value={currentEntry.shareOfProfit}
                  onChange={(v) => setCurrentEntry((p) => ({ ...p, shareOfProfit: v }))}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Partner Remuneration / Salary</label>
                <AmountInput
                  value={currentEntry.salaryFromFirm}
                  onChange={(v) => setCurrentEntry((p) => ({ ...p, salaryFromFirm: v }))}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Interest on Capital</label>
                <AmountInput
                  value={currentEntry.interestOnCapital}
                  onChange={(v) => setCurrentEntry((p) => ({ ...p, interestOnCapital: v }))}
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
            {language === 'bn' ? 'অংশীদারি ফার্মের বিবরণী' : 'Declared Partnership Firms'}
          </h3>
          <span className="font-mono font-bold text-xs text-emerald-800">
            {t('total')}: {formatBDT(totalNet, language)}
          </span>
        </div>

        {income.firmEntries.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500">
            {t('noRecordsFound')}. Click "Add Partnership Firm" to record profit shares.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {income.firmEntries.map((entry) => (
              <div key={entry.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-gray-900">{entry.firmName}</div>
                  <div className="text-xs text-gray-600 font-mono">
                    TIN: {entry.firmTIN || 'N/A'} • Share: {entry.sharePercentage}%
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-gray-500 block">Total Income from Firm:</span>
                    <span className="text-sm font-bold font-mono text-gray-900">
                      {formatBDT(entry.totalIncomeFromFirm, language)}
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
