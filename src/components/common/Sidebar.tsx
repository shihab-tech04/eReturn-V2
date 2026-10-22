import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Home,
  FileText,
  DollarSign,
  TrendingDown,
  ShoppingBag,
  Building,
  CreditCard,
  Eye,
  Send,
  Award,
  Receipt,
  FileCheck2,
  History,
  FilePlus2,
  FileClock,
  Layers,
  RotateCcw,
  Briefcase,
  UserCheck,
  Lock,
  X,
} from 'lucide-react';

export const Sidebar: React.FC<{mobileOpen?: boolean; onClose?: () => void}> = ({mobileOpen=false, onClose}) => {
  const { t, income, rebate, assetsLiabilities } = useApp();
  const location = useLocation();

  const isIncomeActive =
    location.pathname.startsWith('/user-panel/income') ||
    location.pathname.startsWith('/user-panel/employment') ||
    location.pathname.startsWith('/user-panel/financial-assets') ||
    location.pathname.startsWith('/user-panel/rent') ||
    location.pathname.startsWith('/user-panel/agriculture') ||
    location.pathname.startsWith('/user-panel/business') ||
    location.pathname.startsWith('/user-panel/capital-gain') ||
    location.pathname.startsWith('/user-panel/income-from-other-sources') ||
    location.pathname.startsWith('/user-panel/firm-etc') ||
    location.pathname.startsWith('/user-panel/aop') ||
    location.pathname.startsWith('/user-panel/foreign-income') ||
    location.pathname.startsWith('/user-panel/spouse-income') ||
    location.pathname.startsWith('/user-panel/tax-exempted-income') ||
    location.pathname.startsWith('/user-panel/voluntary-disclosure-income');

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
      isActive
        ? 'bg-emerald-700 text-white font-semibold shadow-xs'
        : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-900'
    }`;

  return (
    <aside id="mobile-taxpayer-nav" aria-label={t("menuReturnPreparation")}
      className={(mobileOpen ? "fixed z-[60] inset-y-0 left-0 flex shadow-2xl " : "hidden ") +
        "w-64 max-w-[85vw] bg-white border-r border-gray-200 flex-col shrink-0 h-screen lg:h-auto lg:min-h-[calc(100vh-4rem)] lg:static lg:z-auto lg:flex lg:shadow-none"}
      onClickCapture={(event) => { if ((event.target as HTMLElement).closest("a")) onClose?.(); }}>
      <div className="flex lg:hidden items-center justify-between border-b border-gray-200 px-3 py-2.5">
        <span className="text-xs font-semibold text-gray-700">{t("menuReturnPreparation")}</span>
        <button type="button" onClick={onClose} aria-label="Close menu" className="h-10 w-10 flex items-center justify-center rounded-md text-gray-700 hover:bg-gray-100"><X size={19}/></button>
      </div>
      <div className="p-3 space-y-5 overflow-y-auto flex-1 min-h-0 lg:max-h-[calc(100vh-4rem)] scrollbar-thin">
        {/* Home */}
        <div>
          <NavLink to="/user-panel/home" className={navClass}>
            <Home className="w-4 h-4 text-emerald-600" />
            <span>{t('navHome')}</span>
          </NavLink>
        </div>

        {/* Return Preparation (7 Stages) */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {t('menuReturnPreparation')}
          </div>

          <NavLink to="/user-panel/assessment" className={navClass}>
            <FileText className="w-4 h-4 text-emerald-600" />
            <span className="truncate">{t('navAssessment')}</span>
          </NavLink>

          <NavLink
            to="/user-panel/income"
            className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              isIncomeActive
                ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-900'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span className="truncate">{t('navIncome')}</span>
            </div>
          </NavLink>

          <NavLink to="/user-panel/rebate" className={navClass}>
            <TrendingDown className="w-4 h-4 text-emerald-600" />
            <span className="truncate">{t('navRebate')}</span>
          </NavLink>

          <NavLink to="/user-panel/expenditure" className={navClass}>
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
            <span className="truncate">{t('navExpenditure')}</span>
          </NavLink>

          <NavLink to="/user-panel/assets-liabilities" className={navClass}>
            <Building className="w-4 h-4 text-emerald-600" />
            <span className="truncate">{t('navAssetsLiabilities')}</span>
          </NavLink>

          <NavLink to="/user-panel/tax-payment" className={navClass}>
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span className="truncate">{t('navTaxPayment')}</span>
          </NavLink>

          <NavLink to="/user-panel/return-view" className={navClass}>
            <Eye className="w-4 h-4 text-emerald-600" />
            <span className="truncate">{t('navReturnView')}</span>
          </NavLink>

          <NavLink to="/user-panel/submission" className={navClass}>
            <Send className="w-4 h-4 text-emerald-600" />
            <span className="truncate">{t('navSubmission')}</span>
          </NavLink>
        </div>

        {/* Tax Records */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {t('menuTaxRecords')}
          </div>

          <NavLink to="/user-panel/tin-certificate" className={navClass}>
            <Award className="w-4 h-4 text-blue-600" />
            <span className="truncate">{t('navTinCert')}</span>
          </NavLink>

          <NavLink to="/user-panel/acknowledgement" className={navClass}>
            <Receipt className="w-4 h-4 text-blue-600" />
            <span className="truncate">{t('navAckReceipt')}</span>
          </NavLink>

          <NavLink to="/user-panel/challan-history" className={navClass}>
            <History className="w-4 h-4 text-blue-600" />
            <span className="truncate">{t('navChallanHistory')}</span>
          </NavLink>

          <NavLink to="/user-panel/certificate-request" className={navClass}>
            <FilePlus2 className="w-4 h-4 text-blue-600" />
            <span className="truncate">{t('navCertRequest')}</span>
          </NavLink>

          <NavLink to="/user-panel/certificate-status" className={navClass}>
            <FileClock className="w-4 h-4 text-blue-600" />
            <span className="truncate">{t('navCertStatus')}</span>
          </NavLink>

          <NavLink to="/user-panel/return-history" className={navClass}>
            <FileCheck2 className="w-4 h-4 text-blue-600" />
            <span className="truncate">{t('navReturnHistory')}</span>
          </NavLink>
        </div>

        {/* Special Services */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {t('menuSpecialServices')}
          </div>

          <NavLink to="/user-panel/revised-return" className={navClass}>
            <RotateCcw className="w-4 h-4 text-purple-600" />
            <span className="truncate">{t('navRevisedReturn')}</span>
          </NavLink>

          <NavLink to="/user-panel/audited-accounts" className={navClass}>
            <Briefcase className="w-4 h-4 text-purple-600" />
            <span className="truncate">{t('navAuditedAccounts')}</span>
          </NavLink>
        </div>

        {/* Account & Profile */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {t('menuAccount')}
          </div>

          <NavLink to="/user-panel/profile" className={navClass}>
            <UserCheck className="w-4 h-4 text-gray-600" />
            <span className="truncate">{t('navProfile')}</span>
          </NavLink>

          <NavLink to="/user-panel/change-password" className={navClass}>
            <Lock className="w-4 h-4 text-gray-600" />
            <span className="truncate">{t('navChangePassword')}</span>
          </NavLink>
        </div>
      </div>
    </aside>
  );
};
