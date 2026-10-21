/**
 * WS05 individual eReturn consumer boundary (PROPOSED, non-executable).
 *
 * Neither a deployed citizen endpoint nor an approved response schema exists.
 * Transport injection is for isolated testing and future WS04 contract review.
 * This module never returns tax amounts as payable, printable or claimable values.
 * An approval flag in a response is an assertion, not independent certification.
 */
export const CONSUMER_CONTRACT = 'NBR_ERETURN_RULES_V1_PROPOSED' as const;

export interface IndividualReturnFacts {
  contractVersion: typeof CONSUMER_CONTRACT;
  assessmentYear: string;
  incomeYear: string;
  taxpayerClass: 'INDIVIDUAL';
  residenceStatus: string;
  /** Opaque identifier bound to the authenticated subject, not a TIN or NID. */
  taxpayerRef: string;
  /** Legal event dates, not UI arrival timestamps; ISO yyyy-mm-dd. */
  eventDates: Record<string, string>;
  /** Exact canonical field IDs and entered strings; never JS floating-point amounts. */
  facts: Record<string, string | boolean | null>;
  sourceFieldIds: string[];
}

export interface ProposedScopePin {
  assessmentYear: string;
  incomeYear: string;
  taxpayerClass: 'INDIVIDUAL';
  taxpayerRef: string;
  residenceStatus: string;
  rulesetId: string;
  rulesetHash: string;
  approvedRuleVersionIds: string[];
  /** Required legal applicability interval; not guessed from AY alone. */
  effectiveFrom: string;
  effectiveThrough: string;
  /** A source-backed WS04/WS02 review reference, NOT automatic approval. */
  reviewEvidenceId: string;
}

export interface ProposedTransportReply {
  statusCode: number;
  body: unknown;
}
export type ProposedCalculationTransport = (
  request: Readonly<IndividualReturnFacts>,
  signal: AbortSignal
) => Promise<ProposedTransportReply>;

export type ConsumerResult =
  | { state: 'BLOCKED'; code: string; explanation: string }
  | {
      state: 'CANDIDATE_UNVERIFIED';
      code: 'INDEPENDENT_CERTIFICATION_REQUIRED';
      rulesetId: string;
      rulesetHash: string;
      /** Only opaque IDs; NEVER expose unverified monetary outputs. */
      tracedOutputIds: string[];
      explanation: string;
    };

const HASH = /^[a-f0-9]{64}$/;
const YEAR = /^([0-9]{4})-([0-9]{2})$/;
const DECIMAL = /^-?(?:0|[1-9][0-9]{0,27})(?:\.[0-9]{1,10})?$/;
const REFERENCE = /^[A-Za-z0-9_.:/-]{1,160}$/;
const FIELD = /^[A-Za-z0-9_.:/-]{1,160}$/;
const BLOCKED = (code: string, explanation: string): ConsumerResult =>
  ({ state: 'BLOCKED', code, explanation });

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function nonempty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
function validYear(value: string): boolean {
  const match = YEAR.exec(value);
  return Boolean(match && Number(match[2]) === (Number(match[1]) + 1) % 100);
}
function validDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T00:00:00.000Z');
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}
function ids(value: unknown): value is string[] {
  return Array.isArray(value) && value.length > 0 &&
    value.every((id) => typeof id === 'string' && REFERENCE.test(id)) &&
    new Set(value).size === value.length;
}

/** Fail closed on missing facts or unproven period, without deriving law locally. */
export function validateProposedRequest(
  request: IndividualReturnFacts,
  pin: ProposedScopePin
): ConsumerResult | null {
  if (request.contractVersion !== CONSUMER_CONTRACT ||
      request.taxpayerClass !== 'INDIVIDUAL' || pin.taxpayerClass !== 'INDIVIDUAL') {
    return BLOCKED('UNSUPPORTED_CONTRACT_OR_TAXPAYER', 'No approved individual consumer contract.');
  }
  if (!validYear(request.assessmentYear) || !validYear(request.incomeYear) ||
      request.assessmentYear !== pin.assessmentYear ||
      request.incomeYear !== pin.incomeYear) {
    return BLOCKED('YEAR_PAIR_UNVERIFIED', 'Assessment and income years need an exact approved pair.');
  }
  if (!nonempty(request.taxpayerRef) ||
      request.taxpayerRef !== pin.taxpayerRef ||
      !nonempty(request.residenceStatus) ||
      request.residenceStatus !== pin.residenceStatus) {
    return BLOCKED('SUBJECT_SCOPE_MISMATCH', 'Taxpayer identity or residence scope changed.');
  }
  if (!REFERENCE.test(pin.rulesetId) || !HASH.test(pin.rulesetHash) ||
      !ids(pin.approvedRuleVersionIds) || !nonempty(pin.reviewEvidenceId)) {
    return BLOCKED('VERSION_PIN_UNVERIFIED', 'No reviewable version, approval record or pinned hash.');
  }
  if (!validDate(pin.effectiveFrom) || !validDate(pin.effectiveThrough) ||
      pin.effectiveFrom > pin.effectiveThrough) {
    return BLOCKED('LEGAL_PERIOD_UNVERIFIED', 'An effective legal interval is required.');
  }
  if (!record(request.facts) || !record(request.eventDates) ||
      !ids(request.sourceFieldIds)) {
    return BLOCKED('MISSING_FACTS', 'Source-backed facts, dates and field IDs are required.');
  }
  const sourceFields = new Set(request.sourceFieldIds);
  if (Object.keys(request.facts).length === 0 ||
      Object.keys(request.facts).some((id) => !FIELD.test(id) || !sourceFields.has(id))) {
    return BLOCKED('FIELD_ID_MISMATCH', 'Every supplied fact must resolve to a canonical field ID.');
  }
  for (const value of Object.values(request.facts)) {
    if (value === null || typeof value === 'boolean') continue;
    if (typeof value !== 'string' || !value.trim() || value.length > 2048) {
      return BLOCKED('FACT_TYPE_INVALID', 'Facts must be explicit strings, booleans or null.');
    }
  }
  if (Object.keys(request.eventDates).length === 0) {
    return BLOCKED('EVENT_DATE_REQUIRED', 'AY alone does not select controlling law.');
  }
  for (const [event, date] of Object.entries(request.eventDates)) {
    if (!FIELD.test(event) || !validDate(date) ||
        date < pin.effectiveFrom || date > pin.effectiveThrough) {
      return BLOCKED('EVENT_OUTSIDE_PROVEN_PERIOD', 'Event date is absent, invalid or outside pinned period.');
    }
  }
  return null;
}

/** Convert no numbers; strictly validate decimal representations from a mock response. */
function candidateResponse(
  raw: unknown,
  req: IndividualReturnFacts,
  pin: ProposedScopePin
): ConsumerResult {
  if (!record(raw)) return BLOCKED('MALFORMED_RESPONSE', 'Non-object reply.');
  if (raw.contractVersion !== CONSUMER_CONTRACT || raw.status !== 'APPROVED') {
    return BLOCKED('UNAPPROVED_RESPONSE', 'Response contract is missing or unapproved.');
  }
  if (!record(raw.scope) || raw.scope.taxpayerClass !== 'INDIVIDUAL' ||
      raw.scope.taxpayerRef !== req.taxpayerRef ||
      raw.scope.assessmentYear !== req.assessmentYear ||
      raw.scope.incomeYear !== req.incomeYear ||
      raw.scope.residenceStatus !== req.residenceStatus) {
    return BLOCKED('RESPONSE_SCOPE_MISMATCH', 'Response is not for this taxpayer, period or residence.');
  }
  if (!record(raw.provenance) ||
      raw.provenance.rulesetId !== pin.rulesetId ||
      raw.provenance.rulesetHash !== pin.rulesetHash ||
      raw.provenance.reviewEvidenceId !== pin.reviewEvidenceId ||
      !ids(raw.provenance.approvedRuleVersionIds) ||
      !ids(raw.provenance.legalSourceRefs) ||
      !nonempty(raw.provenance.receiptHash) ||
      !HASH.test(raw.provenance.receiptHash)) {
    return BLOCKED('PROVENANCE_MISMATCH', 'Pinned rules, legal sources or receipt are missing.');
  }
  const actualRuleIds = raw.provenance.approvedRuleVersionIds as string[];
  if (actualRuleIds.length !== pin.approvedRuleVersionIds.length ||
      actualRuleIds.some((id) => !pin.approvedRuleVersionIds.includes(id))) {
    return BLOCKED('RULE_VERSION_MISMATCH', 'Rule revisions differ from the pinned reviewed set.');
  }
  if (!record(raw.outputs) || Object.keys(raw.outputs).length === 0 ||
      !Array.isArray(raw.trace) || raw.trace.length === 0) {
    return BLOCKED('OUTPUT_TRACE_MISSING', 'Amounts must have explicit per-output source and rule traces.');
  }
  const outputIds = Object.keys(raw.outputs);
  if (outputIds.some((id) => !FIELD.test(id) ||
      typeof raw.outputs[id] !== 'string' || !DECIMAL.test(raw.outputs[id]))) {
    return BLOCKED('DECIMAL_PRECISION_INVALID', 'Only exact bounded decimal strings are acceptable.');
  }
  const traced = new Set<string>();
  for (const edge of raw.trace) {
    if (!record(edge) || !nonempty(edge.outputId) ||
        !outputIds.includes(edge.outputId) ||
        !nonempty(edge.sourceFieldId) ||
        !req.sourceFieldIds.includes(edge.sourceFieldId) ||
        !nonempty(edge.ruleVersionId) ||
        !actualRuleIds.includes(edge.ruleVersionId) ||
        !nonempty(edge.legalSourceRef) ||
        !raw.provenance.legalSourceRefs.includes(edge.legalSourceRef)) {
      return BLOCKED('LINEAGE_UNVERIFIED', 'Field, rule version or source locator does not reconcile.');
    }
    traced.add(edge.outputId);
  }
  if (traced.size !== outputIds.length) {
    return BLOCKED('OUTPUT_TRACE_INCOMPLETE', 'Every output needs at least one valid lineage edge.');
  }
  // Deliberate prohibition: unapproved money cannot escape this module.
  return {
    state: 'CANDIDATE_UNVERIFIED',
    code: 'INDEPENDENT_CERTIFICATION_REQUIRED',
    rulesetId: pin.rulesetId,
    rulesetHash: pin.rulesetHash,
    tracedOutputIds: outputIds,
    explanation: 'Shape/trace reviewed locally only. Requires WS04 approved contract, authorized staging invocation, SQL readback and WS07 independent official comparison.',
  };
}

/**
 * Controlled asynchronous inspector; never installs a default URL, token or POST.
 * Calling code must inject an explicitly approved isolated transport.
 * Even a perfectly shaped synthetic reply is NOT a payable/refundable result.
 */
export async function inspectProposedCalculation(
  request: IndividualReturnFacts,
  pin: ProposedScopePin,
  transport: ProposedCalculationTransport | null,
  timeoutMs = 5000
): Promise<ConsumerResult> {
  const badInput = validateProposedRequest(request, pin);
  if (badInput) return badInput;
  if (!transport) return BLOCKED('NO_AUTHORIZED_TRANSPORT', 'No certified citizen calculation endpoint is configured.');
  if (!Number.isInteger(timeoutMs) || timeoutMs < 100 || timeoutMs > 30000) {
    return BLOCKED('INVALID_TIMEOUT', 'A bounded timeout is required.');
  }
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const timeout = new Promise<never>((_resolve, reject) => {
      timer = setTimeout(() => {
        controller.abort();
        reject(new Error('TRANSPORT_TIMEOUT'));
      }, timeoutMs);
    });
    const result = await Promise.race([transport(request, controller.signal), timeout]);
    if (!record(result) || typeof result.statusCode !== 'number') {
      return BLOCKED('MALFORMED_TRANSPORT', 'No reliable HTTP status or response.');
    }
    if (result.statusCode === 401 || result.statusCode === 403) {
      return BLOCKED('AUTHORIZATION_REJECTED', 'Server rejected the caller.');
    }
    if (result.statusCode !== 200) {
      return BLOCKED('ENGINE_UNAVAILABLE', 'No approved calculation result was returned.');
    }
    return candidateResponse(result.body, request, pin);
  } catch (error) {
    return BLOCKED(
      error instanceof Error && error.message === 'TRANSPORT_TIMEOUT'
        ? 'TRANSPORT_TIMEOUT' : 'TRANSPORT_FAILURE',
      'No usable authorized calculation result. Entered form data must be retained.'
    );
  } finally {
    if (timer) clearTimeout(timer);
  }
}
