import { preserveEnteredRent } from '../../adapters/individualEnteredFacts';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RentPropertyEntry, RentPropertyType } from '../../types';
import { AmountInput } from '../../components/common/AmountInput';
import { SearchableSelect } from '../../components/common/SearchableSelect';
import { StepNavigationButtons } from '../../components/common/StepNavigationButtons';
import { formatBDT } from '../../i18n/formatters';
import { Plus, Trash2, Edit2, Check, X, Home } from 'lucide-react';

const PROPERTY_TYPES: RentPropertyType[] = [
  'Residential Apartment / House',
  'Commercial Building',
  'Land',
  'Factory / Industrial Building',
  'Business Premises',
  'Furniture / Fixtures',
  'Machinery / Equipment',
  'Personal Vehicle',
  'Other Capital Asset',
];

export const RentPage: React.FC = () => {
  const { language, t, income, setIncome, askConfirmation } = useApp();
  const [isEditing, setIsEditing] = useState(false);

  const [currentEntry, setCurrentEntry] = useState<RentPropertyEntry>({
    id: '',
    propertyType: 'Residential Apartment / House',
    propertyAddress: '',
    ownershipSharePercentage: 100,
    annualRentReceived: 0,
    advanceRentReceived: 0,
    municipalTaxPaid: 0,
    landRevenuePaid: 0,
    interestOnLoanPaid: 0,
    insurancePremiumPaid: 0,
    repairAllowanceRate: 0,
    repairAllowanceAmount: 0,
    vacancyAllowance: 0,
    otherAllowableDeductions: 0,
    totalDeductions: 0,
    netRentalIncome: 0,
  });

  const handleOpenAdd = () => {
    setCurrentEntry({
      id: `rent-${Date.now()}`,
      propertyType: 'Residential Apartment / House',
      propertyAddress: '',
      ownershipSharePercentage: 100,
      annualRentReceived: 0,
      advanceRentReceived: 0,
      municipalTaxPaid: 0,
      landRevenuePaid: 0,
      interestOnLoanPaid: 0,
      insurancePremiumPaid: 0,
      repairAllowanceRate: 0,
      repairAllowanceAmount: 0,
      vacancyAllowance: 0,
      otherAllowableDeductions: 0,
      totalDeductions: 0,
      netRentalIncome: 0,
    });
    setIsEditing(true);
  };

  const handleEdit = (entry: RentPropertyEntry) => {
    setCurrentEntry(entry);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!currentEntry.propertyAddress.trim()) {
      alert('Please enter property address.');
      return;
    }
    let finalized: RentPropertyEntry;
    try { finalized = preserveEnteredRent(currentEntry); }
    catch { alert(language === 'bn' ? 'ভাড়ার তথ্য যাচাই করুন; ঋণাত্মক বা অবৈধ অঙ্ক গ্রহণযোগ্য নয়।' : 'Check the rental amounts and ownership share; invalid or negative amounts cannot be saved.'); return; }
    setIncome((prev) => {
      const exists = prev.rentEntries.some((e) => e.id === finalized.id);
      return {
        ...prev,
        rentEntries: exists
          ? prev.rentEntries.map((e) => (e.id === finalized.id ? finalized : e))
          : [...prev.rentEntries, finalized],
      };
    });
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    askConfirmation({
      title: 'Remove Rental Property',
      message: 'Are you sure you want to remove this property entry?',
      isDestructive: true,
      onConfirm: () => {
        setIncome((prev) => ({
          ...prev,
          rentEntries: prev.rentEntries.filter((e) => e.id !== id),
        }));
      },
    });
  };

  const totalRentReceived = income.rentEntries.reduce((s, e) => s + e.annualRentReceived, 0);
  const totalDeductions = income.rentEntries.reduce((s, e) => s + e.totalDeductions, 0);
  const totalNet = income.rentEntries.reduce((s, e) => s + e.netRentalIncome, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-emerald-700" />
            <h2 className="text-xl font-bold text-gray-900">{t('rentTitle')}</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Reference route: <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">#/user-panel/rent</code>
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-2 rounded-md shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {language === 'bn' ? 'আরেকটি সম্পত্তি যুক্ত করুন' : 'Add Another Property'}
          </button>
        )}
      </div>

      {isEditing && (
        <div className="bg-white rounded-xl border border-emerald-300 shadow-md p-6 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h3 className="text-sm font-bold text-gray-900">
              {currentEntry.id ? 'Edit Rental Property' : 'Add Rental Property'}
            </h3>
            <button type="button" onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t('propertyType')}</label>
                <SearchableSelect
                  options={PROPERTY_TYPES}
                  value={currentEntry.propertyType}
                  onChange={(val) => setCurrentEntry((p) => ({ ...p, propertyType: val as RentPropertyType }))}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t('ownershipShare')}</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={currentEntry.ownershipSharePercentage}
                  onChange={(e) =>
                    setCurrentEntry((p) => ({ ...p, ownershipSharePercentage: parseFloat(e.target.value) || 100 }))
                  }
                  className="w-full rounded-md border border-gray-300 py-1.5 px-3 text-xs focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('propertyAddress')} *</label>
              <input
                type="text"
                value={currentEntry.propertyAddress}
                onChange={(e) => setCurrentEntry((p) => ({ ...p, propertyAddress: e.target.value }))}
                placeholder="e.g. Flat 4A, Road 12, Sector 3, Uttara, Dhaka"
                className="w-full rounded-md border border-gray-300 py-1.5 px-3 text-xs focus:border-emerald-600 focus:outline-none"
              />
            </div>

            {/* Income Received */}
            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 border-b border-gray-100 pb-1">
                Rental Receipts
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">{t('annualRent')}</label>
                  <AmountInput
                    value={currentEntry.annualRentReceived}
                    onChange={(v) => setCurrentEntry((p) => ({ ...p, annualRentReceived: v }))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">{t('advanceRent')}</label>
                  <AmountInput
                    value={currentEntry.advanceRentReceived}
                    onChange={(v) => setCurrentEntry((p) => ({ ...p, advanceRentReceived: v }))}
                  />
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 border-b border-gray-100 pb-1">
                Allowable Statutory Deductions & Expenses
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">{t('municipalTax')}</label>
                  <AmountInput
                    value={currentEntry.municipalTaxPaid}
                    onChange={(v) => setCurrentEntry((p) => ({ ...p, municipalTaxPaid: v }))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">{t('landRevenue')}</label>
                  <AmountInput
                    value={currentEntry.landRevenuePaid}
                    onChange={(v) => setCurrentEntry((p) => ({ ...p, landRevenuePaid: v }))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">{t('loanInterest')}</label>
                  <AmountInput
                    value={currentEntry.interestOnLoanPaid}
                    onChange={(v) => setCurrentEntry((p) => ({ ...p, interestOnLoanPaid: v }))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">{t('insurancePremium')}</label>
                  <AmountInput
                    value={currentEntry.insurancePremiumPaid}
                    onChange={(v) => setCurrentEntry((p) => ({ ...p, insurancePremiumPaid: v }))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">{t('vacancyAllowance')}</label>
                  <AmountInput
                    value={currentEntry.vacancyAllowance}
                    onChange={(v) => setCurrentEntry((p) => ({ ...p, vacancyAllowance: v }))}
                  />
                </div>
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

      {/* Property Cards & Summary */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">
            {language === 'bn' ? 'ভাড়া দেওয়া সম্পত্তির তালিকা ও সারসংক্ষেপ' : 'Rent Summary & Declared Properties'}
          </h3>
          <div className="text-xs space-x-3">
            <span className="text-gray-500 font-mono">Gross Rent: {formatBDT(totalRentReceived, language)}</span>
            <span className="font-mono font-bold text-emerald-800">{t('total')}: {netPending}</span>
          </div>
        </div>

        {income.rentEntries.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500">
            {t('noRecordsFound')}. Click "Add Another Property" to declare rental properties.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {income.rentEntries.map((entry) => (
              <div key={entry.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900">{entry.propertyType}</span>
                    <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 font-mono">
                      Share: {entry.ownershipSharePercentage}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">{entry.propertyAddress}</div>
                  <div className="text-[11px] text-gray-400 font-mono">
                    Rent: {formatBDT(entry.annualRentReceived, language)} • {language === 'bn' ? 'কর্তন যাচাই বাকি' : 'Deductions pending rule verification'}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-gray-500 block">Net Rent:</span>
                    <span className="text-sm font-bold font-mono text-gray-900">
                      {netPending}
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
