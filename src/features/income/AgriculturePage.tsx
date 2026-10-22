import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AgricultureEntry, AgricultureType } from '../../types';
import { AmountInput } from '../../components/common/AmountInput';
import { SearchableSelect } from '../../components/common/SearchableSelect';
import { StepNavigationButtons } from '../../components/common/StepNavigationButtons';
import { formatBDT } from '../../i18n/formatters';
import { Plus, Trash2, Edit2, Check, X, Sprout } from 'lucide-react';

const AGRI_TYPES: AgricultureType[] = [
  'Production of Crops & Grains',
  'Tea & Rubber Estate',
  'Fisheries & Aquaculture',
  'Livestock, Poultry & Dairy',
  'Other Agricultural Income',
];

export const AgriculturePage: React.FC = () => {
  const { language, t, income, setIncome, askConfirmation } = useApp();
  const [isEditing, setIsEditing] = useState(false);

  const [currentEntry, setCurrentEntry] = useState<AgricultureEntry>({
    id: '',
    type: 'Production of Crops & Grains',
    landDescription: '',
    grossSaleProceeds: 0,
    costOfProduction: 0,
    statutoryExemptionClaimed: 0,
    netAgriculturalIncome: 0,
  });

  const handleOpenAdd = () => {
    setCurrentEntry({
      id: `agri-${Date.now()}`,
      type: 'Production of Crops & Grains',
      landDescription: '',
      grossSaleProceeds: 0,
      costOfProduction: 0,
      statutoryExemptionClaimed: 0,
      netAgriculturalIncome: 0,
    });
    setIsEditing(true);
  };

  const handleEdit = (entry: AgricultureEntry) => {
    setCurrentEntry(entry);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!currentEntry.landDescription.trim()) {
      alert('Please enter land description / location.');
      return;
    }
    // Standard 60% production cost default if zero
    const prodCost = currentEntry.costOfProduction > 0
      ? currentEntry.costOfProduction
      : (currentEntry.grossSaleProceeds * 0.6);

    const net = Math.max(0, currentEntry.grossSaleProceeds - prodCost - (currentEntry.statutoryExemptionClaimed || 0));
    const finalized = {
      ...currentEntry,
      costOfProduction: prodCost,
      netAgriculturalIncome: Math.round(net),
    };

    setIncome((prev) => {
      const exists = prev.agricultureEntries.some((e) => e.id === finalized.id);
      return {
        ...prev,
        agricultureEntries: exists
          ? prev.agricultureEntries.map((e) => (e.id === finalized.id ? finalized : e))
          : [...prev.agricultureEntries, finalized],
      };
    });
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    askConfirmation({
      title: 'Remove Agricultural Income Entry',
      message: 'Are you sure you want to remove this agricultural record?',
      isDestructive: true,
      onConfirm: () => {
        setIncome((prev) => ({
          ...prev,
          agricultureEntries: prev.agricultureEntries.filter((e) => e.id !== id),
        }));
      },
    });
  };

  const totalNet = income.agricultureEntries.reduce((s, e) => s + e.netAgriculturalIncome, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-ui-accent" />
            <h2 className="text-xl font-bold text-ui-content-primary">{t('agriTitle')}</h2>
          </div>
          <p className="text-xs text-ui-content-muted mt-1">
            Reference route: <code className="font-mono bg-ui-surface-subtle px-1 py-0.5 rounded">#/user-panel/agriculture</code>
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 bg-ui-action-bg hover:bg-ui-action-hover text-white text-xs font-semibold px-3 py-2 rounded-md shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {language === 'bn' ? 'কৃষি আয় যোগ করুন' : 'Add Agricultural Entry'}
          </button>
        )}
      </div>

      {isEditing && (
        <div className="bg-ui-surface rounded-xl border border-emerald-300 shadow-md p-6 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-ui-stroke-subtle pb-2">
            <h3 className="text-sm font-bold text-ui-content-primary">
              {currentEntry.id ? 'Edit Agricultural Income' : 'Add Agricultural Income'}
            </h3>
            <button type="button" onClick={() => setIsEditing(false)} className="text-ui-content-muted hover:text-ui-content-secondary">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ui-content-secondary mb-1">
                {t('agriType')} (5 Standard Choices)
              </label>
              <SearchableSelect
                options={AGRI_TYPES}
                value={currentEntry.type}
                onChange={(val) => setCurrentEntry((p) => ({ ...p, type: val as AgricultureType }))}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ui-content-secondary mb-1">{t('landDesc')} *</label>
              <input
                type="text"
                value={currentEntry.landDescription}
                onChange={(e) => setCurrentEntry((p) => ({ ...p, landDescription: e.target.value }))}
                placeholder="e.g. 5 Bigha Farmland, Krishnapur Mauza, Gazipur"
                className="w-full rounded-md border border-ui-stroke-default py-1.5 px-3 text-xs focus:border-ui-focus focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-ui-content-secondary mb-1">{t('grossSale')}</label>
                <AmountInput
                  value={currentEntry.grossSaleProceeds}
                  onChange={(v) => setCurrentEntry((p) => ({ ...p, grossSaleProceeds: v }))}
                />
              </div>
              <div>
                <label className="block text-xs text-ui-content-secondary mb-1">{t('productionCost')}</label>
                <AmountInput
                  value={currentEntry.costOfProduction}
                  onChange={(v) => setCurrentEntry((p) => ({ ...p, costOfProduction: v }))}
                  placeholder="Defaults to 60%"
                />
              </div>
              <div>
                <label className="block text-xs text-ui-content-secondary mb-1">Statutory Exemption</label>
                <AmountInput
                  value={currentEntry.statutoryExemptionClaimed}
                  onChange={(v) => setCurrentEntry((p) => ({ ...p, statutoryExemptionClaimed: v }))}
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
            {language === 'bn' ? 'কৃষি আয়ের বিবরণী' : 'Declared Agricultural Income'}
          </h3>
          <span className="font-mono font-bold text-xs text-ui-accent">
            {t('total')}: {formatBDT(totalNet, language)}
          </span>
        </div>

        {income.agricultureEntries.length === 0 ? (
          <div className="p-8 text-center text-xs text-ui-content-muted">
            {t('noRecordsFound')}. Click "Add Agricultural Entry" to declare agricultural income.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {income.agricultureEntries.map((entry) => (
              <div key={entry.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-ui-surface-subtle">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-ui-content-primary">{entry.type}</div>
                  <div className="text-xs text-ui-content-secondary">{entry.landDescription}</div>
                  <div className="text-[11px] text-ui-content-muted font-mono">
                    Sales: {formatBDT(entry.grossSaleProceeds, language)} • Prod Cost: {formatBDT(entry.costOfProduction, language)}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-ui-content-muted block">Net Income:</span>
                    <span className="text-sm font-bold font-mono text-ui-content-primary">
                      {formatBDT(entry.netAgriculturalIncome, language)}
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
