/** WS06 corporate report intake — candidate-only; no tax authority or executable return. */
export type Evidence = { page: number; text: string; region?: [number, number, number, number] };
export type Statement = 'position' | 'profit_loss' | 'cash_flow' | 'equity' | 'notes';
export type Candidate = {
  id: string; statement: Statement; label: string; canonicalKey?: string;
  current: string | null; previous: string | null; evidence: Evidence[];
  status: 'needs_review' | 'approved' | 'rejected';
  scale: number | null; currency: string | null; parentId?: string; level: 1 | 2 | 3;
};
export type AuditIntake = {
  schemaVersion: 1; sourceSha256: string; sourceFilename: string;
  extractMethod: 'digital_text' | 'scan_requires_review';
  taxpayerEntity: string | null; auditorName: string | null;
  periodStart: string | null; periodEnd: string | null;
  candidates: Candidate[]; approvedAt: string | null;
};
export type Issue = { code: string; fieldIds: string[]; detail: string; blocking: true };
export type Reconciliation = { issues: Issue[]; readyForTaxReview: boolean };
export const CANONICAL_KEYS = [
  'assets', 'equity', 'liabilities', 'cash_position', 'cash_flow_closing',
  'cash_flow_opening', 'cash_flow_net_change', 'profit_before_tax',
  'tax_expense', 'profit_after_tax', 'turnover'
] as const;
export type CanonicalKey = typeof CANONICAL_KEYS[number];

export function parseSignedAmount(input: string | null, scale: number | null): bigint | null {
  if (input === null || scale === null || !Number.isSafeInteger(scale) || scale < 1) return null;
  const s = input.trim().replace(/,/g, '');
  if (s === '' || s === '-' || s === '—') return null;
  const negative = /^\(.*\)$/.test(s);
  const n = negative ? s.slice(1, -1) : s;
  if (!/^[+-]?\d+(?:\.\d+)?$/.test(n)) return null;
  const sign = negative || n.startsWith('-') ? -1n : 1n;
  const value = n.replace(/^[+-]/, '');
  const [whole, fraction = ''] = value.split('.');
  // Forbid truncation: exact integer minor-unit result only.
  const denominator = 10n ** BigInt(fraction.length);
  const numerator = BigInt(whole) * denominator + BigInt(fraction || '0');
  const scaled = numerator * BigInt(scale);
  return scaled % denominator === 0n ? sign * scaled / denominator : null;
}

export function reconcile(input: AuditIntake): Reconciliation {
  const issues: Issue[] = [];
  const fail = (code: string, fieldIds: string[], detail: string) =>
    issues.push({code, fieldIds, detail, blocking: true});
  if (!/^[0-9a-f]{64}$/i.test(input.sourceSha256)) fail('SOURCE_HASH', [], 'Missing valid SHA-256 provenance');
  if (!input.taxpayerEntity || !input.periodStart || !input.periodEnd || !input.auditorName)
    fail('IDENTITY_PERIOD_AUDITOR_UNREVIEWED', [], 'Company, reporting dates and auditor identification need review; no authenticity conclusion');
  if (input.extractMethod === 'scan_requires_review') fail('SCAN_REVIEW', [], 'Scanned PDF requires independently reviewed text');
  if (!input.candidates.length) fail('EMPTY', [], 'No statement candidates');
  const byKey = new Map<string, Candidate>();
  const ids = new Set<string>();
  for (const row of input.candidates) {
    if (ids.has(row.id)) fail('DUPLICATE_ID', [row.id], 'Duplicate candidate identifier');
    ids.add(row.id);
    if (!row.evidence.length || row.evidence.some(e => !Number.isInteger(e.page) || e.page < 1))
      fail('MISSING_LOCATOR', [row.id], 'Source page evidence required');
    if (row.level > 1 && !row.parentId) fail('MISSING_PARENT', [row.id], 'Nested note must have parent');
    if (row.status !== 'approved') fail('UNREVIEWED', [row.id], 'Candidate not approved');
    for (const year of ['current', 'previous'] as const) {
      if (row[year] !== null && parseSignedAmount(row[year], row.scale) === null)
        fail('INVALID_SIGNED_AMOUNT', [row.id], year + ' value or scaling ambiguous');
      if (row.canonicalKey) {
        const key = row.canonicalKey + ':' + year;
        if (row[year] !== null) {
          const duplicate = byKey.get(key);
          if (duplicate) fail('DUPLICATE_MAPPING', [duplicate.id, row.id], 'Multiple candidates mapped to ' + key);
          byKey.set(key, row);
        }
      }
    }
  }
  for (const row of input.candidates) {
    if (row.parentId) {
      const parent = input.candidates.find(x => x.id === row.parentId);
      if (!parent || parent.level !== row.level - 1) fail('NOTE_HIERARCHY', [row.id], 'Invalid parent or nesting level');
    }
  }
  const val = (key: string, year: 'current' | 'previous'): bigint | null => {
    const row = byKey.get(key + ':' + year);
    return row ? parseSignedAmount(row[year], row.scale) : null;
  };
  for (const year of ['current', 'previous'] as const) {
    const a = val('assets',year), e = val('equity',year), l = val('liabilities',year);
    if ([a,e,l].some(x=>x===null)) fail('INCOMPLETE_POSITION', [], year + ' balance components absent');
    else if (a !== e! + l!) fail('POSITION_MISMATCH', [], year + ' assets differ from equity plus liabilities');
    const c = val('cash_position',year), f = val('cash_flow_closing',year);
    if (c !== null && f !== null && c !== f) fail('CASH_MISMATCH', [], year + ' closing cash differs from financial position');
    const op = val('cash_flow_opening',year), change = val('cash_flow_net_change',year);
    if (op !== null && change !== null && f !== null && op + change !== f)
      fail('CASH_BRIDGE', [], year + ' opening cash plus net change differs from closing cash; FX/reconciliation may need separately evidenced treatment');
  }
  if (input.approvedAt === null) fail('INTAKE_APPROVAL', [], 'Explicit intake approval required');
  return {issues, readyForTaxReview: issues.length === 0};
}
/** Only an independently approved, rule-version-bound calculator may issue a tax result. */
export type CorporateTaxHandoff = {
  sourceSha256: string; approvedCandidateIds: string[];
  assessmentYear: string; incomeYearStart: string; incomeYearEnd: string;
  taxpayerType: 'company'; legalRuleVersionId: string | null;
  status: 'BLOCKED_PENDING_LEGAL_RULE_AND_ENGINE';
};
export function createBlockedHandoff(input: AuditIntake, assessmentYear: string): CorporateTaxHandoff {
  return {
    sourceSha256: input.sourceSha256,
    approvedCandidateIds: input.candidates.filter(x=>x.status==='approved').map(x=>x.id),
    assessmentYear, incomeYearStart: input.periodStart || '', incomeYearEnd: input.periodEnd || '',
    taxpayerType: 'company', legalRuleVersionId: null,
    status: 'BLOCKED_PENDING_LEGAL_RULE_AND_ENGINE'
  };
}
