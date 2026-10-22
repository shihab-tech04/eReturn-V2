import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { THEMES, THEME_ORDER } from '../appearance/themes';
import {
  EMPTY_PROFILE, EMPTY_ASSESSMENT, EMPTY_INCOME, EMPTY_REBATE,
  EMPTY_EXPENDITURE, EMPTY_ASSETS_LIABILITIES, EMPTY_TAX_PAYMENT,
} from '../data/emptyData';
import { aggregateIncomeHeads, aggregateExpenditure, RULES_ENGINE_GATE } from '../adapters/calculationAdapter';

test('Stage 1 six theme identities and key values match the Office reference', () => {
  assert.deepEqual(THEME_ORDER, [
    'indigo-blue', 'gov-blue', 'slate-purple',
    'plum-executive', 'fresh-teal', 'dark-mode',
  ]);
  assert.deepEqual(THEME_ORDER.map((id) => THEMES[id].primary), [
    '#4B5694', '#2C5EAD', '#4A4466', '#744577', '#3F7F85', '#8AB4F8',
  ]);
  for (const id of THEME_ORDER) {
    const t = THEMES[id];
    for (const key of [
      'primary', 'primaryDark', 'primaryLight', 'secondary', 'accent',
      'background', 'surface', 'border', 'textPrimary', 'textSecondary',
      'success', 'warning', 'error',
    ] as const) {
      assert.ok(t[key], 'Missing theme field ' + id + '/' + key);
    }
  }
});
test('Stage 1 starts without invented taxpayer identity or filing records', () => {
  for (const key of ['name', 'nameBn', 'tin', 'nid', 'email', 'mobile', 'currentAddress'] as const) {
    assert.equal(EMPTY_PROFILE[key], '');
  }
  assert.equal(EMPTY_PROFILE.gender, '');
  assert.equal(EMPTY_ASSESSMENT.residentStatus, '');
  for (const [key, values] of Object.entries(EMPTY_INCOME)) {
    if (key.endsWith('Entries')) assert.deepEqual(values, [], key);
  }
  assert.deepEqual(EMPTY_REBATE.entries, []);
  assert.equal(aggregateExpenditure(EMPTY_EXPENDITURE), 0);
  assert.equal(EMPTY_ASSETS_LIABILITIES.totalAssets, 0);
  assert.equal(EMPTY_TAX_PAYMENT.challanNumber, '');
  assert.equal(EMPTY_TAX_PAYMENT.taxPaidWithReturn, 0);
  assert.equal(aggregateIncomeHeads(EMPTY_INCOME).totalTaxableIncome, 0);
});
test('Stage 1 leaves statutory calculation fail closed', () => {
  assert.equal(RULES_ENGINE_GATE.status, 'BLOCKED_UNCERTIFIED');
  assert.equal(RULES_ENGINE_GATE.hasApprovedCalculation, false);
  assert.equal(EMPTY_REBATE.estimatedRebateAmount, 0);
});
test('Stage 1 workspace preserves all 13 existing income detailed routes', () => {
  const source = readFileSync(new URL('../features/workspace/ReturnWorkspace.tsx', import.meta.url), 'utf8');
  const paths = [
    'employment', 'financial-assets', 'rent', 'agriculture', 'business', 'capital-gain',
    'income-from-other-sources', 'firm-etc', 'aop', 'foreign-income',
    'spouse-income', 'tax-exempted-income', 'voluntary-disclosure-income',
  ];
  for (const path of paths) assert.match(source, new RegExp("route: '" + path + "'"), path);
  assert.match(source, /to=\{link\(route\)\}/);
});
