import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BusinessEntry, BusinessCategory } from '../../types';
import { AmountInput } from '../../components/common/AmountInput';
import { SearchableSelect } from '../../components/common/SearchableSelect';
import { StepNavigationButtons } from '../../components/common/StepNavigationButtons';
import { formatBDT } from '../../i18n/formatters';
import { Plus, Trash2, Edit2, Check, X, Store } from 'lucide-react';

const BIZ_CATEGORIES: BusinessCategory[] = [
  'Retail Trading',
  'Wholesale Trading',
  'Manufacturing',
  'Service & Consultancy',
  'Medical & Health Services',
  'Legal & Accounting Practice',
  'Information Technology & Software',
  'Engineering & Construction',
  'Transport & Logistics',
  'Export / Import Business',
  'Other Business / Trade',
];

export const BusinessPage: React.FC = () => {
  const { language, t, income, setIncome, askConfirmation } = useApp();
  const [isEditing, setIsEditing] = useState(false);

  const [currentEntry, setCurrentEntry] = useState<BusinessEntry>({
    id: '',
    category: 'Retail Trading',
    businessName: '',
    businessAddress: '',
    tradeLicenseNumber: '',
    totalSalesOrTurnover: 0,
    grossProfit: 0,
    generalExpenses: 0,
    badDebtsWrittenOff: 0,
    depreciationAllowance: 0,
    netProfit: 0,
  });

  const handleOpenAdd = () => {
    setCurrentEntry({
      id: `biz-${Date.now()}`,
      category: 'Retail Trading',
      businessName: '',
      businessAddress: '',
      tradeLicenseNumber: '',
      totalSalesOrTurnover: 0,
      grossProfit: 0,
      generalExpenses: 0,
      badDebtsWrittenOff: 0,
      depreciationAllowance: 0,
      netProfit: 0,
    });
    setIsEditing(true);
  };

  const handleEdit = (entry: BusinessEntry) => {
    setCurrentEntry(entry);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!currentEntry.businessName.trim()) {
      alert('Please enter Business Name.');
      return;
    }
    const net = Math.max(
      0,
      (currentEntry.grossProfit || 0) -
        (currentEntry.generalExpenses || 0) -
        (currentEntry.badDebtsWrittenOff || 0) -
        (currentEntry.depreciationAllowance || 0)
    );
    const finalized = { ...currentEntry, netProfit: net };

    setIncome((prev) => {
      const exists = prev.businessEntries.some((e) => e.id === finalized.id);
      return {
        ...prev,
        businessEntries: exists
          ? prev.businessEntries.map((e) => (e.id === finalized.id ? finalized : e))
          : [...prev.businessEntries, finalized],
      };
    });
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    askConfirmation({
      title: 'Remove Business Entry',
      message: 'Are you sure you want to delete this business record?',
      isDestructive: true,
      onConfirm: () => {
        setIncome((prev) => ({
          ...prev,
          businessEntries: prev.businessEntries.filter((e) => e.id !== id),
        }));
      },
    });
  };

  const totalNet = income.businessEntries.reduce((s, e) => s + e.netProfit, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-ui-accent" />
            <h2 className="text-xl font-bold text-ui-content-primary">{t('bizTitle')}</h2>
          </div>
          <p className="text-xs text-ui-content-muted mt-1">
            Reference route: <code className="font-mono bg-ui-surface-subtle px-1 py-0.5 rounded">#/user-panel/business</code>
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 bg-ui-action-bg hover:bg-ui-action-hover text-white text-xs font-semibold px-3 py-2 rounded-md shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {language === 'bn' ? 'ব্যবসা প্রতিষ্ঠান যোগ করুন' : 'Add Business'}
          </button>
        )}
      </div>

      {isEditing && (
        <div className="bg-ui-surface rounded-xl border border-emerald-300 shadow-md p-6 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-ui-stroke-subtle pb-2">
            <h3 className="text-sm font-bold text-ui-content-primary">
              {currentEntry.id ? 'Edit Business Entry' : 'Add Business Entry'}
            </h3>
            <button type="button" onClick={() => setIsEditing(false)} className="text-ui-content-muted hover:text-ui-content-secondary">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ui-content-secondary mb-1">
                {t('bizCategory')} (11 Standard Categories)
              </label>
              <SearchableSelect
                options={BIZ_CATEGORIES}
                value={currentEntry.category}
                onChange={(val) => setCurrentEntry((p) => ({ ...p, category: val as BusinessCategory }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ui-content-secondary mb-1">{t('bizName')} *</label>
                <input
                  type="text"
                  value={currentEntry.businessName}
                  onChange={(e) => setCurrentEntry((p) => ({ ...p, businessName: e.target.value }))}
                  placeholder="e.g. Modern Hardware & Sanitary"
                  className="w-full rounded-md border border-ui-stroke-default py-1.5 px-3 text-xs focus:border-ui-focus focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ui-content-secondary mb-1">{t('tradeLicense')}</label>
                <input
                  type="text"
                  value={currentEntry.tradeLicenseNumber}
                  onChange={(e) => setCurrentEntry((p) => ({ ...p, tradeLicenseNumber: e.target.value }))}
                  placeholder="e.g. TRAD/DNCC/092817/2024"
                  className="w-full rounded-md border border-ui-stroke-default py-1.5 px-3 text-xs focus:border-ui-focus focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ui-content-secondary mb-1">{t('bizAddress')}</label>
              <input
                type="text"
                value={currentEntry.businessAddress}
                onChange={(e) => setCurrentEntry((p) => ({ ...p, businessAddress: e.target.value }))}
                placeholder="Shop 12, Level 2, City Center Market, Dhaka"
                className="w-full rounded-md border border-ui-stroke-default py-1.5 px-3 text-xs focus:border-ui-focus focus:outline-none"
              />
            </div>

            {/* Financial Performance */}
            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-ui-content-muted mb-2 border-b border-ui-stroke-subtle pb-1">
                Annual Turnover & Profit Particulars
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-ui-content-secondary mb-1">{t('turnover')}</label>
                  <AmountInput
                    value={currentEntry.totalSalesOrTurnover}
                    onChange={(v) => setCurrentEntry((p) => ({ ...p, totalSalesOrTurnover: v }))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-ui-content-secondary mb-1">{t('grossProfit')}</label>
                  <AmountInput
                    value={currentEntry.grossProfit}
                    onChange={(v) => setCurrentEntry((p) => ({ ...p, grossProfit: v }))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-ui-content-secondary mb-1">{t('bizExpenses')}</label>
                  <AmountInput
                    value={currentEntry.generalExpenses}
                    onChange={(v) => setCurrentEntry((p) => ({ ...p, generalExpenses: v }))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-ui-content-secondary mb-1">{t('depreciation')}</label>
                  <AmountInput
                    value={currentEntry.depreciationAllowance}
                    onChange={(v) => setCurrentEntry((p) => ({ ...p, depreciationAllowance: v }))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-ui-content-secondary mb-1">Bad Debts Written Off</label>
                  <AmountInput
                    value={currentEntry.badDebtsWrittenOff}
                    onChange={(v) => setCurrentEntry((p) => ({ ...p, badDebtsWrittenOff: v }))}
                  />
                </div>
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
            {language === 'bn' ? 'ব্যবসায়িক আয়ের তালিকা' : 'Declared Business Records'}
          </h3>
          <span className="font-mono font-bold text-xs text-ui-accent">
            {t('total')}: {formatBDT(totalNet, language)}
          </span>
        </div>

        {income.businessEntries.length === 0 ? (
          <div className="p-8 text-center text-xs text-ui-content-muted">
            {t('noRecordsFound')}. Click "Add Business" to declare sole-proprietorship or profession income.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {income.businessEntries.map((entry) => (
              <div key={entry.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-ui-surface-subtle">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-ui-content-primary">{entry.businessName}</div>
                  <div className="text-xs text-ui-content-secondary">
                    {entry.category} • License: {entry.tradeLicenseNumber || 'N/A'}
                  </div>
                  <div className="text-[11px] text-ui-content-muted font-mono">
                    Turnover: {formatBDT(entry.totalSalesOrTurnover, language)} • Gross Profit: {formatBDT(entry.grossProfit, language)}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-ui-content-muted block">Net Profit:</span>
                    <span className="text-sm font-bold font-mono text-ui-content-primary">
                      {formatBDT(entry.netProfit, language)}
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
