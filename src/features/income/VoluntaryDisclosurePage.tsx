import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VoluntaryDisclosureEntry } from '../../types';
import { AmountInput } from '../../components/common/AmountInput';
import { StepNavigationButtons } from '../../components/common/StepNavigationButtons';
import { formatBDT } from '../../i18n/formatters';
import { Plus, Trash2, Edit2, Check, X, AlertCircle } from 'lucide-react';

const VOLUNTARY_HEADS = [
  'Employment Income',
  'House Property Rent',
  'Agricultural Income',
  'Business or Profession',
  'Capital Gains',
  'Financial Assets',
  'Other Sources of Income',
];

export const VoluntaryDisclosurePage: React.FC = () => {
  const { language, t, income, setIncome, askConfirmation } = useApp();
  const [isEditing, setIsEditing] = useState(false);

  const [currentEntry, setCurrentEntry] = useState<VoluntaryDisclosureEntry>({
    id: '',
    incomeHead: 'Business or Profession',
    particulars: '',
    assessmentYearOfEarning: '2025-2026',
    declaredAmount: 0,
    applicableTaxRatePercentage: 15,
    taxPayable: 0,
  });

  const handleOpenAdd = () => {
    setCurrentEntry({
      id: `vd-${Date.now()}`,
      incomeHead: 'Business or Profession',
      particulars: '',
      assessmentYearOfEarning: '2025-2026',
      declaredAmount: 0,
      applicableTaxRatePercentage: 15,
      taxPayable: 0,
    });
    setIsEditing(true);
  };

  const handleEdit = (entry: VoluntaryDisclosureEntry) => {
    setCurrentEntry(entry);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!currentEntry.particulars.trim()) {
      alert('Please enter particulars of voluntary disclosure.');
      return;
    }
    const tax = Math.round(
      (currentEntry.declaredAmount * (currentEntry.applicableTaxRatePercentage || 15)) / 100
    );
    const finalized = { ...currentEntry, taxPayable: tax };

    setIncome((prev) => {
      const exists = prev.voluntaryDisclosureEntries.some((e) => e.id === finalized.id);
      return {
        ...prev,
        voluntaryDisclosureEntries: exists
          ? prev.voluntaryDisclosureEntries.map((e) => (e.id === finalized.id ? finalized : e))
          : [...prev.voluntaryDisclosureEntries, finalized],
      };
    });
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    askConfirmation({
      title: 'Remove Voluntary Disclosure Line',
      message: 'Are you sure you want to remove this voluntary disclosure declaration?',
      isDestructive: true,
      onConfirm: () => {
        setIncome((prev) => ({
          ...prev,
          voluntaryDisclosureEntries: prev.voluntaryDisclosureEntries.filter((e) => e.id !== id),
        }));
      },
    });
  };

  const totalDeclared = income.voluntaryDisclosureEntries.reduce((s, e) => s + e.declaredAmount, 0);
  const totalTaxPayable = income.voluntaryDisclosureEntries.reduce((s, e) => s + e.taxPayable, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-700" />
            <h2 className="text-xl font-bold text-ui-content-primary">{t('voluntaryDisclosureTitle')}</h2>
          </div>
          <p className="text-xs text-ui-content-muted mt-1">
            Reference route: <code className="font-mono bg-ui-surface-subtle px-1 py-0.5 rounded">#/user-panel/voluntary-disclosure-income</code>
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 bg-ui-action-bg hover:bg-ui-action-hover text-white text-xs font-semibold px-3 py-2 rounded-md shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {language === 'bn' ? 'অপ্রদর্শিত আয় যোগ করুন' : 'Add Disclosure Row'}
          </button>
        )}
      </div>

      {/* Statutory Guidance */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 text-xs text-amber-900 leading-relaxed">
        {language === 'bn'
          ? 'প্রথম তফসিলের অধীনে অপ্রদর্শিত আয়ের বিবরণী দাখিল সাপেক্ষে নির্ধারিত হারে কর পরিশোধ নিশ্চিত করিতে হইবে। কোনো ভিত্তিহীন বা অননুমোদিত কর সুবিধা স্বয়ংক্রিয়ভাবে কার্যকর হইবে না।'
          : 'Under First Schedule provisions, voluntary disclosures require prescribed statutory tax rate settlement. The frontend does not fabricate artificial legal exemptions or penalty waivers.'}
      </div>

      {isEditing && (
        <div className="bg-ui-surface rounded-xl border border-emerald-300 shadow-md p-6 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-ui-stroke-subtle pb-2">
            <h3 className="text-sm font-bold text-ui-content-primary">
              {currentEntry.id ? 'Edit Voluntary Disclosure' : 'Add Voluntary Disclosure Row'}
            </h3>
            <button type="button" onClick={() => setIsEditing(false)} className="text-ui-content-muted hover:text-ui-content-secondary">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ui-content-secondary mb-1">Income Head *</label>
                <select
                  value={currentEntry.incomeHead}
                  onChange={(e) => setCurrentEntry((p) => ({ ...p, incomeHead: e.target.value }))}
                  className="w-full rounded-md border border-ui-stroke-default py-1.5 px-3 text-xs focus:border-ui-focus focus:outline-none"
                >
                  {VOLUNTARY_HEADS.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ui-content-secondary mb-1">Assessment Year of Earning</label>
                <input
                  type="text"
                  value={currentEntry.assessmentYearOfEarning}
                  onChange={(e) => setCurrentEntry((p) => ({ ...p, assessmentYearOfEarning: e.target.value }))}
                  placeholder="e.g. 2024-2025"
                  className="w-full rounded-md border border-ui-stroke-default py-1.5 px-3 text-xs focus:border-ui-focus focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ui-content-secondary mb-1">Particulars / Details *</label>
              <input
                type="text"
                value={currentEntry.particulars}
                onChange={(e) => setCurrentEntry((p) => ({ ...p, particulars: e.target.value }))}
                placeholder="Particulars of undisclosed earnings or investments"
                className="w-full rounded-md border border-ui-stroke-default py-1.5 px-3 text-xs focus:border-ui-focus focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-ui-content-secondary mb-1">Declared Amount (BDT)</label>
                <AmountInput
                  value={currentEntry.declaredAmount}
                  onChange={(v) => setCurrentEntry((p) => ({ ...p, declaredAmount: v }))}
                />
              </div>

              <div>
                <label className="block text-xs text-ui-content-secondary mb-1">Applicable Statutory Rate (%)</label>
                <input
                  type="number"
                  value={currentEntry.applicableTaxRatePercentage}
                  onChange={(e) =>
                    setCurrentEntry((p) => ({ ...p, applicableTaxRatePercentage: parseFloat(e.target.value) || 0 }))
                  }
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
            {language === 'bn' ? 'স্বেচ্ছায় প্রকাশিত আয়ের তালিকা' : 'Voluntary Disclosure Records'}
          </h3>
          <div className="text-xs space-x-3">
            <span className="text-ui-content-muted font-mono">Tax Payable: {formatBDT(totalTaxPayable, language)}</span>
            <span className="font-mono font-bold text-amber-800">{t('total')}: {formatBDT(totalDeclared, language)}</span>
          </div>
        </div>

        {income.voluntaryDisclosureEntries.length === 0 ? (
          <div className="p-8 text-center text-xs text-ui-content-muted">
            {t('noRecordsFound')}. Click "Add Disclosure Row" to record undisclosed earnings under First Schedule.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {income.voluntaryDisclosureEntries.map((entry) => (
              <div key={entry.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-ui-surface-subtle">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-ui-content-primary">{entry.incomeHead}</div>
                  <div className="text-xs text-ui-content-secondary">{entry.particulars} (AY: {entry.assessmentYearOfEarning})</div>
                  <div className="text-[11px] text-ui-content-muted font-mono">
                    Statutory Rate: {entry.applicableTaxRatePercentage}% • Tax Payable: {formatBDT(entry.taxPayable, language)}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-ui-content-muted block">Declared Amount:</span>
                    <span className="text-sm font-bold font-mono text-ui-content-primary">
                      {formatBDT(entry.declaredAmount, language)}
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

      {/* Statutory Declaration Checkbox */}
      <div className="bg-ui-surface rounded-xl border border-ui-stroke-subtle shadow-xs p-5">
        <label className="flex items-start gap-2.5 cursor-pointer text-xs text-ui-content-primary select-none">
          <input
            type="checkbox"
            checked={income.voluntaryDisclosureAffirmed}
            onChange={(e) => setIncome((prev) => ({ ...prev, voluntaryDisclosureAffirmed: e.target.checked }))}
            className="h-4 w-4 text-ui-accent rounded border-ui-stroke-default mt-0.5"
          />
          <span className="leading-relaxed">
            {language === 'bn'
              ? 'আমি এই মর্মে অঙ্গীকার করিতেছি যে, উপরে উল্লিখিত অপ্রদর্শিত আয় প্রথম তফসিলের সকল শর্তাবলি পালনপূর্বক রিটার্নে অন্তর্ভুক্ত করা হইয়াছে।'
              : 'I hereby affirm that the undisclosed income declared above conforms with the conditions of the First Schedule of the Income Tax Act.'}
          </span>
        </label>
      </div>

      <StepNavigationButtons
        backPath="/user-panel/income"
        nextPath="/user-panel/income"
        nextLabel="Done (Back to Income)"
      />
    </div>
  );
};
