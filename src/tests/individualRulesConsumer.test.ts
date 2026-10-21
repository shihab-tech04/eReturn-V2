import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CONSUMER_CONTRACT,
  inspectProposedCalculation,
  validateProposedRequest,
  type IndividualReturnFacts,
  type ProposedScopePin,
  type ProposedCalculationTransport,
} from '../adapters/individualRulesConsumer';

const HASH = 'a'.repeat(64);
const RECEIPT = 'b'.repeat(64);
const request: IndividualReturnFacts = {
  contractVersion: CONSUMER_CONTRACT,
  assessmentYear: '2026-27',
  incomeYear: '2025-26',
  taxpayerClass: 'INDIVIDUAL',
  residenceStatus: 'RESIDENT',
  taxpayerRef: 'isolated-subject',
  eventDates: { salaryReceipt: '2025-12-31' },
  facts: { 'field.employment.salary': '1234.56', 'field.tds.entered': '100.00' },
  sourceFieldIds: ['field.employment.salary', 'field.tds.entered'],
};
const pin: ProposedScopePin = {
  assessmentYear: request.assessmentYear,
  incomeYear: request.incomeYear,
  taxpayerClass: 'INDIVIDUAL',
  taxpayerRef: request.taxpayerRef,
  residenceStatus: request.residenceStatus,
  rulesetId: 'isolated-review-ruleset',
  rulesetHash: HASH,
  approvedRuleVersionIds: ['rv-synthetic-1'],
  reviewEvidenceId: 'review-only-01',
  effectiveFrom: '2025-07-01',
  effectiveThrough: '2026-06-30',
};
function reply() {
  return {
    contractVersion: CONSUMER_CONTRACT,
    status: 'APPROVED',
    scope: {
      taxpayerClass: 'INDIVIDUAL',
      taxpayerRef: request.taxpayerRef,
      assessmentYear: request.assessmentYear,
      incomeYear: request.incomeYear,
      residenceStatus: request.residenceStatus,
    },
    provenance: {
      rulesetId: pin.rulesetId,
      rulesetHash: pin.rulesetHash,
      reviewEvidenceId: pin.reviewEvidenceId,
      approvedRuleVersionIds: [...pin.approvedRuleVersionIds],
      legalSourceRefs: ['SOURCE-ISOLATED-NOT-LEGAL'],
      receiptHash: RECEIPT,
    },
    outputs: { 'tax.gross': '10.0000000001', 'tax.payable': '9.00' },
    trace: [
      {
        sourceFieldId: 'field.employment.salary',
        outputId: 'tax.gross',
        ruleVersionId: 'rv-synthetic-1',
        legalSourceRef: 'SOURCE-ISOLATED-NOT-LEGAL',
      },
      {
        sourceFieldId: 'field.tds.entered',
        outputId: 'tax.payable',
        ruleVersionId: 'rv-synthetic-1',
        legalSourceRef: 'SOURCE-ISOLATED-NOT-LEGAL',
      },
    ],
  };
}
const simulated = (body: unknown, code = 200): ProposedCalculationTransport =>
  async () => ({ statusCode: code, body });
const inspect = (body: unknown) => inspectProposedCalculation(request, pin, simulated(body));
const cloneRequest = (): IndividualReturnFacts => structuredClone(request);
const clonePin = (): ProposedScopePin => structuredClone(pin);

test('WS05 source facts are exact and preserve the AY/IY/year period pair', () => {
  assert.equal(validateProposedRequest(request, pin), null);
  assert.deepEqual(request.facts, {
    'field.employment.salary': '1234.56',
    'field.tds.entered': '100.00',
  });
});

test('WS05 an approved-looking simulated reply NEVER certifies payable amounts', async () => {
  const response = await inspect(reply());
  assert.equal(response.state, 'CANDIDATE_UNVERIFIED');
  assert.equal(response.code, 'INDEPENDENT_CERTIFICATION_REQUIRED');
  assert.equal('outputs' in response, false);
  assert.equal('payableDecimal' in response, false);
  assert.equal('taxAmountDecimal' in response, false);
  assert.deepEqual(response.state === 'CANDIDATE_UNVERIFIED' ? response.tracedOutputIds : [], ['tax.gross', 'tax.payable']);
});

test('WS05 missing citizen endpoint does not call any transport', async () => {
  const response = await inspectProposedCalculation(request, pin, null);
  assert.deepEqual([response.state, response.code], ['BLOCKED', 'NO_AUTHORIZED_TRANSPORT']);
});

test('WS05 no call is made for wrong years, subject, unsupported class, missing dates or unpinned versions', async () => {
  const cases: Array<[string, IndividualReturnFacts, ProposedScopePin]> = [];
  const badYear = cloneRequest(); badYear.assessmentYear = '2027-28'; cases.push(['different year', badYear, clonePin()]);
  const badIY = cloneRequest(); badIY.incomeYear = '2023-24'; cases.push(['income year', badIY, clonePin()]);
  const malformedYear = cloneRequest(); malformedYear.assessmentYear = '2026-28'; cases.push(['invalid year pair', malformedYear, clonePin()]);
  const other = cloneRequest(); other.taxpayerRef = 'other-person'; cases.push(['cross user', other, clonePin()]);
  const residence = cloneRequest(); residence.residenceStatus = 'NONRESIDENT'; cases.push(['residency', residence, clonePin()]);
  const noEvent = cloneRequest(); noEvent.eventDates = {}; cases.push(['missing event', noEvent, clonePin()]);
  const badEvent = cloneRequest(); badEvent.eventDates = { salaryReceipt: '2027-01-01' }; cases.push(['out of effective period', badEvent, clonePin()]);
  const badDate = cloneRequest(); badDate.eventDates = { salaryReceipt: '2025-02-29' }; cases.push(['invalid leap date', badDate, clonePin()]);
  const noHash = clonePin(); noHash.rulesetHash = 'not-a-hash'; cases.push(['no hash', cloneRequest(), noHash]);
  const noRevisions = clonePin(); noRevisions.approvedRuleVersionIds = []; cases.push(['no versions', cloneRequest(), noRevisions]);
  const noReview = clonePin(); noReview.reviewEvidenceId = ''; cases.push(['missing review', cloneRequest(), noReview]);
  const noPeriod = clonePin(); noPeriod.effectiveFrom = ''; cases.push(['missing period', cloneRequest(), noPeriod]);
  let calls = 0;
  const transport: ProposedCalculationTransport = async () => { calls++; return {statusCode: 200, body: reply()}; };
  for (const [name, facts, scope] of cases) {
    const result = await inspectProposedCalculation(facts, scope, transport);
    assert.equal(result.state, 'BLOCKED', name);
  }
  assert.equal(calls, 0, 'No transport on an unproven request');
});

test('WS05 no implicit number conversion or unknown source fields', async () => {
  const malformed = cloneRequest();
  malformed.facts['field.employment.salary'] = 1234 as unknown as string;
  assert.equal((await inspectProposedCalculation(malformed, pin, simulated(reply()))).state, 'BLOCKED');
  const mismatched = cloneRequest();
  mismatched.facts['unmapped.field'] = '1.0';
  assert.equal((await inspectProposedCalculation(mismatched, pin, simulated(reply()))).code, 'FIELD_ID_MISMATCH');
  const duplicate = cloneRequest();
  duplicate.sourceFieldIds.push('field.employment.salary');
  assert.equal((await inspectProposedCalculation(duplicate, pin, simulated(reply()))).code, 'MISSING_FACTS');
});

test('WS05 unapproved, malformed and mismatched server replies are all blocked', async () => {
  const tests: Array<[string, (value: ReturnType<typeof reply>) => void]> = [
    ['approved flag', (v) => { v.status = 'DRAFT'; }],
    ['wrong contract', (v) => { v.contractVersion = 'OTHER' as typeof CONSUMER_CONTRACT; }],
    ['other subject', (v) => { v.scope.taxpayerRef = 'other'; }],
    ['wrong AY', (v) => { v.scope.assessmentYear = '2027-28'; }],
    ['wrong income year', (v) => { v.scope.incomeYear = '2024-25'; }],
    ['wrong residence', (v) => { v.scope.residenceStatus = 'NONRESIDENT'; }],
    ['stale ruleset hash', (v) => { v.provenance.rulesetHash = RECEIPT; }],
    ['unrecognized rule version', (v) => { v.provenance.approvedRuleVersionIds = ['rv-other']; }],
    ['missing source', (v) => { v.provenance.legalSourceRefs = []; }],
    ['fake receipt', (v) => { v.provenance.receiptHash = 'fake'; }],
    ['orphan field trace', (v) => { v.trace[0].sourceFieldId = 'unknown.field'; }],
    ['orphan rule trace', (v) => { v.trace[0].ruleVersionId = 'other'; }],
    ['wrong legal source', (v) => { v.trace[0].legalSourceRef = 'unlisted'; }],
    ['missing output trace', (v) => { v.trace.pop(); }],
    ['float number', (v) => { v.outputs['tax.gross'] = 1.3 as unknown as string; }],
    ['scientific notation', (v) => { v.outputs['tax.gross'] = '1e10'; }],
    ['excess precision', (v) => { v.outputs['tax.gross'] = '1.00000000001'; }],
    ['localized money', (v) => { v.outputs['tax.gross'] = '৳ 10,000'; }],
    ['Infinity', (v) => { v.outputs['tax.gross'] = 'Infinity'; }],
    ['missing outputs', (v) => { v.outputs = {}; }],
  ];
  for (const [name, mutate] of tests) {
    const candidate = reply();
    mutate(candidate);
    const result = await inspect(candidate);
    assert.equal(result.state, 'BLOCKED', name);
  }
  assert.equal((await inspect(null)).code, 'MALFORMED_RESPONSE');
});

test('WS05 authorization, rate limit and transport failures cannot return money', async () => {
  for (const status of [401, 403]) {
    assert.equal((await inspectProposedCalculation(request, pin, simulated(reply(), status))).code, 'AUTHORIZATION_REJECTED');
  }
  for (const status of [400, 429, 500, 503]) {
    assert.equal((await inspectProposedCalculation(request, pin, simulated(reply(), status))).code, 'ENGINE_UNAVAILABLE');
  }
  const throws: ProposedCalculationTransport = async () => { throw new Error('network'); };
  assert.equal((await inspectProposedCalculation(request, pin, throws)).code, 'TRANSPORT_FAILURE');
});

test('WS05 request timeout aborts isolated transport, with no invented payable', async () => {
  let aborted = false;
  const slow: ProposedCalculationTransport = async (_request, signal) => {
    return new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => {
        aborted = true;
        reject(new Error('aborted'));
      }, { once: true });
    });
  };
  const response = await inspectProposedCalculation(request, pin, slow, 100);
  assert.equal(response.code, 'TRANSPORT_TIMEOUT');
  assert.equal(aborted, true);
});

test('WS05 bounded timeout and requested field controls fail closed', async () => {
  assert.equal((await inspectProposedCalculation(request, pin, simulated(reply()), 0)).code, 'INVALID_TIMEOUT');
  const candidate = reply();
  candidate.outputs['new.untraced'] = '100.0';
  assert.equal((await inspect(candidate)).code, 'OUTPUT_TRACE_INCOMPLETE');
});
