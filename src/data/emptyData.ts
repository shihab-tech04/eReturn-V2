import type { AssessmentData, AssetsLiabilitiesState, ExpenditureState, IncomeState, RebateState, TaxPaymentState, UserProfile } from '../types';

export const EMPTY_PROFILE: UserProfile = {
  name: '', nameBn: '', tin: '', nid: '', fatherName: '', motherName: '',
  spouseName: '', spouseTin: '', dob: '', gender: '', mobile: '',
  email: '', currentAddress: '', permanentAddress: '', taxesZone: '',
  taxesCircle: '', status: 'Individual',
};
export const EMPTY_ASSESSMENT: AssessmentData = {
  returnScheme: 'Universal Self', assessmentYear: '2026-2027',
  incomeYearFrom: '2025-07-01', incomeYearTo: '2026-06-30',
  residentStatus: '', hasTaxExemptedIncome: false, hasTaxableIncome: false,
  heads: {
    employment: false, rent: false, agriculture: false, business: false,
    capitalGain: false, financialAssets: false, otherSources: false,
  },
  additionalCategories: {
    firmPartner: false, aopMember: false, foreignIncome: false, spouseOrMinor: false,
  },
  voluntaryDisclosure: false,
};
export const EMPTY_INCOME: IncomeState = {
  employmentEntries: [], financialAssetEntries: [], rentEntries: [],
  agricultureEntries: [], businessEntries: [], capitalGainEntries: [],
  otherIncomeEntries: [], firmEntries: [], aopEntries: [], foreignIncomeEntries: [],
  spouseMinorEntries: [], taxExemptedEntries: [], voluntaryDisclosureEntries: [],
  voluntaryDisclosureAffirmed: false,
};
export const EMPTY_REBATE: RebateState = {
  entries: [], totalInvestment: 0,
  statutoryRebateCeilingRule: 'R-002: RULES_ENGINE_NOT_CERTIFIED',
  estimatedRebateAmount: 0,
};
export const EMPTY_EXPENDITURE: ExpenditureState = {
  personalAndFood: 0, housingRentAndMaintenance: 0, autoAndTransport: 0,
  utilityBills: 0, educationExpenses: 0, eventsAndHospitality: 0,
  foreignTravel: 0, donationsAndGiftsNonRebate: 0, otherLivingExpenses: 0,
  totalExpenditure: 0,
};
export const EMPTY_ASSETS_LIABILITIES: AssetsLiabilitiesState = {
  businessCapital: 0, directorsShareholdings: 0,
  nonAgriculturalProperty: 0, agriculturalProperty: 0, financialAssetsValue: 0,
  motorVehicles: 0, goldAndJewelry: 0, furnitureAndElectronics: 0, otherAssets: 0,
  totalAssets: 0, mortgagesOnProperty: 0, bankLoans: 0, unsecuredLoans: 0,
  otherDebts: 0, totalLiabilities: 0, netWealthCurrentYear: 0,
  netWealthPreviousYear: 0, changeInNetWealth: 0, incomeShownInReturn: 0,
  taxExemptedIncomeTotal: 0, otherReceiptsAndGifts: 0, totalSourceOfFunds: 0,
  outflowExpenditure: 0, totalUsesOfFunds: 0, reconciliationDifference: 0,
};
export const EMPTY_TAX_PAYMENT: TaxPaymentState = {
  taxableIncome: 0, grossTaxCalculated: 0, taxRebateDeducted: 0,
  netTaxLiability: 0, minimumTaxRateApplied: 0, surchargeAmount: 0,
  delayInterestOrPenalty: 0, totalTaxPayable: 0, tdsSalary: 0,
  tdsBankAndFinancial: 0, tdsContractAndSupplies: 0,
  tdsRentAndOther: 0, totalTDS: 0, advanceTaxPaid: 0, taxPaidWithReturn: 0,
  challanNumber: '', challanDate: '', bankName: '',
  totalTaxPaidAndCredited: 0, netPayableOrRefundable: 0,
};
