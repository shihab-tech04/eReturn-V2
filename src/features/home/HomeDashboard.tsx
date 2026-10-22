import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardList, FileText, ListChecks, ReceiptText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { aggregateIncomeHeads, RULES_ENGINE_GATE } from '../../adapters/calculationAdapter';
import { formatBDT } from '../../i18n/formatters';
import { hasReturnDraft } from '../workspace/draftStatus';

export const HomeDashboard: React.FC = () => {
  const {
    language, assessmentYear, profile, assessment, income,
    rebate, expenditure, assetsLiabilities, taxPayment, returnHistory,
  } = useApp();
  const bn = language === 'bn';
  const t = (en: string, bangla: string) => bn ? bangla : en;
  const draft = hasReturnDraft({profile, assessment, income, rebate, expenditure, assetsLiabilities, taxPayment});
  const enteredLines = Object.values(income).reduce(
    (total, item) => total + (Array.isArray(item) ? item.length : 0), 0
  );
  const incomeTotal = aggregateIncomeHeads(income).totalTaxableIncome;
  const investments = rebate.entries.reduce((sum, entry) => sum + (entry.investmentAmount || 0), 0);
  const assetsEntered = [
    assetsLiabilities.businessCapital, assetsLiabilities.nonAgriculturalProperty,
    assetsLiabilities.agriculturalProperty, assetsLiabilities.financialAssetsValue,
    assetsLiabilities.motorVehicles, assetsLiabilities.goldAndJewelry,
    assetsLiabilities.furnitureAndElectronics, assetsLiabilities.bankLoans,
    assetsLiabilities.mortgagesOnProperty, assetsLiabilities.otherDebts,
  ].some(Boolean);
  const metrics = [
    {
      label:t('Income entries', 'আয়ের এন্ট্রি'),
      value:enteredLines ? String(enteredLines) : '—',
      note:t('Current browser session', 'বর্তমান ব্রাউজার সেশন'),
    },
    {
      label:t('Income entered', 'প্রবেশকৃত আয়'),
      value:enteredLines ? formatBDT(incomeTotal, language) : '—',
      note:t('Arithmetic sum, not approved taxable income', 'গাণিতিক সমষ্টি, অনুমোদিত করযোগ্য আয় নয়'),
    },
    {
      label:t('Investment entered', 'প্রবেশকৃত বিনিয়োগ'),
      value:rebate.entries.length ? formatBDT(investments, language) : '—',
      note:t('Statutory rebate not determined', 'আইনগত রেয়াত নির্ধারিত হয়নি'),
    },
    {
      label:t('Tax calculation', 'কর হিসাব'),
      value:t('Pending', 'অপেক্ষমাণ'),
      note:t('Certified Rules Engine not connected', 'প্রত্যয়িত রুলস ইঞ্জিন সংযুক্ত নয়'),
    },
  ];

  return <div className="er-dashboard">
    <div className="er-page-heading">
      <div>
        <h1>{t('Taxpayer Dashboard', 'করদাতার ড্যাশবোর্ড')}</h1>
        <p>{t('Assessment year', 'করবর্ষ')} {assessmentYear} · {draft
          ? t('Continue working with your current draft', 'আপনার বর্তমান খসড়ার কাজ চালিয়ে যান')
          : t('Prepare your first return in a guided workspace', 'নির্দেশনাসহ ওয়ার্কস্পেসে প্রথম রিটার্ন প্রস্তুত করুন')}</p>
      </div>
      <div className="er-page-actions">
        <Link to="/user-panel/guided-submission" className="er-quick-link er-quick-link-primary" data-entry="ereturn-submission">
          {t('eReturn Submission', 'ই-রিটার্ন দাখিল')} <ArrowRight size={18} aria-hidden={true}/>
        </Link>
        <Link to="/user-panel/return-workspace" className="er-quick-link">
          {draft ? t('Resume Return', 'রিটার্ন চালু করুন') : t('Start Return', 'রিটার্ন শুরু করুন')}
          <ArrowRight size={18} aria-hidden={true}/>
        </Link>
      </div>
    </div>

    <div className="er-dashboard-grid">
      {metrics.map(metric => <div className="er-dashboard-card" key={metric.label}>
        <span>{metric.label}</span><strong>{metric.value}</strong><small>{metric.note}</small>
      </div>)}
    </div>

    <div className="er-dashboard-columns">
      <section className="er-dashboard-section" aria-labelledby="er-current-status">
        <h2 id="er-current-status">{draft ? t('Current return workspace', 'বর্তমান রিটার্ন ওয়ার্কস্পেস') : t('Get started', 'শুরু করুন')}</h2>
        <p>{draft
          ? t('Your entered facts remain in memory during this browser session. Download the draft file in My Tax Return to preserve it.', 'আপনার দেওয়া তথ্য এই ব্রাউজার সেশনের মেমরিতে থাকে। সংরক্ষণের জন্য আমার আয়কর রিটার্ন থেকে খসড়া ফাইল ডাউনলোড করুন।')
          : t('There are no taxpayer entries in this session. Start with assessment details and add only the income and financial facts that apply to you.', 'এই সেশনে করদাতার কোনো এন্ট্রি নেই। প্রযোজ্য কর নির্ধারণের তথ্য, আয় ও আর্থিক বিবরণ দিয়ে শুরু করুন।')}</p>
        <div className="er-dashboard-activities">
          <Link to="/user-panel/return-workspace"><FileText size={18} aria-hidden={true}/>{t('Open My Tax Return', 'আমার আয়কর রিটার্ন খুলুন')}</Link>
          <Link to="/user-panel/assessment"><ListChecks size={18} aria-hidden={true}/>{t('Assessment details', 'কর নির্ধারণের বিবরণ')}</Link>
          <Link to="/user-panel/return-view"><ClipboardList size={18} aria-hidden={true}/>{t('Review entered return facts', 'প্রবেশকৃত রিটার্ন তথ্য পর্যালোচনা')}</Link>
        </div>
      </section>

      <section className="er-dashboard-section" aria-labelledby="er-records-status">
        <h2 id="er-records-status">{t('Recent tax records', 'সাম্প্রতিক কর রেকর্ড')}</h2>
        <p>{returnHistory.length
          ? t('Records exist in the local dataset, but their filing and identity verification are not established. No filing history chart is presented.', 'স্থানীয় ডেটায় রেকর্ড আছে; তবে দাখিল ও পরিচয় যাচাই প্রতিষ্ঠিত নয়। কোনো ইতিহাসের চার্ট দেখানো হচ্ছে না।')
          : t('No independently verified filed returns are available. Past-year charts and filed-return summaries will appear only when verified data are connected.', 'স্বাধীনভাবে যাচাইকৃত দাখিলকৃত রিটার্ন পাওয়া যায়নি। যাচাইকৃত তথ্য যুক্ত হলে অতীতের চার্ট ও সারসংক্ষেপ প্রদর্শিত হবে।')}</p>
        <div className="er-dashboard-activities">
          <Link to="/user-panel/tax-records"><ReceiptText size={18} aria-hidden={true}/>{t('Tax Records', 'কর রেকর্ড')}</Link>
          <Link to="/user-panel/return-history"><ClipboardList size={18} aria-hidden={true}/>{t('Return history', 'রিটার্নের ইতিহাস')}</Link>
        </div>
      </section>
    </div>

    <div className="er-record-note" role="status">
      {RULES_ENGINE_GATE.status === 'BLOCKED_UNCERTIFIED'
        ? t('Official tax payable, rebate and credit entitlement are unavailable pending verified calculation. No filing or payment is performed here.', 'প্রত্যয়িত হিসাব ছাড়া প্রদেয় কর, রেয়াত ও ক্রেডিট নির্ধারণ করা যায় না। এখানে কোনো রিটার্ন দাখিল বা কর পরিশোধ করা হয় না।')
        : t('Verify statutory calculation status before relying on any totals.', 'কর হিসাবের ওপর নির্ভর করার আগে তার যাচাইকরণ দেখুন।')}
      {assetsEntered && <span> {t('Asset and liability amounts in this session are unverified entries.', 'এই সেশনের সম্পদ ও দায়ের তথ্য যাচাইকৃত নয়।')}</span>}
    </div>
  </div>;
};
