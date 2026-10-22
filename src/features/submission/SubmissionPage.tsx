import React from 'react';
import { RULES_ENGINE_GATE } from '../../adapters/calculationAdapter';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatBDT } from '../../i18n/formatters';
import { aggregateIncomeHeads } from '../../adapters/calculationAdapter';
import {
  Send,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  FileText,
  DollarSign,
  Building,
  CreditCard,
  ArrowRight,
  Download,
  Receipt,
  Award,
} from 'lucide-react';

export const SubmissionPage: React.FC = () => {
  const {
    language,
    t,
    profile,
    assessment,
    income,
    rebate,
    expenditure,
    assetsLiabilities,
    taxPayment,
    submission,
    setSubmission,
    exportDraftJson,
  } = useApp();

  const navigate = useNavigate();

  const incAgg = aggregateIncomeHeads(income);

  // Validation checks for submission readiness
  const checks = [
    {
      id: 'assessment',
      title: 'Assessment Parameters Entered (not legally verified)',
      isPassed: Boolean(assessment.returnScheme && assessment.assessmentYear && assessment.residentStatus),
      path: '/user-panel/assessment',
    },
    {
      id: 'income',
      title: 'Active Income Heads Completed',
      isPassed: incAgg.totalTaxableIncome > 0,
      path: '/user-panel/income',
    },
    {
      id: 'expenditure',
      title: 'Lifestyle Expenses (IT-10BB) Recorded',
      isPassed: expenditure.totalExpenditure > 0,
      path: '/user-panel/expenditure',
    },
    {
      id: 'assets',
      title: 'Statement of Assets & Liabilities (IT-10B) Configured',
      isPassed: assetsLiabilities.totalAssets > 0,
      path: '/user-panel/assets-liabilities',
    },
    {
      id: 'tax',
      title: 'Tax & Payment Calculation — blocked pending certified Rules Engine',
      isPassed: RULES_ENGINE_GATE.hasApprovedCalculation,
      path: '/user-panel/tax-payment',
    },
  ];

  const handleLocalSubmit = () => {
    // Fail closed, including when invoked programmatically. Do not create local
    // filing serial numbers or imitate acknowledgement of an actual tax return.
    window.alert(language === 'bn'
      ? 'অনুমোদিত কর রুলস ইঞ্জিন ছাড়া রিটার্ন জমা দেওয়া যাবে না।'
      : 'Submission blocked: no approved Rules Engine calculation or authorized filing integration.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <Send className="w-5 h-5 text-ui-accent" />
          <h2 className="text-xl font-bold text-ui-content-primary">{t('submissionTitle')}</h2>
        </div>
        <p className="text-xs text-ui-content-muted mt-1">{t('submissionSubtitle')}</p>
      </div>

      {/* Scope Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 space-y-1">
          <span className="font-bold block">Development & Local Testing Execution Mode</span>
          <p className="leading-relaxed">{t('submissionNotice')}</p>
        </div>
      </div>

      <div role="alert" className="bg-amber-50 border border-amber-300 text-amber-950 rounded-xl p-4 text-xs">
        <strong>{language === 'bn' ? 'রিটার্ন জমা দেওয়া বন্ধ' : 'Filing is not available'}</strong>
        <p className="mt-1">{language === 'bn'
          ? 'অনুমোদিত করবর্ষ ও করদাতাভিত্তিক রুলস ইঞ্জিনের ফল এবং নিরাপদ জমা দেওয়ার সংযোগ যাচাই না হওয়া পর্যন্ত কোনো রিটার্ন জমা বা প্রাপ্তিস্বীকার তৈরি হবে না।'
          : 'No filing or acknowledgement can be generated until certified year- and taxpayer-scoped tax calculations and an authorized submission API are verified. You may continue reviewing your entered draft.'}</p>
      </div>
      {/* If already submitted locally */}
      {RULES_ENGINE_GATE.hasApprovedCalculation && submission.isSubmittedLocally ? (
        <div className="bg-ui-surface rounded-xl border border-emerald-300 shadow-lg p-8 text-center space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-ui-accent-soft text-ui-accent flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-ui-content-primary">{t('filedSuccessfully')}</h3>
            <p className="text-xs text-ui-content-secondary max-w-md mx-auto">
              Your Universal Self-Assessment return for AY {assessment.assessmentYear} has been locally verified and validated.
            </p>
          </div>

          {/* Tokens */}
          <div className="bg-ui-surface-subtle border border-ui-stroke-subtle rounded-lg p-4 max-w-md mx-auto font-mono text-xs space-y-2 text-left">
            <div className="flex justify-between border-b border-ui-stroke-subtle pb-1.5">
              <span className="text-ui-content-muted">{t('filingSerial')}:</span>
              <span className="font-bold text-ui-accent">{submission.localSubmissionId}</span>
            </div>
            <div className="flex justify-between border-b border-ui-stroke-subtle pb-1.5">
              <span className="text-ui-content-muted">{t('filingDate')}:</span>
              <span className="text-ui-content-primary">{submission.localSubmissionTimestamp}</span>
            </div>
            <div className="flex justify-between border-b border-ui-stroke-subtle pb-1.5">
              <span className="text-ui-content-muted">TIN Number:</span>
              <span className="font-bold text-ui-content-primary">{profile.tin}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ui-content-muted">Tax Payable / Paid:</span>
              <span className="font-bold text-ui-accent">{(language === 'bn' ? 'রুলস ইঞ্জিন অনুমোদন বাকি' : 'Pending Rules Engine')}</span>
            </div>
          </div>

          {/* Direct CTA to Acknowledgement & TIN Cert */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/user-panel/acknowledgement')}
              className="inline-flex items-center gap-2 bg-ui-action-bg hover:bg-ui-action-hover text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm cursor-pointer"
            >
              <Receipt className="w-4 h-4" />
              <span>{language === 'bn' ? 'প্রাপ্তিস্বীকার রসিদ দেখুন' : 'View Acknowledgement Slip'}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/user-panel/tin-certificate')}
              className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>{t('navTinCert')}</span>
            </button>

            <button
              type="button"
              onClick={exportDraftJson}
              className="inline-flex items-center gap-2 bg-ui-surface-subtle hover:bg-gray-200 text-ui-content-primary text-xs font-semibold px-4 py-2.5 rounded-lg border border-ui-stroke-default cursor-pointer"
            >
              <Download className="w-4 h-4 text-ui-content-secondary" />
              <span>{t('exportDraft')}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Readiness Checklist */}
          <div className="bg-ui-surface rounded-xl border border-ui-stroke-subtle shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-bold text-ui-content-primary uppercase tracking-wide border-b border-ui-stroke-subtle pb-2">
              {t('completenessChecklist')}
            </h3>

            <div className="space-y-3">
              {checks.map((chk) => (
                <div
                  key={chk.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-ui-stroke-subtle bg-ui-surface-subtle/50 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    {chk.isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-ui-accent shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    <span className={chk.isPassed ? 'text-ui-content-primary font-medium' : 'text-amber-800 font-medium'}>
                      {chk.title}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(chk.path)}
                    className="text-xs text-ui-accent hover:text-ui-content-primary font-semibold"
                  >
                    Review
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submission Summary Box */}
          <div className="bg-ui-surface rounded-xl border border-ui-stroke-subtle shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-bold text-ui-content-primary uppercase tracking-wide border-b border-ui-stroke-subtle pb-2">
              Entered Draft Summary for Assessment Year {assessment.assessmentYear}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-3 bg-ui-surface-subtle rounded-lg border border-ui-stroke-subtle">
                <span className="text-ui-content-muted block text-[11px]">Total Taxable Income:</span>
                <span className="text-sm font-bold text-ui-content-primary">{formatBDT(incAgg.totalTaxableIncome, language)}</span>
              </div>
              <div className="p-3 bg-ui-surface-subtle rounded-lg border border-ui-stroke-subtle">
                <span className="text-ui-content-muted block text-[11px]">Statutory Tax Liability (not calculated):</span>
                <span className="text-sm font-bold text-ui-content-primary">{(language === 'bn' ? 'রুলস ইঞ্জিন অনুমোদন বাকি' : 'Pending Rules Engine')}</span>
              </div>
              <div className="p-3 bg-ui-surface-subtle rounded-lg border border-ui-stroke-subtle">
                <span className="text-ui-content-muted block text-[11px]">TDS + Advance Tax:</span>
                <span className="text-sm font-bold text-blue-800">{formatBDT(taxPayment.totalTaxPaidAndCredited, language)}</span>
              </div>
              <div className="p-3 bg-ui-surface-subtle rounded-lg border border-ui-stroke-subtle">
                <span className="text-ui-content-muted block text-[11px]">Net Wealth (IT-10B):</span>
                <span className="text-sm font-bold text-purple-800">{formatBDT(assetsLiabilities.netWealthCurrentYear, language)}</span>
              </div>
            </div>
          </div>

          {/* Legal Declaration */}
          <div className="bg-ui-surface rounded-xl border border-ui-stroke-subtle shadow-xs p-6 space-y-5">
            <h3 className="text-sm font-bold text-ui-content-primary uppercase tracking-wide border-b border-ui-stroke-subtle pb-2">
              {t('declarationTitle')}
            </h3>

            <div className="p-4 rounded-lg bg-ui-accent-soft/50 border border-ui-accent-border">
              <label className="flex items-start gap-3 cursor-pointer text-xs text-ui-content-primary select-none">
                <input
                  type="checkbox"
                  checked={submission.declarationAccepted}
                  onChange={(e) =>
                    setSubmission((prev) => ({ ...prev, declarationAccepted: e.target.checked }))
                  }
                  className="h-4 w-4 text-ui-accent rounded border-ui-stroke-default mt-0.5 shrink-0"
                />
                <span className="leading-relaxed">{t('declarationBody')}</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-ui-content-secondary mb-1">{t('taxpayerNameAffirm')}</label>
                <input
                  type="text"
                  value={submission.taxpayerNameAffirmed}
                  onChange={(e) =>
                    setSubmission((prev) => ({ ...prev, taxpayerNameAffirmed: e.target.value }))
                  }
                  className="w-full rounded-md border border-ui-stroke-default py-1.5 px-3 focus:border-ui-focus focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-ui-content-secondary mb-1">{t('capacityAffirm')}</label>
                <input
                  type="text"
                  value={submission.designationOrCapacity}
                  onChange={(e) =>
                    setSubmission((prev) => ({ ...prev, designationOrCapacity: e.target.value }))
                  }
                  className="w-full rounded-md border border-ui-stroke-default py-1.5 px-3 focus:border-ui-focus focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-ui-content-secondary mb-1">{t('placeAffirm')}</label>
                <input
                  type="text"
                  value={submission.placeAffirmed}
                  onChange={(e) =>
                    setSubmission((prev) => ({ ...prev, placeAffirmed: e.target.value }))
                  }
                  className="w-full rounded-md border border-ui-stroke-default py-1.5 px-3 focus:border-ui-focus focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-ui-content-secondary mb-1">{t('dateAffirm')}</label>
                <input
                  type="date"
                  value={submission.dateAffirmed}
                  onChange={(e) =>
                    setSubmission((prev) => ({ ...prev, dateAffirmed: e.target.value }))
                  }
                  className="w-full rounded-md border border-ui-stroke-default py-1.5 px-3 focus:border-ui-focus focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-ui-stroke-subtle">
              <button
                type="button"
                onClick={() => navigate('/user-panel/return-view')}
                className="text-xs text-ui-content-secondary hover:text-ui-content-primary font-semibold"
              >
                ← {language === 'bn' ? 'রিটার্ন প্রিভিউতে ফিরুন' : 'Back to Return Preview'}
              </button>

              <button
                type="button"
                disabled={!RULES_ENGINE_GATE.hasApprovedCalculation || !submission.declarationAccepted}
                onClick={handleLocalSubmit}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-ui-action-bg hover:bg-ui-action-hover disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-bold px-6 py-3 rounded-lg shadow-sm transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{t('submitReturnBtn')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
