import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { EmploymentEntry } from '../../types';
import { AmountInput } from '../../components/common/AmountInput';
import { StepNavigationButtons } from '../../components/common/StepNavigationButtons';
import { formatBDT } from '../../i18n/formatters';
import { Plus, Trash2, Edit2, Check, X, Briefcase } from 'lucide-react';

export const EmploymentPage: React.FC = () => {
  const { language, t, income, setIncome, askConfirmation } = useApp();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<EmploymentEntry>({
    id: '',
    employmentType: 'Private / Other',
    employerName: '',
    designation: '',
    basicPay: 0,
    houseRentAllowance: 0,
    medicalAllowance: 0,
    conveyanceAllowance: 0,
    festivalBonus: 0,
    otherAllowances: 0,
    totalIncome: 0,
    exemptedAmount: 0,
    netTaxableIncome: 0,
  });

  const calculateTotals = (entry: EmploymentEntry) => {
    const total =
      (entry.basicPay || 0) +
      (entry.houseRentAllowance || 0) +
      (entry.medicalAllowance || 0) +
      (entry.conveyanceAllowance || 0) +
      (entry.festivalBonus || 0) +
      (entry.otherAllowances || 0);

    // Standard statutory exemption rule:
    // House rent exempt up to 50% basic or 300,000 (lesser)
    // Medical exempt up to 10% basic or 120,000 (lesser)
    // Conveyance exempt up to 30,000
    // Total standard statutory exemption can be estimated:
    const hrExempt = Math.min(entry.houseRentAllowance || 0, Math.min((entry.basicPay || 0) * 0.5, 300000));
    const medExempt = Math.min(entry.medicalAllowance || 0, Math.min((entry.basicPay || 0) * 0.1, 120000));
    const convExempt = Math.min(entry.conveyanceAllowance || 0, 30000);
    const autoExempt = hrExempt + medExempt + convExempt;

    const net = Math.max(0, total - (entry.exemptedAmount || autoExempt));
    return {
      ...entry,
      totalIncome: total,
      exemptedAmount: entry.exemptedAmount || autoExempt,
      netTaxableIncome: net,
    };
  };

  const handleOpenAdd = () => {
    setCurrentEntry({
      id: `emp-${Date.now()}`,
      employmentType: 'Private / Other',
      employerName: '',
      designation: '',
      basicPay: 0,
      houseRentAllowance: 0,
      medicalAllowance: 0,
      conveyanceAllowance: 0,
      festivalBonus: 0,
      otherAllowances: 0,
      totalIncome: 0,
      exemptedAmount: 0,
      netTaxableIncome: 0,
    });
    setIsEditing(true);
  };

  const handleEdit = (entry: EmploymentEntry) => {
    setCurrentEntry(entry);
    setIsEditing(true);
  };

  const handleSaveEntry = () => {
    if (!currentEntry.employerName.trim()) {
      alert('Please enter Employer / Organization Name.');
      return;
    }
    const calculated = calculateTotals(currentEntry);
    setIncome((prev) => {
      const exists = prev.employmentEntries.some((e) => e.id === calculated.id);
      return {
        ...prev,
        employmentEntries: exists
          ? prev.employmentEntries.map((e) => (e.id === calculated.id ? calculated : e))
          : [...prev.employmentEntries, calculated],
      };
    });
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    askConfirmation({
      title: 'Remove Employment Entry',
      message: 'Are you sure you want to delete this employer record?',
      isDestructive: true,
      onConfirm: () => {
        setIncome((prev) => ({
          ...prev,
          employmentEntries: prev.employmentEntries.filter((e) => e.id !== id),
        }));
      },
    });
  };

  const totalNet = income.employmentEntries.reduce((s, e) => s + e.netTaxableIncome, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-700" />
            <h2 className="text-xl font-bold text-gray-900">{t('employmentTitle')}</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Reference route: <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">#/user-panel/employment</code>
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-2 rounded-md shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {language === 'bn' ? 'নিয়োগকর্তা যোগ করুন' : 'Add Employer Record'}
          </button>
        )}
      </div>

      {/* Editing Modal/Form */}
      {isEditing && (
        <div className="bg-white rounded-xl border border-emerald-300 shadow-md p-6 space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-900">
              {currentEntry.id ? 'Edit Employment Record' : 'New Employment Record'}
            </h3>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Employment Type Radio (4 observed choices) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                {t('empType')}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { value: 'Govt iBAS++', label: t('govtIbas') },
                  { value: 'Govt Non-iBAS++', label: t('govtNonIbas') },
                  { value: 'Private / Other', label: t('privateOther') },
                  { value: 'Autonomous / Semi-Govt / Corporation', label: t('autonomous') },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      currentEntry.employmentType === opt.value
                        ? 'border-emerald-600 bg-emerald-50/50 font-medium text-emerald-950'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="empType"
                      value={opt.value}
                      checked={currentEntry.employmentType === opt.value}
                      onChange={() =>
                        setCurrentEntry((p) => ({ ...p, employmentType: opt.value as any }))
                      }
                      className="text-emerald-700 h-4 w-4 mt-0.5"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t('employerName')} *
                </label>
                <input
                  type="text"
                  value={currentEntry.employerName}
                  onChange={(e) => setCurrentEntry((p) => ({ ...p, employerName: e.target.value }))}
                  placeholder="e.g. Acme Corporation Ltd."
                  className="w-full rounded-md border border-gray-300 py-1.5 px-3 text-xs focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t('designation')}
                </label>
                <input
                  type="text"
                  value={currentEntry.designation}
                  onChange={(e) => setCurrentEntry((p) => ({ ...p, designation: e.target.value }))}
                  placeholder="e.g. Senior Manager"
                  className="w-full rounded-md border border-gray-300 py-1.5 px-3 text-xs focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Salary Breakdown */}
            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 border-b border-gray-100 pb-1">
                Salary Allowances & Breakdown (Annual BDT)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">{t('basicPay')}</label>
                  <AmountInput
                    value={currentEntry.basicPay}
                    onChange={(v) => setCurrentEntry((p) => ({ ...p, basicPay: v }))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">{t('houseRent')}</label>
                  <AmountInput
                    value={currentEntry.houseRentAllowance}
                    onChange={(v) => setCurrentEntry((p) => ({ ...p, houseRentAllowance: v }))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">{t('medical')}</label>
                  <AmountInput
                    value={currentEntry.medicalAllowance}
                    onChange={(v) => setCurrentEntry((p) => ({ ...p, medicalAllowance: v }))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">{t('conveyance')}</label>
                  <AmountInput
                    value={currentEntry.conveyanceAllowance}
                    onChange={(v) => setCurrentEntry((p) => ({ ...p, conveyanceAllowance: v }))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">{t('festivalBonus')}</label>
                  <AmountInput
                    value={currentEntry.festivalBonus}
                    onChange={(v) => setCurrentEntry((p) => ({ ...p, festivalBonus: v }))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">{t('otherAllowances')}</label>
                  <AmountInput
                    value={currentEntry.otherAllowances}
                    onChange={(v) => setCurrentEntry((p) => ({ ...p, otherAllowances: v }))}
                  />
                </div>
              </div>
            </div>

            {/* Exempted portion override */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  {language === 'bn' ? 'আইনগত অনুমোদিত করমুক্ত অংশ' : 'Statutory Exempted Portion'}
                </label>
                <AmountInput
                  value={currentEntry.exemptedAmount}
                  onChange={(v) => setCurrentEntry((p) => ({ ...p, exemptedAmount: v }))}
                  placeholder="Computed automatically"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleSaveEntry}
                className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-1.5 rounded-md text-xs font-medium"
              >
                <Check className="w-3.5 h-3.5" />
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List of Entries */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">
            {language === 'bn' ? 'নিয়োগকর্তার তালিকা' : 'Declared Employment Records'}
          </h3>
          <span className="text-xs font-mono font-bold text-emerald-800">
            {t('total')}: {formatBDT(totalNet, language)}
          </span>
        </div>

        {income.employmentEntries.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500">
            {t('noRecordsFound')}. Click "Add Employer Record" to record employment income.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {income.employmentEntries.map((entry) => (
              <div key={entry.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900">{entry.employerName}</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">
                      {entry.employmentType}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">{entry.designation || 'N/A'}</div>
                  <div className="text-[11px] text-gray-400 font-mono">
                    Gross: {formatBDT(entry.totalIncome, language)} • Exempt: {formatBDT(entry.exemptedAmount, language)}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-gray-500 block">Taxable Income:</span>
                    <span className="text-sm font-bold font-mono text-gray-900">
                      {formatBDT(entry.netTaxableIncome, language)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleEdit(entry)}
                      className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(entry.id)}
                      className="p-1.5 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded"
                      title="Delete"
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
