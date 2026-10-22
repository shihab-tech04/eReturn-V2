import type {
  UserProfile, AssessmentData, IncomeState, RebateState, ExpenditureState,
  AssetsLiabilitiesState, TaxPaymentState,
} from '../../types';

/** Checks whether the current in-memory workspace contains taxpayer-entered facts.
 * This is not proof of a persisted draft or a submitted return.
 */
export function hasReturnDraft(data: {
  profile: UserProfile;
  assessment: AssessmentData;
  income: IncomeState;
  rebate: RebateState;
  expenditure: ExpenditureState;
  assetsLiabilities: AssetsLiabilitiesState;
  taxPayment: TaxPaymentState;
}) {
  const { profile, assessment, income, rebate, expenditure, assetsLiabilities, taxPayment } = data;
  return Boolean(
    profile.name.trim() || profile.nameBn.trim() || profile.tin.trim()
    || assessment.residentStatus || assessment.voluntaryDisclosure
    || Object.values(assessment.heads).some(Boolean)
    || Object.values(assessment.additionalCategories).some(Boolean)
    || Object.values(income).some(v => Array.isArray(v) && v.length > 0)
    || rebate.entries.length
    || Object.entries(expenditure).some(([k, v]) => k !== 'totalExpenditure' && Number(v) !== 0)
    || [
      assetsLiabilities.businessCapital, assetsLiabilities.nonAgriculturalProperty,
      assetsLiabilities.agriculturalProperty, assetsLiabilities.financialAssetsValue,
      assetsLiabilities.motorVehicles, assetsLiabilities.goldAndJewelry,
      assetsLiabilities.furnitureAndElectronics, assetsLiabilities.bankLoans,
      assetsLiabilities.mortgagesOnProperty, assetsLiabilities.otherDebts,
      assetsLiabilities.otherReceiptsAndGifts,
    ].some(Number)
    || [
      taxPayment.tdsSalary, taxPayment.tdsBankAndFinancial,
      taxPayment.tdsContractAndSupplies, taxPayment.tdsRentAndOther,
      taxPayment.advanceTaxPaid, taxPayment.taxPaidWithReturn,
    ].some(Number) || taxPayment.challanNumber.trim()
  );
}
