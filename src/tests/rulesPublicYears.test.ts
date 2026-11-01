import test from 'node:test';
import assert from 'node:assert/strict';
import {
  NBR_PUBLIC_YEARS_URL, readCanonicalRuleYears,
  matchSelectedRuleYear, toCanonicalAssessmentYear,
} from '../adapters/rulesPublicYears';

const sample = { years: [
  { assessmentYear: '2026-27', incomeYear: '2025-26', state: 'active', executable: true },
  { assessmentYear: '2027-28', incomeYear: '2026-27', state: 'draft', executable: false },
] };
const mock = (payload: unknown, status = 200) =>
  (async () => new Response(JSON.stringify(payload), { status })) as typeof fetch;

test('Citizen and Office read exactly the same canonical Rules SQL years endpoint', async () => {
  assert.equal(NBR_PUBLIC_YEARS_URL,
    'https://gtorruuhvohafapctxym.supabase.co/functions/v1/nbr-rules-office-gateway/public/years');
  const result = await readCanonicalRuleYears(mock(sample));
  assert.deepEqual(result, sample.years);
  assert.equal(toCanonicalAssessmentYear('2026-2027'), '2026-27');
  assert.equal(matchSelectedRuleYear(result, '2026-2027')?.incomeYear, '2025-26');
  assert.equal(matchSelectedRuleYear(result, '2025-2026'), null);
  // SQL's executable label is never independent approval of legal calculations.
  assert.equal(result[0].executable, true);
});

test('Fail closed on unreachable, duplicate, inconsistent and unsupported years', async () => {
  await assert.rejects(readCanonicalRuleYears(mock({ error: 'down' }, 503)), /UNAVAILABLE/);
  await assert.rejects(readCanonicalRuleYears(mock({ years: [] })), /CONTRACT_MISMATCH/);
  await assert.rejects(readCanonicalRuleYears(mock({ years: [sample.years[0], sample.years[0]] })), /CONTRACT_MISMATCH/);
  await assert.rejects(readCanonicalRuleYears(mock({ years: [{
    ...sample.years[0], incomeYear: '2024-25',
  }] })), /CONTRACT_MISMATCH/);
  await assert.rejects(readCanonicalRuleYears(mock({ years: [{
    ...sample.years[0], executable: 'true',
  }] })), /CONTRACT_MISMATCH/);
  assert.throws(() => toCanonicalAssessmentYear('2026-28'), /FORMAT_MISMATCH/);
});
