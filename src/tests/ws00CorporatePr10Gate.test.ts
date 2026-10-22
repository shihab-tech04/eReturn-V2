// WS00 independent acceptance on an isolated branch; imports six original WS06 tests.
// Does not modify the original WS06 PR, legal rules or any taxpayer data.
import '../features/audited-accounts/corporateIntake.test';

import test from 'node:test';
import assert from 'node:assert/strict';
import { reconcile, type AuditIntake, type Candidate } from '../features/audited-accounts/corporateIntake';

const row = (key: string, current: string, previous: string): Candidate => ({
  id: key, statement: 'position', label: key, canonicalKey: key,
  current, previous, evidence: [{ page: 1, text: key }],
  status: 'approved', scale: 1, currency: 'BDT', level: 1,
});
const fixture = (): AuditIntake => ({
  schemaVersion: 1,
  sourceSha256: 'a'.repeat(64),
  sourceFilename: 'synthetic-not-a-tax-return.pdf',
  extractMethod: 'digital_text',
  taxpayerEntity: 'Synthetic Ltd',
  auditorName: 'Synthetic reviewed label',
  periodStart: '2024-07-01',
  periodEnd: '2025-06-30',
  approvedAt: '2026-10-22T00:00:00Z',
  candidates: [
    row('assets', '100', '90'),
    row('equity', '60', '50'),
    row('liabilities', '40', '40'),
    row('cash_position', '20', '10'),
    row('cash_flow_closing', '20', '10'),
    row('cash_flow_opening', '15', '8'),
    row('cash_flow_net_change', '5', '2'),
  ],
});

test('WS00: identical numeric values from incompatible currencies must not reconcile as one accounting unit', () => {
  const report = fixture();
  assert.equal(reconcile(report).readyForTaxReview, true, 'same-currency synthetic control');
  report.candidates[0].currency = 'USD';
  const result = reconcile(report);
  assert.equal(result.readyForTaxReview, false, 'mixed currencies must require review');
  assert.ok(result.issues.some(issue => issue.code === 'CURRENCY_MISMATCH'));
});

test('WS00: missing currency on a monetary candidate fails closed without a BDT fallback', () => {
  const report = fixture();
  report.candidates[0].currency = null;
  const result = reconcile(report);
  assert.equal(result.readyForTaxReview, false);
  assert.ok(result.issues.some(issue => issue.code === 'CURRENCY_UNVERIFIED' &&
    issue.fieldIds.includes('assets')));
});

test('WS00: compound or ambiguous currency labels cannot authorize accounting equality', () => {
  const report = fixture();
  report.candidates[1].currency = 'BDT / USD';
  const result = reconcile(report);
  assert.equal(result.readyForTaxReview, false);
  assert.ok(result.issues.some(issue => issue.code === 'CURRENCY_UNVERIFIED' &&
    issue.fieldIds.includes('equity')));
});
