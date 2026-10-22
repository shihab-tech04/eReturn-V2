/**
 * Live status reader for the replacement NBR Rules SQL project.
 * This is NOT a statutory calculation or legal certification endpoint.
 * Uses no privileged credentials; keep tax amounts fail-closed.
 */
export const NBR_ENGINE_STATUS_URL =
  'https://gtorruuhvohafapctxym.supabase.co/functions/v1/nbr-tax-engine/status';

export interface RulesSqlObservation {
  engineVersion: string;
  activeYear: string;
  ruleCount: number;
  runtimeBindingCount: number;
  unhandledRuleCount: number;
}

function record(x: unknown): x is Record<string, unknown> {
  return x !== null && typeof x === 'object' && !Array.isArray(x);
}

export async function readRulesSqlObservation(fetcher: typeof fetch = fetch): Promise<RulesSqlObservation> {
  const response = await fetcher(NBR_ENGINE_STATUS_URL, {
    method: 'GET',
    cache: 'no-store',
    headers: { accept: 'application/json' },
  });
  if (!response.ok) throw new Error('NBR_SQL_UNAVAILABLE');
  const body: unknown = await response.json();
  if (!record(body) || body.ok !== true ||
      typeof body.engineVersion !== 'string' ||
      typeof body.activeYear !== 'string' ||
      (typeof body.ruleCount !== 'number' || !Number.isInteger(body.ruleCount)) ||
      (typeof body.runtimeBindingCount !== 'number' || !Number.isInteger(body.runtimeBindingCount)) ||
      (typeof body.unhandledRuleCount !== 'number' || !Number.isInteger(body.unhandledRuleCount)) ||
      body.ruleCount !== 366 || body.unhandledRuleCount !== 0) {
    throw new Error('NBR_SQL_STATUS_CONTRACT_MISMATCH');
  }
  return {
    engineVersion: body.engineVersion,
    activeYear: body.activeYear,
    ruleCount: body.ruleCount,
    runtimeBindingCount: body.runtimeBindingCount,
    unhandledRuleCount: body.unhandledRuleCount,
  };
}
