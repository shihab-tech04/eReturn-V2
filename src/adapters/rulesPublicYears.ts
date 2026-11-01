/**
 * Read-only tax-year identity from the SAME canonical Rules SQL gateway used by
 * NBR Office Management. Stored SQL is not independent statutory certification.
 * No secrets, local snapshots or executable calculations are used here.
 */
export const NBR_PUBLIC_YEARS_URL =
  'https://gtorruuhvohafapctxym.supabase.co/functions/v1/nbr-rules-office-gateway/public/years';

export interface CanonicalRuleYear {
  assessmentYear: string;
  incomeYear: string;
  state: string;
  executable: boolean; // Historical SQL label ONLY; never approves calculation.
}
const yearPattern = /^(\d{4})-(\d{2})$/;

function validYear(value: string): boolean {
  const found = yearPattern.exec(value);
  return found !== null && Number(found[2]) === (Number(found[1]) + 1) % 100;
}

/** UI "2026-2027" and SQL "2026-27" refer to one identical AY. */
export function toCanonicalAssessmentYear(uiYear: string): string {
  const full = /^(\d{4})-(\d{4})$/.exec(uiYear);
  if (!full || Number(full[2]) !== Number(full[1]) + 1) {
    throw new Error('NBR_ASSESSMENT_YEAR_FORMAT_MISMATCH');
  }
  return full[1] + '-' + full[2].slice(-2);
}

export async function readCanonicalRuleYears(fetcher: typeof fetch = fetch): Promise<CanonicalRuleYear[]> {
  const response = await fetcher(NBR_PUBLIC_YEARS_URL, {
    method: 'GET',
    headers: { accept: 'application/json' },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('NBR_RULES_SQL_UNAVAILABLE');

  const payload: unknown = await response.json();
  if (payload === null || typeof payload !== 'object' || !('years' in payload) ||
      !Array.isArray(payload.years) || payload.years.length === 0) {
    throw new Error('NBR_RULES_YEAR_CONTRACT_MISMATCH');
  }

  const seen = new Set<string>();
  const years: CanonicalRuleYear[] = [];
  for (const candidate of payload.years as unknown[]) {
    if (candidate === null || typeof candidate !== 'object') {
      throw new Error('NBR_RULES_YEAR_CONTRACT_MISMATCH');
    }
    const y = candidate as Record<string, unknown>;
    if (typeof y.assessmentYear !== 'string' || !validYear(y.assessmentYear) ||
        typeof y.incomeYear !== 'string' || !validYear(y.incomeYear) ||
        typeof y.state !== 'string' || !y.state ||
        typeof y.executable !== 'boolean' ||
        seen.has(y.assessmentYear)) {
      throw new Error('NBR_RULES_YEAR_CONTRACT_MISMATCH');
    }
    // The AY and IY are distinct periods. Never infer tax law from AY alone.
    const first = Number(y.assessmentYear.slice(0, 4));
    const incomeFirst = Number(y.incomeYear.slice(0, 4));
    if (incomeFirst !== first - 1) throw new Error('NBR_RULES_YEAR_CONTRACT_MISMATCH');
    seen.add(y.assessmentYear);
    years.push({
      assessmentYear: y.assessmentYear,
      incomeYear: y.incomeYear,
      state: y.state,
      executable: y.executable,
    });
  }
  return years;
}

export function matchSelectedRuleYear(
  years: readonly CanonicalRuleYear[],
  uiYear: string
): CanonicalRuleYear | null {
  const canonical = toCanonicalAssessmentYear(uiYear);
  return years.find(year => year.assessmentYear === canonical) ?? null;
}
