import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { GapRegisterModal } from '../components/common/GapRegisterModal';
import { TaxpayerNavigation, isReturnDetailPath, isTaxRecordPath } from '../components/layout/TaxpayerNavigation';
import { useApp } from '../context/AppContext';
import '../components/layout/taxpayer-shell.css';
import '../styles/sobaike-public-parity.css';

export const TaxpayerLayout: React.FC = () => {
  const { language } = useApp();
  const pathname = useLocation().pathname;
  const wide = pathname === '/user-panel/return-workspace';
  const isLanding = pathname === '/user-panel/home' || wide || pathname === '/user-panel/tax-records';
  const returnDetail = isReturnDetailPath(pathname);
  const recordDetail = isTaxRecordPath(pathname);

  return <div className="er-app-shell">
    <TaxpayerNavigation />
    <div className="er-main-region">
      <main id="er-main" className={'er-main-content' + (wide ? ' er-main-content--wide' : '')}>
        {!isLanding && <Link className="er-back-link" to={returnDetail ? '/user-panel/return-workspace' : recordDetail ? '/user-panel/tax-records' : '/user-panel/home'}>
          {language === 'bn' ? '← ফিরে যান' : '← Back to ' + (returnDetail ? 'My Tax Return' : recordDetail ? 'Tax Records' : 'Dashboard')}
        </Link>}
        <Outlet />
      </main>
      <footer className="er-shell-footer">
        <div className="er-shell-footer-inner">
          <p>{language === 'bn' ? 'eReturn V2 · করদাতার ওয়ার্কস্পেস' : 'eReturn V2 · Taxpayer Workspace'}</p>
          <p>{language === 'bn' ? 'আইনগত কর হিসাব প্রত্যয়ন সাপেক্ষ · অনলাইনে দাখিল বন্ধ' : 'Statutory calculation not certified · Online filing unavailable'}</p>
        </div>
      </footer>
    </div>
    <ConfirmationModal />
    <GapRegisterModal />
  </div>;
};
