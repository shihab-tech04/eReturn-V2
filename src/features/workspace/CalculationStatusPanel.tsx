import React, { useEffect, useState } from 'react';
import {
  readCanonicalRuleYears, matchSelectedRuleYear,
  type CanonicalRuleYear,
} from '../../adapters/rulesPublicYears';
import { useApp } from '../../context/AppContext';
import { RULES_ENGINE_GATE } from '../../adapters/calculationAdapter';

export function CalculationStatusPanel() {
  const { language, assessment, income, assessmentYear } = useApp();
  const [yearStatus, setYearStatus] = useState<'loading' | 'matched' | 'missing' | 'conflict' | 'unavailable'>('loading');
  const [sqlYear, setSqlYear] = useState<CanonicalRuleYear | null>(null);
  useEffect(() => {
    let active = true;
    setYearStatus('loading');
    setSqlYear(null);
    // Return-form year and app-shell year are independent in imported drafts.
    // Never display an identity match when the two disagree.
    if (assessment.assessmentYear !== assessmentYear) {
      setYearStatus('conflict');
      return () => { active = false; };
    }
    void readCanonicalRuleYears().then(years => {
      if (!active) return;
      const matched = matchSelectedRuleYear(years, assessment.assessmentYear);
      setSqlYear(matched);
      setYearStatus(matched ? 'matched' : 'missing');
    }).catch(() => {
      if (active) setYearStatus('unavailable');
    });
    return () => { active = false; };
  }, [assessmentYear, assessment.assessmentYear]);
  const bn = language === 'bn';
  const t = (en: string, bangla: string) => bn ? bangla : en;
  const pendingFacts = [
    !assessment.residentStatus && t('Residence status not specified', 'আবাসিক অবস্থা দেওয়া হয়নি'),
    !Object.values(assessment.heads).some(Boolean) &&
      !Object.values(assessment.additionalCategories).some(Boolean) &&
      !Object.values(income).some(value => Array.isArray(value) && value.length) &&
      t('Select applicable income heads', 'প্রযোজ্য আয়ের খাত নির্বাচন করুন'),
  ].filter((fact): fact is string => typeof fact === 'string' && Boolean(fact));
  return <section className="er-calculation-panel" aria-labelledby="er-calculation-panel-title">
    <h2 id="er-calculation-panel-title" tabIndex={-1}>{t('Calculation & verification', 'হিসাব ও যাচাইকরণ')}</h2>
    <p className="er-calculation-state" role="status">{t('Awaiting certified Rules Engine', 'প্রত্যয়িত রুলস ইঞ্জিন অপেক্ষমাণ')}</p>
    <p aria-live="polite">{yearStatus === 'matched' && sqlYear
      ? t('NBR SQL tax-year identity matched', 'এনবিআর SQL করবর্ষের পরিচয় মিলেছে') +
        ': AY ' + sqlYear.assessmentYear + ' / IY ' + sqlYear.incomeYear +
        '. ' + t('Statutory calculation still blocked.', 'আইনগত হিসাব এখনও বন্ধ।')
      : yearStatus === 'conflict'
        ? t('The return form and workspace select different assessment years. Reconcile them before calculating.', 'রিটার্ন ফর্ম ও কর্মক্ষেত্রে ভিন্ন করবর্ষ নির্বাচিত। হিসাবের আগে করবর্ষ মিলিয়ে নিন।')
      : yearStatus === 'missing'
        ? t('The selected assessment year is not in the canonical NBR SQL catalogue. Calculations remain blocked.', 'নির্বাচিত করবর্ষ মূল এনবিআর SQL তালিকায় নেই। হিসাব বন্ধ রয়েছে।')
      : yearStatus === 'unavailable'
        ? t('NBR SQL year read-back unavailable. Calculations remain blocked.', 'এনবিআর SQL করবর্ষ যাচাই পাওয়া যায়নি। হিসাব বন্ধ রয়েছে।')
      : t('Checking canonical NBR SQL tax-year identity…', 'মূল এনবিআর SQL করবর্ষ যাচাই চলছে…')}</p>
    <dl>
      {[
        [t('Taxable base', 'করযোগ্য ভিত্তি'), '—'],
        [t('Gross tax', 'মোট কর'), '—'],
        [t('Statutory rebate', 'আইনগত রেয়াত'), '—'],
        [t('Verified tax credits', 'যাচাইকৃত কর ক্রেডিট'), '—'],
        [t('Net payable / refundable', 'নিট প্রদেয় / ফেরতযোগ্য'), '—'],
      ].map(([name,value]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}
    </dl>
    <h3>{t('Required facts', 'প্রয়োজনীয় তথ্য')}</h3>
    {pendingFacts.length ? <ul>{pendingFacts.map(fact => <li key={fact}>{fact}</li>)}</ul>
      : <p>{t('No missing facts identified by the frontend. Legal completeness is not certified.', 'ফ্রন্টএন্ডে অনুপস্থিত তথ্য শনাক্ত হয়নি। আইনগত পূর্ণতা প্রত্যয়িত নয়।')}</p>}
    <h3>{t('Calculation trace', 'হিসাবের ট্রেস')}</h3>
    <p>{t('No approved year- and taxpayer-scoped trace is available.', 'করবর্ষ ও করদাতাভিত্তিক অনুমোদিত ট্রেস পাওয়া যায়নি।')}</p>
    <small>{RULES_ENGINE_GATE.status} · FINAL_2026_09_30</small>
  </section>;
}
