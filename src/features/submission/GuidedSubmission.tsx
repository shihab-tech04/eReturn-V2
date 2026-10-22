import React, { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Download, Edit3, FileCheck2, FileText, Info, LockKeyhole, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { GapRegisterModal } from '../../components/common/GapRegisterModal';
import { RULES_ENGINE_GATE, aggregateIncomeHeads, aggregateExpenditure } from '../../adapters/calculationAdapter';
import { formatBDT } from '../../i18n/formatters';
import { INCOME_LINKS } from '../workspace/ReturnWorkspace';
import { AssessmentPage } from '../assessment/AssessmentPage';
import { EmploymentPage } from '../income/EmploymentPage';
import { FinancialAssetsPage } from '../income/FinancialAssetsPage';
import { RentPage } from '../income/RentPage';
import { AgriculturePage } from '../income/AgriculturePage';
import { BusinessPage } from '../income/BusinessPage';
import { CapitalGainsPage } from '../income/CapitalGainsPage';
import { OtherSourcesPage } from '../income/OtherSourcesPage';
import { FirmPage } from '../income/FirmPage';
import { AopPage } from '../income/AopPage';
import { ForeignIncomePage } from '../income/ForeignIncomePage';
import { SpouseIncomePage } from '../income/SpouseIncomePage';
import { TaxExemptedPage } from '../income/TaxExemptedPage';
import { VoluntaryDisclosurePage } from '../income/VoluntaryDisclosurePage';
import { RebatePage } from '../rebate/RebatePage';
import { ExpenditurePage } from '../expenditure/ExpenditurePage';
import { AssetsLiabilitiesPage } from '../assets-liabilities/AssetsLiabilitiesPage';
import { TaxPaymentPage } from '../tax-payment/TaxPaymentPage';
import { ReturnViewPage } from '../return-view/ReturnViewPage';
import { AuditedAccountsPage } from '../audited-accounts/AuditedAccountsPage';
import { ProfilePage } from '../profile/ProfilePage';
import '../../components/layout/taxpayer-shell.css';
import '../../styles/sobaike-public-parity.css';
import '../../styles/sobaike-ereturn-form-adapter.css';
import './guided-submission.css';

const translations = {
  en: {title:'Submit Your Tax Return', subtitle:'Three simple steps to review and confirm your return.', check:'Check Details', payment:'Tax & Payment', confirm:'Confirm & Submit', next:'Next', back:'Back', exit:'Download Draft & Exit', edit:'Edit', review:'Review', saved:'Return to Review', full:'View Full Draft Return', close:'Close Preview', entered:'Entries recorded', missing:'Review needed', unknown:'Not legally validated', notEntered:'No entries recorded'},
  bn: {title:'আয়কর রিটার্ন দাখিল', subtitle:'রিটার্ন পর্যালোচনা ও নিশ্চিত করার সহজ তিনটি ধাপ।', check:'তথ্য যাচাই', payment:'কর ও পরিশোধ', confirm:'নিশ্চিতকরণ ও দাখিল', next:'পরবর্তী', back:'পেছনে', exit:'খসড়া ডাউনলোড ও প্রস্থান', edit:'সম্পাদনা', review:'পর্যালোচনা', saved:'পর্যালোচনায় ফিরুন', full:'সম্পূর্ণ খসড়া রিটার্ন দেখুন', close:'পূর্বরূপ বন্ধ করুন', entered:'তথ্য নথিভুক্ত', missing:'পর্যালোচনা প্রয়োজন', unknown:'আইনগতভাবে যাচাইকৃত নয়', notEntered:'তথ্য নথিভুক্ত নয়'},
};
const stepTitles = (bn: boolean) => bn ? [translations.bn.check,translations.bn.payment,translations.bn.confirm] : [translations.en.check,translations.en.payment,translations.en.confirm];
const allEditors: Record<string, React.ComponentType> = {
  profile:ProfilePage, assessment:AssessmentPage, employment:EmploymentPage,
  'financial-assets':FinancialAssetsPage, rent:RentPage, agriculture:AgriculturePage,
  business:BusinessPage, 'capital-gain':CapitalGainsPage,
  'income-from-other-sources':OtherSourcesPage, 'firm-etc':FirmPage, aop:AopPage,
  'foreign-income':ForeignIncomePage, 'spouse-income':SpouseIncomePage,
  'tax-exempted-income':TaxExemptedPage, 'voluntary-disclosure-income':VoluntaryDisclosurePage,
  rebate:RebatePage, expenditure:ExpenditurePage, 'assets-liabilities':AssetsLiabilitiesPage,
  'tax-payment':TaxPaymentPage, 'audited-accounts':AuditedAccountsPage,
};
const editorLabels: Record<string,[string,string]> = {
  profile:['Personal Information','ব্যক্তিগত তথ্য'], assessment:['Assessment Details','কর নির্ধারণের তথ্য'],
  income:['Income Information','আয়ের তথ্য'], rebate:['Investments & Rebate','বিনিয়োগ ও রেয়াত'],
  expenditure:['Lifestyle Expenditure','জীবনযাত্রার ব্যয়'],
  'assets-liabilities':['Assets & Liabilities','সম্পদ ও দায়'],
  'tax-payment':['Tax & Payment Entries','কর ও পরিশোধের তথ্য'],
  'audited-accounts':['Audited Accounts','নিরীক্ষিত হিসাব'],
};

export const SubmissionLayout: React.FC = () => {
  const {language, toggleLanguage, assessmentYear} = useApp();
  const bn=language==='bn';
  return <div className="er-submission-shell">
    <a className="er-guided-skip" href="#guided-main">{bn?'মূল বিষয়বস্তুতে যান':'Skip to main content'}</a>
    <header className="er-guided-header">
      <div className="er-guided-brand" aria-label="NBR eReturn V2"><span className="er-guided-brand-mark">NBR</span><span><strong>eReturn V2</strong><small>{bn?'রিটার্ন দাখিল':'Return submission'}</small></span></div>
      <div className="er-guided-meta">
        <span>{bn?'করবর্ষ':'Assessment Year'}: {assessmentYear}</span>
        <button type="button" onClick={toggleLanguage} aria-label={bn?'Switch to English':'বাংলায় দেখুন'}>{bn?'English':'বাংলা'}</button>
      </div>
    </header>
    <main id="guided-main" className="er-guided-main"><Outlet/></main>
    <ConfirmationModal/><GapRegisterModal/>
  </div>;
};

export const SubmissionPage: React.FC = () => {
  const {language, profile, assessment, income, rebate, expenditure, assetsLiabilities, taxPayment, submission, setSubmission, exportDraftJson, t} = useApp();
  const bn=language==='bn', c=translations[language];
  const navigate=useNavigate(), location=useLocation();
  const parsed=Number(new URLSearchParams(location.search).get('step'));
  const step=parsed===2||parsed===3?parsed:1;
  const [showPreview,setShowPreview]=useState(false);
  const titleRef=useRef<HTMLHeadingElement>(null);
  useEffect(()=>{titleRef.current?.focus();setShowPreview(false);},[step]);
  const setStep=(n:number)=>navigate('/user-panel/guided-submission?step='+n);
  const edit=(section:string,returnStep=step)=>navigate('/user-panel/guided-submission/edit/'+section+'?step='+returnStep);
  const exit=()=>{exportDraftJson();navigate('/user-panel/home');};
  const inc=aggregateIncomeHeads(income);
  const incomeEntries=INCOME_LINKS.reduce((sum,item)=>sum+income[item.key].length,0);
  const incomeEntered=incomeEntries>0;
  const expenseEntered=Object.entries(expenditure).some(([k,v])=>k!=='totalExpenditure' && Number(v)!==0);
  const assetEntered=Boolean(assetsLiabilities.totalAssets||assetsLiabilities.totalLiabilities);
  const lines: {id:string;title:string;description:string;entered:boolean;actions:{label:string;section:string}[]}[]=[
    {id:'personal',title:bn?'ব্যক্তিগত ও কর নির্ধারণের তথ্য':'Personal & Assessment Information',description:bn?'করদাতা, করবর্ষ ও আবাসিক অবস্থা':'Taxpayer, year, residency and return selection',entered:Boolean((profile.name||profile.tin)&&assessment.residentStatus),actions:[{label:bn?'ব্যক্তিগত তথ্য':'Profile',section:'profile'},{label:bn?'কর নির্ধারণ':'Assessment',section:'assessment'}]},
    {id:'income',title:bn?'আয়ের বিবরণ':'Income Information',description:bn?'১৩টি আয়ের বিভাগের নথিভুক্ত তথ্য':'Recorded facts across 13 income sections',entered:incomeEntered,actions:[{label:c.edit,section:'income'}]},
    {id:'investments',title:bn?'বিনিয়োগ ও ব্যয়':'Investments & Expenditure',description:bn?'বিনিয়োগ, রেয়াত ও জীবনযাত্রার ব্যয়':'Investment, rebate and lifestyle expense entries',entered:rebate.entries.length>0||expenseEntered,actions:[{label:bn?'বিনিয়োগ':'Investments',section:'rebate'},{label:bn?'ব্যয়':'Expenses',section:'expenditure'}]},
    {id:'assets',title:bn?'সম্পদ ও দায়':'Assets & Liabilities',description:bn?'নথিভুক্ত সম্পদ, দায় ও নিট সম্পদের তথ্য':'Recorded assets, liabilities and net-wealth inputs',entered:assetEntered,actions:[{label:c.edit,section:'assets-liabilities'}]},
    {id:'other',title:bn?'প্রযোজ্য অন্যান্য তথ্য':'Other Applicable Information',description:bn?'প্রযোজ্য হলে নিরীক্ষিত হিসাব পর্যালোচনা করুন':'Review supporting audited accounts where applicable',entered:false,actions:[{label:c.review,section:'audited-accounts'}]},
  ];
  return <div className="er-guided-flow">
    <div className="er-guided-intro">
      <h1 ref={titleRef} tabIndex={-1}>{c.title}</h1>
      <p>{c.subtitle}</p>
    </div>
    <ol className="er-guided-steps" aria-label={bn?'দাখিলের ধাপ':'Submission progress'}>
      {stepTitles(bn).map((label,i)=><li key={i} className={step===i+1?'is-current':step>i+1?'is-done':''} aria-current={step===i+1?'step':undefined}>
        <span className="er-guided-number">{step>i+1?<CheckCircle2 size={19}/>:i+1}</span>
        <strong>{label}</strong><small>{bn?'ধাপ '+(i+1):'Step '+(i+1)+' of 3'}</small>
      </li>)}
    </ol>
    <section className="er-guided-panel" aria-labelledby="guided-step-title">
      <div className="er-guided-panel-header">
        <div><h2 id="guided-step-title">{bn?'ধাপ ':'Step '}{step} — {stepTitles(bn)[step-1]}</h2>
        <p>{step===1?(bn?'তথ্য পর্যালোচনা করুন। পরিবর্তন করতে সম্পাদনা নির্বাচন করুন।':'Review your entries. Choose Edit to correct any section.')
          :step===2?(bn?'কর ও পরিশোধের তথ্য দেখুন।':'Review tax and payment entries before final confirmation.')
          :(bn?'খসড়া রিটার্ন ও ঘোষণা পর্যালোচনা করুন।':'Review your draft return and declaration before any filing.')}</p></div>
        <span className="er-guided-step-label">{step} / 3</span>
      </div>
      {step===1 && <div className="er-guided-checklist">
        {lines.map(item=><div key={item.id} className="er-guided-review-row" data-section={item.id}>
          <div className="er-guided-row-symbol"><FileText size={20} aria-hidden="true"/></div>
          <div className="er-guided-row-content"><h3>{item.title}</h3><p>{item.description}</p></div>
          <span className={'er-guided-status '+(item.entered?'is-entered':'is-pending')}>{item.entered?c.entered:item.id==='other'?c.unknown:c.missing}</span>
          <div className="er-guided-row-actions">{item.actions.map(action=><button key={action.section} type="button" onClick={()=>edit(action.section,1)} aria-label={action.label+' — '+item.title}>{action.label}<Edit3 size={15} aria-hidden="true"/></button>)}</div>
        </div>)}
        <p className="er-guided-info"><Info size={18} aria-hidden="true"/>{bn?'নথিভুক্ত তথ্য মানেই আইনি সম্পূর্ণতা বা যোগ্যতা নিশ্চিত নয়।':'Recorded entries do not establish legal completeness or eligibility. You can review later stages, but filing remains disabled.'}</p>
      </div>}
      {step===2 && <div className="er-guided-stage">
        <div className="er-guided-amounts">
          <div><span>{bn?'আয়ের এন্ট্রির যোগফল (নির্ধারিত করযোগ্য আয় নয়)':'Sum of income entries (not assessed taxable income)'}</span><strong>{incomeEntered?formatBDT(inc.totalTaxableIncome,language):'—'}</strong></div>
          <div><span>{bn?'প্রত্যয়িত মোট কর':'Certified tax liability'}</span><strong>{bn?'হিসাব হয়নি':'Not calculated'}</strong></div>
          <div><span>{bn?'প্রবেশকৃত উৎসে কর (যাচাইকৃত ক্রেডিট নয়)':'Entered withholding (not a verified credit)'}</span><strong>{formatBDT(taxPayment.totalTDS,language)}</strong></div>
          <div><span>{bn?'প্রবেশকৃত অগ্রিম ও অন্যান্য পরিশোধ':'Entered advance and other payments'}</span><strong>{formatBDT(taxPayment.advanceTaxPaid+taxPayment.taxPaidWithReturn,language)}</strong></div>
          <div className="er-guided-amount-emphasis"><span>{bn?'প্রদেয় / ফেরতযোগ্য কর':'Payable / Refundable'}</span><strong>{bn?'যাচাই বাকি':'Unavailable'}</strong></div>
        </div>
        <div className="er-guided-inline-action"><p>{bn?'পরিশোধ ও উৎসে করের তথ্য পরিবর্তন করতে নিচের বোতাম ব্যবহার করুন।':'Need to correct payment or withholding details?'}</p><button onClick={()=>edit('tax-payment',2)} type="button"><Edit3 size={16}/>{bn?'পরিশোধের তথ্য সম্পাদনা':'Edit Tax & Payment'}</button></div>
        <p role="status" className="er-guided-info"><ShieldAlert size={18}/>{bn?'রুলস ইঞ্জিন প্রত্যয়িত না হওয়ায় কর, রেয়াত এবং ক্রেডিট নির্ধারণ করা যাচ্ছে না।':'Official calculation and credit eligibility are blocked until verified, year-scoped Rules Engine results are available.'}</p>
      </div>}
      {step===3 && <div className="er-guided-stage">
        <div className="er-guided-preview-trigger">
          <div><h3>{bn?'রিটার্নের খসড়া দেখুন':'Review your draft return'}</h3><p>{bn?'এটি দাখিলকৃত বা আইনগতভাবে প্রত্যয়িত রিটার্ন নয়।':'This preview is neither filed nor a certified statutory calculation.'}</p></div>
          <button type="button" onClick={()=>setShowPreview(v=>!v)} aria-expanded={showPreview}><FileText size={17}/>{showPreview?c.close:c.full}</button>
        </div>
        {showPreview && <div className="er-guided-preview" aria-label={bn?'রিটার্নের খসড়া':'Draft return preview'}><ReturnViewPage/></div>}
        <fieldset className="er-guided-declaration"><legend>{bn?'করদাতার ঘোষণা':'Taxpayer Declaration'}</legend>
          <label className="er-guided-declaration-check"><input type="checkbox" checked={submission.declarationAccepted} onChange={e=>setSubmission(prev=>({...prev,declarationAccepted:e.target.checked}))}/><span>{t('declarationBody')}</span></label>
          <div className="er-guided-declaration-fields">
            <label>{t('taxpayerNameAffirm')}<input value={submission.taxpayerNameAffirmed} onChange={e=>setSubmission(prev=>({...prev,taxpayerNameAffirmed:e.target.value}))}/></label>
            <label>{t('capacityAffirm')}<input value={submission.designationOrCapacity} onChange={e=>setSubmission(prev=>({...prev,designationOrCapacity:e.target.value}))}/></label>
            <label>{t('placeAffirm')}<input value={submission.placeAffirmed} onChange={e=>setSubmission(prev=>({...prev,placeAffirmed:e.target.value}))}/></label>
            <label>{t('dateAffirm')}<input type="date" value={submission.dateAffirmed} onChange={e=>setSubmission(prev=>({...prev,dateAffirmed:e.target.value}))}/></label>
          </div>
        </fieldset>
        <p role="alert" className="er-guided-blocked"><LockKeyhole size={19}/>{bn?'রিটার্ন দাখিল বন্ধ: কর হিসাব ও অনুমোদিত দাখিল সংযোগ প্রত্যয়িত নয়। কোনো রসিদ বা দাখিল নম্বর তৈরি হবে না।':'Submission unavailable: certified tax calculation and authorized filing integration are not connected. No filing number or acknowledgement will be created.'}</p>
      </div>}
    </section>
    <footer className="er-guided-footer">
      <button type="button" className="er-guided-btn er-guided-outline" onClick={exit}><Download size={17}/>{c.exit}</button>
      <div className="er-guided-footer-right">
        <button type="button" className="er-guided-btn er-guided-outline" disabled={step===1} onClick={()=>setStep(step-1)}><ArrowLeft size={17}/>{c.back}</button>
        {step<3?<button type="button" className="er-guided-btn er-guided-primary" onClick={()=>setStep(step+1)}>{c.next}<ArrowRight size={17}/></button>:
          <button type="button" className="er-guided-btn er-guided-primary" disabled aria-disabled="true" title={RULES_ENGINE_GATE.reason}><LockKeyhole size={17}/>{bn?'রিটার্ন দাখিল':'Submit Return'}</button>}
      </div>
    </footer>
    <p className="er-guided-session-note">{bn?'তথ্য শুধু চলমান ব্রাউজার সেশনে আছে। বাইরে যাওয়ার আগে খসড়া ডাউনলোড করুন।':'Entered facts remain in this browser session only. Download the draft to keep a copy across sessions.'}</p>
  </div>;
};

export const SubmissionEditPage: React.FC = () => {
  const {section} = useParams();
  const {language} = useApp();
  const navigate=useNavigate(), location=useLocation();
  const bn=language==='bn';
  const target=Number(new URLSearchParams(location.search).get('step'))===2?2:1;
  const Component=section?allEditors[section]:undefined;
  const label=section?(editorLabels[section]?.[bn?1:0]||INCOME_LINKS.find(x=>x.route===section)?.[bn?'bn':'en']):undefined;
  const returnToReview=()=>navigate('/user-panel/guided-submission?step='+target);
  if(section!=='income'&&!Component) return <div className="er-guided-flow"><h1>{bn?'এই বিভাগ পাওয়া যায়নি':'Section not found'}</h1><button className="er-guided-btn er-guided-primary" onClick={returnToReview}>{bn?'পর্যালোচনায় ফিরুন':'Return to Review'}</button></div>;
  return <div className="er-guided-flow er-guided-edit">
    <div className="er-guided-edit-bar">
      <div><p className="er-guided-eyebrow">{bn?'রিটার্নের তথ্য সম্পাদনা':'Edit return information'}</p><h1>{label|| (bn?'আয়ের তথ্য':'Income Information')}</h1><p>{bn?'আগের তথ্য বজায় থাকবে। সম্পাদনার পরে পর্যালোচনায় ফিরুন।':'Existing entries stay in the current session. Return to review after making changes.'}</p></div>
      <button type="button" className="er-guided-btn er-guided-primary" onClick={returnToReview}><CheckCircle2 size={17}/>{bn?'সংরক্ষণ ও পর্যালোচনায় ফেরা':'Save & Return to Review'}</button>
    </div>
    <div className="er-submission-edit-form">
      {section==='income'?<section className="er-guided-panel"><h2>{bn?'আয়ের বিভাগ বেছে নিন':'Choose an income section'}</h2><div className="er-guided-income-grid">{INCOME_LINKS.map(x=><Link key={x.key} to={'/user-panel/guided-submission/edit/'+x.route+'?step=1'}>{bn?x.bn:x.en}<ArrowRight size={17}/></Link>)}</div></section>:Component?<Component/>:null}
    </div>
    <footer className="er-guided-footer"><button type="button" className="er-guided-btn er-guided-outline" onClick={returnToReview}><ArrowLeft size={17}/>{bn?'পর্যালোচনায় ফিরুন':'Back to Review'}</button><button type="button" className="er-guided-btn er-guided-primary" onClick={returnToReview}><CheckCircle2 size={17}/>{bn?'সংরক্ষণ ও পর্যালোচনায় ফেরা':'Save & Return to Review'}</button></footer>
    <p className="er-guided-session-note">{bn?'এটি কেবল চলমান সেশনের তথ্য। সার্ভারে সংরক্ষণ নয়।':'Save & Return retains in-session changes; it does not persist them to a server.'}</p>
  </div>;
};
