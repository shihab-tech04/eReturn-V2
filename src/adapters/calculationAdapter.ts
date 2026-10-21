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

// Rebate calculation adapter boundary (Section 10 & 22)
// Note: Statutory rebate formula AY 2026-27 R-002 is gated by the verified Rules Engine.
export function computeRebateAdapter(
  rebate: RebateState,
  totalTaxableIncome: number
): {
  totalEligibleInvestment: number;
  estimatedRebateAmount: number;
  ruleCode: string;
  isStatutoryVerified: boolean;
  statusNote: string;
} {
  const totalEligibleInvestment = rebate.entries.reduce((sum, e) => sum + (e.investmentAmount || 0), 0);
  
  // Under Bangladesh tax conventions, allowable rebate is lesser of:
  // (a) 15% of eligible investment, or
  // (b) 3% of taxable income, or
  // (c) statutory ceiling ৳ 10,00,000.
  // We represent this transparently through the adapter contract:
  const ceilingA = totalEligibleInvestment * 0.15;
  const ceilingB = totalTaxableIncome > 0 ? totalTaxableIncome * 0.03 : 0;
  const statutoryCap = 1000000;
  
  let provisionalAmount = 0;
  if (totalEligibleInvestment > 0 && totalTaxableIncome > 0) {
    provisionalAmount = Math.min(ceilingA, ceilingB, statutoryCap);
  } else if (totalEligibleInvestment > 0) {
    provisionalAmount = Math.min(ceilingA, statutoryCap);
  }

  return {
    totalEligibleInvestment,
    estimatedRebateAmount: Math.round(provisionalAmount),
    ruleCode: 'R-002',
    isStatutoryVerified: false,
    statusNote: 'Adapter active: Provisional ceiling applied (15% investment / 3% taxable income limit). Final approval subject to Rules Engine certified dispatch.',
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

// Standard Individual Slab Tax Calculation Adapter (AY 2026-27 / 2025-26)
// First ৳ 3,50,000 = 0%
// Next  ৳ 1,00,000 = 5%
// Next  ৳ 4,00,000 = 10%
// Next  ৳ 5,00,000 = 15%
// Next  ৳ 5,00,000 = 20%
// Rest             = 25%
export function computeStandardSlabTax(taxableIncome: number, residentStatus: string = 'Resident'): number {
  if (taxableIncome <= 0) return 0;
  if (residentStatus === 'Non-Resident') {
    return Math.round(taxableIncome * 0.25);
  }

  let remaining = taxableIncome;
  let tax = 0;

  // Slab 1: 350,000 at 0%
  const slab1 = Math.min(remaining, 350000);
  remaining -= slab1;

  // Slab 2: 100,000 at 5%
  if (remaining > 0) {
    const slab2 = Math.min(remaining, 100000);
    tax += slab2 * 0.05;
    remaining -= slab2;
  }

  // Slab 3: 400,000 at 10%
  if (remaining > 0) {
    const slab3 = Math.min(remaining, 400000);
    tax += slab3 * 0.10;
    remaining -= slab3;
  }

  // Slab 4: 500,000 at 15%
  if (remaining > 0) {
    const slab4 = Math.min(remaining, 500000);
    tax += slab4 * 0.15;
    remaining -= slab4;
  }

  // Slab 5: 500,000 at 20%
  if (remaining > 0) {
    const slab5 = Math.min(remaining, 500000);
    tax += slab5 * 0.20;
    remaining -= slab5;
  }

  // Remaining at 25%
  if (remaining > 0) {
    tax += remaining * 0.25;
  }

  return Math.round(tax);
}
