import test from 'node:test';
import assert from 'node:assert/strict';
import { parseAmount, proposeCorporateLines, reconcileCorporate, createCompanyReturnHandoff, readReviewSnapshot } from '../features/audited-accounts/corporateIntake';

import {
  aggregateIncomeHeads,
  computeStandardSlabTax,
  computeRebateAdapter,
  aggregateExpenditure,
  computeAssetsLiabilitiesReconciliation,
  CANONICAL_METADATA,
  RULES_ENGINE_GATE,
  getApprovedRulesCalculation,
} from '../adapters/calculationAdapter';

import { NBR_ENGINE_STATUS_URL, readRulesSqlObservation } from '../adapters/rulesEngineRemoteStatus';
import { GAP_REGISTER_ITEMS, GAP_REGISTER_SUMMARY } from '../data/gapRegisterData';
import { toBanglaDigits, formatBDT, parseNumber } from '../i18n/formatters';
import {
  INITIAL_INCOME,
  INITIAL_REBATE,
  INITIAL_EXPENDITURE,
  INITIAL_ASSETS_LIABILITIES,
  INITIAL_CHALLANS,
  INITIAL_CERTIFICATE_STATUS,
  INITIAL_AUDITED_BUSINESSES,
} from '../data/mockData';

test('1. Workstream B Gap Register Benchmark Integrity', () => {
  assert.equal(GAP_REGISTER_ITEMS.length, 47, 'Total gap register items must be exactly 47');

  const counts = {
    match: GAP_REGISTER_ITEMS.filter((i) => i.status === 'MATCH').length,
    conflict: GAP_REGISTER_ITEMS.filter((i) => i.status === 'CONFLICT').length,
    notVerified: GAP_REGISTER_ITEMS.filter((i) => i.status === 'NOT VERIFIED').length,
    partial: GAP_REGISTER_ITEMS.filter((i) => i.status === 'PARTIAL').length,
    missing: GAP_REGISTER_ITEMS.filter((i) => i.status === 'MISSING').length,
  };

  assert.equal(counts.match, 16, 'Expected exactly 16 MATCH items');
  assert.equal(counts.conflict, 10, 'Expected exactly 10 CONFLICT items');
  assert.equal(counts.notVerified, 10, 'Expected exactly 10 NOT VERIFIED items');
  assert.equal(counts.partial, 9, 'Expected exactly 9 PARTIAL items');
  assert.equal(counts.missing, 2, 'Expected exactly 2 MISSING items (R-002, T-004)');

  const r002 = GAP_REGISTER_ITEMS.find((i) => i.code === 'R-002');
  assert.ok(r002, 'R-002 must be explicitly tracked');
  assert.equal(r002.status, 'MISSING');

  const t004 = GAP_REGISTER_ITEMS.find((i) => i.code === 'T-004');
  assert.ok(t004, 'T-004 must be explicitly tracked');
  assert.equal(t004.status, 'MISSING');
});

test('2. Canonical Rules Engine Metadata Contract', () => {
  assert.equal(CANONICAL_METADATA.registryVersion, 'FINAL_2026_09_30');
  assert.equal(CANONICAL_METADATA.ruleCount, 366);
  assert.equal(
    CANONICAL_METADATA.registrySha256,
    '34902bac07a459a4f0c051b90bfe3b4c492f2465d06c661bab18ab7f36252184'
  );
});

test('2a. Central calculation dispatch is blocked and traceable by contract', () => {
  assert.equal(RULES_ENGINE_GATE.status, 'BLOCKED_UNCERTIFIED');
  assert.equal(RULES_ENGINE_GATE.hasApprovedCalculation, false);
  assert.throws(
    () => getApprovedRulesCalculation({
      contractVersion: 'NBR_ERETURN_RULES_V1_PROPOSED',
      assessmentYear: '2026-27', incomeYear: '2025-26',
      taxpayerClass: 'INDIVIDUAL', residenceStatus: 'RESIDENT',
      eventDates: {}, facts: {},
    }),
    /RULES_ENGINE_NOT_CERTIFIED/
  );
});

test('3. Income Aggregation Logic', () => {
  const result = aggregateIncomeHeads(INITIAL_INCOME);
  assert.equal(result.employmentNet, 1370000);
  assert.equal(result.financialNet, 225000); // 180,000 + 45,000
  assert.equal(result.rentNet, 248800);
  assert.equal(result.capGainNet, 107500);
  assert.equal(result.taxExemptTotal, 150000);

  const expectedTaxable = 1370000 + 225000 + 248800 + 107500;
  assert.equal(result.totalTaxableIncome, expectedTaxable);
});

test('4. Statutory slab calculation fails closed without an approved Rules Engine', () => {
  for (const taxableIncome of [0, 350000, 450000, 850000, 1000000]) {
    assert.throws(() => computeStandardSlabTax(taxableIncome), /RULES_ENGINE_NOT_CERTIFIED/);
    assert.throws(() => computeStandardSlabTax(taxableIncome, 'Non-Resident'), /RULES_ENGINE_NOT_CERTIFIED/);
  }
});

test('5. Rebate adapter reports entered investment only, never a verified entitlement', () => {
  const rebateCalc = computeRebateAdapter(INITIAL_REBATE, 1951300);
  assert.equal(rebateCalc.totalEligibleInvestment, 180000);
  assert.equal(rebateCalc.estimatedRebateAmount, 0);
  assert.equal(rebateCalc.ruleCode, 'R-002');
  assert.equal(rebateCalc.isStatutoryVerified, false);
  assert.match(rebateCalc.statusNote, /No verified version-pinned Rules Engine/);
});

test('6. Expenditure Aggregation (IT-10BB)', () => {
  const total = aggregateExpenditure(INITIAL_EXPENDITURE);
  assert.equal(total, 1300000);
});

test('7. Assets, Liabilities and Reconciliation (IT-10B)', () => {
  const recon = computeAssetsLiabilitiesReconciliation(
    INITIAL_ASSETS_LIABILITIES,
    1951300,
    150000,
    1300000
  );

  assert.equal(recon.totalAssets, 9730000);
  assert.equal(recon.totalLiabilities, 1200000);
  assert.equal(recon.netWealthCurrentYear, 8530000);
  assert.equal(recon.changeInNetWealth, 8530000 - 7750000); // 780,000
  assert.equal(recon.totalSourceOfFunds, 1951300 + 150000); // 2,101,300
  assert.equal(recon.totalUsesOfFunds, 1300000);
  assert.equal(recon.netAccretion, 2101300 - 1300000); // 801,300
  assert.equal(recon.reconciliationDifference, 780000 - 801300); // -21,300
});

test('8. Bilingual Formatter & Bengali Numerals', () => {
  assert.equal(toBanglaDigits('12345'), '১২৩৪৫');
  assert.equal(toBanglaDigits('2026-2027'), '২০২৬-২০২৭');
  assert.equal(formatBDT(150000, 'en'), '৳ 1,50,000');
  assert.equal(formatBDT(150000, 'bn'), '৳ ১,৫০,০০০');
  assert.equal(parseNumber('১,৫০,০০০'), 150000);
});

test('9. Challan and Certificate Column Structure Integrity', () => {
  assert.equal(INITIAL_CHALLANS.length, 3);
  const ch = INITIAL_CHALLANS[0];
  assert.ok(ch.challanNo);
  assert.ok(ch.challanDate);
  assert.ok(ch.section);
  assert.ok(ch.taxesZone);
  assert.ok(ch.taxesCircle);
  assert.ok(ch.bankName);
  assert.ok(ch.challanAmount > 0);

  assert.equal(INITIAL_CERTIFICATE_STATUS.length, 2);
  const cert = INITIAL_CERTIFICATE_STATUS[0];
  assert.ok(cert.tinNo);
  assert.ok(cert.assessmentYear);
  assert.ok(cert.returnRegisterSerial);
  assert.ok(cert.requestStatus);
});

test('10. Audited Accounts 3-Level Note Hierarchy', () => {
  assert.equal(INITIAL_AUDITED_BUSINESSES.length, 1);
  const biz = INITIAL_AUDITED_BUSINESSES[0];
  const notes = biz.notes;

  const level1 = notes.filter((n) => n.level === 1);
  const level2 = notes.filter((n) => n.level === 2);
  const level3 = notes.filter((n) => n.level === 3);

  assert.ok(level1.length > 0, 'Level 1 note exists');
  assert.ok(level2.length > 0, 'Level 2 child note exists');
  assert.ok(level3.length > 0, 'Level 3 sub-note exists');

  // Verify child note references parent
  const child = level2[0];
  assert.equal(child.parentId, level1[0].id);

  // Verify sub-note references child
  const sub = level3[0];
  assert.equal(sub.parentId, child.id);
});

test('Replacement SQL status: exact endpoint and read-only contract', async () => {
  const fetcher = (async (url: string, init?: RequestInit) => {
    assert.equal(url, NBR_ENGINE_STATUS_URL);
    assert.ok(url.includes('gtorruuhvohafapctxym.supabase.co'));
    assert.equal(init?.method, 'GET');
    assert.equal(init?.cache, 'no-store');
    assert.equal(init?.headers && (init.headers as Record<string, string>).accept, 'application/json');
    return new Response(JSON.stringify({
      ok: true, engineVersion: 'NBR-TAX-ENGINE-1.5.0',
      activeYear: '2026-27', ruleCount: 366,
      runtimeBindingCount: 366, unhandledRuleCount: 0,
    }), { status: 200 });
  }) as typeof fetch;
  const status = await readRulesSqlObservation(fetcher);
  assert.equal(status.ruleCount, 366);
  assert.equal(status.activeYear, '2026-27');
  assert.equal(RULES_ENGINE_GATE.hasApprovedCalculation, false);
});

test('Replacement SQL reader fails closed on errors and incomplete rule coverage', async () => {
  const unavailable = (async () => new Response('service down', {status: 503})) as typeof fetch;
  await assert.rejects(readRulesSqlObservation(unavailable), /NBR_SQL_UNAVAILABLE/);
  const incomplete = (async () => new Response(JSON.stringify({
    ok: true, engineVersion: 'NBR-TAX-ENGINE-1.5.0', activeYear: '2026-27',
    ruleCount: 366, runtimeBindingCount: 365, unhandledRuleCount: 1,
  }), {status: 200})) as typeof fetch;
  await assert.rejects(readRulesSqlObservation(incomplete), /NBR_SQL_STATUS_CONTRACT_MISMATCH/);
  assert.equal(RULES_ENGINE_GATE.status, 'BLOCKED_UNCERTIFIED');
});

test('11. WS06 untrusted PDF text only yields candidate accounting rows', () => {
  assert.equal(parseAmount('১,২৩৪.৫০'), 123450n);
  assert.equal(parseAmount('(250.25)'), -25025n);
  assert.equal(parseAmount('unverified'), null);
  const rows = proposeCorporateLines([{ page: 1, text:
    'Statement of Financial Position\nTotal assets 1,000.00 900.00\nTotal equity and liabilities 1,000.00 899.00\nTotal assets 1,000.00 900.00' }]);
  assert.equal(rows.length, 3);
  assert.ok(rows.every(x => x.status !== 'REVIEWED'));
  assert.ok(rows.filter(x => x.canonical === 'total_assets').every(x => x.issues.includes('DUPLICATE_CANONICAL_CANDIDATE')));
  assert.ok(rows.every(x => x.locator.page === 1));
});

test('12. WS06 reviewed arithmetic remains evidence-only, deterministic and fail-closed', () => {
  const lines = proposeCorporateLines([{page: 2, text:
    'Statement of Financial Position\nTotal assets 1,000.00 900.00\nTotal equity and liabilities 1,000.00 899.00'}]);
  const draft = {
    schema: 'WS06_CORPORATE_INTAKE_V1' as const,
    source: {name:'synthetic.pdf',sha256:'synthetic-only',bytes:100,pageCount:2,digitalPages:2,scanPages:0,parser:'PDFJS_TEXT_V1' as const},
    context: {companyName:'Synthetic Corporation',financialPeriodEnd:'2026-06-30',comparativePeriodEnd:'2025-06-30',currency:'BDT',scale:'UNITS' as const},
    lines: lines.map(x => ({...x,status:'REVIEWED' as const})),
    stage: 'REVIEW_ONLY' as const,
  };
  const outcome = reconcileCorporate(draft);
  assert.equal(outcome.find(x => x.period==='current' && x.check==='Assets = equity + liabilities')?.status,'MATCH');
  assert.equal(outcome.find(x => x.period==='previous' && x.check==='Assets = equity + liabilities')?.status,'FAIL');
  const unconfirmed = {...draft,context:{...draft.context,currency:'UNCONFIRMED'}};
  assert.ok(reconcileCorporate(unconfirmed).every(x => x.status === 'BLOCKED'));
  const handoff = createCompanyReturnHandoff(draft);
  assert.equal(handoff.isExecutable,false);
  assert.equal(handoff.taxComputation,null);
  assert.match(handoff.status,/BLOCKED_PENDING_CORPORATE/);
  assert.throws(() => readReviewSnapshot(JSON.stringify(draft),'other-source'), /SOURCE_OR_SCHEMA_MISMATCH/);
  assert.deepEqual(readReviewSnapshot(JSON.stringify(draft),'synthetic-only').source.sha256, 'synthetic-only');
});

test('13. WS06 reviewed PDF page custody cannot be restored with altered page indexes', () => {
  const rows=proposeCorporateLines([{page:1,text:'Statement of Financial Position\nTotal assets 100 90'}]);
  const draft={
    schema:'WS06_CORPORATE_INTAKE_V1' as const,
    source:{name:'synthetic.pdf',sha256:'a'.repeat(64),bytes:150,pageCount:1,digitalPages:1,scanPages:0,parser:'PDFJS_TEXT_V1' as const},
    context:{companyName:'',financialPeriodEnd:'',comparativePeriodEnd:'',currency:'UNCONFIRMED',scale:'UNCONFIRMED' as const},
    lines:rows,sourcePages:[{page:1,text:'Statement of Financial Position\nTotal assets 100 90'}],
    stage:'REVIEW_ONLY' as const
  };
  assert.equal(readReviewSnapshot(JSON.stringify(draft),draft.source.sha256).sourcePages?.[0].page,1);
  const wrong={...draft,sourcePages:[{page:2,text:'modified'}]};
  assert.throws(()=>readReviewSnapshot(JSON.stringify(wrong),draft.source.sha256),/INVALID_SOURCE_PAGE_INDEX/);
  const outOfRange={...draft,lines:rows.map(x=>({...x,locator:{...x.locator,page:8}}))};
  assert.throws(()=>readReviewSnapshot(JSON.stringify(outOfRange),draft.source.sha256),/INVALID_ROW_SOURCE_PAGE/);
});
