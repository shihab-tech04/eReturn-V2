import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, ClipboardCheck, FileText, Receipt, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './tax-records-guided.css';

const groups = [
  {
    key:'certificates', Icon:BadgeCheck, en:'Certificates', bn:'সনদ',
    items:[
      {to:'tin-certificate',en:'TIN Certificate',bn:'টিআইএন সনদ',desc:'View the certificate section',descBn:'সনদের বিভাগ দেখুন'},
      {to:'certificate-request',en:'Certificate Requests',bn:'সনদের আবেদন',desc:'Review request details',descBn:'আবেদনের তথ্য দেখুন'},
      {to:'certificate-status',en:'Certificate Status',bn:'সনদের অবস্থা',desc:'Check available status information',descBn:'সনদের অবস্থা দেখুন'}
    ]
  },
  {
    key:'returns', Icon:FileText, en:'Return documents', bn:'রিটার্নের নথিপত্র',
    items:[
      {to:'return-view',en:'Return Preview',bn:'রিটার্নের পূর্বরূপ',desc:'Review your prepared draft',descBn:'প্রস্তুত খসড়া দেখুন'},
      {to:'acknowledgement',en:'Acknowledgement',bn:'প্রাপ্তিস্বীকার',desc:'View acknowledgement information',descBn:'প্রাপ্তিস্বীকারের তথ্য দেখুন'},
      {to:'return-history',en:'Return History',bn:'রিটার্নের ইতিহাস',desc:'Review available historical entries',descBn:'বিদ্যমান পূর্ববর্তী রিটার্ন দেখুন'}
    ]
  },
  {
    key:'payments', Icon:Receipt, en:'Payment documents', bn:'পরিশোধের নথিপত্র',
    items:[
      {to:'challan-history',en:'Challan Records',bn:'চালানের তথ্য',desc:'Review entered challan details',descBn:'চালানের তথ্য দেখুন'}
    ]
  }
];

export function TaxRecordsHub() {
  const { language } = useApp();
  const bn = language === 'bn';
  const t=(en:string,bengali:string)=>bn?bengali:en;
  return <div className="er-guided-records" aria-labelledby="tax-records-title">
    <header className="er-guided-records-intro">
      <h1 id="tax-records-title">{t('Tax Records','কর রেকর্ড')}</h1>
      <p>{t('Find your return documents, certificates and payment information in one place.',
          'আপনার রিটার্নের নথি, সনদ ও পরিশোধের তথ্য এক জায়গায় দেখুন।')}</p>
      <div className="er-guided-records-caution" role="status">
        <ShieldAlert size={20} aria-hidden={true}/>
        <span>{t('Records shown here must be verified against the official service before they can be treated as filed or paid.',
            'এখানে দেখানো রেকর্ডকে দাখিল বা পরিশোধের প্রমাণ ধরার আগে সরকারি সেবায় যাচাই করতে হবে।')}</span>
      </div>
    </header>
    <div className="er-guided-records-groups">
      {groups.map(({key,Icon,en,bn:bengali,items})=>
        <section key={key} aria-labelledby={'record-group-'+key} className="er-guided-records-group">
          <h2 id={'record-group-'+key}><Icon size={22} aria-hidden={true}/>{bn?bengali:en}</h2>
          <div className="er-guided-records-links">
            {items.map(item=><Link key={item.to} to={'/user-panel/'+item.to} className="er-guided-records-link">
              <span><strong>{bn?item.bn:item.en}</strong><small>{bn?item.descBn:item.desc}</small></span>
              <ArrowRight size={20} aria-hidden={true}/>
            </Link>)}
          </div>
        </section>
      )}
    </div>
    <section aria-labelledby="record-revision" className="er-guided-records-revision">
      <div className="er-guided-records-revision-title">
        <ClipboardCheck size={24} aria-hidden={true}/>
        <div>
          <h2 id="record-revision">{t('Revised Return','সংশোধিত রিটার্ন')}</h2>
          <p>{t('A revised return follows a separate process. Eligibility and previous filing must be verified before proceeding.',
              'সংশোধিত রিটার্নের প্রক্রিয়া আলাদা। এগোনোর আগে যোগ্যতা ও পূর্ববর্তী দাখিল যাচাই প্রয়োজন।')}</p>
        </div>
      </div>
      <Link className="er-quick-link" to="/user-panel/revised-return">
        {t('Review revised-return information','সংশোধিত রিটার্নের তথ্য দেখুন')} <ArrowRight size={18} aria-hidden={true}/>
      </Link>
    </section>
  </div>;
}
