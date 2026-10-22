import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const items = [
  { to:'tin-certificate', en:'TIN Certificate', bn:'টিআইএন সনদ', desc:'Taxpayer certificate view', descBn:'করদাতা সনদের পূর্বরূপ' },
  { to:'certificate-request', en:'Certificate Requests', bn:'সনদের আবেদন', desc:'Certificate request details', descBn:'সনদের আবেদনের বিবরণ' },
  { to:'certificate-status', en:'Certificate Status', bn:'সনদের অবস্থা', desc:'Status recorded in the current session', descBn:'বর্তমান সেশনে নথিভুক্ত অবস্থা' },
  { to:'acknowledgement', en:'Acknowledgement', bn:'প্রাপ্তিস্বীকার', desc:'Inspect acknowledgement view', descBn:'প্রাপ্তিস্বীকারের পূর্বরূপ' },
  { to:'return-view', en:'Return Preview', bn:'রিটার্নের পূর্বরূপ', desc:'Review prepared return without filing', descBn:'দাখিল ছাড়া প্রস্তুত রিটার্ন দেখুন' },
  { to:'challan-history', en:'Challan Records', bn:'চালানের বিবরণ', desc:'Entered challan information', descBn:'প্রবেশকৃত চালানের তথ্য' },
  { to:'return-history', en:'Return History', bn:'রিটার্নের ইতিহাস', desc:'Historic return entries, if available', descBn:'পূর্ববর্তী রিটার্নের এন্ট্রি, যদি থাকে' },
];
export function TaxRecordsHub() {
  const { language } = useApp();
  const bn = language === 'bn';
  return <section aria-labelledby="tax-records-title">
    <div className="er-page-heading">
      <div><h1 id="tax-records-title">{bn ? 'কর রেকর্ড' : 'Tax Records'}</h1>
        <p>{bn ? 'সনদ, প্রাপ্তিস্বীকার, রিটার্ন ও চালানের তথ্য এক জায়গায়' : 'Certificates, acknowledgements, return and challan records in one place'}</p></div>
    </div>
    <p className="er-record-note" role="status">{bn
      ? 'এখানে প্রদর্শিত স্থানীয় রেকর্ড সরকারি যাচাইকরণের প্রমাণ নয়। কোনো সার্ভার-সংযুক্ত রেকর্ড সেবা নিশ্চিত করা হয়নি।'
      : 'Local record views are not proof of government verification. No authoritative server record service is certified.'}</p>
    <div className="er-record-grid">
      {items.map(item=><Link to={'/user-panel/'+item.to} className="er-record-item" key={item.to}>
        <strong>{bn?item.bn:item.en}</strong><small>{bn?item.descBn:item.desc}</small>
      </Link>)}
    </div>
    <div className="er-dashboard-section er-record-revision">
      <h2>{bn?'সংশোধিত রিটার্ন':'Revised Return'}</h2>
      <p>{bn
        ? 'যাচাইকৃত যোগ্যতা ও বিধান ছাড়া সংশোধিত রিটার্ন দাখিল করা যাবে না।'
        : 'A revised return is a separate conditional workflow; filing eligibility remains subject to verified requirements.'}</p>
      <Link className="er-quick-link" to="/user-panel/revised-return">{bn?'সংশোধিত রিটার্ন পর্যালোচনা':'Review Revised Return'}</Link>
    </div>
  </section>;
}
