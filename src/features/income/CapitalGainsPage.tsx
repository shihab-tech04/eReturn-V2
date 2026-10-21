import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CapitalGainEntry, CapitalGainType } from '../../types';
import { AmountInput } from '../../components/common/AmountInput';
import { SearchableSelect } from '../../components/common/SearchableSelect';
import { StepNavigationButtons } from '../../components/common/StepNavigationButtons';
import { formatBDT } from '../../i18n/formatters';
import { Plus, Trash2, Edit2, Check, X, TrendingUp } from 'lucide-react';

const CAPITAL_GAIN_TYPES: CapitalGainType[] = [
  'Sale of Land & Real Estate',
  'Sale of Building / Apartment',
  'Transfer of Listed Shares / Securities',
  'Transfer of Unlisted Shares',
  'Sale of Machinery & Plant',
  'Sale of Motor Vehicles',
  'Gold, Precious Metals & Jewelry',
  'Intellectual Property / Patents',
  'Mutual Fund Units',
  'Partnership Interest Liquidation',
  'Compensation on Acquired Assets',
  'Sale of Agricultural Land (Urban)',
  'Other Capital Assets',
];

export const CapitalGainsPage: React.FC = () => {
  const { language, t, income, setIncome, askConfirmation } = useApp();
  const [isEditing, setIsEditing] = useState(false);

  const [currentEntry, setCurrentEntry] = useState<CapitalGainEntry>({
    id: '',
    gainType: 'Transfer of Listed Shares / Securities',
    assetDescription: '',
    dateOfAcquisition: '',
    dateOfDisposal: '',
    fullValueConsideration: 0,
    costOfAcquisition: 0,
    expenditureIncurredOnTransfer: 0,
    exemptedOrReinvestedAmount: 0,
    netCapitalGain: 0,
  });

  const handleOpenAdd = () => {
    setCurrentEntry({
      id: `cg-${Date.now()}`,
      gainType: 'Transfer of Listed Shares / Securities',
      assetDescription: '',
      dateOfAcquisition: '',
      dateOfDisposal: '',
      fullValueConsideration: 0,
      costOfAcquisition: 0,
      expenditureIncurredOnTransfer: 0,
      exemptedOrReinvestedAmount: 0,
      netCapitalGain: 0,
    });
    setIsEditing(true);
  };

  const handleEdit = (entry: CapitalGainEntry) => {
    setCurrentEntry(entry);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!currentEntry.assetDescription.trim()) {
      alert('Please enter asset description.');
      return;
    }
    const net = Math.max(
      0,
      (currentEntry.fullValueConsideration || 0) -
        (currentEntry.costOfAcquisition || 0) -
        (currentEntry.expenditureIncurredOnTransfer || 0) -
        (currentEntry.exemptedOrReinvestedAmount || 0)
    );
    const finalized = { ...currentEntry, netCapitalGain: net };

    setIncome((prev) => {
      const exists = prev.capitalGainEntries.some((e) => e.id === finalized.id);
      return {
        ...prev,
        capitalGainEntries: exists
          ? prev.capitalGainEntries.map((e) => (e.id === finalized.id ? finalized : e))
          : [...prev.capitalGainEntries, finalized],
      };
    });
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    askConfirmation({
      title: 'Remove Capital Gain Entry',
      message: 'Are you sure you want to delete this capital gain record?',
      isDestructive: true,
      onConfirm: () => {
        setIncome((prev) => ({
          ...prev,
          capitalGainEntries: prev.capitalGainEntries.filter((e) => e.id !== id),
        }));
      },
    });
  };

  const totalNet = income.capitalGainEntries.reduce((s, e) => s + e.netCapitalGain, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-700" />
            <h2 className="text-xl font-bold text-gray-900">{t('capGainTitle')}</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Reference route: <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">#/user-panel/capital-gain</code>
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-2 rounded-md shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {language === 'bn' ? 'মূলধনী লাভ যোগ করুন' : 'Add Capital Gain'}
          </button>
        )}
      </div>

      {isEditing && (
        <div className="bg-white rounded-xl border border-emerald-300 shadow-md p-6 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h3 className="text-sm font-bold text-gray-900">
              {currentEntry.id ? 'Edit Capital Gain' : 'Add Capital Gain'}
            </h3>
            <button type="button" onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {t('gainType')} (13 Standard Options)
              </label>
              <SearchableSelect
                options={CAPITAL_GAIN_TYPES}
                value={currentEntry.gainType}
                onChange={(val) => setCurrentEntry((p) => ({ ...p, gainType: val as CapitalGainType }))}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('assetDesc')} *</label>
              <input
                type="text"
                value={currentEntry.assetDescription}
                onChange={(e) => setCurrentEntry((p) => ({ ...p, assetDescription: e.target.value }))}
                placeholder="e.g. 5 Kathas land plot at Purbachal Sector 14"
                className="w-full rounded-md border border-gray-300 py-1.5 px-3 text-xs focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t('dateAcquisition')}</label>
                <input
                  type="date"
                  value={currentEntry.dateOfAcquisition}
                  onChange={(e) => setCurrentEntry((p) => ({ ...p, dateOfAcquisition: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 py-1.5 px-3 text-xs focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t('dateDisposal')}</label>
                <input
                  type="date"
                  value={currentEntry.dateOfDisposal}
                  onChange={(e) => setCurrentEntry((p) => ({ ...p, dateOfDisposal: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 py-1.5 px-3 text-xs focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Amounts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">{t('fullValue')}</label>
                <AmountInput
                  value={currentEntry.fullValueConsideration}
                  onChange={(v) => setCurrentEntry((p) => ({ ...p, fullValueConsideration: v }))}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">{t('costAcquisition')}</label>
                <AmountInput
                  value={currentEntry.costOfAcquisition}
                  onChange={(v) => setCurrentEntry((p) => ({ ...p, costOfAcquisition: v }))}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">{t('transferExpense')}</label>
                <AmountInput
                  value={currentEntry.expenditureIncurredOnTransfer}
                  onChange={(v) => setCurrentEntry((p) => ({ ...p, expenditureIncurredOnTransfer: v }))}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Exempt / Reinvested</label>
                <AmountInput
                  value={currentEntry.exemptedOrReinvestedAmount}
                  onChange={(v) => setCurrentEntry((p) => ({ ...p, exemptedOrReinvestedAmount: v }))}
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
            {language === 'bn' ? 'মূলধনী লাভের তালিকা' : 'Declared Capital Gains'}
          </h3>
          <span className="font-mono font-bold text-xs text-emerald-800">
            {t('total')}: {formatBDT(totalNet, language)}
          </span>
        </div>

        {income.capitalGainEntries.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500">
            {t('noRecordsFound')}. Click "Add Capital Gain" to record sale or transfer of capital assets.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {income.capitalGainEntries.map((entry) => (
              <div key={entry.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-gray-900">{entry.gainType}</div>
                  <div className="text-xs text-gray-600">{entry.assetDescription}</div>
                  <div className="text-[11px] text-gray-400 font-mono">
                    Consideration: {formatBDT(entry.fullValueConsideration, language)} • Cost: {formatBDT(entry.costOfAcquisition, language)}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-gray-500 block">Net Gain:</span>
                    <span className="text-sm font-bold font-mono text-gray-900">
                      {formatBDT(entry.netCapitalGain, language)}
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
