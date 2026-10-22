import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, FileText, Info, Download, Upload, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { aggregateIncomeHeads, aggregateExpenditure, RULES_ENGINE_GATE } from '../../adapters/calculationAdapter';
import { formatBDT, toBanglaDigits } from '../../i18n/formatters';
import type { IncomeState } from '../../types';
import { CalculationStatusPanel } from './CalculationStatusPanel';
import './workspace.css';

type EntryKey = Exclude<keyof IncomeState, 'voluntaryDisclosureAffirmed'>;
type IncomeLink = { key: EntryKey; route: string; en: string; bn: string };
export const INCOME_LINKS: IncomeLink[] = [
  { key: 'employmentEntries', route: 'employment', en: 'Employment', bn: 'চাকরি হতে আয়' },
  { key: 'financialAssetEntries', route: 'financial-assets', en: 'Financial assets', bn: 'আর্থিক সম্পদ হতে আয়' },
  { key: 'rentEntries', route: 'rent', en: 'Rent', bn: 'ভাড়া হতে আয়' },
  { key: 'agricultureEntries', route: 'agriculture', en: 'Agriculture', bn: 'কৃষি হতে আয়' },
  { key: 'businessEntries', route: 'business', en: 'Business or profession', bn: 'ব্যবসা বা পেশা' },
  { key: 'capitalGainEntries', route: 'capital-gain', en: 'Capital gains', bn: 'মূলধনি মুনাফা' },
  { key: 'otherIncomeEntries', route: 'income-from-other-sources', en: 'Other sources', bn: 'অন্যান্য উৎস' },
  { key: 'firmEntries', route: 'firm-etc', en: 'Firm', bn: 'ফার্মের আয়' },
  { key: 'aopEntries', route: 'aop', en: 'Association of persons', bn: 'ব্যক্তিসংঘ' },
  { key: 'foreignIncomeEntries', route: 'foreign-income', en: 'Foreign income', bn: 'বৈদেশিক আয়' },
  { key: 'spouseMinorEntries', route: 'spouse-income', en: 'Spouse or minor income', bn: 'স্বামী/স্ত্রী বা অপ্রাপ্তবয়স্কের আয়' },
  { key: 'taxExemptedEntries', route: 'tax-exempted-income', en: 'Tax-exempt income', bn: 'করমুক্ত আয়' },
  { key: 'voluntaryDisclosureEntries', route: 'voluntary-disclosure-income', en: 'Voluntary disclosure', bn: 'স্বেচ্ছায় আয় প্রকাশ' },
];

export const ReturnWorkspace: React.FC = () => {
  const {
    language, assessmentYear, assessment, income, rebate, expenditure,
    assetsLiabilities, taxPayment, exportDraftJson, importDraftJson,
  } = useApp();
  const fileInput = useRef<HTMLInputElement>(null);
  const [importMessage, setImportMessage] = useState('');
  const bn = language === 'bn';
  const tr = (en: string, bengali: string) => bn ? bengali : en;
  const n = (num: number) => bn ? toBanglaDigits(num) : String(num);
  const incomeAggregation = aggregateIncomeHeads(income);
  const entryCount = INCOME_LINKS.reduce((sum, item) => sum + income[item.key].length, 0);
  const hasIncome = entryCount > 0;
  const hasExpense = aggregateExpenditure(expenditure) !== 0;
  const hasAssets = assetsLiabilities.totalAssets !== 0 || assetsLiabilities.totalLiabilities !== 0;
  const paymentEntry = taxPayment.tdsSalary + taxPayment.tdsBankAndFinancial +
    taxPayment.tdsContractAndSupplies + taxPayment.tdsRentAndOther +
    taxPayment.advanceTaxPaid + taxPayment.taxPaidWithReturn;
  const money = (value: number, hasValue: boolean) => hasValue ? formatBDT(value, language) : '—';
  const link = (route: string) => '/user-panel/' + route;

  const groups = [
    {
      id: 'assessment', icon: '01', title: tr('Taxpayer & assessment', 'করদাতা ও কর নির্ধারণ'),
      description: tr('Residence, return scheme, income heads and tax year', 'আবাসিক অবস্থা, রিটার্নের ধরন, আয়ের খাত ও করবর্ষ'),
      path: 'assessment', value: assessment.residentStatus ? tr(assessment.residentStatus, assessment.residentStatus === 'Resident' ? 'নিবাসী' : 'অনিবাসী') : '—',
      detail: tr('Confirm your assessment details', 'কর নির্ধারণের বিবরণ নিশ্চিত করুন'),
    },
    {
      id: 'rebate', icon: '03', title: tr('Investment & rebate', 'বিনিয়োগ ও রেয়াত'),
      description: tr('Recorded investments; legal allowance not yet evaluated', 'নথিভুক্ত বিনিয়োগ; আইনগত রেয়াত এখনো যাচাই হয়নি'),
      path: 'rebate', value: money(rebate.entries.reduce((sum, entry) => sum + (entry.investmentAmount || 0), 0), rebate.entries.length > 0),
      detail: tr(n(rebate.entries.length) + ' investments recorded', n(rebate.entries.length) + 'টি বিনিয়োগ নথিভুক্ত'),
    },
    {
      id: 'expenditure', icon: '04', title: tr('Lifestyle expenditure', 'জীবনযাত্রার ব্যয়'),
      description: tr('Detailed IT-10BB expenditure entries', 'আইটি-১০বিবি ব্যয়ের বিস্তারিত বিবরণ'),
      path: 'expenditure', value: money(aggregateExpenditure(expenditure), hasExpense),
      detail: tr('Sum of entered expense lines', 'প্রবেশকৃত ব্যয়ের সমষ্টি'),
    },
    {
      id: 'assets-liabilities', icon: '05', title: tr('Assets & liabilities', 'সম্পদ ও দায়'),
      description: tr('IT-10B details and reconciliation', 'আইটি-১০বি বিবরণ ও সমন্বয়'),
      path: 'assets-liabilities', value: money(assetsLiabilities.netWealthCurrentYear, hasAssets),
      detail: tr('Assets less liabilities (arithmetic only)', 'সম্পদ থেকে দায় বিয়োগ (শুধু গাণিতিক)'),
    },
    {
      id: 'tax-payment', icon: '06', title: tr('Tax & payment records', 'কর ও পরিশোধের বিবরণ'),
      description: tr('Withholding, advance tax and payments are not confirmed credits', 'উৎসে কর, অগ্রিম কর ও পরিশোধ এখনো যাচাইকৃত ক্রেডিট নয়'),
      path: 'tax-payment', value: money(paymentEntry, paymentEntry !== 0),
      detail: tr('Entered payments, not independently verified', 'প্রবেশকৃত পরিশোধ; স্বাধীনভাবে যাচাইকৃত নয়'),
    },
    {
      id: 'return-view', icon: '07', title: tr('Return preview', 'রিটার্নের পূর্বরূপ'),
      description: tr('Inspect short and detailed return output before any filing', 'দাখিলের আগে সংক্ষিপ্ত ও বিস্তারিত রিটার্ন দেখুন'),
      path: 'return-view', value: tr('Review', 'পর্যালোচনা'),
      detail: tr('Not a filed return', 'দাখিলকৃত রিটার্ন নয়'),
    },
    {
      id: 'audited-accounts', icon: '08', title: tr('Audited accounts (where applicable)', 'নিরীক্ষিত হিসাব (প্রযোজ্য হলে)'),
      description: tr('Supporting financial statements for an applicable return', 'প্রযোজ্য রিটার্নের সহায়ক আর্থিক বিবরণী'),
      path: 'audited-accounts', value: tr('Details', 'বিস্তারিত'),
      detail: tr('Available inside My Tax Return, not a separate filing', 'আমার আয়কর রিটার্নের অংশ; আলাদা দাখিল নয়'),
    },
  ];

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      setImportMessage(importDraftJson(text)
        ? tr('Draft loaded into this browser session.', 'এই ব্রাউজার সেশনে খসড়া লোড হয়েছে।')
        : tr('Draft format not recognized. Nothing was imported.', 'খসড়ার ধরন সঠিক নয়। কিছু আমদানি হয়নি।'));
    } catch {
      setImportMessage(tr('The selected file could not be read.', 'নির্বাচিত ফাইল পড়া যায়নি।'));
    }
    event.currentTarget.value = '';
  };

  const renderSummary = (section: typeof groups[number]) => (
    <section key={section.id} className="er-section" id={section.id} aria-labelledby={'title-' + section.id}>
            <div className="er-section-title">
              <span className="er-index">{section.icon}</span>
              <div><h2 id={'title-' + section.id}>{section.title}</h2><p>{section.description}</p></div>
            </div>
            <div className="er-card-bottom">
              <div><strong className="er-value">{section.value}</strong><small>{section.detail}</small></div>
              <Link className="er-button er-button-outline" to={link(section.path)}>
                {tr('Open details', 'বিস্তারিত খুলুন')} <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </section>
  );

  return (
    <div className="er-workspace">
      <section className="er-hero" aria-labelledby="workspace-title">
        <div>
          <p className="er-eyebrow">{tr('INDIVIDUAL INCOME TAX · RETURN PREPARATION', 'ব্যক্তি আয়কর · রিটার্ন প্রস্তুতকরণ')}</p>
          <h1 id="workspace-title">{tr('Your tax return, in one place', 'আপনার আয়কর রিটার্ন, এক জায়গায়')}</h1>
          <p>{tr('Start with the summary. Open full-size forms only where you need details.', 'প্রথমে সারসংক্ষেপ দেখুন। প্রয়োজনমতো পূর্ণাঙ্গ ফরমে বিস্তারিত পূরণ করুন।')}</p>
          <p className="er-period">
            {tr('Assessment year', 'করবর্ষ')} {bn ? toBanglaDigits(assessmentYear) : assessmentYear}
            {' · '}{tr('Income period', 'আয়কাল')} {assessment.incomeYearFrom} – {assessment.incomeYearTo}
          </p>
        </div>
        <div className="er-hero-actions">
          <Link to="/user-panel/submission" className="er-button er-button-soft">
            <FileText size={17} aria-hidden="true" /> {tr('Submission Review', 'দাখিল পর্যালোচনা')}
          </Link>
          <button type="button" className="er-button er-button-primary" onClick={exportDraftJson}>
            <Download size={17} aria-hidden="true" /> {tr('Download draft', 'খসড়া ডাউনলোড')}
          </button>
          <button type="button" className="er-button er-button-soft" onClick={() => fileInput.current?.click()}>
            <Upload size={17} aria-hidden="true" /> {tr('Resume from file', 'ফাইল থেকে চালু করুন')}
          </button>
          <button type="button" className="er-button er-button-soft er-jump-calculation"
            onClick={() => document.getElementById('er-calculation-panel-title')?.focus()}>
            {tr('Calculation status', 'কর হিসাবের অবস্থা')}
          </button>
          <input ref={fileInput} type="file" accept=".json,application/json" hidden onChange={handleImport}
            aria-label={tr('Select a saved draft JSON file', 'সংরক্ষিত খসড়ার JSON ফাইল নির্বাচন করুন')} />
        </div>
      </section>
      <p className="er-note" role="status">
        <Info size={16} aria-hidden="true" />
        {importMessage || tr('Changes are held in this browser session. Download a draft to keep a copy; this is not a server save.', 'পরিবর্তন এই ব্রাউজার সেশনে থাকে। কপি রাখতে খসড়া ডাউনলোড করুন; এটি সার্ভারে সংরক্ষণ নয়।')}
      </p>

      <div className="er-workspace-grid">
        <div className="er-workspace-left">
          <div className="er-assessment-summary">
            {groups.slice(0,1).map(renderSummary)}
          </div>
      <section className="er-section er-income" aria-labelledby="income-heading" id="income">
        <div className="er-card-head">
          <div className="er-section-title"><span className="er-index">02</span><div>
            <h2 id="income-heading">{tr('Income sources', 'আয়ের উৎস')}</h2>
            <p>{tr('Choose an income type to open its full-size form. Returning here will update this summary.', 'পূর্ণাঙ্গ ফরম খুলতে আয়ের ধরন নির্বাচন করুন। এখানে ফিরলে সারসংক্ষেপ আপডেট হবে।')}</p>
          </div></div>
          <Link className="er-button er-button-soft" to={link('income')}>
            {tr('All income forms', 'সকল আয় ফরম')} <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className="er-income-list">
          {INCOME_LINKS.map(({ key, route, en, bn: titleBn }) => (
            <Link key={key} to={link(route)} className="er-income-row">
              <span>{bn ? titleBn : en}</span>
              <span className="er-count">{n(income[key].length)} {tr('entries', 'এন্ট্রি')}</span>
              <ChevronRight size={17} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>


          <div className="er-sections">
            {groups.slice(1).map(renderSummary)}
          </div>
        </div>
        <aside className="er-workspace-right" aria-label={tr('Calculation status and trace', 'কর হিসাবের অবস্থা ও ট্রেস')}>
      <div className="er-metrics" aria-label={tr('Return at a glance', 'রিটার্ন এক নজরে')}>
        <div className="er-metric">
          <span>{tr('Income entered', 'প্রবেশকৃত আয়')}</span>
          <strong>{money(incomeAggregation.totalTaxableIncome, hasIncome)}</strong>
          <small>{tr('Sum of entered income lines · not assessed taxable income', 'প্রবেশকৃত আয়ের সমষ্টি · নির্ধারিত করযোগ্য আয় নয়')}</small>
        </div>
        <div className="er-metric">
          <span>{tr('Investment entered', 'প্রবেশকৃত বিনিয়োগ')}</span>
          <strong>{money(rebate.totalInvestment, rebate.entries.length > 0)}</strong>
          <small>{tr('Eligibility and rebate pending', 'যোগ্যতা ও রেয়াত যাচাই বাকি')}</small>
        </div>
        <div className="er-metric">
          <span>{tr('Net tax payable', 'নিট প্রদেয় কর')}</span>
          <strong>{tr('Not calculated', 'হিসাব হয়নি')}</strong>
          <small>{tr('Certified calculation service not connected', 'প্রত্যয়িত হিসাব সেবা সংযুক্ত নয়')}</small>
        </div>
        <div className="er-metric">
          <span>{tr('Income entries', 'আয়ের এন্ট্রি')}</span>
          <strong>{n(entryCount)}</strong>
          <small>{tr('Across 13 income sections', 'আয়ের ১৩টি বিভাগে')}</small>
        </div>
      </div>


      <CalculationStatusPanel />


      <section className="er-readiness" aria-labelledby="readiness-title">
        <ShieldAlert size={22} aria-hidden="true" />
        <div>
          <h2 id="readiness-title">{tr('Filing and official calculation are not enabled', 'দাখিল ও সরকারি কর হিসাব এখনো চালু নয়')}</h2>
          <p>{tr(RULES_ENGINE_GATE.reason + ' Payment entries are not proof of government credit. Use the preview only to review entered information.',
            'অনুমোদিত, করবর্ষ-নির্দিষ্ট রুলস ইঞ্জিনের হিসাব পাওয়া যায়নি। পরিশোধের এন্ট্রি সরকারি ক্রেডিটের প্রমাণ নয়। পূর্বরূপ কেবল তথ্য পর্যালোচনার জন্য।')}</p>
          <Link to={link('return-view')} className="er-button er-button-outline"><FileText size={17} aria-hidden="true" />{tr('Review return', 'রিটার্ন পর্যালোচনা')}</Link>
        </div>
      </section>

        </aside>
      </div>
    </div>
  );
};
