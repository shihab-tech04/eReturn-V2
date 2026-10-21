import {
  AssessmentData,
  IncomeState,
  RebateState,
  ExpenditureState,
  AssetsLiabilitiesState,
  TaxPaymentState,
} from '../types';

export interface CalculationContractMetadata {
  registryVersion: 'FINAL_2026_09_30';
  ruleCount: 366;
  registrySha256: '34902bac07a459a4f0c051b90bfe3b4c492f2465d06c661bab18ab7f36252184';
  adapterStatus: 'VERIFIED_PURE_AGGREGATION_ACTIVE' | 'RULES_ENGINE_DECOUPLED';
}

export const CANONICAL_METADATA: CalculationContractMetadata = {
  registryVersion: 'FINAL_2026_09_30',
  ruleCount: 366,
  registrySha256: '34902bac07a459a4f0c051b90bfe3b4c492f2465d06c661bab18ab7f36252184',
  adapterStatus: 'VERIFIED_PURE_AGGREGATION_ACTIVE',
};

// Pure mathematical aggregation for Income heads (sum of entered lines)
export function aggregateIncomeHeads(income: IncomeState) {
  const employmentNet = income.employmentEntries.reduce((sum, e) => sum + (e.netTaxableIncome || 0), 0);
  const financialNet = income.financialAssetEntries.reduce((sum, e) => sum + (e.netTaxableAmount || 0), 0);
  const rentNet = income.rentEntries.reduce((sum, e) => sum + (e.netRentalIncome || 0), 0);
  const agriNet = income.agricultureEntries.reduce((sum, e) => sum + (e.netAgriculturalIncome || 0), 0);
  const bizNet = income.businessEntries.reduce((sum, e) => sum + (e.netProfit || 0), 0);
  const capGainNet = income.capitalGainEntries.reduce((sum, e) => sum + (e.netCapitalGain || 0), 0);
  const otherNet = income.otherIncomeEntries.reduce((sum, e) => sum + (e.netAmount || 0), 0);
  const firmNet = income.firmEntries.reduce((sum, e) => sum + (e.totalIncomeFromFirm || 0), 0);
  const aopNet = income.aopEntries.reduce((sum, e) => sum + (e.distributedShareOfIncome || 0), 0);
  const foreignNet = income.foreignIncomeEntries.reduce((sum, e) => sum + (e.amountInBDT || 0), 0);
  const spouseMinorNet = income.spouseMinorEntries.reduce((sum, e) => sum + (e.netIncome || 0), 0);
  const taxExemptTotal = income.taxExemptedEntries.reduce((sum, e) => sum + (e.amount || 0), 0);
  const voluntaryNet = income.voluntaryDisclosureEntries.reduce((sum, e) => sum + (e.declaredAmount || 0), 0);

  const totalTaxableIncome =
    employmentNet +
    financialNet +
    rentNet +
    agriNet +
    bizNet +
    capGainNet +
    otherNet +
    firmNet +
    aopNet +
    foreignNet +
    spouseMinorNet;

  return {
    employmentNet,
    financialNet,
    rentNet,
    agriNet,
    bizNet,
    capGainNet,
    otherNet,
    firmNet,
    aopNet,
    foreignNet,
    spouseMinorNet,
    taxExemptTotal,
    voluntaryNet,
    totalTaxableIncome,
  };
}

/**
 * Executable statutory amounts are unavailable until an independently certified,
 * year/taxpayer/fact-scoped central Rules Engine contract has been approved.
 * An identity-registry hash alone is NOT calculation authorization.
 */
export const RULES_ENGINE_GATE = Object.freeze({
  status: 'BLOCKED_UNCERTIFIED' as const,
  reason: 'No verified version-pinned Rules Engine calculation response for this taxpayer, income year and assessment year.',
  contract: 'NBR_ERETURN_RULES_V1_PROPOSED',
  hasApprovedCalculation: false,
});

export interface RulesCalculationRequest {
  contractVersion: 'NBR_ERETURN_RULES_V1_PROPOSED';
  assessmentYear: string;
  incomeYear: string;
  taxpayerClass: string;
  residenceStatus: string;
  eventDates: Record<string, string>;
  facts: Record<string, unknown>;
}

export interface ApprovedRulesCalculation {
  status: 'APPROVED';
  approvalEvidenceId: string;
  versionHash: string;
  selectedRuleVersions: string[];
  taxAmountDecimal: string;
  rebateAmountDecimal: string;
  payableDecimal: string;
  calculationTrace: Record<string, unknown>[];
}

/** Adapter intentionally returns no approved amount until a verified backend is connected. */
export function getApprovedRulesCalculation(_request: RulesCalculationRequest): ApprovedRulesCalculation {
  throw new Error('RULES_ENGINE_NOT_CERTIFIED: ' + RULES_ENGINE_GATE.reason);
}

export function computeRebateAdapter(
  rebate: RebateState,
  _totalTaxableIncome: number
): {
  totalEligibleInvestment: number;
  estimatedRebateAmount: number;
  ruleCode: string;
  isStatutoryVerified: boolean;
  statusNote: string;
} {
  const totalEligibleInvestment = rebate.entries.reduce((sum, entry) => sum + (entry.investmentAmount || 0), 0);
  return {
    totalEligibleInvestment,
    estimatedRebateAmount: 0, // Placeholder only; UI must show unavailable, NEVER a zero rebate finding.
    ruleCode: 'R-002',
    isStatutoryVerified: false,
    statusNote: RULES_ENGINE_GATE.reason,
  };
}

// Pure aggregation for Expenditure (IT-10BB)
export function aggregateExpenditure(exp: ExpenditureState): number {
  return (
    (exp.personalAndFood || 0) +
    (exp.housingRentAndMaintenance || 0) +
    (exp.autoAndTransport || 0) +
    (exp.utilityBills || 0) +
    (exp.educationExpenses || 0) +
    (exp.eventsAndHospitality || 0) +
    (exp.foreignTravel || 0) +
    (exp.donationsAndGiftsNonRebate || 0) +
    (exp.otherLivingExpenses || 0)
  );
}

// Pure aggregation & reconciliation for Assets & Liabilities (IT-10B)
export function computeAssetsLiabilitiesReconciliation(
  al: AssetsLiabilitiesState,
  totalTaxableIncome: number,
  totalTaxExemptedIncome: number,
  totalExpenditure: number
) {
  const totalAssets =
    (al.businessCapital || 0) +
    (al.directorsShareholdings || 0) +
    (al.nonAgriculturalProperty || 0) +
    (al.agriculturalProperty || 0) +
    (al.financialAssetsValue || 0) +
    (al.motorVehicles || 0) +
    (al.goldAndJewelry || 0) +
    (al.furnitureAndElectronics || 0) +
    (al.otherAssets || 0);

  const totalLiabilities =
    (al.mortgagesOnProperty || 0) +
    (al.bankLoans || 0) +
    (al.unsecuredLoans || 0) +
    (al.otherDebts || 0);

  const netWealthCurrentYear = totalAssets - totalLiabilities;
  const netWealthPreviousYear = al.netWealthPreviousYear || 0;
  const changeInNetWealth = netWealthCurrentYear - netWealthPreviousYear;

  const incomeShownInReturn = totalTaxableIncome;
  const taxExemptedIncomeTotal = totalTaxExemptedIncome;
  const otherReceiptsAndGifts = al.otherReceiptsAndGifts || 0;
  const totalSourceOfFunds = incomeShownInReturn + taxExemptedIncomeTotal + otherReceiptsAndGifts;

  const outflowExpenditure = totalExpenditure;
  const totalUsesOfFunds = outflowExpenditure;

  // Net accretion in funds available for wealth growth
  const netAccretion = totalSourceOfFunds - totalUsesOfFunds;
  const reconciliationDifference = changeInNetWealth - netAccretion;

  return {
    totalAssets,
    totalLiabilities,
    netWealthCurrentYear,
    netWealthPreviousYear,
    changeInNetWealth,
    totalSourceOfFunds,
    totalUsesOfFunds,
    netAccretion,
    reconciliationDifference,
    isReconciled: Math.abs(reconciliationDifference) < 1,
  };
}

/** Do not reintroduce client-authored statutory slabs or minimum-tax defaults. */
export function computeStandardSlabTax(_taxableIncome: number, _residentStatus = 'Resident'): number {
  throw new Error('RULES_ENGINE_NOT_CERTIFIED: ' + RULES_ENGINE_GATE.reason);
}
