import React from 'react';
import { useApp } from '../../context/AppContext';
import { AmountInput } from '../../components/common/AmountInput';
import { StepNavigationButtons } from '../../components/common/StepNavigationButtons';
import { formatBDT } from '../../i18n/formatters';
import { CreditCard, AlertTriangle, ShieldCheck, Receipt, Building, CheckCircle2 } from 'lucide-react';

export const TaxPaymentPage: React.FC = () => {
  const { language, t, taxPayment, setTaxPayment } = useApp();

  const handleUpdate = (field: keyof typeof taxPayment, val: any) => {
    setTaxPayment((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const isRefundable = taxPayment.netPayableOrRefundable < 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-emerald-700" />
          <h2 className="text-xl font-bold text-gray-900">{t('taxPaymentTitle')}</h2>
        </div>
        <p className="text-xs text-gray-500 mt-1">{t('taxPaymentSubtitle')}</p>
      </div>

      {/* Scope Notice: Payment Execution Boundary */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-xs">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 space-y-1">
            <span className="font-bold block">{t('paymentDisclaimerTitle')}</span>
            <p className="leading-relaxed">{t('paymentDisclaimer')}</p>
          </div>
        </div>
      </div>

      {/* 1. Tax Computation Summary */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            1. {t('taxLiabilitySummary')}
          </h3>
          <span className="text-xs font-mono text-gray-500">
            Rules Engine: Final 2026-09-30 (R-002 / T-004 Boundary)
          </span>
        </div>

        <div className="space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
            <span className="text-gray-600">{t('taxableIncomeSummary')}</span>
            <span className="font-bold text-gray-900 text-sm">
              {formatBDT(taxPayment.taxableIncome, language)}
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
            <span className="text-gray-600">{t('grossTax')}</span>
            <span className="font-semibold text-gray-900">
              {formatBDT(taxPayment.grossTaxCalculated, language)}
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-gray-50 text-emerald-700">
            <span>{t('rebateDeduction')} (Schedule 24D)</span>
            <span>- {formatBDT(taxPayment.taxRebateDeducted, language)}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
            <span className="text-gray-600">{t('minimumTax')} (Zone 04 Dhaka)</span>
            <span className="text-gray-700">Min. {formatBDT(taxPayment.minimumTaxRateApplied, language)}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
            <span className="text-gray-600">{t('surcharge')}</span>
            <span className="text-gray-700">{formatBDT(taxPayment.surchargeAmount, language)}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
            <span className="text-gray-600">{t('penaltyDelay')}</span>
            <span className="text-gray-700">{formatBDT(taxPayment.delayInterestOrPenalty, language)}</span>
          </div>

          <div className="flex items-center justify-between py-2 bg-emerald-50 px-3 rounded-lg font-bold text-emerald-950 text-sm">
            <span>{t('totalPayable')}</span>
            <span>{formatBDT(taxPayment.totalTaxPayable, language)}</span>
          </div>
        </div>
      </div>

      {/* 2. Tax Deducted or Collected at Source (TDS/AIT) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            2. {t('withholdingSection')}
          </h3>
          <span className="text-xs font-mono font-bold text-blue-700">
            Total TDS: {formatBDT(taxPayment.totalTDS, language)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-gray-600 mb-1">{t('tdsSalary')}</label>
            <AmountInput
              value={taxPayment.tdsSalary}
              onChange={(v) => handleUpdate('tdsSalary', v)}
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1">{t('tdsBank')}</label>
            <AmountInput
              value={taxPayment.tdsBankAndFinancial}
              onChange={(v) => handleUpdate('tdsBankAndFinancial', v)}
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1">{t('tdsContracts')}</label>
            <AmountInput
              value={taxPayment.tdsContractAndSupplies}
              onChange={(v) => handleUpdate('tdsContractAndSupplies', v)}
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1">{t('tdsRent')}</label>
            <AmountInput
              value={taxPayment.tdsRentAndOther}
              onChange={(v) => handleUpdate('tdsRentAndOther', v)}
            />
          </div>
        </div>
      </div>

      {/* 3. Advance Tax & Tax Paid with Return (Self-Assessment Challan) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-2">
          3. Advance Tax & Treasury Challan Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-gray-600 mb-1">{t('advanceTax')}</label>
            <AmountInput
              value={taxPayment.advanceTaxPaid}
              onChange={(v) => handleUpdate('advanceTaxPaid', v)}
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1">{t('taxPaidReturn')}</label>
            <AmountInput
              value={taxPayment.taxPaidWithReturn}
              onChange={(v) => handleUpdate('taxPaidWithReturn', v)}
            />
          </div>
        </div>

        {/* Challan Particulars Entry */}
        <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/50 space-y-3 pt-3">
          <span className="text-xs font-bold text-gray-800 block">
            Treasury Challan Particulars (For Section 173 Payment Matching)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-gray-600 mb-1">Challan Number</label>
              <input
                type="text"
                value={taxPayment.challanNumber}
                onChange={(e) => handleUpdate('challanNumber', e.target.value)}
                placeholder="e.g. TR-CH-2026-9921"
                className="w-full rounded-md border border-gray-300 py-1.5 px-3 text-xs focus:border-emerald-600 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-1">Challan Date</label>
              <input
                type="date"
                value={taxPayment.challanDate}
                onChange={(e) => handleUpdate('challanDate', e.target.value)}
                className="w-full rounded-md border border-gray-300 py-1.5 px-3 text-xs focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-1">Bank & Branch</label>
              <input
                type="text"
                value={taxPayment.bankName}
                onChange={(e) => handleUpdate('bankName', e.target.value)}
                placeholder="e.g. Sonali Bank PLC (Dhaka Main)"
                className="w-full rounded-md border border-gray-300 py-1.5 px-3 text-xs focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Final Settlement Summary */}
      <div
        className={`rounded-xl p-6 border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isRefundable
            ? 'bg-blue-50 border-blue-300 text-blue-950'
            : taxPayment.netPayableOrRefundable === 0
            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
            : 'bg-red-50 border-red-300 text-red-950'
        }`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-gray-700" />
            <h4 className="text-base font-bold">{t('netTaxPayableOrRefund')}</h4>
          </div>
          <p className="text-xs opacity-80">
            {isRefundable
              ? language === 'bn'
                ? 'আপনার অতিরিক্ত কর পরিশোধিত থাকায় এটি ফেরত (Refund) হিসেবে দাবি করা যাইবে।'
                : 'Tax paid exceeds statutory liability; claimable as a tax refund in assessment.'
              : taxPayment.netPayableOrRefundable === 0
              ? language === 'bn'
                ? 'সকল কর পরিশোধ ও সমন্বয় সুষম (কোনো বকেয়া নেই)।'
                : 'All tax liabilities have been fully discharged and reconciled.'
              : language === 'bn'
              ? 'অবশিষ্ট কর পরিশোধ না করা পর্যন্ত রিটার্ন স্বনির্ধারণী হিসেবে চূড়ান্ত গণ্য হইবে না।'
              : 'Outstanding tax payable must be settled via treasury challan prior to submission.'}
          </p>
        </div>

        <div className="text-right">
          <span className="text-2xl font-bold font-mono">
            {formatBDT(Math.abs(taxPayment.netPayableOrRefundable), language)}
          </span>
          <span className="block text-xs font-semibold mt-0.5">
            {isRefundable ? '(Refund Due)' : taxPayment.netPayableOrRefundable === 0 ? '(Nil Balance)' : '(Payable Balance)'}
          </span>
        </div>
      </div>

      <StepNavigationButtons
        backPath="/user-panel/assets-liabilities"
        nextPath="/user-panel/return-view"
      />
    </div>
  );
};
