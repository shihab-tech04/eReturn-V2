export type Language = 'en' | 'bn';

export type AssessmentYear = '2026-2027' | '2025-2026' | '2024-2025';

export type ReturnScheme = 'Universal Self' | 'Normal';

export type ResidentStatus = 'Resident' | 'Non-Resident';

export interface AssessmentData {
  returnScheme: ReturnScheme;
  assessmentYear: AssessmentYear;
  incomeYearFrom: string;
  incomeYearTo: string;
  residentStatus: ResidentStatus;
  hasTaxExemptedIncome: boolean;
  hasTaxableIncome: boolean;
  // Heads of income selected:
  heads: {
    employment: boolean;
    rent: boolean;
    agriculture: boolean;
    business: boolean;
    capitalGain: boolean;
    financialAssets: boolean;
    otherSources: boolean;
  };
  // Additional income categories:
  additionalCategories: {
    firmPartner: boolean;
    aopMember: boolean;
    foreignIncome: boolean;
    spouseOrMinor: boolean;
  };
  // Voluntary disclosure:
  voluntaryDisclosure: boolean;
}

// 1. Employment
export interface EmploymentEntry {
  id: string;
  employmentType: 'Govt iBAS++' | 'Govt Non-iBAS++' | 'Private / Other' | 'Autonomous / Semi-Govt / Corporation' | 'Salary Subject to Reduced Tax Rate';
  employerName: string;
  designation: string;
  basicPay: number;
  houseRentAllowance: number;
  medicalAllowance: number;
  conveyanceAllowance: number;
  festivalBonus: number;
  otherAllowances: number;
  totalIncome: number;
  exemptedAmount: number;
  netTaxableIncome: number;
}

// 2. Financial Assets
export type FinancialAssetType =
  | 'Interest / Profit on Savings Certificates (Sanchayapatra)'
  | 'Profit / Dividend from Stock / Shares / Mutual Funds'
  | 'Interest from Bank Fixed Deposit (FDR) / Term Deposit'
  | 'Interest from Savings Bank Account / Special Deposit'
  | 'Profit from Islamic Banking / Mudaraba Deposit'
  | 'Interest on Debentures / Bonds / Securities'
  | 'Other Financial Assets';

export interface FinancialAssetEntry {
  id: string;
  assetType: FinancialAssetType;
  institutionName: string;
  accountOrCertificateNo: string;
  grossAmount: number;
  taxDeductedAtSource: number;
  exemptedAmount: number;
  netTaxableAmount: number;
}

// 3. Rent
export type RentPropertyType =
  | 'Residential Apartment / House'
  | 'Commercial Building'
  | 'Land'
  | 'Factory / Industrial Building'
  | 'Business Premises'
  | 'Furniture / Fixtures'
  | 'Machinery / Equipment'
  | 'Personal Vehicle'
  | 'Other Capital Asset';

export interface RentPropertyEntry {
  id: string;
  propertyType: RentPropertyType;
  propertyAddress: string;
  ownershipSharePercentage: number;
  annualRentReceived: number;
  advanceRentReceived: number;
  municipalTaxPaid: number;
  landRevenuePaid: number;
  interestOnLoanPaid: number;
  insurancePremiumPaid: number;
  repairAllowanceRate: number; // e.g. 25% or 30%
  repairAllowanceAmount: number;
  vacancyAllowance: number;
  otherAllowableDeductions: number;
  totalDeductions: number;
  netRentalIncome: number;
}

// 4. Agriculture
export type AgricultureType =
  | 'Production of Crops & Grains'
  | 'Tea & Rubber Estate'
  | 'Fisheries & Aquaculture'
  | 'Livestock, Poultry & Dairy'
  | 'Other Agricultural Income';

export interface AgricultureEntry {
  id: string;
  type: AgricultureType;
  landDescription: string;
  grossSaleProceeds: number;
  costOfProduction: number; // 60% standard or actual if accounts kept
  statutoryExemptionClaimed: number;
  netAgriculturalIncome: number;
}

// 5. Business or Profession
export type BusinessCategory =
  | 'Retail Trading'
  | 'Wholesale Trading'
  | 'Manufacturing'
  | 'Service & Consultancy'
  | 'Medical & Health Services'
  | 'Legal & Accounting Practice'
  | 'Information Technology & Software'
  | 'Engineering & Construction'
  | 'Transport & Logistics'
  | 'Export / Import Business'
  | 'Other Business / Trade';

export interface BusinessEntry {
  id: string;
  category: BusinessCategory;
  businessName: string;
  businessAddress: string;
  tradeLicenseNumber: string;
  totalSalesOrTurnover: number;
  grossProfit: number;
  generalExpenses: number;
  badDebtsWrittenOff: number;
  depreciationAllowance: number;
  netProfit: number;
}

// 6. Capital Gains
export type CapitalGainType =
  | 'Sale of Land & Real Estate'
  | 'Sale of Building / Apartment'
  | 'Transfer of Listed Shares / Securities'
  | 'Transfer of Unlisted Shares'
  | 'Sale of Machinery & Plant'
  | 'Sale of Motor Vehicles'
  | 'Gold, Precious Metals & Jewelry'
  | 'Intellectual Property / Patents'
  | 'Mutual Fund Units'
  | 'Partnership Interest Liquidation'
  | 'Compensation on Acquired Assets'
  | 'Sale of Agricultural Land (Urban)'
  | 'Other Capital Assets';

export interface CapitalGainEntry {
  id: string;
  gainType: CapitalGainType;
  assetDescription: string;
  dateOfAcquisition: string;
  dateOfDisposal: string;
  fullValueConsideration: number;
  costOfAcquisition: number;
  expenditureIncurredOnTransfer: number;
  exemptedOrReinvestedAmount: number;
  netCapitalGain: number;
}

// 7. Other Sources
export type OtherIncomeType =
  | 'Cash Dividend'
  | 'Royalties & License Fees'
  | 'Lottery / Prize Bond / Game Winnings'
  | 'Deemed Income under Tax Law'
  | 'Director\'s Fees & Remuneration'
  | 'Commission & Brokerage'
  | 'Rental of Equipment / Chattels'
  | 'Honorarium & Lecture Fees'
  | 'Agricultural Income not assessed as Agriculture Head'
  | 'Casual / Non-recurring Receipts'
  | 'Miscellaneous Receipts';

export interface OtherIncomeEntry {
  id: string;
  incomeType: OtherIncomeType;
  payerName: string;
  grossAmount: number;
  allowableDeduction: number;
  netAmount: number;
}

// 8. Firm Income
export interface FirmEntry {
  id: string;
  firmName: string;
  firmTIN: string;
  sharePercentage: number;
  shareOfProfit: number;
  salaryFromFirm: number;
  interestOnCapital: number;
  totalIncomeFromFirm: number;
}

// 9. Association of Persons (AoP)
export interface AopEntry {
  id: string;
  aopName: string;
  aopRegistrationOrTIN: string;
  sharePercentage: number;
  distributedShareOfIncome: number;
}

// 10. Foreign Income
export interface ForeignIncomeEntry {
  id: string;
  country: string;
  natureOfIncome: string;
  amountForeignCurrency: number;
  exchangeRate: number;
  amountInBDT: number;
  taxPaidAbroadBDT: number;
  creditClaimed: number;
}

// 11. Spouse or Minor Children
export interface SpouseMinorIncomeEntry {
  id: string;
  relationship: 'Spouse' | 'Daughter' | 'Son';
  name: string;
  nidOrBirthCert: string;
  natureOfIncome: string;
  grossIncome: number;
  exemptedAmount: number;
  netIncome: number;
}

// 12. Tax Exempted Income
export type TaxExemptionType =
  | 'Agricultural Income Exemption (statutory limit)'
  | 'Information Technology Enabled Services (ITES) Exemption'
  | 'Remittance / Foreign Inward Remittance Exemption'
  | 'Gratuity / Pension from Government / Recognized Fund'
  | 'Dividend Exemption up to statutory limit'
  | 'Income of Charitable / Religious Institutions'
  | 'Wage Earners\' Inward Remittance'
  | 'Software Development & Cloud Services'
  | 'Export of Handicrafts Exemption'
  | 'Income from Poultry / Fishery Exemption'
  | 'Other Statutory Exemptions (Sixth Schedule)';

export interface TaxExemptedEntry {
  id: string;
  exemptionType: TaxExemptionType;
  particulars: string;
  amount: number;
  statutoryReference: string;
}

// 13. Voluntary Disclosure
export interface VoluntaryDisclosureEntry {
  id: string;
  incomeHead: string;
  particulars: string;
  assessmentYearOfEarning: string;
  declaredAmount: number;
  applicableTaxRatePercentage: number;
  taxPayable: number;
}

export interface IncomeState {
  employmentEntries: EmploymentEntry[];
  financialAssetEntries: FinancialAssetEntry[];
  rentEntries: RentPropertyEntry[];
  agricultureEntries: AgricultureEntry[];
  businessEntries: BusinessEntry[];
  capitalGainEntries: CapitalGainEntry[];
  otherIncomeEntries: OtherIncomeEntry[];
  firmEntries: FirmEntry[];
  aopEntries: AopEntry[];
  foreignIncomeEntries: ForeignIncomeEntry[];
  spouseMinorEntries: SpouseMinorIncomeEntry[];
  taxExemptedEntries: TaxExemptedEntry[];
  voluntaryDisclosureEntries: VoluntaryDisclosureEntry[];
  voluntaryDisclosureAffirmed: boolean;
}

// Rebate 12 categories
export type RebateCategory =
  | 'Life Insurance Premium'
  | 'Contribution to Provident Fund (GPF / RPF)'
  | 'Contribution to Superannuation Fund'
  | 'Investment in Approved Govt Securities / Treasury Bonds'
  | 'Investment in Approved Stocks / Shares / Debentures'
  | 'Deposit Pension Scheme (DPS) within statutory monthly limit'
  | 'Contribution to Benevolent Fund & Group Insurance Scheme'
  | 'Donation to National Welfare / Relief Funds'
  | 'Donation to Philanthropic Institutions / Hospitals'
  | 'Donation to Zakat Fund Management Board'
  | 'Investment in Bangladesh Infrastructure Finance Fund'
  | 'Other Approved Investment / Savings Schemes';

export interface RebateEntry {
  id: string;
  category: RebateCategory;
  institutionOrPolicyName: string;
  referenceNo: string;
  investmentAmount: number;
  statutoryEligibilityChecked: boolean;
  allowableAmount: number;
}

export interface RebateState {
  entries: RebateEntry[];
  totalInvestment: number;
  statutoryRebateCeilingRule: string; // "R-002: Pending certified rules engine calculation"
  estimatedRebateAmount: number;
}

// Expenditure
export interface ExpenditureState {
  personalAndFood: number;
  housingRentAndMaintenance: number;
  autoAndTransport: number;
  utilityBills: number; // electricity, gas, water, internet
  educationExpenses: number;
  eventsAndHospitality: number; // festival, party, etc.
  foreignTravel: number;
  donationsAndGiftsNonRebate: number;
  otherLivingExpenses: number;
  totalExpenditure: number;
}

// Assets & Liabilities (IT-10B)
export interface AssetsLiabilitiesState {
  // Assets
  businessCapital: number;
  directorsShareholdings: number;
  nonAgriculturalProperty: number;
  agriculturalProperty: number;
  financialAssetsValue: number; // FDR, shares, loans given, bank balances
  motorVehicles: number;
  goldAndJewelry: number;
  furnitureAndElectronics: number;
  otherAssets: number;
  totalAssets: number;

  // Liabilities
  mortgagesOnProperty: number;
  bankLoans: number;
  unsecuredLoans: number;
  otherDebts: number;
  totalLiabilities: number;

  // Net Wealth
  netWealthCurrentYear: number;
  netWealthPreviousYear: number;
  changeInNetWealth: number;

  // Sources of funds
  incomeShownInReturn: number;
  taxExemptedIncomeTotal: number;
  otherReceiptsAndGifts: number;
  totalSourceOfFunds: number;

  // Uses of funds
  outflowExpenditure: number;
  totalUsesOfFunds: number;

  // Reconciliation difference
  reconciliationDifference: number;
}

// Tax & Payment
export interface TaxPaymentState {
  taxableIncome: number;
  grossTaxCalculated: number;
  taxRebateDeducted: number;
  netTaxLiability: number;
  minimumTaxRateApplied: number;
  surchargeAmount: number;
  delayInterestOrPenalty: number;
  totalTaxPayable: number;
  // Deductions at source
  tdsSalary: number;
  tdsBankAndFinancial: number;
  tdsContractAndSupplies: number;
  tdsRentAndOther: number;
  totalTDS: number;
  // Advance Tax
  advanceTaxPaid: number;
  // Tax Paid with Return
  taxPaidWithReturn: number;
  challanNumber: string;
  challanDate: string;
  bankName: string;
  totalTaxPaidAndCredited: number;
  netPayableOrRefundable: number; // Positive = payable, Negative = refund
}

// Submission state
export interface SubmissionState {
  declarationAccepted: boolean;
  taxpayerNameAffirmed: string;
  designationOrCapacity: string;
  dateAffirmed: string;
  placeAffirmed: string;
  isSubmittedLocally: boolean;
  localSubmissionId: string;
  localSubmissionTimestamp: string;
}

// Corporate Audited Accounts
export interface AccountNote {
  id: string;
  noteNumber: string;
  title: string;
  level: 1 | 2 | 3;
  parentId?: string;
  currentYearAmount: number;
  previousYearAmount: number;
  description: string;
}

export interface AuditedBusiness {
  id: string;
  businessName: string;
  businessType: 'Trading' | 'Service' | 'Bank and Finance' | 'Insurance' | 'Manufacturing and Trading';
  registrationNo: string;
  auditorFirmName: string;
  auditYear: string;
  turnoverCurrent: number;
  turnoverPrevious: number;
  grossProfitCurrent: number;
  grossProfitPrevious: number;
  netProfitCurrent: number;
  netProfitPrevious: number;
  totalAssetsCurrent: number;
  totalAssetsPrevious: number;
  totalLiabilitiesCurrent: number;
  totalLiabilitiesPrevious: number;
  notes: AccountNote[];
}

export interface UserProfile {
  name: string;
  nameBn: string;
  tin: string;
  nid: string;
  fatherName: string;
  motherName: string;
  spouseName: string;
  spouseTin: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Third Gender';
  mobile: string;
  email: string;
  currentAddress: string;
  permanentAddress: string;
  taxesZone: string;
  taxesCircle: string;
  status: 'Individual';
}

export interface ChallanRecord {
  sl: number;
  challanNo: string;
  challanDate: string;
  section: string;
  taxesZone: string;
  taxesCircle: string;
  bankName: string;
  branchName: string;
  challanAmount: number;
}

export interface CertificateStatusRecord {
  tinNo: string;
  assessmentYear: string;
  submissionDate: string;
  submissionSection: string;
  returnRegisterSerial: string;
  zoneName: string;
  circleName: string;
  totalIncome: number;
  netWealth: number;
  totalTaxPaid: number;
  requestType: string;
  requestStatus: 'Approved' | 'Pending' | 'Rejected';
  rejectReason: string;
}

export interface ReturnHistoryRecord {
  assessmentYear: string;
  returnScheme: string;
  submissionDate: string;
  serialNumber: string;
  totalIncome: number;
  taxPaid: number;
  status: 'Filed' | 'Revised' | 'Processed';
}

// Workstream B Gap Register item
export interface GapItem {
  id: string;
  code: string;
  title: string;
  category: string;
  status: 'MATCH' | 'CONFLICT' | 'NOT VERIFIED' | 'PARTIAL' | 'MISSING';
  referenceObservation: string;
  frontendResolution: string;
}
