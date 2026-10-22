import test from 'node:test';
import assert from 'node:assert/strict';
import {
  projectIndividualDraft,
  type IndividualDraftSnapshot,
  type CitizenCallerReference,
  type ReviewedFieldBinding,
} from '../adapters/individualDraftProjection';
import type { ProposedScopePin } from '../adapters/individualRulesConsumer';
import {
  INITIAL_ASSESSMENT, INITIAL_INCOME, INITIAL_REBATE,
  INITIAL_EXPENDITURE, INITIAL_ASSETS_LIABILITIES, INITIAL_TAX_PAYMENT,
} from '../data/mockData';

const base: IndividualDraftSnapshot = {
  assessment: INITIAL_ASSESSMENT,
  income: INITIAL_INCOME,
  rebate: INITIAL_REBATE,
  expenditure: INITIAL_EXPENDITURE,
  assetsLiabilities: INITIAL_ASSETS_LIABILITIES,
  taxPayment: INITIAL_TAX_PAYMENT,
};
const caller: CitizenCallerReference = { taxpayerRef: 'test-subject', sessionEvidenceRef: 'server-reviewed-session' };
const pin: ProposedScopePin = {
  assessmentYear: '2026-27', incomeYear: '2025-26',
  taxpayerClass: 'INDIVIDUAL', taxpayerRef: caller.taxpayerRef,
  residenceStatus: 'RESIDENT',
  rulesetId: 'test-proposed-ruleset',
  rulesetHash: 'a'.repeat(64),
  approvedRuleVersionIds: ['test-reviewed-version'],
  effectiveFrom: '2025-07-01',
  effectiveThrough: '2026-06-30',
  reviewEvidenceId: 'test-only-record',
};
const bindings: ReviewedFieldBinding[] = [
  {localField:'income.employmentEntries.0.basicPay',canonicalFieldId:'synthetic.salary',fieldReviewEvidenceId:'review-salary'},
  {localField:'income.rentEntries.0.annualRentReceived',canonicalFieldId:'synthetic.gross-rent',fieldReviewEvidenceId:'review-rent'},
  {localField:'taxPayment.tdsSalary',canonicalFieldId:'synthetic.entered-tds',fieldReviewEvidenceId:'review-entered-tds'},
];
const dates = { incomeEvent: '2025-11-30' };

test('WS05 projection: explicit reviewed field bindings only; preserves exact raw values and no PII', () => {
  const result = projectIndividualDraft(base, caller, pin, bindings, dates);
  assert.equal(result.state, 'CANDIDATE_ONLY');
  if (result.state !== 'CANDIDATE_ONLY') return;
  assert.equal(result.request.contractVersion, 'NBR_ERETURN_RULES_V1_PROPOSED');
  assert.equal(result.request.assessmentYear, '2026-27');
  assert.equal(result.request.incomeYear, '2025-26');
  assert.equal(result.request.taxpayerRef, 'test-subject');
  assert.equal(result.request.facts['synthetic.salary'], String(base.income.employmentEntries[0].basicPay));
  assert.equal(result.request.facts['synthetic.gross-rent'], String(base.income.rentEntries[0].annualRentReceived));
  assert.equal(result.request.facts['synthetic.entered-tds'], String(base.taxPayment.tdsSalary));
  assert.equal(Object.hasOwn(result.request, 'tin'), false);
  assert.equal(Object.hasOwn(result.request, 'nid'), false);
  assert.equal(Object.hasOwn(result.request, 'outputs'), false);
  assert.equal(Object.hasOwn(result.request, 'taxAmountDecimal'), false);
  assert.deepEqual(result.reviewEvidenceIds, ['review-salary','review-rent','review-entered-tds']);
  assert.equal(base.income.employmentEntries[0].basicPay, INITIAL_INCOME.employmentEntries[0].basicPay);
});

test('WS05 projection: cannot infer caller identity, tax year, or required event date', () => {
  assert.equal(projectIndividualDraft(base, null, pin, bindings, dates).state,'BLOCKED');
  assert.equal(projectIndividualDraft(base, { ...caller, taxpayerRef:'other' }, pin, bindings, dates).state,'BLOCKED');
  assert.equal(projectIndividualDraft(base, { ...caller, sessionEvidenceRef:'' }, pin, bindings, dates).state,'BLOCKED');
  assert.equal(projectIndividualDraft({ ...base, assessment: { ...base.assessment, assessmentYear:'2025-2026'} }, caller, pin, bindings, dates).state,'BLOCKED');
  assert.equal(projectIndividualDraft(base, caller, pin, bindings, {}).state,'BLOCKED');
  assert.equal(projectIndividualDraft(base, caller, pin, bindings, {incomeEvent:'2027-01-01'}).state,'BLOCKED');
});

test('WS05 projection: invented IDs or unapproved calculated fields are rejected', () => {
  assert.equal(projectIndividualDraft(base, caller, pin, [], dates).state,'BLOCKED');
  for (const localField of [
    'income.employmentEntries.0.netTaxableIncome',
    'income.rentEntries.0.netRentalIncome',
    'income.agricultureEntries.0.netAgriculturalIncome',
    'taxPayment.totalTaxPaidAndCredited',
    'income.employmentEntries.0.employerName',
    'income.employmentEntries.1000.basicPay',
    'profile.tin',
  ]) {
    const result = projectIndividualDraft(base, caller, pin, [{
      localField, canonicalFieldId:'synthetic.incorrect',fieldReviewEvidenceId:'review-test',
    }], dates);
    assert.equal(result.state,'BLOCKED',localField);
  }
  const same = [
    {...bindings[0]},
    {...bindings[1], canonicalFieldId: bindings[0].canonicalFieldId},
  ];
  assert.equal(projectIndividualDraft(base, caller, pin, same, dates).state,'BLOCKED');
  assert.equal(projectIndividualDraft(base, caller, pin, [bindings[0],bindings[0]], dates).state,'BLOCKED');
});

test('WS05 projection: zero and entered withholding are not accepted tax credits', () => {
  const source: IndividualDraftSnapshot = {
    ...base, taxPayment:{...base.taxPayment,tdsSalary:0},
  };
  const result = projectIndividualDraft(source, caller, pin, [bindings[2]], dates);
  assert.equal(result.state,'CANDIDATE_ONLY');
  if(result.state!=='CANDIDATE_ONLY') return;
  assert.equal(result.request.facts['synthetic.entered-tds'],'0');
  assert.equal('approvedCreditDecimal' in result.request, false);
  assert.equal(result.request.sourceFieldIds.length,1);
});

test('WS05 projection: malformed decimals and impossible source inputs fail closed', () => {
  const source: IndividualDraftSnapshot = {
    ...base, taxPayment:{...base.taxPayment, tdsSalary: Number.NaN},
  };
  assert.equal(projectIndividualDraft(source,caller,pin,[bindings[2]],dates).state,'BLOCKED');
  const tooLarge: IndividualDraftSnapshot = {
    ...base, taxPayment:{...base.taxPayment,tdsSalary:Number.MAX_SAFE_INTEGER},
  };
  assert.equal(projectIndividualDraft(tooLarge,caller,pin,[bindings[2]],dates).state,'BLOCKED');
});
