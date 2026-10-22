import React from 'react';
import { useApp } from '../../context/AppContext';
import { AmountInput } from '../../components/common/AmountInput';
import { StepNavigationButtons } from '../../components/common/StepNavigationButtons';
import { AccessibleHelpTooltip } from '../../components/common/AccessibleHelpTooltip';
import { formatBDT } from '../../i18n/formatters';
import { computeAssetsLiabilitiesReconciliation, aggregateIncomeHeads, aggregateExpenditure } from '../../adapters/calculationAdapter';
import { Building, Scale, CheckCircle2, AlertTriangle } from 'lucide-react';

export const AssetsLiabilitiesPage: React.FC = () => {
  const { language, t, assetsLiabilities, setAssetsLiabilities, income, expenditure } = useApp();

  const handleUpdate = (field: keyof typeof assetsLiabilities, val: number) => {
    setAssetsLiabilities((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const incAgg = aggregateIncomeHeads(income);
  const expTotal = aggregateExpenditure(expenditure);
  const recon = computeAssetsLiabilitiesReconciliation(
    assetsLiabilities,
    incAgg.totalTaxableIncome,
    incAgg.taxExemptTotal,
    expTotal
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-ui-accent" />
            <h2 className="text-xl font-bold text-ui-content-primary">{t('assetsTitle')}</h2>
          </div>
          <p className="text-xs text-ui-content-muted mt-1">{t('assetsSubtitle')}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-ui-accent-soft border border-ui-accent-border rounded-lg px-4 py-2 text-right">
            <span className="text-[11px] text-ui-accent font-medium block">Current Net Wealth:</span>
            <span className="text-lg font-bold font-mono text-ui-content-primary">
              {formatBDT(recon.netWealthCurrentYear, language)}
            </span>
          </div>
        </div>
      </div>

      {/* Reconciliation Status Card */}
      <div
        className={`rounded-xl p-4 border flex items-start gap-3 transition-colors ${
          recon.isReconciled
            ? 'bg-ui-accent-soft/70 border-emerald-300 text-emerald-950'
            : 'bg-amber-50/70 border-amber-300 text-amber-950'
        }`}
      >
        <div className="shrink-0 mt-0.5">
          {recon.isReconciled ? (
            <CheckCircle2 className="w-5 h-5 text-ui-accent" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-700" />
          )}
        </div>
        <div className="space-y-1 text-xs flex-1">
          <div className="font-bold flex items-center justify-between">
            <span>{recon.isReconciled ? t('reconMatch') : t('reconMismatch')}</span>
            <span className="font-mono text-xs">
              Diff: {formatBDT(recon.reconciliationDifference, language)}
            </span>
          </div>
          <p className="leading-relaxed opacity-90">
            {language === 'bn'
              ? 'নিট সম্পদের বৃদ্ধি (চলতি নিট সম্পদ - বিগত বছরের নিট সম্পদ) = প্রাপ্ত তহবিলের উদ্বৃত্ত (মোট অর্জিত তহবিল - বার্ষিক জীবনযাত্রার ব্যয়)।'
              : 'Growth in net wealth (Current year net wealth minus preceding year net wealth) must reconcile with available accretions (Total funds received minus lifestyle expenditures).'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Assets */}
        <div className="bg-ui-surface rounded-xl border border-ui-stroke-subtle shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-ui-stroke-subtle pb-2">
            <h3 className="text-sm font-bold text-ui-content-primary">{t('assetsSection')}</h3>
            <span className="text-xs font-mono font-bold text-ui-accent">
              Subtotal: {formatBDT(recon.totalAssets, language)}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-ui-content-secondary">{t('bizCapital')}</span>
                <AccessibleHelpTooltip content="Capital invested in proprietary firms, partnerships, or trade businesses outside limited companies." />
              </div>
              <AmountInput
                value={assetsLiabilities.businessCapital}
                onChange={(v) => handleUpdate('businessCapital', v)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-ui-content-secondary">{t('directorsShare')}</span>
                <AccessibleHelpTooltip content="Face value / cost of shares held as a director in private or public limited companies." />
              </div>
              <AmountInput
                value={assetsLiabilities.directorsShareholdings}
                onChange={(v) => handleUpdate('directorsShareholdings', v)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-ui-content-secondary">{t('nonAgriProperty')}</span>
                <AccessibleHelpTooltip content="Residential plots, apartments, commercial space, factory buildings at acquisition cost." />
              </div>
              <AmountInput
                value={assetsLiabilities.nonAgriculturalProperty}
                onChange={(v) => handleUpdate('nonAgriculturalProperty', v)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-ui-content-secondary">{t('agriProperty')}</span>
                <AccessibleHelpTooltip content="Farmland, agricultural plots, orchards and ponds at acquisition cost." />
              </div>
              <AmountInput
                value={assetsLiabilities.agriculturalProperty}
                onChange={(v) => handleUpdate('agriculturalProperty', v)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-ui-content-secondary">{t('financialAssetsWealth')}</span>
                <AccessibleHelpTooltip content="Sanchayapatra certificates, bank fixed deposits, shares, debentures, loans given to others, and closing bank balances." />
              </div>
              <AmountInput
                value={assetsLiabilities.financialAssetsValue}
                onChange={(v) => handleUpdate('financialAssetsValue', v)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-ui-content-secondary">{t('motorVehicles')}</span>
                <AccessibleHelpTooltip content="Personal cars, jeeps, motorcycles and vehicles registered with BRTA at acquisition cost." />
              </div>
              <AmountInput
                value={assetsLiabilities.motorVehicles}
                onChange={(v) => handleUpdate('motorVehicles', v)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-ui-content-secondary">{t('goldJewelry')}</span>
                <AccessibleHelpTooltip content="Cost or declared value of gold ornaments, jewelry, and precious stones." />
              </div>
              <AmountInput
                value={assetsLiabilities.goldAndJewelry}
                onChange={(v) => handleUpdate('goldAndJewelry', v)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-ui-content-secondary">{t('furnitureElectronics')}</span>
                <AccessibleHelpTooltip content="Household furniture, electronics, home appliances, air conditioners and TV." />
              </div>
              <AmountInput
                value={assetsLiabilities.furnitureAndElectronics}
                onChange={(v) => handleUpdate('furnitureAndElectronics', v)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-ui-content-secondary">{t('otherAssets')}</span>
                <AccessibleHelpTooltip content="Any other personal or capital belongings not enumerated above." />
              </div>
              <AmountInput
                value={assetsLiabilities.otherAssets}
                onChange={(v) => handleUpdate('otherAssets', v)}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Liabilities & Reconciliation */}
        <div className="space-y-6">
          {/* Liabilities */}
          <div className="bg-ui-surface rounded-xl border border-ui-stroke-subtle shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-ui-stroke-subtle pb-2">
              <h3 className="text-sm font-bold text-ui-content-primary">{t('liabilitiesSection')}</h3>
              <span className="text-xs font-mono font-bold text-red-700">
                Subtotal: {formatBDT(recon.totalLiabilities, language)}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="block font-medium text-ui-content-secondary mb-1">{t('mortgageDebt')}</span>
                <AmountInput
                  value={assetsLiabilities.mortgagesOnProperty}
                  onChange={(v) => handleUpdate('mortgagesOnProperty', v)}
                />
              </div>

              <div>
                <span className="block font-medium text-ui-content-secondary mb-1">{t('bankLoanDebt')}</span>
                <AmountInput
                  value={assetsLiabilities.bankLoans}
                  onChange={(v) => handleUpdate('bankLoans', v)}
                />
              </div>

              <div>
                <span className="block font-medium text-ui-content-secondary mb-1">{t('unsecuredDebt')}</span>
                <AmountInput
                  value={assetsLiabilities.unsecuredLoans}
                  onChange={(v) => handleUpdate('unsecuredLoans', v)}
                />
              </div>

              <div>
                <span className="block font-medium text-ui-content-secondary mb-1">{t('otherDebt')}</span>
                <AmountInput
                  value={assetsLiabilities.otherDebts}
                  onChange={(v) => handleUpdate('otherDebts', v)}
                />
              </div>
            </div>
          </div>

          {/* Net Wealth Prior Year & Change */}
          <div className="bg-ui-surface rounded-xl border border-ui-stroke-subtle shadow-xs p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ui-content-muted border-b border-ui-stroke-subtle pb-1">
              Net Wealth Year-on-Year Growth
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-ui-content-secondary mb-1">{t('netWealthPrevious')}</label>
                <AmountInput
                  value={assetsLiabilities.netWealthPreviousYear}
                  onChange={(v) => handleUpdate('netWealthPreviousYear', v)}
                />
              </div>

              <div className="bg-ui-surface-subtle p-2.5 rounded-lg border border-ui-stroke-subtle">
                <span className="block text-[11px] text-ui-content-muted">{t('changeInNetWealth')}</span>
                <span className="text-base font-bold font-mono text-ui-accent">
                  {formatBDT(recon.changeInNetWealth, language)}
                </span>
              </div>
            </div>
          </div>

          {/* Sources and Uses of Funds */}
          <div className="bg-ui-surface rounded-xl border border-ui-stroke-subtle shadow-xs p-5 space-y-3 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-ui-content-muted border-b border-ui-stroke-subtle pb-1 flex items-center justify-between">
              <span>{t('reconciliationSection')}</span>
              <Scale className="w-4 h-4 text-ui-accent" />
            </h4>

            <div className="space-y-2 font-mono">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-ui-content-secondary">{t('incomeReported')}:</span>
                <span className="font-semibold text-ui-content-primary">{formatBDT(incAgg.totalTaxableIncome, language)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-ui-content-secondary">{t('exemptIncomeReported')}:</span>
                <span className="font-semibold text-ui-content-primary">{formatBDT(incAgg.taxExemptTotal, language)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-50">
                <span className="text-ui-content-secondary">{t('otherReceipts')}:</span>
                <div className="w-36">
                  <AmountInput
                    value={assetsLiabilities.otherReceiptsAndGifts}
                    onChange={(v) => handleUpdate('otherReceiptsAndGifts', v)}
                  />
                </div>
              </div>
              <div className="flex justify-between py-1 font-bold text-ui-accent bg-ui-accent-soft px-2 rounded">
                <span>{t('totalFundSources')}:</span>
                <span>{formatBDT(recon.totalSourceOfFunds, language)}</span>
              </div>
              <div className="flex justify-between py-1 text-red-700 px-2">
                <span>Less: {t('usesOfFunds')}:</span>
                <span>- {formatBDT(recon.totalUsesOfFunds, language)}</span>
              </div>
              <div className="flex justify-between py-1.5 font-bold text-ui-content-primary border-t-2 border-ui-stroke-subtle px-2">
                <span>{t('reconciledBalance')}:</span>
                <span>{formatBDT(recon.netAccretion, language)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <StepNavigationButtons
        backPath="/user-panel/expenditure"
        nextPath="/user-panel/tax-payment"
      />
    </div>
  );
};
