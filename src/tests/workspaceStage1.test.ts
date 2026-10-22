import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { THEMES, THEME_ORDER } from '../appearance/themes';
import {
  EMPTY_PROFILE, EMPTY_ASSESSMENT, EMPTY_INCOME, EMPTY_REBATE,
  EMPTY_EXPENDITURE, EMPTY_ASSETS_LIABILITIES, EMPTY_TAX_PAYMENT,
} from '../data/emptyData';
import { aggregateIncomeHeads, aggregateExpenditure, RULES_ENGINE_GATE } from '../adapters/calculationAdapter';

test('Current visual contract matches pinned Sobaike Public light/dark/system tokens', () => {
  // Sobaike Janao Public source: cec3cef2a298c64439be25cc3b0018b02bf7c8b9
  assert.deepEqual(THEME_ORDER, ['light', 'dark', 'system']);
  assert.equal(THEMES.light.primary, '#1B4D6B');
  assert.equal(THEMES.light.primaryDark, '#163B52');
  assert.equal(THEMES.light.background, '#F0F2F5');
  assert.equal(THEMES.light.surface, '#FFFFFF');
  assert.equal(THEMES.light.textPrimary, '#050505');
  assert.equal(THEMES.light.textSecondary, '#65676B');
  assert.equal(THEMES.dark.background, '#18191A');
  assert.equal(THEMES.dark.surface, '#242526');
  assert.equal(THEMES.dark.textPrimary, '#E4E6EB');
  assert.equal(THEMES.dark.textSecondary, '#B0B3B8');
  for (const id of THEME_ORDER) {
    const t = THEMES[id];
    for (const key of [
      'primary', 'primaryDark', 'primaryLight', 'secondary', 'accent',
      'background', 'surface', 'border', 'textPrimary', 'textSecondary',
      'success', 'warning', 'error',
    ] as const) assert.ok(t[key], 'Missing visual token ' + id + '/' + key);
  }
  const css = readFileSync(new URL('../styles/sobaike-canonical.css', import.meta.url), 'utf8');
  // Pin the reference values in the actual imported canonical CSS, not a
  // hand-copied local approximation. Whitespace formatting is immaterial.
  const tokens = [
    ['--radius-control', '12px'], ['--radius-card', '16px'],
    ['--radius-modal', '24px'], ['--type-body-size', '14px'],
    ['--type-h1-size-desktop', '32px'],
    ['--ui-primary-action-bg', '#1B4D6B'],
    ['--ui-page', '#18191A'], ['--ui-text-primary', '#E4E6EB'],
  ];
  for (const [key, value] of tokens) {
    assert.ok(css.includes(key + ': ' + value + ';') ||
      css.includes(key + ':' + value + ';'),
      'Canonical Sobaike visual token absent: ' + key + ' = ' + value);
  }
  assert.ok(css.includes('@theme inline'), 'Sobaike source utility-theme definitions missing');
  assert.ok(css.includes('.ui-space-button-md'), 'Canonical Sobaike button recipe missing');
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
