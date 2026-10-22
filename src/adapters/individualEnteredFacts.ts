import type { AgricultureEntry, RentPropertyEntry, IncomeState, TaxPaymentState } from '../types';

/** Captures taxpayer-entered facts; no statutory deductions, exemptions or rates. */
const requireEnteredAmount = (value: unknown, field: string): number => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 ||
      !Number.isSafeInteger(Math.round(value * 100))) {
    throw new Error('INVALID_ENTERED_AMOUNT:' + field);
  }
  return value;
};

/**
 * Save raw rent facts only. A zero in legacy calculated columns is a storage
 * sentinel, NEVER a computed zero rental liability. UI must print PENDING.
 */
export function preserveEnteredRent(entry: RentPropertyEntry): RentPropertyEntry {
  if (!entry.propertyAddress?.trim()) throw new Error('RENT_PROPERTY_REQUIRED');
  for (const key of [
    'annualRentReceived', 'advanceRentReceived', 'municipalTaxPaid',
    'landRevenuePaid', 'interestOnLoanPaid', 'insurancePremiumPaid',
    'vacancyAllowance', 'otherAllowableDeductions',
  ] as const) requireEnteredAmount(entry[key], key);
  if (!Number.isFinite(entry.ownershipSharePercentage) ||
      entry.ownershipSharePercentage < 0 || entry.ownershipSharePercentage > 100) {
    throw new Error('INVALID_OWNERSHIP_PERCENTAGE');
  }
  return {
    ...entry,
    repairAllowanceRate: 0,
    repairAllowanceAmount: 0,
    totalDeductions: 0,
    netRentalIncome: 0,
  };
}

/**
 * Zero recorded production cost stays zero; it must not trigger a fabricated
 * deemed-cost fraction. An entered exemption is a claim, not an entitlement.
 */
export function preserveEnteredAgriculture(entry: AgricultureEntry): AgricultureEntry {
  if (!entry.landDescription?.trim()) throw new Error('AGRICULTURE_DESCRIPTION_REQUIRED');
  for (const key of [
    'grossSaleProceeds', 'costOfProduction', 'statutoryExemptionClaimed',
  ] as const) requireEnteredAmount(entry[key], key);
  return { ...entry, netAgriculturalIncome: 0 };
}

export type EnteredIncomeStatus = 'NO_ENTRIES' | 'ENTERED_NOT_TAX_VERIFIED';

/**
 * Even a purely arithmetical aggregation of claimed income heads is NOT an
 * approved income-tax total until WS04 supplies a version-pinned calculation.
 */
export function enteredIncomeStatus(income: IncomeState): EnteredIncomeStatus {
  const entryLists = [
    income.employmentEntries, income.financialAssetEntries, income.rentEntries,
    income.agricultureEntries, income.businessEntries, income.capitalGainEntries,
    income.otherIncomeEntries, income.firmEntries, income.aopEntries,
    income.foreignIncomeEntries, income.spouseMinorEntries,
    income.taxExemptedEntries, income.voluntaryDisclosureEntries,
  ];
  return entryLists.some((items) => items.length > 0)
    ? 'ENTERED_NOT_TAX_VERIFIED' : 'NO_ENTRIES';
}

/** Numerically entered source/payment figures; never claimed tax credits. */
export function enteredWithholdingAndPayment(tax: TaxPaymentState) {
  const tds = [
    tax.tdsSalary, tax.tdsBankAndFinancial,
    tax.tdsContractAndSupplies, tax.tdsRentAndOther,
  ].reduce((sum, amount, i) => sum + requireEnteredAmount(amount, 'tds_' + i), 0);
  requireEnteredAmount(tax.advanceTaxPaid, 'advanceTaxPaid');
  requireEnteredAmount(tax.taxPaidWithReturn, 'taxPaidWithReturn');
  return {
    enteredTdsTotal: tds,
    confirmedCreditDecimal: null as null,
    confirmedAdvanceTaxDecimal: null as null,
    confirmedReturnPaymentDecimal: null as null,
  };
}
