import { describe, expect, it } from 'vitest';
import { AuditIntake, Candidate, parseSignedAmount, reconcile, createBlockedHandoff } from './corporateIntake';
const mk = (key: string, current: string, previous: string): Candidate => ({
 id:key, statement:'position', label:key, canonicalKey:key, current, previous,
 evidence:[{page:2,text:key}],status:'approved',scale:1,currency:'BDT',level:1
});
const fixture = (): AuditIntake => ({
 schemaVersion:1,sourceSha256:'a'.repeat(64),sourceFilename:'public-synthetic.pdf',
 extractMethod:'digital_text',taxpayerEntity:'Synthetic PLC',auditorName:'Unverified auditor label',
 periodStart:'2024-07-01',periodEnd:'2025-06-30',approvedAt:'2026-10-22T00:00:00Z',
 candidates:[mk('assets','100','90'),mk('equity','60','50'),mk('liabilities','40','40'),
 mk('cash_position','20','10'),mk('cash_flow_closing','20','10'),
 mk('cash_flow_opening','15','8'),mk('cash_flow_net_change','5','2')]
});
describe('corporate intake fail-closed controls',()=>{
 it('handles signed amounts without floating point rounding',()=>{
   expect(parseSignedAmount('(1,250.50)',100)).toBe(-125050n);
   expect(parseSignedAmount('12.005',100)).toBeNull();
   expect(parseSignedAmount('-',1)).toBeNull();
 });
 it('allows a reviewed arithmetically balanced synthetic example',()=>{
   expect(reconcile(fixture()).readyForTaxReview).toBe(true);
 });
 it('rejects the original illustrative report balance sheet mismatches, never endorses its amounts',()=>{
   const d=fixture();d.candidates.find(x=>x.canonicalKey==='assets')!.current='11421770';
   d.candidates.find(x=>x.canonicalKey==='equity')!.current='16000000';
   d.candidates.find(x=>x.canonicalKey==='liabilities')!.current='12203667';
   expect(reconcile(d).issues.some(x=>x.code==='POSITION_MISMATCH')).toBe(true);
 });
 it('rejects contradictory cash statement values',()=>{
   const d=fixture();d.candidates.find(x=>x.canonicalKey==='cash_flow_closing')!.current='67716475';
   expect(reconcile(d).issues.some(x=>x.code==='CASH_MISMATCH')).toBe(true);
 });
 it('blocks scan, missing provenance, unreviewed amounts, duplicate mappings and malformed notes',()=>{
   const d=fixture();d.extractMethod='scan_requires_review';d.sourceSha256='';
   d.candidates[0].status='needs_review';
   d.candidates.push({...mk('assets','7','7'),id:'duplicate-assets',level:3,parentId:'missing'});
   const codes=reconcile(d).issues.map(x=>x.code);
   for(const code of ['SCAN_REVIEW','SOURCE_HASH','UNREVIEWED','DUPLICATE_MAPPING','NOTE_HIERARCHY'])
     expect(codes).toContain(code);
 });
 it('never issues approved tax even after account reconciliation',()=>{
   const handoff=createBlockedHandoff(fixture(),'2025-2026');
   expect(handoff.status).toBe('BLOCKED_PENDING_LEGAL_RULE_AND_ENGINE');
   expect(handoff.legalRuleVersionId).toBeNull();
 });
});
