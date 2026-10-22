import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  preserveEnteredAgriculture,
  preserveEnteredRent,
  preserveEnteredEmployment,
  preserveEnteredForeign,
  enteredIncomeStatus,
  enteredWithholdingAndPayment,
} from '../adapters/individualEnteredFacts';
import { INITIAL_INCOME, INITIAL_TAX_PAYMENT } from '../data/mockData';
import type { AgricultureEntry, ForeignIncomeEntry } from '../types';

test('WS05 rent: input is retained; statutory allowance and net liability are not inferred', () => {
  const entry = {
    ...INITIAL_INCOME.rentEntries[0],
    annualRentReceived: 250000,
    advanceRentReceived: 0,
    municipalTaxPaid: 11000,
    ownershipSharePercentage: 50,
    repairAllowanceRate: 25,
    repairAllowanceAmount: 62500,
    netRentalIncome: 120000,
  };
  const output = preserveEnteredRent(entry);
  assert.equal(output.annualRentReceived, 250000);
  assert.equal(output.municipalTaxPaid, 11000);
  assert.equal(output.ownershipSharePercentage, 50);
  assert.equal(output.repairAllowanceRate, 0);
  assert.equal(output.repairAllowanceAmount, 0);
  assert.equal(output.totalDeductions, 0);
  assert.equal(output.netRentalIncome, 0);
  assert.equal(entry.netRentalIncome, 120000, 'input source object is immutable');
  for (const bad of [-1, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(() => preserveEnteredRent({ ...entry, annualRentReceived: bad }), /INVALID_ENTERED_AMOUNT/);
  }
  assert.throws(() => preserveEnteredRent({ ...entry, ownershipSharePercentage: 150 }), /INVALID_OWNERSHIP_PERCENTAGE/);
});

test('WS05 agriculture: zero cost never creates a 60% deemed expenditure', () => {
  const entry: AgricultureEntry = {
    id: 'isolated-agri',
    type: 'Production of Crops & Grains',
    landDescription: 'Controlled test plot',
    grossSaleProceeds: 350000,
    costOfProduction: 0,
    statutoryExemptionClaimed: 70000,
    netAgriculturalIncome: 90000,
  };
  const saved = preserveEnteredAgriculture(entry);
  assert.equal(saved.grossSaleProceeds, 350000);
  assert.equal(saved.costOfProduction, 0);
  assert.equal(saved.statutoryExemptionClaimed, 70000, 'entered claim retained');
  assert.equal(saved.netAgriculturalIncome, 0, 'no invented statutory net');
  assert.throws(() => preserveEnteredAgriculture({ ...entry, costOfProduction: -1 }), /INVALID_ENTERED_AMOUNT/);
});

test('WS05 employment: gross is mathematical; no salary exemption or taxable income rate', () => {
  const entry = {
    ...INITIAL_INCOME.employmentEntries[0],
    basicPay: 200000,
    houseRentAllowance: 50000,
    medicalAllowance: 12000,
    conveyanceAllowance: 3000,
    festivalBonus: 7000,
    otherAllowances: 8000,
    exemptedAmount: 25000,
    netTaxableIncome: 255000,
  };
  const saved = preserveEnteredEmployment(entry);
  assert.equal(saved.totalIncome, 280000);
  assert.equal(saved.exemptedAmount, 25000, 'claimed exempt amount is only data');
  assert.equal(saved.netTaxableIncome, 0);
  assert.throws(() => preserveEnteredEmployment({ ...entry, basicPay: -1 }), /INVALID_ENTERED_AMOUNT/);
});

test('WS05 foreign: missing exchange rate must fail closed; foreign tax is unverified', () => {
  const entry: ForeignIncomeEntry = {
    id: 'isolated-foreign',
    country: 'Other Country',
    natureOfIncome: 'Foreign consulting',
    amountForeignCurrency: 100,
    exchangeRate: 0,
    amountInBDT: 0,
    taxPaidAbroadBDT: 800,
    creditClaimed: 800,
  };
  assert.throws(() => preserveEnteredForeign(entry), /EXPLICIT_EXCHANGE_RATE_REQUIRED/);
  const saved = preserveEnteredForeign({ ...entry, exchangeRate: 117 });
  assert.equal(saved.amountForeignCurrency, 100);
  assert.equal(saved.exchangeRate, 117);
  assert.equal(saved.creditClaimed, 800, 'claim preserved, not a verified tax credit');
  assert.equal(saved.amountInBDT, 0, 'no implicit FX calculation here');
  assert.throws(() => preserveEnteredForeign({ ...entry, exchangeRate: 117, creditClaimed: -1 }), /INVALID_ENTERED_AMOUNT/);
});

test('WS05 entered withholding remains distinct from confirmed tax credit', () => {
  const input = {
    ...INITIAL_TAX_PAYMENT,
    tdsSalary: 500,
    tdsBankAndFinancial: 10,
    tdsContractAndSupplies: 20,
    tdsRentAndOther: 30,
    advanceTaxPaid: 400,
    taxPaidWithReturn: 700,
  };
  const result = enteredWithholdingAndPayment(input);
  assert.equal(result.enteredTdsTotal, 560);
  assert.equal(result.confirmedCreditDecimal, null);
  assert.equal(result.confirmedAdvanceTaxDecimal, null);
  assert.equal(result.confirmedReturnPaymentDecimal, null);
  assert.throws(() => enteredWithholdingAndPayment({ ...input, tdsSalary: Number.NaN }), /INVALID_ENTERED_AMOUNT/);
});

test('WS05 entered income never asserts a certified statutory computation', () => {
  assert.equal(enteredIncomeStatus(INITIAL_INCOME), 'ENTERED_NOT_TAX_VERIFIED');
  const empty = {
    ...INITIAL_INCOME,
    ...Object.fromEntries(Object.entries(INITIAL_INCOME)
      .filter(([, v]) => Array.isArray(v)).map(([k]) => [k, []])),
  };
  assert.equal(enteredIncomeStatus(empty), 'NO_ENTRIES');
});

test('WS05 source pages call safe entry capture; do not restore client-authored rates', () => {
  const employed = readFileSync('src/features/income/EmploymentPage.tsx', 'utf8');
  const rent = readFileSync('src/features/income/RentPage.tsx', 'utf8');
  const agri = readFileSync('src/features/income/AgriculturePage.tsx', 'utf8');
  const foreign = readFileSync('src/features/income/ForeignIncomePage.tsx', 'utf8');
  const context = readFileSync('src/context/AppContext.tsx', 'utf8');
  assert.match(employed, /preserveEnteredEmployment\(currentEntry\)/);
  assert.doesNotMatch(employed, /hrExempt|medExempt|autoExempt|300000/);
  assert.match(rent, /preserveEnteredRent\(currentEntry\)/);
  assert.doesNotMatch(rent, /grossRent \* rate|repairAllowanceRate: 25/);
  assert.match(agri, /preserveEnteredAgriculture\(currentEntry\)/);
  assert.doesNotMatch(agri, /0\.6|Defaults to 60%/);
  assert.match(foreign, /preserveEnteredForeign/);
  assert.doesNotMatch(foreign, /exchangeRate: 120|exchangeRate \|\| 1/);
  assert.match(context, /totalTaxPaidAndCredited: 0/);
});
