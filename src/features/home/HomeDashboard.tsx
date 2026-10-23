import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardCheck, FileText, ListChecks, ReceiptText, ShieldAlert, WalletCards } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RULES_ENGINE_GATE } from '../../adapters/calculationAdapter';
import { hasReturnDraft } from '../workspace/draftStatus';
import './dashboard-guided.css';

/**
 * First-time-taxpayer UX: factual progress only. Entry counts are not legal
 * completeness, statutory calculation or official submission evidence.
 */
export const HomeDashboard: React.FC = () => {
  const { language, assessmentYear, profile, assessment, income, rebate, expenditure,
    assetsLiabilities, taxPayment, returnHistory } = useApp();
  const bn = language === 'bn';
  const t = (en:string, bangla:string) => bn ? bangla : en;
  const draft = hasReturnDraft({profile, assessment, income, rebate, expenditure, assetsLiabilities, taxPayment});
  const enteredLines = Object.values(income).reduce((total, item) =>
    total + (Array.isArray(item) ? item.length : 0), 0);
  const steps = [
    {
      number:'01', Icon:ListChecks, href:'/user-panel/assessment',
      title:t('Check your assessment details','কর নির্ধারণের তথ্য যাচাই করুন'),
      description:t('Confirm the assessment year, income period and taxpayer details before entering figures.',
        'অঙ্ক দেওয়ার আগে করবর্ষ, আয়কাল ও করদাতার তথ্য যাচাই করুন।'),
      action:t('Review assessment','কর নির্ধারণ দেখুন')
    },
    {
      number:'02', Icon:WalletCards, href:'/user-panel/income',
      title:t('Enter the income that applies to you','আপনার প্রযোজ্য আয়ের তথ্য দিন'),
      description:t('Choose relevant income categories. You do not need to fill in every category.',
        'প্রাসঙ্গিক আয়ের বিভাগ বেছে নিন। সব বিভাগ পূরণ করতে হবে না।'),
      action:t('Choose income types','আয়ের ধরন বাছুন')
    },
    {
      number:'03', Icon:ClipboardCheck, href:'/user-panel/return-view',
      title:t('Review and keep your draft','খসড়া যাচাই ও সংরক্ষণ করুন'),
      description:t('Check your entries, correct mistakes and export a copy before leaving this browser.',
        'তথ্য যাচাই ও সংশোধন করুন। ব্রাউজার ছাড়ার আগে খসড়ার কপি সংরক্ষণ করুন।'),
      action:t('Review draft','খসড়া দেখুন')
    }
  ];
  return <div className="er-dashboard er-guided-home">
    <header className="er-guided-home-intro">
      <div className="er-guided-home-title">
        <p className="er-guided-home-eyebrow">{t('ASSESSMENT YEAR','করবর্ষ')} {assessmentYear}</p>
        <h1>{t('Taxpayer Dashboard','করদাতার ড্যাশবোর্ড')}</h1>
        <p>{draft
          ? t('Continue preparing your return. We will help you find the next section.',
              'আপনার রিটার্ন প্রস্তুত করা চালিয়ে যান। পরবর্তী বিভাগ খুঁজে পেতে সহায়তা পাবেন।')
          : t('Prepare your return step by step, using information from your own records.',
              'নিজের নথিপত্র ব্যবহার করে ধাপে ধাপে রিটার্ন প্রস্তুত করুন।')}</p>
      </div>
      <div className="er-guided-home-actions">
        <Link to="/user-panel/return-workspace" className="er-quick-link er-quick-link-primary">
          {draft ? t('Continue My Tax Return','আমার রিটার্ন চালিয়ে যান') : t('Start My Tax Return','আমার রিটার্ন শুরু করুন')}
          <ArrowRight size={18} aria-hidden={true}/>
        </Link>
        <Link to="/user-panel/guided-submission" className="er-quick-link" data-entry="ereturn-submission">
          {t('Submission review','দাখিল পর্যালোচনা')}
        </Link>
      </div>
    </header>
    <div className="er-guided-home-columns">
      <section className="er-guided-home-steps" aria-labelledby="er-guided-steps">
        <div className="er-guided-home-section-head">
          <h2 id="er-guided-steps">{t('Your next steps','পরবর্তী করণীয়')}</h2>
          <p>{t('Work through the sections in an order that makes sense for you.',
            'আপনার সুবিধামতো ক্রমে বিভাগগুলো পূরণ করুন।')}</p>
        </div>
        <ol className="er-guided-home-step-list">
          {steps.map(({number,Icon,href,title,description,action})=><li key={number}>
            <div className="er-guided-home-step-number" aria-hidden={true}>{number}</div>
            <div className="er-guided-home-step-text">
              <h3><Icon size={19} aria-hidden={true}/>{title}</h3>
              <p>{description}</p>
            </div>
            <Link to={href} className="er-guided-home-step-action">
              {action}<ArrowRight size={17} aria-hidden={true}/>
            </Link>
          </li>)}
        </ol>
      </section>
      <aside className="er-guided-home-summary" aria-labelledby="er-home-snapshot">
        <h2 id="er-home-snapshot">{t('Your draft at a glance','খসড়ার সারসংক্ষেপ')}</h2>
        <p className="er-guided-home-summary-note">{t('These figures reflect what you entered, not an assessed return.',
          'এগুলো আপনার দেওয়া তথ্য; কর নির্ধারণের ফল নয়।')}</p>
        <dl className="er-guided-home-facts">
          <div><dt>{t('Income entries','আয়ের এন্ট্রি')}</dt><dd>{enteredLines}</dd></div>
          <div><dt>{t('Investment entries','বিনিয়োগের এন্ট্রি')}</dt><dd>{rebate.entries.length}</dd></div>
          <div><dt>{t('Tax calculation','কর হিসাব')}</dt>
            <dd className="er-guided-home-pending">{t('Not available yet','এখনো পাওয়া যাচ্ছে না')}</dd></div>
        </dl>
        <div className="er-guided-home-safe-note" role="status">
          <ShieldAlert size={20} aria-hidden={true}/>
          <p>{RULES_ENGINE_GATE.status === 'BLOCKED_UNCERTIFIED'
            ? t('Tax amounts cannot be confirmed yet. You can continue preparing and checking your draft.',
                'এখনো করের অঙ্ক নিশ্চিত করা যাচ্ছে না। তবে খসড়া প্রস্তুত ও যাচাই করতে পারবেন।')
            : t('Review the verified calculation status before relying on any tax amount.',
                'করের অঙ্ক ব্যবহার করার আগে যাচাইকৃত হিসাবের অবস্থা দেখুন।')}</p>
        </div>
      </aside>
    </div>
    <section className="er-guided-home-records" aria-labelledby="er-guided-records">
      <div>
        <h2 id="er-guided-records">{t('Tax records and documents','কর রেকর্ড ও নথিপত্র')}</h2>
        <p>{returnHistory.length
          ? t('Existing local records need official verification before they can be treated as filed.',
              'স্থানীয় রেকর্ডকে দাখিলকৃত গণ্য করার আগে সরকারি যাচাই প্রয়োজন।')
          : t('Find certificates, acknowledgements and payment records when verified records are available.',
              'যাচাইকৃত রেকর্ড পাওয়া গেলে সনদ, প্রাপ্তিস্বীকার ও পরিশোধের তথ্য এখানে দেখুন।')}</p>
      </div>
      <Link className="er-quick-link" to="/user-panel/tax-records">
        <ReceiptText size={18} aria-hidden={true}/>{t('Open Tax Records','কর রেকর্ড খুলুন')}
        <ArrowRight size={17} aria-hidden={true}/>
      </Link>
    </section>
    <p className="er-guided-home-endnote"><FileText size={17} aria-hidden={true}/>
      {t('Your entries remain in this browser session. Export the draft to keep a copy. No official filing occurs on this page.',
          'আপনার তথ্য এই ব্রাউজার সেশনে থাকে। কপি রাখতে খসড়া সংরক্ষণ করুন। এই পৃষ্ঠায় সরকারি দাখিল হয় না।')}
    </p>
  </div>;
};
