import test from 'node:test';
import assert from 'node:assert/strict';

import {
  aggregateIncomeHeads,
  computeStandardSlabTax,
  computeRebateAdapter,
  aggregateExpenditure,
  computeAssetsLiabilitiesReconciliation,
  CANONICAL_METADATA,
} from '../adapters/calculationAdapter';

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

test('4. Standard Individual Slab Tax Calculation', () => {
  // Income 0 = 0 tax
  assert.equal(computeStandardSlabTax(0), 0);
  // Income 350,000 (first slab at 0%) = 0
  assert.equal(computeStandardSlabTax(350000), 0);
  // Income 450,000 (first 350k free, next 100k @ 5%) = 5,000
  assert.equal(computeStandardSlabTax(450000), 5000);
  // Income 850,000 (350k @ 0%, 100k @ 5% = 5000, 400k @ 10% = 40000) = 45,000
  assert.equal(computeStandardSlabTax(850000), 45000);

  // Non-resident flat 25%
  assert.equal(computeStandardSlabTax(1000000, 'Non-Resident'), 250000);
});

test('5. Rebate Adapter (R-002 boundary)', () => {
  const rebateCalc = computeRebateAdapter(INITIAL_REBATE, 1951300);
  assert.equal(rebateCalc.totalEligibleInvestment, 180000);
  // 15% of 180,000 = 27,000
  // 3% of 1,951,300 = 58,539
  // Lesser of 27,000 and 58,539 = 27,000
  assert.equal(rebateCalc.estimatedRebateAmount, 27000);
  assert.equal(rebateCalc.ruleCode, 'R-002');
  assert.equal(rebateCalc.isStatutoryVerified, false);
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
