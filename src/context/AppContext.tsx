import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Language,
  AssessmentYear,
  UserProfile,
  AssessmentData,
  IncomeState,
  RebateState,
  ExpenditureState,
  AssetsLiabilitiesState,
  TaxPaymentState,
  SubmissionState,
  ChallanRecord,
  CertificateStatusRecord,
  ReturnHistoryRecord,
  AuditedBusiness,
} from '../types';
import { translations } from '../i18n/translations';
import { EMPTY_PROFILE, EMPTY_ASSESSMENT, EMPTY_INCOME, EMPTY_REBATE, EMPTY_EXPENDITURE, EMPTY_ASSETS_LIABILITIES, EMPTY_TAX_PAYMENT } from '../data/emptyData';
import {
  INITIAL_USER_PROFILE,
  INITIAL_ASSESSMENT,
  INITIAL_INCOME,
  INITIAL_REBATE,
  INITIAL_EXPENDITURE,
  INITIAL_ASSETS_LIABILITIES,
  INITIAL_TAX_PAYMENT,
  INITIAL_CHALLANS,
  INITIAL_CERTIFICATE_STATUS,
  INITIAL_RETURN_HISTORY,
  INITIAL_AUDITED_BUSINESSES,
} from '../data/mockData';
import {
  aggregateIncomeHeads,
  computeRebateAdapter,
  aggregateExpenditure,
  computeAssetsLiabilitiesReconciliation,
} from '../adapters/calculationAdapter';

interface ConfirmModalConfig {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof typeof translations.en) => string;
  assessmentYear: AssessmentYear;
  setAssessmentYear: (ay: AssessmentYear) => void;
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  assessment: AssessmentData;
  setAssessment: React.Dispatch<React.SetStateAction<AssessmentData>>;
  income: IncomeState;
  setIncome: React.Dispatch<React.SetStateAction<IncomeState>>;
  rebate: RebateState;
  setRebate: React.Dispatch<React.SetStateAction<RebateState>>;
  expenditure: ExpenditureState;
  setExpenditure: React.Dispatch<React.SetStateAction<ExpenditureState>>;
  assetsLiabilities: AssetsLiabilitiesState;
  setAssetsLiabilities: React.Dispatch<React.SetStateAction<AssetsLiabilitiesState>>;
  taxPayment: TaxPaymentState;
  setTaxPayment: React.Dispatch<React.SetStateAction<TaxPaymentState>>;
  submission: SubmissionState;
  setSubmission: React.Dispatch<React.SetStateAction<SubmissionState>>;
  auditedBusinesses: AuditedBusiness[];
  setAuditedBusinesses: React.Dispatch<React.SetStateAction<AuditedBusiness[]>>;
  challans: ChallanRecord[];
  setChallans: React.Dispatch<React.SetStateAction<ChallanRecord[]>>;
  certStatusRecords: CertificateStatusRecord[];
  returnHistory: ReturnHistoryRecord[];
  confirmModal: ConfirmModalConfig;
  askConfirmation: (config: Omit<ConfirmModalConfig, 'isOpen'>) => void;
  closeConfirmation: () => void;
  isGapModalOpen: boolean;
  setIsGapModalOpen: (open: boolean) => void;
  resetToBlank: () => void;
  loadDemoFixture: () => void;
  exportDraftJson: () => void;
  importDraftJson: (jsonString: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [assessmentYear, setAssessmentYear] = useState<AssessmentYear>('2026-2027');
  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE);
  const [assessment, setAssessment] = useState<AssessmentData>(EMPTY_ASSESSMENT);
  const [income, setIncome] = useState<IncomeState>(EMPTY_INCOME);
  const [rebate, setRebate] = useState<RebateState>(EMPTY_REBATE);
  const [expenditure, setExpenditure] = useState<ExpenditureState>(EMPTY_EXPENDITURE);
  const [assetsLiabilities, setAssetsLiabilities] = useState<AssetsLiabilitiesState>(EMPTY_ASSETS_LIABILITIES);
  const [taxPayment, setTaxPayment] = useState<TaxPaymentState>(EMPTY_TAX_PAYMENT);
  const [submission, setSubmission] = useState<SubmissionState>({
    declarationAccepted: false,
    taxpayerNameAffirmed: '',
    designationOrCapacity: 'Individual Self',
    dateAffirmed: '',
    placeAffirmed: '',
    isSubmittedLocally: false,
    localSubmissionId: '',
    localSubmissionTimestamp: '',
  });
  const [auditedBusinesses, setAuditedBusinesses] = useState<AuditedBusiness[]>([]);
  const [challans, setChallans] = useState<ChallanRecord[]>([]);
  const [certStatusRecords, setCertStatusRecords] = useState<CertificateStatusRecord[]>([]);
  const [returnHistory, setReturnHistory] = useState<ReturnHistoryRecord[]>([]);

  const [confirmModal, setConfirmModal] = useState<ConfirmModalConfig>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [isGapModalOpen, setIsGapModalOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'bn' : 'en'));
  };

  const t = (key: keyof typeof translations.en): string => {
    const langDict = translations[language];
    return (langDict && langDict[key]) || translations.en[key] || String(key);
  };

  const askConfirmation = (config: Omit<ConfirmModalConfig, 'isOpen'>) => {
    setConfirmModal({
      ...config,
      isOpen: true,
    });
  };

  const closeConfirmation = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Keep derived pure arithmetic calculated across steps
  useEffect(() => {
    const incAgg = aggregateIncomeHeads(income);
    const expTotal = aggregateExpenditure(expenditure);
    const rebateCalc = computeRebateAdapter(rebate, incAgg.totalTaxableIncome);

    // Statutory calculation unavailable: never derive official liabilities from
    // hardcoded slab, rebate, residency, location or minimum-tax assumptions.
    // A displayed numeric zero must never be interpreted as a legal tax result.
    // Withholding sum
    const totalTDS =
      (taxPayment.tdsSalary || 0) +
      (taxPayment.tdsBankAndFinancial || 0) +
      (taxPayment.tdsContractAndSupplies || 0) +
      (taxPayment.tdsRentAndOther || 0);

    const totalPaid = totalTDS + (taxPayment.advanceTaxPaid || 0) + (taxPayment.taxPaidWithReturn || 0);

    // Update TaxPayment
    setTaxPayment((prev) => ({
      ...prev,
      taxableIncome: incAgg.totalTaxableIncome,
      grossTaxCalculated: 0,
      taxRebateDeducted: 0,
      netTaxLiability: 0,
      minimumTaxRateApplied: 0,
      totalTaxPayable: 0,
      totalTDS,
      totalTaxPaidAndCredited: totalPaid,
      netPayableOrRefundable: 0,
    }));

    // Update Expenditure Total
    setExpenditure((prev) => ({
      ...prev,
      totalExpenditure: expTotal,
    }));

    // Update Rebate Total
    setRebate((prev) => ({
      ...prev,
      totalInvestment: rebateCalc.totalEligibleInvestment,
      estimatedRebateAmount: 0,
    }));

    // Update Assets & Liabilities reconciliation
    const recon = computeAssetsLiabilitiesReconciliation(
      assetsLiabilities,
      incAgg.totalTaxableIncome,
      incAgg.taxExemptTotal,
      expTotal
    );

    setAssetsLiabilities((prev) => ({
      ...prev,
      totalAssets: recon.totalAssets,
      totalLiabilities: recon.totalLiabilities,
      netWealthCurrentYear: recon.netWealthCurrentYear,
      changeInNetWealth: recon.changeInNetWealth,
      incomeShownInReturn: incAgg.totalTaxableIncome,
      taxExemptedIncomeTotal: incAgg.taxExemptTotal,
      totalSourceOfFunds: recon.totalSourceOfFunds,
      outflowExpenditure: expTotal,
      totalUsesOfFunds: recon.totalUsesOfFunds,
      reconciliationDifference: recon.reconciliationDifference,
    }));
  }, [income, rebate.entries, expenditure.personalAndFood, expenditure.housingRentAndMaintenance, expenditure.autoAndTransport, expenditure.utilityBills, expenditure.educationExpenses, expenditure.eventsAndHospitality, expenditure.foreignTravel, expenditure.donationsAndGiftsNonRebate, expenditure.otherLivingExpenses, assetsLiabilities.nonAgriculturalProperty, assetsLiabilities.agriculturalProperty, assetsLiabilities.financialAssetsValue, assetsLiabilities.motorVehicles, assetsLiabilities.goldAndJewelry, assetsLiabilities.furnitureAndElectronics, assetsLiabilities.otherAssets, assetsLiabilities.mortgagesOnProperty, assetsLiabilities.bankLoans, assetsLiabilities.unsecuredLoans, assetsLiabilities.otherDebts, assetsLiabilities.netWealthPreviousYear, assetsLiabilities.otherReceiptsAndGifts, taxPayment.tdsSalary, taxPayment.tdsBankAndFinancial, taxPayment.tdsContractAndSupplies, taxPayment.tdsRentAndOther, taxPayment.advanceTaxPaid, taxPayment.taxPaidWithReturn, assessment.residentStatus]);

  const resetToBlank = () => {
    setProfile(EMPTY_PROFILE);
    setAssessment({ ...EMPTY_ASSESSMENT, assessmentYear });
    setIncome(EMPTY_INCOME);
    setRebate(EMPTY_REBATE);
    setExpenditure(EMPTY_EXPENDITURE);
    setAssetsLiabilities(EMPTY_ASSETS_LIABILITIES);
    setTaxPayment(EMPTY_TAX_PAYMENT);
    setAuditedBusinesses([]);
    setChallans([]);
    setCertStatusRecords([]);
    setReturnHistory([]);
    setSubmission({
      declarationAccepted: false, taxpayerNameAffirmed: '',
      designationOrCapacity: 'Individual Self', dateAffirmed: '',
      placeAffirmed: '', isSubmittedLocally: false,
      localSubmissionId: '', localSubmissionTimestamp: '',
    });
  };

  const loadDemoFixture = () => {
    setProfile(INITIAL_USER_PROFILE);
    setAssessment(INITIAL_ASSESSMENT);
    setIncome(INITIAL_INCOME);
    setRebate(INITIAL_REBATE);
    setExpenditure(INITIAL_EXPENDITURE);
    setAssetsLiabilities(INITIAL_ASSETS_LIABILITIES);
    setTaxPayment(INITIAL_TAX_PAYMENT);
    setAuditedBusinesses(INITIAL_AUDITED_BUSINESSES);
    setChallans(INITIAL_CHALLANS);
    setCertStatusRecords(INITIAL_CERTIFICATE_STATUS);
    setReturnHistory(INITIAL_RETURN_HISTORY);
  };

  const exportDraftJson = () => {
    const draftPayload = {
      version: 'NBR-ERETURN-2026-V1',
      exportedAt: new Date().toISOString(),
      profile,
      assessment,
      income,
      rebate,
      expenditure,
      assetsLiabilities,
      taxPayment,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(draftPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `eReturn_Draft_${profile.tin}_${assessment.assessmentYear}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importDraftJson = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.assessment && data.income) {
        if (data.profile) setProfile(data.profile);
        if (data.assessment) setAssessment(data.assessment);
        if (data.income) setIncome(data.income);
        if (data.rebate) setRebate(data.rebate);
        if (data.expenditure) setExpenditure(data.expenditure);
        if (data.assetsLiabilities) setAssetsLiabilities(data.assetsLiabilities);
        if (data.taxPayment) setTaxPayment(data.taxPayment);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Invalid draft JSON import', e);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        assessmentYear,
        setAssessmentYear,
        profile,
        setProfile,
        assessment,
        setAssessment,
        income,
        setIncome,
        rebate,
        setRebate,
        expenditure,
        setExpenditure,
        assetsLiabilities,
        setAssetsLiabilities,
        taxPayment,
        setTaxPayment,
        submission,
        setSubmission,
        auditedBusinesses,
        setAuditedBusinesses,
        challans,
        setChallans,
        certStatusRecords,
        returnHistory,
        confirmModal,
        askConfirmation,
        closeConfirmation,
        isGapModalOpen,
        setIsGapModalOpen,
        resetToBlank,
        loadDemoFixture,
        exportDraftJson,
        importDraftJson,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
