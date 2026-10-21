import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AopEntry } from '../../types';
import { AmountInput } from '../../components/common/AmountInput';
import { StepNavigationButtons } from '../../components/common/StepNavigationButtons';
import { formatBDT } from '../../i18n/formatters';
import { Plus, Trash2, Edit2, Check, X, Users } from 'lucide-react';

export const AopPage: React.FC = () => {
  const { language, t, income, setIncome, askConfirmation } = useApp();
  const [isEditing, setIsEditing] = useState(false);

  const [currentEntry, setCurrentEntry] = useState<AopEntry>({
    id: '',
    aopName: '',
    aopRegistrationOrTIN: '',
    sharePercentage: 50,
    distributedShareOfIncome: 0,
  });

  const handleOpenAdd = () => {
    setCurrentEntry({
      id: `aop-${Date.now()}`,
      aopName: '',
      aopRegistrationOrTIN: '',
      sharePercentage: 50,
      distributedShareOfIncome: 0,
    });
    setIsEditing(true);
  };

  const handleEdit = (entry: AopEntry) => {
    setCurrentEntry(entry);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!currentEntry.aopName.trim()) {
      alert('Please enter Association of Persons (AoP) Name.');
      return;
    }
    setIncome((prev) => {
      const exists = prev.aopEntries.some((e) => e.id === currentEntry.id);
      return {
        ...prev,
        aopEntries: exists
          ? prev.aopEntries.map((e) => (e.id === currentEntry.id ? currentEntry : e))
          : [...prev.aopEntries, currentEntry],
      };
    });
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    askConfirmation({
      title: 'Remove AoP Entry',
      message: 'Are you sure you want to remove this AoP record?',
      isDestructive: true,
      onConfirm: () => {
        setIncome((prev) => ({
          ...prev,
          aopEntries: prev.aopEntries.filter((e) => e.id !== id),
        }));
      },
    });
  };

  const totalNet = income.aopEntries.reduce((s, e) => s + e.distributedShareOfIncome, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-700" />
            <h2 className="text-xl font-bold text-gray-900">{t('catAop')}</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Reference route: <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">#/user-panel/aop</code>
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-2 rounded-md shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {language === 'bn' ? 'ব্যক্তিসংঘ (এওপি) যোগ করুন' : 'Add AoP Record'}
          </button>
        )}
      </div>

      {isEditing && (
        <div className="bg-white rounded-xl border border-emerald-300 shadow-md p-6 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h3 className="text-sm font-bold text-gray-900">
              {currentEntry.id ? 'Edit Association of Persons (AoP)' : 'Add Association of Persons (AoP)'}
            </h3>
            <button type="button" onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">AoP Name *</label>
                <input
                  type="text"
                  value={currentEntry.aopName}
                  onChange={(e) => setCurrentEntry((p) => ({ ...p, aopName: e.target.value }))}
                  placeholder="e.g. Bangladesh Ceramic Exporters Consortium (AoP)"
                  className="w-full rounded-md border border-gray-300 py-1.5 px-3 text-xs focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Registration / TIN</label>
                <input
                  type="text"
                  value={currentEntry.aopRegistrationOrTIN}
                  onChange={(e) => setCurrentEntry((p) => ({ ...p, aopRegistrationOrTIN: e.target.value }))}
                  placeholder="e.g. AOP-882910-BD"
                  className="w-full rounded-md border border-gray-300 py-1.5 px-3 text-xs focus:border-emerald-600 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Member Share Percentage (%)</label>
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
                <label className="block text-xs text-gray-600 mb-1">Distributed Share of Income (BDT)</label>
                <AmountInput
                  value={currentEntry.distributedShareOfIncome}
                  onChange={(v) => setCurrentEntry((p) => ({ ...p, distributedShareOfIncome: v }))}
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
            {language === 'bn' ? 'ব্যক্তিসংঘের বিবরণী' : 'Declared AoP Memberships'}
          </h3>
          <span className="font-mono font-bold text-xs text-emerald-800">
            {t('total')}: {formatBDT(totalNet, language)}
          </span>
        </div>

        {income.aopEntries.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500">
            {t('noRecordsFound')}. Click "Add AoP Record" to declare Association of Persons income.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {income.aopEntries.map((entry) => (
              <div key={entry.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-gray-900">{entry.aopName}</div>
                  <div className="text-xs text-gray-600 font-mono">
                    TIN/Reg: {entry.aopRegistrationOrTIN || 'N/A'} • Member Share: {entry.sharePercentage}%
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-gray-500 block">Distributed Income:</span>
                    <span className="text-sm font-bold font-mono text-gray-900">
                      {formatBDT(entry.distributedShareOfIncome, language)}
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
