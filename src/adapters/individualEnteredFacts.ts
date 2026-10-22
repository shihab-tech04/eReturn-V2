import type { AgricultureEntry, RentPropertyEntry, EmploymentEntry, ForeignIncomeEntry, IncomeState, TaxPaymentState } from '../types';

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

/**
 * Employer totals are arithmetic only; special allowances/exemptions and the
 * resulting net taxable salary require a verified legal calculation.
 */
export function preserveEnteredEmployment(entry: EmploymentEntry): EmploymentEntry {
  if (!entry.employerName?.trim()) throw new Error('EMPLOYER_REQUIRED');
  const incomeComponents = [
    entry.basicPay, entry.houseRentAllowance, entry.medicalAllowance,
    entry.conveyanceAllowance, entry.festivalBonus, entry.otherAllowances,
  ];
  const gross = incomeComponents.reduce<number>(
    (sum, value, index) => sum + requireEnteredAmount(value, 'salary_' + index), 0
  );
  requireEnteredAmount(entry.exemptedAmount, 'claimedExemption');
  return { ...entry, totalIncome: gross, netTaxableIncome: 0 };
}

/** Exact exchange rate must be entered; no fallback to 1 or fixed FX rates. */
export function preserveEnteredForeign(entry: ForeignIncomeEntry): ForeignIncomeEntry {
  if (!entry.natureOfIncome?.trim()) throw new Error('FOREIGN_INCOME_NATURE_REQUIRED');
  requireEnteredAmount(entry.amountForeignCurrency, 'foreignAmount');
  requireEnteredAmount(entry.amountInBDT, 'convertedAmount');
  requireEnteredAmount(entry.taxPaidAbroadBDT, 'foreignTaxEntered');
  requireEnteredAmount(entry.creditClaimed, 'foreignCreditClaimed');
  if (entry.amountForeignCurrency > 0 &&
      (!Number.isFinite(entry.exchangeRate) || entry.exchangeRate <= 0)) {
    throw new Error('EXPLICIT_EXCHANGE_RATE_REQUIRED');
  }
  // Do not infer legal foreign tax credit from the converted sum.
  return { ...entry };
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
