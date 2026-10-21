import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatBDT } from '../../i18n/formatters';
import {
  FileText,
  DollarSign,
  TrendingDown,
  ShoppingBag,
  Building,
  CreditCard,
  Eye,
  ArrowRight,
  ShieldCheck,
  Award,
  Receipt,
  History,
  Calendar,
  AlertCircle,
  Briefcase,
} from 'lucide-react';

export const HomeDashboard: React.FC = () => {
  const { language, t, assessmentYear, profile, taxPayment, expenditure, assetsLiabilities } = useApp();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 rounded-xl p-6 text-white shadow-sm border border-emerald-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded">
            Taxpayer Portal • AY {assessmentYear}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold mt-1">
            {language === 'bn' ? `স্বাগতম, ${profile.nameBn}` : `Welcome, ${profile.name}`}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
            {language === 'bn'
              ? 'আপনার কর নির্ধারণ, আয়ের উৎস, কর রেয়াত ও পরিসম্পদ বিবরণী সম্পন্ন করে সময়মতো আয়কর রিটার্ন দাখিল করুন।'
              : 'Prepare and file your individual income tax return under Universal Self-Assessment before Tax Day (30 November).'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/user-panel/assessment')}
            className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-bold px-4 py-2.5 rounded-lg text-sm shadow-md transition-all cursor-pointer"
          >
            <span>{language === 'bn' ? 'রিটার্ন প্রস্তুতকরণ শুরু করুন' : 'Continue Return Preparation'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-medium">{t('taxableIncomeSummary')}</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-gray-900 font-mono">
            {formatBDT(taxPayment.taxableIncome, language)}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            {language === 'bn' ? 'রিটার্নে প্রদর্শিত মোট করযোগ্য আয়' : 'Aggregated from active income heads'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-medium">{t('netTax')}</span>
            <CreditCard className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-gray-900 font-mono">
            {formatBDT(taxPayment.netTaxLiability, language)}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            {language === 'bn' ? 'রেয়াত ও ন্যূনতম কর বিবেচনার পর' : 'After allowable investment tax rebate'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-medium">{t('totalPaidAndCredited')}</span>
            <Receipt className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-gray-900 font-mono">
            {formatBDT(taxPayment.totalTaxPaidAndCredited, language)}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            {language === 'bn' ? 'টিডিএস, অগ্রিম কর ও চালানে প্রদত্ত' : 'TDS, Advance Tax & Treasury Challan'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-medium">{t('netWealthCurrent')}</span>
            <Building className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-bold text-gray-900 font-mono">
            {formatBDT(assetsLiabilities.netWealthCurrentYear, language)}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            {language === 'bn' ? 'আইটি-১০বি অনুযায়ী মোট নিট সম্পদ' : 'IT-10B Assets less total liabilities'}
          </p>
        </div>
      </div>

      {/* Return Preparation Stages Tracker */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              {language === 'bn' ? '৭-ধাপ বিশিষ্ট রিটার্ন প্রস্তুতকরণ' : '7-Stage Return Preparation Journey'}
            </h3>
            <p className="text-xs text-gray-500">
              {language === 'bn'
                ? 'আইনগত প্রয়োজনীয় সকল তথ্য যথাযথ ক্রমানুসারে পূরণ করুন।'
                : 'Complete all statutory steps in sequence as verified in the authenticated eReturn workflow.'}
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
            {language === 'bn' ? 'স্বনির্ধারণী প্রস্তুত চলমান' : 'Universal Self-Assessment'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div
            onClick={() => navigate('/user-panel/assessment')}
            className="p-3.5 rounded-lg border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/40 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">1</span>
              <FileText className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="font-semibold text-xs text-gray-900 group-hover:text-emerald-900">
              {t('step1')}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              {language === 'bn' ? 'করবর্ষ ও আয়ের প্রযোজ্য খাত নির্বাচন' : 'Scheme, AY, and Income Head Selection'}
            </p>
          </div>

          <div
            onClick={() => navigate('/user-panel/income')}
            className="p-3.5 rounded-lg border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/40 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">2</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="font-semibold text-xs text-gray-900 group-hover:text-emerald-900">
              {t('step2')}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              {language === 'bn' ? '১৩টি সম্ভাব্য খাতের বিবরণী ও বাদ' : '13 statutory heads of income'}
            </p>
          </div>

          <div
            onClick={() => navigate('/user-panel/rebate')}
            className="p-3.5 rounded-lg border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/40 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">3</span>
              <TrendingDown className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="font-semibold text-xs text-gray-900 group-hover:text-emerald-900">
              {t('step3')}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              {language === 'bn' ? '১২টি অনুমোদিত বিনিয়োগ খাত' : 'Schedule 24D eligible investments'}
            </p>
          </div>

          <div
            onClick={() => navigate('/user-panel/expenditure')}
            className="p-3.5 rounded-lg border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/40 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">4</span>
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="font-semibold text-xs text-gray-900 group-hover:text-emerald-900">
              {t('step4')}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              {language === 'bn' ? '৯টি জীবনযাত্রার ব্যয়ের খাত' : 'IT-10BB lifestyle expenditure lines'}
            </p>
          </div>

          <div
            onClick={() => navigate('/user-panel/assets-liabilities')}
            className="p-3.5 rounded-lg border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/40 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">5</span>
              <Building className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="font-semibold text-xs text-gray-900 group-hover:text-emerald-900">
              {t('step5')}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              {language === 'bn' ? 'আইটি-১০বি সম্পদ, দায় ও তহবিল মিলন' : 'IT-10B Assets, liabilities & reconciliation'}
            </p>
          </div>

          <div
            onClick={() => navigate('/user-panel/tax-payment')}
            className="p-3.5 rounded-lg border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/40 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">6</span>
              <CreditCard className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="font-semibold text-xs text-gray-900 group-hover:text-emerald-900">
              {t('step6')}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              {language === 'bn' ? 'কর হিসাব ও ট্রেজারি চালান তথ্য' : 'Computation, TDS credit & challans'}
            </p>
          </div>

          <div
            onClick={() => navigate('/user-panel/return-view')}
            className="p-3.5 rounded-lg border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/40 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">7</span>
              <Eye className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="font-semibold text-xs text-gray-900 group-hover:text-emerald-900">
              {t('step7')}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              {language === 'bn' ? 'আইটি-১১গ প্রিন্ট প্রিভিউ ফরম' : 'IT-11GA form inspection & print'}
            </p>
          </div>

          <div
            onClick={() => navigate('/user-panel/submission')}
            className="p-3.5 rounded-lg border border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100/50 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">✓</span>
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="font-semibold text-xs text-emerald-950">
              {t('navSubmission')}
            </div>
            <p className="text-[11px] text-emerald-700 mt-1">
              {language === 'bn' ? 'চূড়ান্ত নিরীক্ষা ও আইনগত অঙ্গীকার' : 'Readiness validation & affirmation'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/user-panel/tin-certificate')}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs hover:border-blue-400 cursor-pointer transition-all flex items-start gap-3"
        >
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">{t('navTinCert')}</h4>
            <p className="text-xs text-gray-500 mt-0.5">
              {language === 'bn' ? 'সরকারি টিআইএন সনদপত্র দেখুন ও প্রিন্ট করুন' : 'View official taxpayer certificate'}
            </p>
          </div>
        </div>

        <div
          onClick={() => navigate('/user-panel/acknowledgement')}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs hover:border-blue-400 cursor-pointer transition-all flex items-start gap-3"
        >
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">{t('navAckReceipt')}</h4>
            <p className="text-xs text-gray-500 mt-0.5">
              {language === 'bn' ? 'রিটার্ন দাখিলের প্রাপ্তিস্বীকার পত্র' : 'Official acknowledgement slip'}
            </p>
          </div>
        </div>

        <div
          onClick={() => navigate('/user-panel/audited-accounts')}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs hover:border-purple-400 cursor-pointer transition-all flex items-start gap-3"
        >
          <div className="p-2.5 rounded-lg bg-purple-50 text-purple-700 shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">{t('navAuditedAccounts')}</h4>
            <p className="text-xs text-gray-500 mt-0.5">
              {language === 'bn' ? 'করপোরেট আর্থিক বিবরণী ও ৩-স্তর নোটস' : 'Corporate financial statements & notes'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
