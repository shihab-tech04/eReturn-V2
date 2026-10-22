import React, { useState } from 'react';
import {
  CROSSWALK, CorporateReportDraft, CorporateLine, CanonicalAccount,
  reconcileCorporate, readReviewSnapshot, createCompanyReturnHandoff, parseAmount
} from './corporateIntake';
import { extractCorporatePdf } from './corporatePdf';

interface Props { language:'en'|'bn'; businessName:string; }
const translated={
  en:{title:'Import audited corporate report',sub:'Private, local PDF extraction. All results require your review; tax computation is unavailable until certified rules are linked.',choose:'Choose financial report (PDF)',manual:'Existing manual accounts are preserved.',context:'Confirm report identity, periods and units',company:'Company named in report',period:'Year ended (YYYY-MM-DD)',prev:'Comparative year ended',currency:'Currency',scale:'Amount scale',lines:'Extracted statement candidates',review:'Review',mapping:'Canonical field',status:'Decision',save:'Export review file',restore:'Restore review file',check:'Reconciliation checks',blocked:'Corporate tax calculation blocked pending verified Office/SQL/Rules Engine integration',empty:'No PDF imported.',print:'Download blocked company handoff'},
  bn:{title:'নিরীক্ষিত কোম্পানির প্রতিবেদন আমদানি',sub:'পিডিএফের তথ্য এই ব্রাউজারেই পড়া হবে। সব তথ্য যাচাই করতে হবে; প্রত্যয়িত বিধি ছাড়া কর গণনা হবে না।',choose:'আর্থিক প্রতিবেদন বেছে নিন (PDF)',manual:'বিদ্যমান ম্যানুয়াল হিসাব অক্ষত থাকবে।',context:'প্রতিষ্ঠান, সময়কাল ও একক নিশ্চিত করুন',company:'প্রতিবেদনে প্রতিষ্ঠানের নাম',period:'বছর সমাপ্তির তারিখ (YYYY-MM-DD)',prev:'তুলনামূলক বছর সমাপ্তির তারিখ',currency:'মুদ্রা',scale:'অর্থের একক',lines:'প্রাপ্ত আর্থিক তথ্য',review:'যাচাই',mapping:'মানসম্মত ক্ষেত্র',status:'সিদ্ধান্ত',save:'রিভিউ ফাইল সংরক্ষণ',restore:'রিভিউ ফাইল ফিরিয়ে আনুন',check:'মিলকরণ যাচাই',blocked:'প্রত্যয়িত Office/SQL/Rules Engine সংযোগ না হওয়া পর্যন্ত কোম্পানির কর গণনা বন্ধ',empty:'কোনো পিডিএফ আমদানি করা হয়নি।',print:'অনুমোদনহীন কোম্পানি হ্যান্ডঅফ ডাউনলোড'}
};
function exportJson(filename:string,body:unknown){
  const blob=new Blob([JSON.stringify(body,null,2)],{type:'application/json'});
  const uri=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=uri;a.download=filename;a.click();
  URL.revokeObjectURL(uri);
}
export const CorporateReportIntake:React.FC<Props>=({language,businessName})=>{
  const t=translated[language];
  const [draft,setDraft]=useState<CorporateReportDraft|null>(null);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const [showAll,setShowAll]=useState(false);
  const modify=(f:(current:CorporateReportDraft)=>CorporateReportDraft)=>setDraft(prev=>prev?f(prev):null);
  const changeLine=(id:string,update:Partial<CorporateLine>)=>modify(d=>({
    ...d,lines:d.lines.map(l=>l.id===id?{...l,...update}:l)
  }));
  const choosePdf=async(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0];
    e.target.value='';
    if(!file)return;
    setBusy(true);setError('');
    try{
      const extracted=await extractCorporatePdf(file);
      setDraft(extracted);
      if(extracted.source.scanPages)
        setError(language==='bn'?'স্ক্যান করা পৃষ্ঠা পাওয়া গেছে; OCR যাচাই ছাড়া এগুলো ব্যবহারযোগ্য নয়।':'Some pages lack digital text and require independently reviewed OCR.');
    }catch(err){setError(err instanceof Error?err.message:'PDF_READ_FAILED');}
    finally{setBusy(false);}
  };
  const restore=async(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0];e.target.value='';
    if(!file||!draft)return;
    try{setDraft(readReviewSnapshot(await file.text(),draft.source.sha256));setError('');}
    catch(err){setError(err instanceof Error?err.message:'RESTORE_FAILED');}
  };
  const updateContext=(key:keyof CorporateReportDraft['context'],value:string)=>
    modify(d=>({...d,context:{...d.context,[key]:value}}));
  const rows=draft?.lines??[];
  const visible=showAll?rows:rows.slice(0,35);
  const checks=draft?reconcileCorporate(draft):[];
  const duplicateReviewed = rows.some(l=>l.status==='REVIEWED'&&l.canonical!=='unmapped'&&
    rows.filter(x=>x.status==='REVIEWED'&&x.canonical===l.canonical).length>1);
  return <section aria-label={t.title} className="bg-white rounded-xl border border-gray-200 shadow-xs p-4 space-y-4">
    <div className="space-y-1">
      <h3 className="text-sm font-bold text-gray-900">{t.title}</h3>
      <p className="text-xs text-gray-600">{t.sub}</p>
      <p className="text-xs text-gray-500">{t.manual}</p>
    </div>
    <label className="inline-flex flex-wrap items-center gap-2 text-xs font-semibold text-indigo-800">
      <span>{t.choose}</span>
      <input aria-label={t.choose} className="max-w-full text-xs" type="file" accept=".pdf,application/pdf" onChange={choosePdf} disabled={busy}/>
    </label>
    {busy&&<p role="status" className="text-xs text-gray-600">Reading PDF in browser…</p>}
    {error&&<p role="alert" className="text-xs text-red-700">{error}</p>}
    {!draft?<p className="text-xs text-gray-500">{t.empty}</p>:<>
      <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-700 break-all">
        <p><strong>{draft.source.name}</strong> — SHA-256 {draft.source.sha256}</p>
        <p>{draft.source.pageCount} pages · {draft.source.digitalPages} digital text · {draft.source.scanPages} possible scans · {rows.length} candidate lines</p>
        <p>Source custody: local file; no upload. Auditor identity, source financial accuracy and legal authority are NOT verified.</p>
      </div>
      <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <legend className="text-xs font-semibold text-gray-900 mb-2">{t.context}</legend>
        {([
          ['companyName',t.company],
          ['financialPeriodEnd',t.period],
          ['comparativePeriodEnd',t.prev]
        ] as const).map(([key,label])=><label key={key} className="text-xs text-gray-700 space-y-1">
          <span className="block">{label}</span>
          <input value={draft.context[key]} onChange={e=>updateContext(key,e.target.value)}
            placeholder={key==='companyName'?businessName:'YYYY-MM-DD'}
            className="w-full border rounded-md px-2 py-2 text-xs" />
        </label>)}
        <label className="text-xs text-gray-700 space-y-1">
          <span className="block">{t.currency}</span>
          <select value={draft.context.currency} onChange={e=>updateContext('currency',e.target.value)}
            className="w-full border rounded-md p-2">
            <option value="UNCONFIRMED">Unconfirmed</option><option value="BDT">BDT (confirmed from source)</option>
            <option value="OTHER">Other / requires conversion review</option>
          </select>
        </label>
        <label className="text-xs text-gray-700 space-y-1">
          <span className="block">{t.scale}</span>
          <select value={draft.context.scale} onChange={e=>updateContext('scale',e.target.value)} className="w-full border rounded-md p-2">
            <option value="UNCONFIRMED">Unconfirmed</option><option value="UNITS">Units</option>
            <option value="THOUSANDS">Thousands (manual cross-statement review)</option>
            <option value="MILLIONS">Millions (manual cross-statement review)</option>
          </select>
        </label>
      </fieldset>
      <div>
        <h4 className="font-semibold text-xs text-gray-900 mb-2">{t.lines} ({rows.length})</h4>
        <div className="overflow-x-auto max-w-full rounded-md border border-gray-200" tabIndex={0}>
          <table className="min-w-[830px] w-full text-xs">
            <thead className="bg-gray-100"><tr>
              <th scope="col" className="px-2 py-2 text-left">Source (page / label / note)</th>
              <th scope="col" className="px-2 py-2 text-right">Current raw</th>
              <th scope="col" className="px-2 py-2 text-right">Comparative raw</th>
              <th scope="col" className="px-2 py-2 text-left">{t.mapping}</th>
              <th scope="col" className="px-2 py-2 text-left">{t.status}</th>
            </tr></thead>
            <tbody>
              {visible.map(line=><tr key={line.id} className="border-t border-gray-100">
                <td className="px-2 py-2 align-top"><p className="font-semibold">{line.label}</p>
                  <p className="text-gray-500">p.{line.locator.page} · {line.section} · note {line.noteReference??'—'}</p>
                  {line.issues.length>0&&<p className="text-red-700">{line.issues.join(', ')}</p>}
                  <details><summary className="cursor-pointer text-indigo-700">Source excerpt</summary><p>{line.locator.excerpt}</p></details>
                </td>
                <td className="px-2 py-2 text-right font-mono">{line.currentRaw??'—'}</td>
                <td className="px-2 py-2 text-right font-mono">{line.previousRaw??'—'}</td>
                <td className="px-2 py-2">
                  <select aria-label={'Canonical field for '+line.label} value={line.canonical}
                    onChange={e=>changeLine(line.id,{canonical:e.target.value as CanonicalAccount,status:'CANDIDATE'})}
                    className="max-w-48 w-full border rounded p-1.5">
                    {CROSSWALK.map(opt=><option key={opt.key} value={opt.key}>{opt.label}</option>)}
                  </select>
                </td>
                <td className="px-2 py-2">
                  <select aria-label={'Review '+line.label} value={line.status}
                    onChange={e=>{
                      const status=e.target.value as CorporateLine['status'];
                      if(status==='REVIEWED'&&(line.canonical==='unmapped'||parseAmount(line.currentRaw)===null)){
                        setError('Select a canonical field and a valid current value before approval.');
                        return;
                      }
                      changeLine(line.id,{status});setError('');
                    }} className="border rounded p-1.5">
                    <option value="CANDIDATE">Candidate</option><option value="AMBIGUOUS">Ambiguous</option>
                    <option value="REVIEWED">Reviewed by preparer</option><option value="REJECTED">Exclude</option>
                  </select>
                </td>
              </tr>)}
            </tbody>
          </table>
        </div>
        {rows.length>35&&<button type="button" onClick={()=>setShowAll(!showAll)}
          className="mt-2 text-xs font-semibold text-indigo-700 underline">{showAll?'Show first 35':'Show all '+rows.length+' rows'}</button>}
      </div>
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-gray-900">{t.check}</h4>
        {checks.map((r,i)=><p key={i} className={'text-xs '+(r.status==='FAIL'?'text-red-700':'text-gray-700')}>
          <strong>{r.status}</strong> · {r.period}: {r.check}
          {r.difference!==undefined?' · Difference '+r.difference:''}
          {' · '+r.explanation}
          {r.locators.length>0?' · pages '+r.locators.map(x=>x.page).join(', '):''}
        </p>)}
        {duplicateReviewed&&<p role="alert" className="text-xs text-red-700">Duplicate reviewed canonical fields: reconcile competing source rows.</p>}
      </div>
      <p className="text-xs font-semibold text-amber-800">{t.blocked}</p>
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <button type="button" onClick={()=>exportJson('corporate-intake-review-'+draft.source.sha256.slice(0,12)+'.json',draft)}
          className="px-3 py-2 border rounded-md font-semibold">{t.save}</button>
        <label className="inline-flex flex-wrap items-center gap-2">
          <span>{t.restore}</span><input aria-label={t.restore} type="file" accept="application/json,.json" onChange={restore} className="max-w-full text-xs" />
        </label>
        <button type="button" disabled={checks.some(x=>x.status!=='MATCH')||duplicateReviewed||!draft.context.companyName.trim()||!draft.context.financialPeriodEnd}
          onClick={()=>exportJson('corporate-company-handoff-BLOCKED.json',createCompanyReturnHandoff(draft))}
          className="px-3 py-2 border rounded-md font-semibold disabled:opacity-40" title="Never submits or calculates corporate tax">
          {t.print}
        </button>
      </div>
    </>}
  </section>;
};
