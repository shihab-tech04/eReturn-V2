/**
 * WS06 review-only corporate statement intake.
 * Untrusted PDF text is evidence, never an audited opinion or tax calculation.
 * No dependency on production SQL or Rules Engine is permitted here.
 */
export type CorporateSection = 'position' | 'profit' | 'cashflow' | 'equity' | 'notes' | 'unknown';
export type CanonicalAccount =
  | 'total_assets' | 'total_equity_liabilities' | 'cash_position'
  | 'cash_closing' | 'cash_opening' | 'cash_net_change'
  | 'profit_before_tax' | 'profit_after_tax' | 'income_tax_expense'
  | 'ppe_carrying' | 'revenue' | 'unmapped';
export type IntakeStatus = 'CANDIDATE' | 'REVIEWED' | 'AMBIGUOUS' | 'REJECTED';
export interface SourcePage { page: number; text: string; textItems?: number; }
export interface EvidenceLocator { page: number; excerpt: string; }
export interface CorporateLine {
  id: string;
  section: CorporateSection;
  label: string;
  noteReference: string | null;
  currentRaw: string | null;
  previousRaw: string | null;
  canonical: CanonicalAccount;
  status: IntakeStatus;
  issues: string[];
  locator: EvidenceLocator;
}
export interface CorporateReportDraft {
  schema: 'WS06_CORPORATE_INTAKE_V1';
  source: { name: string; sha256: string; bytes: number; pageCount: number; digitalPages: number; scanPages: number; parser: 'PDFJS_TEXT_V1' };
  context: { companyName: string; financialPeriodEnd: string; comparativePeriodEnd: string; currency: string; scale: 'UNCONFIRMED' | 'UNITS' | 'THOUSANDS' | 'MILLIONS'; };
  lines: CorporateLine[];
  stage: 'REVIEW_ONLY';
}
export interface ReconResult {
  check: string;
  period: 'current' | 'previous';
  status: 'MATCH' | 'FAIL' | 'BLOCKED';
  left?: string;
  right?: string;
  difference?: string;
  explanation: string;
  locators: EvidenceLocator[];
}
export const CROSSWALK: ReadonlyArray<{ key: CanonicalAccount; label: string; section: CorporateSection }> = [
  {key:'total_assets',label:'Total assets',section:'position'},
  {key:'total_equity_liabilities',label:'Total equity and liabilities',section:'position'},
  {key:'cash_position',label:'Cash and cash equivalents (position)',section:'position'},
  {key:'cash_closing',label:'Closing cash and cash equivalents (cash flow)',section:'cashflow'},
  {key:'cash_opening',label:'Opening cash and cash equivalents (cash flow)',section:'cashflow'},
  {key:'cash_net_change',label:'Net change in cash and cash equivalents',section:'cashflow'},
  {key:'profit_before_tax',label:'Profit before tax',section:'profit'},
  {key:'income_tax_expense',label:'Income tax expense / benefit (sign review)',section:'profit'},
  {key:'profit_after_tax',label:'Profit after tax',section:'profit'},
  {key:'ppe_carrying',label:'PPE carrying value (no depreciation presumption)',section:'position'},
  {key:'revenue',label:'Revenue',section:'profit'},
  {key:'unmapped',label:'Other / unresolved',section:'unknown'},
];
export const normalizeLabel = (s: string) => s.normalize('NFKC').toLowerCase()
  .replace(/[‐‑–—−]/g,'-').replace(/[^a-z0-9\u0980-\u09ff]+/g,' ').trim().replace(/\s+/g,' ');
const translit = (s: string) => s.replace(/[০-৯]/g,(c)=>String('০১২৩৪৫৬৭৮৯'.indexOf(c)));
export function parseAmount(raw: string | null): bigint | null {
  if (raw === null) return null;
  const s = translit(raw.trim()).replace(/\u00a0/g,'');
  if (!s || /^(?:-|–|—|n\/a)$/i.test(s)) return null;
  const negative = /^\(.*\)$/.test(s) || /^[-−]/.test(s);
  const numeric = s.replace(/^[(-]/,'').replace(/[)]$/,'').replace(/,/g,'');
  if (!/^\d+(?:\.\d{1,2})?$/.test(numeric)) return null;
  const parts = numeric.split('.');
  const minor = BigInt(parts[0])*100n + BigInt((parts[1]||'').padEnd(2,'0'));
  return negative ? -minor : minor;
}
export function formatMinor(n: bigint): string {
  const a = n < 0n ? -n : n;
  const integer = (a/100n).toString(), fraction = (a%100n).toString().padStart(2,'0');
  return (n < 0n ? '-' : '')+integer+(fraction==='00'?'':'.'+fraction);
}
function detectSection(text: string, last: CorporateSection): CorporateSection {
  const n=normalizeLabel(text);
  if (/statement of financial position|balance sheet/.test(n)) return 'position';
  if (/statement of (?:profit or loss|comprehensive income)|profit and loss|income statement/.test(n)) return 'profit';
  if (/statement of cash flows?|cash flow statement/.test(n)) return 'cashflow';
  if (/statement of changes in equity/.test(n)) return 'equity';
  if (/notes to (?:the )?financial statements/.test(n)) return 'notes';
  return last;
}
export function suggestKey(section: CorporateSection, label: string): CanonicalAccount {
  const n=normalizeLabel(label);
  if(section==='position') {
    if (/^total assets?$/.test(n)) return 'total_assets';
    if (/^total (?:equity and liabilities|liabilities and equity)$/.test(n)) return 'total_equity_liabilities';
    if (/^(?:cash and cash equivalents|cash at bank and in hand)$/.test(n)) return 'cash_position';
    if (/^(?:property plant and equipment|ppe)$/.test(n)) return 'ppe_carrying';
  }
  if(section==='profit'){
    if (/^(?:profit|loss) before (?:income )?tax/.test(n)) return 'profit_before_tax';
    if (/^(?:profit|loss) after (?:income )?tax/.test(n)) return 'profit_after_tax';
    if (/^income tax (?:expense|benefit)/.test(n)) return 'income_tax_expense';
    if (/^(?:revenue|net revenue|turnover|sales)$/.test(n)) return 'revenue';
  }
  if(section==='cashflow') {
    if(/(?:cash and cash equivalents|cash balance) at (?:end|closing)|(?:closing|end of (?:the )?year) cash/.test(n)) return 'cash_closing';
    if(/(?:cash and cash equivalents|cash balance) at (?:beginning|start|opening)|(?:opening|beginning of (?:the )?year) cash/.test(n)) return 'cash_opening';
    if(/^(?:net increase|net decrease|net change) in cash/.test(n)) return 'cash_net_change';
  }
  return 'unmapped';
}
/** Conservative extraction: no implicit tax mapping, no inferred monetary scale. */
export function proposeCorporateLines(pages: SourcePage[]): CorporateLine[] {
  let section: CorporateSection='unknown';
  const results: CorporateLine[]=[];
  const num='(?:\\(?[-−]?[০-৯0-9][০-৯0-9,]*(?:\\.[০-৯0-9]{1,2})?\\)?|[-–—])';
  const tail=new RegExp('^(.+?)\\s+('+num+')\\s+('+num+')\\s*$');
  for(const p of pages){
    for(const input of p.text.split(/\r?\n/)){
      const line=input.replace(/\s+/g,' ').trim();
      if(!line)continue;
      section=detectSection(line,section);
      const m=line.match(tail);
      if(!m || m[1].length<3 || /^(notes|particulars|amount|year|as at)/i.test(m[1]))continue;
      let label=m[1]; let noteReference: string|null=null;
      const note=label.match(/^(.*?)\s+(?:note\s*)?(\d{1,2}(?:\.\d{1,3}){0,2})$/i);
      if(note && note[1].length>2){label=note[1];noteReference=note[2];}
      const current=m[2], previous=m[3];
      const issues:string[]=[];
      if(parseAmount(current)===null && !/^[-–—]$/.test(current))issues.push('INVALID_CURRENT');
      if(parseAmount(previous)===null && !/^[-–—]$/.test(previous))issues.push('INVALID_PREVIOUS');
      // For tax/PPE rows, printed sign or basis is not interpretable from an unverified table.
      const key=suggestKey(section,label);
      if (key==='income_tax_expense' || key==='ppe_carrying') issues.push('ACCOUNTING_SIGN_OR_BASIS_REVIEW');
      results.push({id:'p'+p.page+'-r'+results.length,section,label,noteReference,currentRaw:current,previousRaw:previous,canonical:key,status:issues.length?'AMBIGUOUS':'CANDIDATE',issues,locator:{page:p.page,excerpt:line.slice(0,260)}});
    }
  }
  const seen=new Map<string,CorporateLine[]>();
  results.forEach(r=>{if(r.canonical==='unmapped')return;const k=r.section+'/'+r.canonical;seen.set(k,[...(seen.get(k)||[]),r]);});
  seen.forEach(rows=>{if(rows.length>1)rows.forEach(r=>{r.status='AMBIGUOUS';r.issues.push('DUPLICATE_CANONICAL_CANDIDATE');});});
  return results;
}
const getSelected=(d:CorporateReportDraft,key:CanonicalAccount,period:'current'|'previous')=>{
  const matches=d.lines.filter(l=>l.status==='REVIEWED'&&l.canonical===key);
  return matches.length===1?{value:parseAmount(period==='current'?matches[0].currentRaw:matches[0].previousRaw),locator:matches[0].locator}:null;
};
export function reconcileCorporate(d:CorporateReportDraft): ReconResult[] {
  const pairs:ReadonlyArray<[string,CanonicalAccount,CanonicalAccount]>=[
    ['Assets = equity + liabilities','total_assets','total_equity_liabilities'],
    ['Closing cash flow = cash in financial position','cash_closing','cash_position']
  ];
  const out:ReconResult[]=[];
  for(const period of ['current','previous'] as const)for(const [check,a,b] of pairs){
    const left=getSelected(d,a,period),right=getSelected(d,b,period);
    const locators=[left?.locator,right?.locator].filter((x):x is EvidenceLocator=>Boolean(x));
    if(d.context.scale==='UNCONFIRMED'||d.context.currency!=='BDT'||!left||!right||left.value===null||right.value===null){
      out.push({check,period,status:'BLOCKED',explanation:'Confirm BDT/scale and review one evidenced row per canonical field.',locators});
    }else{
      const delta=left.value-right.value;
      out.push({check,period,status:delta===0n?'MATCH':'FAIL',left:formatMinor(left.value),right:formatMinor(right.value),difference:formatMinor(delta),explanation:delta===0n?'Equal within exact decimal precision.':'Mismatch: inspect both evidence locators and signed values.',locators});
    }
  }
  for(const period of ['current','previous'] as const){
    const o=getSelected(d,'cash_opening',period),n=getSelected(d,'cash_net_change',period),c=getSelected(d,'cash_closing',period);
    const locators=[o?.locator,n?.locator,c?.locator].filter((x):x is EvidenceLocator=>Boolean(x));
    if(!o||!n||!c||o.value===null||n.value===null||c.value===null||d.context.scale==='UNCONFIRMED'){
      out.push({check:'Opening cash + net change = closing cash',period,status:'BLOCKED',explanation:'Opening, movement, closing and unit scale require review.',locators});
    }else{
      const diff=o.value+n.value-c.value;
      out.push({check:'Opening cash + net change = closing cash',period,status:diff===0n?'MATCH':'FAIL',left:formatMinor(o.value+n.value),right:formatMinor(c.value),difference:formatMinor(diff),explanation:diff===0n?'Cash bridge matches.':'Movement/sign or reconciliation requires investigation.',locators});
    }
  }
  return out;
}
export function createCompanyReturnHandoff(d:CorporateReportDraft){
  const check=reconcileCorporate(d);
  return {
    contract:'WS06_COMPANY_RETURN_CANDIDATE_V1' as const,
    sourceSha256:d.source.sha256,
    companyName:d.context.companyName,
    financialPeriodEnd:d.context.financialPeriodEnd,
    comparativePeriodEnd:d.context.comparativePeriodEnd,
    accountingFields:d.lines.filter(l=>l.status==='REVIEWED').map(l=>({
      canonicalFieldId:l.canonical, currentRaw:l.currentRaw, previousRaw:l.previousRaw, evidence:l.locator
    })),
    reconciliations:check,
    status:'BLOCKED_PENDING_CORPORATE_LEGAL_RULE_APPROVAL_AND_AUTHENTICATED_ENGINE' as const,
    taxComputation:null,
    isExecutable:false as const
  };
}
export function readReviewSnapshot(text:string, expectedSourceSha256:string):CorporateReportDraft{
  const d:unknown=JSON.parse(text);
  if(!d||typeof d!=='object')throw Error('INVALID_REVIEW_SNAPSHOT');
  const v=d as Partial<CorporateReportDraft>;
  if(v.schema!=='WS06_CORPORATE_INTAKE_V1'||v.stage!=='REVIEW_ONLY'||v.source?.sha256!==expectedSourceSha256||!Array.isArray(v.lines)||v.lines.length>10000)
    throw Error('REVIEW_SNAPSHOT_SOURCE_OR_SCHEMA_MISMATCH');
  if(v.lines.some(l=>!l||typeof l.id!=='string'||!['CANDIDATE','REVIEWED','REJECTED','AMBIGUOUS'].includes(l.status)||typeof l.locator?.page!=='number'))
    throw Error('INVALID_REVIEW_SNAPSHOT_ROWS');
  return v as CorporateReportDraft;
}
