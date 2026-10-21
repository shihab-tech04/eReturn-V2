import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RebateEntry, RebateCategory } from '../../types';
import { AmountInput } from '../../components/common/AmountInput';
import { SearchableSelect } from '../../components/common/SearchableSelect';
import { StepNavigationButtons } from '../../components/common/StepNavigationButtons';
import { formatBDT } from '../../i18n/formatters';
import { computeRebateAdapter, aggregateIncomeHeads } from '../../adapters/calculationAdapter';
import { Plus, Trash2, Edit2, Check, X, TrendingDown, ShieldAlert } from 'lucide-react';

const REBATE_CATEGORIES: RebateCategory[] = [
  'Life Insurance Premium',
  'Contribution to Provident Fund (GPF / RPF)',
  'Contribution to Superannuation Fund',
  'Investment in Approved Govt Securities / Treasury Bonds',
  'Investment in Approved Stocks / Shares / Debentures',
  'Deposit Pension Scheme (DPS) within statutory monthly limit',
  'Contribution to Benevolent Fund & Group Insurance Scheme',
  'Donation to National Welfare / Relief Funds',
  'Donation to Philanthropic Institutions / Hospitals',
  'Donation to Zakat Fund Management Board',
  'Investment in Bangladesh Infrastructure Finance Fund',
  'Other Approved Investment / Savings Schemes',
];

export const RebatePage: React.FC = () => {
  const { language, t, rebate, setRebate, income, askConfirmation } = useApp();
  const [isEditing, setIsEditing] = useState(false);

  const [currentEntry, setCurrentEntry] = useState<RebateEntry>({
    id: '',
    category: 'Deposit Pension Scheme (DPS) within statutory monthly limit',
    institutionOrPolicyName: '',
    referenceNo: '',
    investmentAmount: 0,
    statutoryEligibilityChecked: true,
    allowableAmount: 0,
  });

  const incAgg = aggregateIncomeHeads(income);
  const rebateCalc = computeRebateAdapter(rebate, incAgg.totalTaxableIncome);

  const handleOpenAdd = () => {
    setCurrentEntry({
      id: `reb-${Date.now()}`,
      category: 'Deposit Pension Scheme (DPS) within statutory monthly limit',
      institutionOrPolicyName: '',
      referenceNo: '',
      investmentAmount: 0,
      statutoryEligibilityChecked: true,
      allowableAmount: 0,
    });
    setIsEditing(true);
  };

  const handleEdit = (entry: RebateEntry) => {
    setCurrentEntry(entry);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!currentEntry.institutionOrPolicyName.trim()) {
      alert('Please enter Institution / Policy / Scheme Name.');
      return;
    }
    const finalized = {
      ...currentEntry,
      allowableAmount: currentEntry.investmentAmount,
    };

    setRebate((prev) => {
      const exists = prev.entries.some((e) => e.id === finalized.id);
      return {
        ...prev,
        entries: exists
          ? prev.entries.map((e) => (e.id === finalized.id ? finalized : e))
          : [...prev.entries, finalized],
      };
    });
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    askConfirmation({
      title: 'Remove Rebate Entry',
      message: 'Are you sure you want to remove this investment rebate entry?',
      isDestructive: true,
      onConfirm: () => {
        setRebate((prev) => ({
          ...prev,
          entries: prev.entries.filter((e) => e.id !== id),
        }));
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-emerald-700" />
            <h2 className="text-xl font-bold text-gray-900">{t('rebateTitle')}</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">{t('rebateSubtitle')}</p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-2 rounded-md shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {language === 'bn' ? 'বিনিয়োগ এন্ট্রি যোগ করুন' : 'Add Eligible Investment'}
          </button>
        )}
      </div>

      {/* R-002 Rules Engine Adapter Boundary Notice */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-900">{t('ruleNotice')}</span>
            <span className="bg-emerald-200 text-emerald-900 text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold">
              R-002 Adapter Boundary
            </span>
          </div>
          <p className="text-emerald-800 leading-relaxed">{t('ruleNoticeDesc')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px] text-emerald-950">
            <div>Total Eligible Investment: {formatBDT(rebateCalc.totalEligibleInvestment, language)}</div>
            <div>Estimated Allowable Rebate: {formatBDT(rebateCalc.estimatedRebateAmount, language)}</div>
          </div>
        </div>
      </div>

      {/* Edit / Add Modal */}
      {isEditing && (
        <div className="bg-white rounded-xl border border-emerald-300 shadow-md p-6 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h3 className="text-sm font-bold text-gray-900">
              {currentEntry.id ? 'Edit Investment Entry' : 'Add Eligible Investment'}
            </h3>
            <button type="button" onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {t('investmentCategory')} (12 Statutory Categories)
              </label>
              <SearchableSelect
                options={REBATE_CATEGORIES}
                value={currentEntry.category}
                onChange={(val) => setCurrentEntry((p) => ({ ...p, category: val as RebateCategory }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t('institutionOrPolicy')} *</label>
                <input
                  type="text"
                  value={currentEntry.institutionOrPolicyName}
                  onChange={(e) => setCurrentEntry((p) => ({ ...p, institutionOrPolicyName: e.target.value }))}
                  placeholder="e.g. Eastern Bank PLC DPS / Delta Life Insurance"
                  className="w-full rounded-md border border-gray-300 py-1.5 px-3 text-xs focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t('investRefNo')}</label>
                <input
                  type="text"
                  value={currentEntry.referenceNo}
                  onChange={(e) => setCurrentEntry((p) => ({ ...p, referenceNo: e.target.value }))}
                  placeholder="e.g. DPS-928102-2024 / POL-44819"
                  className="w-full rounded-md border border-gray-300 py-1.5 px-3 text-xs focus:border-emerald-600 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">{t('investAmount')} (BDT)</label>
              <AmountInput
                value={currentEntry.investmentAmount}
                onChange={(v) => setCurrentEntry((p) => ({ ...p, investmentAmount: v }))}
              />
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
            {language === 'bn' ? 'অনুমোদিত বিনিয়োগের তালিকা' : 'Declared Eligible Investments (Schedule 24D)'}
          </h3>
          <div className="text-xs space-x-3">
            <span className="text-gray-500 font-mono">
              Total Invested: {formatBDT(rebateCalc.totalEligibleInvestment, language)}
            </span>
            <span className="font-mono font-bold text-emerald-800">
              Rebate: {formatBDT(rebateCalc.estimatedRebateAmount, language)}
            </span>
          </div>
        </div>

        {rebate.entries.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500">
            {t('noRecordsFound')}. Click "Add Eligible Investment" to declare life insurance, DPS, provident fund, or stocks.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {rebate.entries.map((entry) => (
              <div key={entry.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-gray-900">{entry.category}</div>
                  <div className="text-xs text-gray-600">
                    {entry.institutionOrPolicyName} {entry.referenceNo && `(${entry.referenceNo})`}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-gray-500 block">Investment Amount:</span>
                    <span className="text-sm font-bold font-mono text-gray-900">
                      {formatBDT(entry.investmentAmount, language)}
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
        nextPath="/user-panel/expenditure"
      />
    </div>
  );
};
