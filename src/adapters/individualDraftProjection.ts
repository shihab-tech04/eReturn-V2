/**
 * WS05: non-mutating draft-to-candidate Rules Engine projection.
 * This is not an authenticated network API, an accepted ER-5 field crosswalk,
 * or a source of verified statutory amounts.
 */
import type {
  AssessmentData, IncomeState, RebateState, ExpenditureState,
  AssetsLiabilitiesState, TaxPaymentState,
} from '../types';
import {
  CONSUMER_CONTRACT, validateProposedRequest,
  type IndividualReturnFacts, type ProposedScopePin,
} from './individualRulesConsumer';

export interface IndividualDraftSnapshot {
  assessment: AssessmentData;
  income: IncomeState;
  rebate: RebateState;
  expenditure: ExpenditureState;
  assetsLiabilities: AssetsLiabilitiesState;
  taxPayment: TaxPaymentState;
}

export interface CitizenCallerReference {
  /** Opaque subject from a separately authenticated, WS04-approved session. */
  taxpayerRef: string;
  sessionEvidenceRef: string;
}

export interface ReviewedFieldBinding {
  /** Local property pointer, e.g. income.employmentEntries.0.basicPay. */
  localField: string;
  /** Exact canonical ER-5 ID supplied by WS04; NEVER inferred here. */
  canonicalFieldId: string;
  fieldReviewEvidenceId: string;
}

export type DraftProjectionResult =
  | { state: 'BLOCKED'; code: string }
  | {
      state: 'CANDIDATE_ONLY';
      request: IndividualReturnFacts;
      reviewEvidenceIds: string[];
      explanation: string;
    };

const blocked = (code: string): DraftProjectionResult => ({ state: 'BLOCKED', code });
const IDENTIFIER = /^[A-Za-z0-9_.:/-]{1,160}$/;
const NUMERIC = /^-?(?:0|[1-9]\d{0,27})(?:\.\d{1,10})?$/;

/**
 * Whitelisted taxpayer-entered columns, never client-authored calculated rates
 * or taxable/exempt outputs. Must be reconciled with ER-5 before real use.
 */
const INPUT_COLUMNS: Record<string, readonly string[]> = {
  employmentEntries: ['basicPay','houseRentAllowance','medicalAllowance','conveyanceAllowance','festivalBonus','otherAllowances','exemptedAmount'],
  financialAssetEntries: ['grossAmount','taxDeductedAtSource','exemptedAmount'],
  rentEntries: ['annualRentReceived','advanceRentReceived','ownershipSharePercentage','municipalTaxPaid','landRevenuePaid','interestOnLoanPaid','insurancePremiumPaid','vacancyAllowance','otherAllowableDeductions'],
  agricultureEntries: ['grossSaleProceeds','costOfProduction','statutoryExemptionClaimed'],
  businessEntries: ['totalSalesOrTurnover','grossProfit','generalExpenses','badDebtsWrittenOff','depreciationAllowance'],
  capitalGainEntries: ['fullValueConsideration','costOfAcquisition','expenditureIncurredOnTransfer','exemptedOrReinvestedAmount'],
  otherIncomeEntries: ['grossAmount','allowableDeduction'],
  firmEntries: ['sharePercentage','shareOfProfit','salaryFromFirm','interestOnCapital'],
  aopEntries: ['sharePercentage','distributedShareOfIncome'],
  foreignIncomeEntries: ['amountForeignCurrency','exchangeRate','amountInBDT','taxPaidAbroadBDT','creditClaimed'],
  spouseMinorEntries: ['grossIncome','exemptedAmount'],
  taxExemptedEntries: ['amount'],
  voluntaryDisclosureEntries: ['declaredAmount'],
  entries: ['investmentAmount'],
};
const EXPENDITURE_COLUMNS = [
  'personalAndFood','housingRentAndMaintenance','autoAndTransport',
  'utilityBills','educationExpenses','eventsAndHospitality',
  'foreignTravel','donationsAndGiftsNonRebate','otherLivingExpenses',
];
const ASSET_COLUMNS = [
  'businessCapital','directorsShareholdings','nonAgriculturalProperty',
  'agriculturalProperty','financialAssetsValue','motorVehicles',
  'goldAndJewelry','furnitureAndElectronics','otherAssets',
  'mortgagesOnProperty','bankLoans','unsecuredLoans','otherDebts',
  'netWealthPreviousYear','otherReceiptsAndGifts',
];
const PAYMENT_COLUMNS = [
  'tdsSalary','tdsBankAndFinancial','tdsContractAndSupplies',
  'tdsRentAndOther','advanceTaxPaid','taxPaidWithReturn',
];

function getInputValue(source: IndividualDraftSnapshot, pointer: string): unknown {
  const [group, collection, index, field, excess] = pointer.split('.');
  if (excess !== undefined) return undefined;
  if (group === 'income' || group === 'rebate') {
    if (!field || !/^\d+$/.test(index ?? '') || index.length > 6) return undefined;
    if (group === 'rebate' && collection !== 'entries') return undefined;
    if (group === 'income' && collection === 'entries') return undefined;
    const permitted = INPUT_COLUMNS[collection];
    if (!permitted?.includes(field)) return undefined;
    const state = group === 'income' ? source.income : source.rebate;
    const list = (state as unknown as Record<string, unknown>)[collection];
    return Array.isArray(list) ? (list[Number(index)] as Record<string, unknown> | undefined)?.[field] : undefined;
  }
  if (index !== undefined || field !== undefined) return undefined;
  if (group === 'expenditure' && EXPENDITURE_COLUMNS.includes(collection)) {
    return (source.expenditure as unknown as Record<string, unknown>)[collection];
  }
  if (group === 'assetsLiabilities' && ASSET_COLUMNS.includes(collection)) {
    return (source.assetsLiabilities as unknown as Record<string, unknown>)[collection];
  }
  if (group === 'taxPayment' && PAYMENT_COLUMNS.includes(collection)) {
    return (source.taxPayment as unknown as Record<string, unknown>)[collection];
  }
  return undefined;
}

function decimalString(value: unknown): string | null {
  if (typeof value !== 'number' || !Number.isFinite(value) ||
      !Number.isSafeInteger(Math.round(value * 100))) return null;
  const result = String(value);
  return NUMERIC.test(result) ? result : null;
}

function normalizeAY(ay: string): string | null {
  const match = /^(\d{4})-(\d{4})$/.exec(ay);
  if (!match || Number(match[2]) !== Number(match[1]) + 1) return null;
  return match[1] + '-' + match[2].slice(-2);
}

export function projectIndividualDraft(
  source: IndividualDraftSnapshot,
  caller: CitizenCallerReference | null,
  pin: ProposedScopePin,
  bindings: readonly ReviewedFieldBinding[],
  eventDates: Record<string, string>
): DraftProjectionResult {
  if (!caller?.taxpayerRef || !caller.sessionEvidenceRef ||
      !IDENTIFIER.test(caller.taxpayerRef) ||
      !IDENTIFIER.test(caller.sessionEvidenceRef) ||
      caller.taxpayerRef !== pin.taxpayerRef) return blocked('SERVER_CALLER_BINDING_REQUIRED');
  const ay = normalizeAY(source.assessment.assessmentYear);
  if (ay !== pin.assessmentYear || !ay) return blocked('ASSESSMENT_YEAR_MISMATCH');
  if (source.assessment.residentStatus.toUpperCase().replace(/[- ]/g, '_') !== pin.residenceStatus.toUpperCase().replace(/[- ]/g, '_')) {
    return blocked('RESIDENCE_SCOPE_MISMATCH');
  }
  if (!Array.isArray(bindings) || bindings.length === 0) return blocked('REVIEWED_FIELD_BINDINGS_REQUIRED');
  const facts: Record<string, string> = {};
  const localFields = new Set<string>();
  const reviewEvidenceIds: string[] = [];
  for (const binding of bindings) {
    if (!binding || !IDENTIFIER.test(binding.canonicalFieldId) ||
        !IDENTIFIER.test(binding.fieldReviewEvidenceId) ||
        !binding.localField || localFields.has(binding.localField) ||
        Object.hasOwn(facts, binding.canonicalFieldId)) return blocked('AMBIGUOUS_FIELD_MAPPING');
    localFields.add(binding.localField);
    const number = decimalString(getInputValue(source, binding.localField));
    if (number === null) return blocked('UNKNOWN_OR_INVALID_FIELD_VALUE');
    facts[binding.canonicalFieldId] = number;
    reviewEvidenceIds.push(binding.fieldReviewEvidenceId);
  }
  const request: IndividualReturnFacts = {
    contractVersion: CONSUMER_CONTRACT,
    assessmentYear: pin.assessmentYear,
    incomeYear: pin.incomeYear,
    taxpayerClass: 'INDIVIDUAL',
    residenceStatus: pin.residenceStatus,
    taxpayerRef: caller.taxpayerRef,
    eventDates: { ...eventDates },
    facts,
    sourceFieldIds: Object.keys(facts),
  };
  const failure = validateProposedRequest(request, pin);
  if (failure) return blocked(failure.code);
  return {
    state: 'CANDIDATE_ONLY',
    request,
    reviewEvidenceIds,
    explanation: 'Only local taxpayer-entered values were projected. The canonical IDs, session assertion, applicable law and response still require independent WS02/WS04/WS07 verification; no network request was performed.',
  };
}
