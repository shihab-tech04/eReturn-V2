import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { TaxpayerLayout } from './layouts/TaxpayerLayout';

import { HomeDashboard } from './features/home/HomeDashboard';
import { AssessmentPage } from './features/assessment/AssessmentPage';
import { IncomeHubPage } from './features/income/IncomeHubPage';
import { EmploymentPage } from './features/income/EmploymentPage';
import { FinancialAssetsPage } from './features/income/FinancialAssetsPage';
import { RentPage } from './features/income/RentPage';
import { AgriculturePage } from './features/income/AgriculturePage';
import { BusinessPage } from './features/income/BusinessPage';
import { CapitalGainsPage } from './features/income/CapitalGainsPage';
import { OtherSourcesPage } from './features/income/OtherSourcesPage';
import { FirmPage } from './features/income/FirmPage';
import { AopPage } from './features/income/AopPage';
import { ForeignIncomePage } from './features/income/ForeignIncomePage';
import { SpouseIncomePage } from './features/income/SpouseIncomePage';
import { TaxExemptedPage } from './features/income/TaxExemptedPage';
import { VoluntaryDisclosurePage } from './features/income/VoluntaryDisclosurePage';

import { RebatePage } from './features/rebate/RebatePage';
import { ExpenditurePage } from './features/expenditure/ExpenditurePage';
import { AssetsLiabilitiesPage } from './features/assets-liabilities/AssetsLiabilitiesPage';
import { TaxPaymentPage } from './features/tax-payment/TaxPaymentPage';
import { ReturnViewPage } from './features/return-view/ReturnViewPage';
import { SubmissionPage } from './features/submission/SubmissionPage';

import { TinCertificatePage } from './features/tax-record/TinCertificatePage';
import { AcknowledgementPage } from './features/tax-record/AcknowledgementPage';
import { ChallanHistoryPage } from './features/tax-record/ChallanHistoryPage';
import { CertificateRequestPage } from './features/tax-record/CertificateRequestPage';
import { CertificateStatusPage } from './features/tax-record/CertificateStatusPage';
import { ReturnHistoryPage } from './features/tax-record/ReturnHistoryPage';

import { RevisedReturnPage } from './features/revised-return/RevisedReturnPage';
import { AuditedAccountsPage } from './features/audited-accounts/AuditedAccountsPage';
import { ProfilePage } from './features/profile/ProfilePage';
import { ChangePasswordPage } from './features/profile/ChangePasswordPage';

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/user-panel/home" replace />} />
          <Route path="/user-panel" element={<TaxpayerLayout />}>
            <Route index element={<Navigate to="/user-panel/home" replace />} />
            <Route path="home" element={<HomeDashboard />} />
            
            {/* 7-Stage Return Preparation */}
            <Route path="assessment" element={<AssessmentPage />} />
            <Route path="income" element={<IncomeHubPage />} />
            <Route path="employment" element={<EmploymentPage />} />
            <Route path="financial-assets" element={<FinancialAssetsPage />} />
            <Route path="rent" element={<RentPage />} />
            <Route path="agriculture" element={<AgriculturePage />} />
            <Route path="business" element={<BusinessPage />} />
            <Route path="capital-gain" element={<CapitalGainsPage />} />
            <Route path="income-from-other-sources" element={<OtherSourcesPage />} />
            <Route path="firm-etc" element={<FirmPage />} />
            <Route path="aop" element={<AopPage />} />
            <Route path="foreign-income" element={<ForeignIncomePage />} />
            <Route path="spouse-income" element={<SpouseIncomePage />} />
            <Route path="tax-exempted-income" element={<TaxExemptedPage />} />
            <Route path="voluntary-disclosure-income" element={<VoluntaryDisclosurePage />} />

            <Route path="rebate" element={<RebatePage />} />
            <Route path="expenditure" element={<ExpenditurePage />} />
            <Route path="assets-liabilities" element={<AssetsLiabilitiesPage />} />
            <Route path="tax-payment" element={<TaxPaymentPage />} />
            <Route path="return-view" element={<ReturnViewPage />} />
            <Route path="submission" element={<SubmissionPage />} />

            {/* Tax Records */}
            <Route path="tin-certificate" element={<TinCertificatePage />} />
            <Route path="acknowledgement" element={<AcknowledgementPage />} />
            <Route path="challan-history" element={<ChallanHistoryPage />} />
            <Route path="certificate-request" element={<CertificateRequestPage />} />
            <Route path="certificate-status" element={<CertificateStatusPage />} />
            <Route path="return-history" element={<ReturnHistoryPage />} />
            <Route path="return-records" element={<ReturnHistoryPage />} />

            {/* Special Services */}
            <Route path="revised-return" element={<RevisedReturnPage />} />
            <Route path="audited-accounts" element={<AuditedAccountsPage />} />

            {/* Profile & Account */}
            <Route path="profile" element={<ProfilePage />} />
            <Route path="change-password" element={<ChangePasswordPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/user-panel/home" replace />} />
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}
