import React from 'react';
import { useApp } from '../../context/AppContext';
import { RULES_ENGINE_GATE } from '../../adapters/calculationAdapter';

export function CalculationStatusPanel() {
  const { language, assessment, income } = useApp();
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
