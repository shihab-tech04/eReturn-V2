import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardCheck, FileText, LayoutGrid, ListChecks, ReceiptText, ShieldAlert, WalletCards } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RULES_ENGINE_GATE } from '../../adapters/calculationAdapter';
import { hasReturnDraft } from '../workspace/draftStatus';
import { TaxServiceHeroCarousel } from './TaxServiceHeroCarousel';
import { TaxFilterChip } from './TaxFilterChip';
import './dashboard-guided.css';
import './sobaike-home-composition.css';

/**
 * Source composition: Sobaike Public HomePage / PublicPageContainer /
 * ServiceHeroCarousel / FilterChip / ReportCard at main 97d23297.
 * Data labels and actions remain real eReturn routes, never invented tax results.
 */
export const HomeDashboard:React.FC=()=>{
  const { language,assessmentYear,profile,assessment,income,rebate,expenditure,
    assetsLiabilities,taxPayment,returnHistory }=useApp();
  const bn=language==='bn';
  const t=(en:string,bangla:string)=>bn?bangla:en;
  const draft=hasReturnDraft({profile,assessment,income,rebate,expenditure,assetsLiabilities,taxPayment});
  const enteredLines=Object.values(income).reduce((total,item)=>
    total+(Array.isArray(item)?item.length:0),0);
  const [filter,setFilter]=useState<'all'|'steps'|'records'>('all');
  const steps=[
    {number:'01',Icon:ListChecks,href:'/user-panel/assessment',tag:t('Assessment','কর নির্ধারণ'),
      title:t('Check your assessment details','কর নির্ধারণের তথ্য যাচাই করুন'),
      description:t('Confirm the assessment year, income period and taxpayer details before entering figures.',
        'অঙ্ক দেওয়ার আগে করবর্ষ, আয়কাল ও করদাতার তথ্য যাচাই করুন।'),
      action:t('Review assessment','কর নির্ধারণ দেখুন')},
    {number:'02',Icon:WalletCards,href:'/user-panel/income',tag:t('Income','আয়'),
      title:t('Enter the income that applies to you','আপনার প্রযোজ্য আয়ের তথ্য দিন'),
      description:t('Choose relevant income categories. You do not need to fill in every category.',
        'প্রাসঙ্গিক আয়ের বিভাগ বেছে নিন। সব বিভাগ পূরণ করতে হবে না।'),
      action:t('Choose income types','আয়ের ধরন বাছুন')},
    {number:'03',Icon:ClipboardCheck,href:'/user-panel/return-view',tag:t('Return review','রিটার্ন পর্যালোচনা'),
      title:t('Review and keep your draft','খসড়া যাচাই ও সংরক্ষণ করুন'),
      description:t('Check your entries, correct mistakes and export a copy before leaving this browser.',
        'তথ্য যাচাই ও সংশোধন করুন। ব্রাউজার ছাড়ার আগে খসড়ার কপি সংরক্ষণ করুন।'),
      action:t('Review draft','খসড়া দেখুন')},
  ];
  return <div id="er-home-page-container"
    className="er-dashboard er-sobaike-home w-full text-left px-4 py-4 md:px-6 md:py-5 lg:px-8 lg:py-6 min-[1440px]:px-0 min-[1440px]:py-6 space-y-5 md:space-y-6 min-[1440px]:space-y-7">
    <h1 className="sr-only">{t('Taxpayer Dashboard','করদাতার ড্যাশবোর্ড')}</h1>
    <TaxServiceHeroCarousel language={language} hasDraft={draft} assessmentYear={assessmentYear}/>
    <section id="er-home-feed-section" className="space-y-4 pt-1" aria-labelledby="er-guided-steps">
      <div className="flex items-start justify-between gap-2 sm:gap-3 border-b border-ui-stroke-subtle pb-3 er-sobaike-feed-head">
        <div className="min-w-0 flex-1">
          <h2 id="er-guided-steps" className="text-[18px] sm:text-[20px] font-bold leading-[1.3] text-ui-content-primary">
            {t('Your next steps','পরবর্তী করণীয়')}
          </h2>
          <p className="type-helper text-ui-content-secondary mt-1">
            {t('Work through the sections in an order that makes sense for you.',
              'আপনার সুবিধামতো ক্রমে বিভাগগুলো পূরণ করুন।')}
          </p>
        </div>
        <div className="er-home-feed-actions">
          <span className="er-home-ay-chip">{t('AY','করবর্ষ')} {assessmentYear}</span>
          <Link to="/user-panel/guided-submission" data-entry="ereturn-submission"
            className="er-home-review-link">{t('Submission review','দাখিল পর্যালোচনা')}</Link>
        </div>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar er-home-filters"
        role="group" aria-label={t('Dashboard content filters','ড্যাশবোর্ডের বিষয়বস্তু ফিল্টার')}>
        <TaxFilterChip id="er-feed-all" label={t('All','সব')} selected={filter==='all'}
          icon={<LayoutGrid/>} onClick={()=>setFilter('all')}/>
        <TaxFilterChip id="er-feed-steps" label={t('Return steps','রিটার্নের ধাপ')} count={3}
          selected={filter==='steps'} icon={<ListChecks/>} onClick={()=>setFilter('steps')}/>
        <TaxFilterChip id="er-feed-records" label={t('Tax records','কর রেকর্ড')}
          selected={filter==='records'} icon={<ReceiptText/>} onClick={()=>setFilter('records')}/>
      </div>
      {filter!=='records'&&<ol className="er-guided-home-step-list space-y-3" aria-label={t('Return preparation steps','রিটার্ন প্রস্তুতির ধাপ')}>
        {steps.map(({number,Icon,href,title,description,action,tag})=><li key={number}>
          <article className="er-tax-feed-card group relative bg-ui-surface border border-ui-stroke-subtle rounded-xl sm:rounded-2xl p-3.5 sm:p-4 md:p-6 transition-all duration-150 shadow-2xs hover:shadow-xs text-left space-y-2 sm:space-y-2.5 md:space-y-3">
            <div className="flex items-center justify-between gap-2 text-[12px] sm:text-[13px] md:text-[14px]">
              <span className="er-tax-feed-category">{tag}</span>
              <span className="text-ui-content-muted">{t('Step','ধাপ')} {number}</span>
            </div>
            <h3 className="text-[16px] sm:text-[17px] md:text-[20px] leading-[1.38] sm:leading-[1.4] md:leading-[30px] font-bold md:font-semibold text-ui-content-primary">
              <Icon size={19} aria-hidden="true" className="inline align-middle mr-2 text-ui-content-muted"/>
              {title}
            </h3>
            <p className="text-[13px] sm:text-[14px] md:text-[16px] leading-[1.5] sm:leading-[1.55] md:leading-[26px] text-ui-content-secondary">
              {description}
            </p>
            <div className="flex items-center justify-between gap-2 pt-2 sm:pt-2.5 md:pt-3 border-t border-ui-stroke-subtle text-[12px] sm:text-[13px] md:text-[14px] text-ui-content-muted">
              <span>{t('Prepare your draft','খসড়া প্রস্তুত করুন')}</span>
              <Link to={href} className="inline-flex items-center gap-2 text-ui-content-primary font-semibold min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-ui-focus rounded-lg">
                {action}<ArrowRight size={16} aria-hidden="true"/>
              </Link>
            </div>
          </article>
        </li>)}
      </ol>}
      {filter!=='steps'&&<section className="er-guided-home-records er-tax-feed-card bg-ui-surface border border-ui-stroke-subtle rounded-xl sm:rounded-2xl p-3.5 sm:p-4 md:p-6 shadow-2xs"
        aria-labelledby="er-guided-records">
        <div>
          <h2 id="er-guided-records">{t('Tax records and documents','কর রেকর্ড ও নথিপত্র')}</h2>
          <p>{returnHistory.length
            ? t('Existing local records need official verification before they can be treated as filed.',
                'স্থানীয় রেকর্ডকে দাখিলকৃত গণ্য করার আগে সরকারি যাচাই প্রয়োজন।')
            : t('Find certificates, acknowledgements and payment records when verified records are available.',
                'যাচাইকৃত রেকর্ড পাওয়া গেলে সনদ, প্রাপ্তিস্বীকার ও পরিশোধের তথ্য এখানে দেখুন।')}</p>
        </div>
        <Link className="er-quick-link" to="/user-panel/tax-records">
          <ReceiptText size={18} aria-hidden="true"/>{t('Open Tax Records','কর রেকর্ড খুলুন')}
          <ArrowRight size={17} aria-hidden="true"/>
        </Link>
      </section>}
    </section>
    <section className="er-guided-home-summary er-tax-draft-snapshot" aria-labelledby="er-home-snapshot">
      <h2 id="er-home-snapshot">{t('Your draft at a glance','খসড়ার সারসংক্ষেপ')}</h2>
      <small className="er-guided-home-summary-note">{t('These figures reflect what you entered, not an assessed return.',
        'এগুলো আপনার দেওয়া তথ্য; কর নির্ধারণের ফল নয়।')}</small>
      <dl className="er-guided-home-facts">
        <div><dt>{t('Income entries','আয়ের এন্ট্রি')}</dt><dd>{enteredLines}</dd></div>
        <div><dt>{t('Investment entries','বিনিয়োগের এন্ট্রি')}</dt><dd>{rebate.entries.length}</dd></div>
        <div><dt>{t('Tax calculation','কর হিসাব')}</dt>
          <dd className="er-guided-home-pending">{t('Not available yet','এখনো পাওয়া যাচ্ছে না')}</dd></div>
      </dl>
      <div className="er-guided-home-safe-note" role="status">
        <ShieldAlert size={20} aria-hidden="true"/>
        <p>{RULES_ENGINE_GATE.status==='BLOCKED_UNCERTIFIED'
          ? t('Tax amounts cannot be confirmed yet. You can continue preparing and checking your draft.',
              'এখনো করের অঙ্ক নিশ্চিত করা যাচ্ছে না। তবে খসড়া প্রস্তুত ও যাচাই করতে পারবেন।')
          : t('Review the verified calculation status before relying on any tax amount.',
              'করের অঙ্ক ব্যবহার করার আগে যাচাইকৃত হিসাবের অবস্থা দেখুন।')}</p>
      </div>
    </section>
    <p className="er-guided-home-endnote"><FileText size={17} aria-hidden="true"/>
      {t('Your entries remain in this browser session. Export the draft to keep a copy. No official filing occurs on this page.',
        'আপনার তথ্য এই ব্রাউজার সেশনে থাকে। কপি রাখতে খসড়া সংরক্ষণ করুন। এই পৃষ্ঠায় সরকারি দাখিল হয় না।')}
    </p>
  </div>;
};
