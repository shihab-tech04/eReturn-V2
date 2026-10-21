import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatBDT } from '../../i18n/formatters';
import { aggregateIncomeHeads } from '../../adapters/calculationAdapter';
import { StepNavigationButtons } from '../../components/common/StepNavigationButtons';
import {
  Briefcase,
  Home,
  Sprout,
  Store,
  TrendingUp,
  Landmark,
  Coins,
  Users,
  Globe2,
  HeartHandshake,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const IncomeHubPage: React.FC = () => {
  const { language, t, assessment, income } = useApp();
  const navigate = useNavigate();

  const agg = aggregateIncomeHeads(income);

  interface HeadCardDef {
    id: string;
    title: string;
    route: string;
    icon: React.ReactNode;
    isActive: boolean;
    entryCount: number;
    netAmount: number;
  }

  const headCards: HeadCardDef[] = [
    {
      id: 'employment',
      title: t('headEmployment'),
      route: '/user-panel/employment',
      icon: <Briefcase className="w-5 h-5 text-emerald-700" />,
      isActive: assessment.heads.employment,
      entryCount: income.employmentEntries.length,
      netAmount: agg.employmentNet,
    },
    {
      id: 'rent',
      title: t('headRent'),
      route: '/user-panel/rent',
      icon: <Home className="w-5 h-5 text-emerald-700" />,
      isActive: assessment.heads.rent,
      entryCount: income.rentEntries.length,
      netAmount: agg.rentNet,
    },
    {
      id: 'agriculture',
      title: t('headAgriculture'),
      route: '/user-panel/agriculture',
      icon: <Sprout className="w-5 h-5 text-emerald-700" />,
      isActive: assessment.heads.agriculture,
      entryCount: income.agricultureEntries.length,
      netAmount: agg.agriNet,
    },
    {
      id: 'business',
      title: t('headBusiness'),
      route: '/user-panel/business',
      icon: <Store className="w-5 h-5 text-emerald-700" />,
      isActive: assessment.heads.business,
      entryCount: income.businessEntries.length,
      netAmount: agg.bizNet,
    },
    {
      id: 'capitalGain',
      title: t('headCapitalGain'),
      route: '/user-panel/capital-gain',
      icon: <TrendingUp className="w-5 h-5 text-emerald-700" />,
      isActive: assessment.heads.capitalGain,
      entryCount: income.capitalGainEntries.length,
      netAmount: agg.capGainNet,
    },
    {
      id: 'financialAssets',
      title: t('headFinancialAssets'),
      route: '/user-panel/financial-assets',
      icon: <Landmark className="w-5 h-5 text-emerald-700" />,
      isActive: assessment.heads.financialAssets,
      entryCount: income.financialAssetEntries.length,
      netAmount: agg.financialNet,
    },
    {
      id: 'otherSources',
      title: t('headOtherSources'),
      route: '/user-panel/income-from-other-sources',
      icon: <Coins className="w-5 h-5 text-emerald-700" />,
      isActive: assessment.heads.otherSources,
      entryCount: income.otherIncomeEntries.length,
      netAmount: agg.otherNet,
    },
    // Additional Categories
    {
      id: 'firm',
      title: t('catFirm'),
      route: '/user-panel/firm-etc',
      icon: <Users className="w-5 h-5 text-purple-700" />,
      isActive: assessment.additionalCategories.firmPartner,
      entryCount: income.firmEntries.length,
      netAmount: agg.firmNet,
    },
    {
      id: 'aop',
      title: t('catAop'),
      route: '/user-panel/aop',
      icon: <Users className="w-5 h-5 text-purple-700" />,
      isActive: assessment.additionalCategories.aopMember,
      entryCount: income.aopEntries.length,
      netAmount: agg.aopNet,
    },
    {
      id: 'foreign',
      title: t('catForeign'),
      route: '/user-panel/foreign-income',
      icon: <Globe2 className="w-5 h-5 text-purple-700" />,
      isActive: assessment.additionalCategories.foreignIncome,
      entryCount: income.foreignIncomeEntries.length,
      netAmount: agg.foreignNet,
    },
    {
      id: 'spouseMinor',
      title: t('catSpouseMinor'),
      route: '/user-panel/spouse-income',
      icon: <HeartHandshake className="w-5 h-5 text-purple-700" />,
      isActive: assessment.additionalCategories.spouseOrMinor,
      entryCount: income.spouseMinorEntries.length,
      netAmount: agg.spouseMinorNet,
    },
    // Tax Exempted
    {
      id: 'taxExempted',
      title: language === 'bn' ? 'করমুক্ত আয়ের বিবরণী' : 'Tax-Exempted Income',
      route: '/user-panel/tax-exempted-income',
      icon: <ShieldAlert className="w-5 h-5 text-blue-700" />,
      isActive: assessment.hasTaxExemptedIncome,
      entryCount: income.taxExemptedEntries.length,
      netAmount: agg.taxExemptTotal,
    },
    // Voluntary Disclosure
    {
      id: 'voluntary',
      title: t('voluntaryDisclosureCheck'),
      route: '/user-panel/voluntary-disclosure-income',
      icon: <AlertCircle className="w-5 h-5 text-amber-700" />,
      isActive: assessment.voluntaryDisclosure,
      entryCount: income.voluntaryDisclosureEntries.length,
      netAmount: agg.voluntaryNet,
    },
  ];

  const activeHeads = headCards.filter((h) => h.isActive);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">{t('incomeHubTitle')}</h2>
        <p className="text-xs text-gray-500 mt-1">{t('incomeHubSubtitle')}</p>
      </div>

      {/* Summary Box */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
            {t('incomeSummary')}
          </span>
          <div className="text-2xl font-bold text-gray-900 font-mono mt-1">
            {formatBDT(agg.totalTaxableIncome, language)}
          </div>
          <p className="text-[11px] text-gray-500">
            {language === 'bn'
              ? `সক্রিয় খাতের মোট সংখ্যা: ${activeHeads.length} টি`
              : `Total active income heads selected: ${activeHeads.length}`}
          </p>
        </div>

        {agg.taxExemptTotal > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900">
            <span className="font-semibold block">{language === 'bn' ? 'মোট করমুক্ত আয়:' : 'Total Tax-Exempt Income:'}</span>
            <span className="text-sm font-bold font-mono">{formatBDT(agg.taxExemptTotal, language)}</span>
          </div>
        )}
      </div>

      {/* If no heads selected */}
      {activeHeads.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
          <h3 className="text-base font-bold text-gray-900">{t('noHeadsSelected')}</h3>
          <p className="text-xs text-gray-600 max-w-md mx-auto">
            {language === 'bn'
              ? 'আপনার কর নির্ধারণ ধাপ হতে এক বা একাধিক আয়ের উৎস নির্বাচন করে এই ধাপে বিস্তারিত তথ্য এন্ট্রি করুন।'
              : 'Please check the relevant sources of income in the Assessment step to activate their entry forms.'}
          </p>
          <button
            type="button"
            onClick={() => navigate('/user-panel/assessment')}
            className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium px-4 py-2 rounded-md text-xs shadow-xs"
          >
            <span>{language === 'bn' ? 'কর নির্ধারণ ধাপে ফিরুন' : 'Return to Assessment'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Grid of Active Heads */}
      {activeHeads.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeHeads.map((head) => (
            <div
              key={head.id}
              className="bg-white rounded-xl border border-gray-200 shadow-xs hover:border-emerald-500 hover:shadow-sm transition-all p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                      {head.icon}
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">{head.title}</h3>
                  </div>

                  {head.entryCount > 0 ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      {head.entryCount} {language === 'bn' ? 'টি এন্ট্রি' : 'items'}
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      {t('notStarted')}
                    </span>
                  )}
                </div>

                <div className="my-3 flex items-baseline justify-between border-t border-gray-100 pt-3">
                  <span className="text-xs text-gray-500">
                    {language === 'bn' ? 'নিট হিসাবভুক্ত আয়:' : 'Net Taxable Value:'}
                  </span>
                  <span className="text-sm font-bold font-mono text-gray-900">
                    {formatBDT(head.netAmount, language)}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate(head.route)}
                  className="w-full inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium py-2 px-3 rounded-md text-xs transition-colors cursor-pointer"
                >
                  <span>{t('manageHead')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Navigation to Rebate */}
      <StepNavigationButtons
        backPath="/user-panel/assessment"
        nextPath="/user-panel/rebate"
      />
    </div>
  );
};
