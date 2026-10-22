import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Sidebar } from '../components/common/Sidebar';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { GapRegisterModal } from '../components/common/GapRegisterModal';
import { useApp } from '../context/AppContext';

export const TaxpayerLayout: React.FC = () => {
  const { language } = useApp();
  const isWorkspace = useLocation().pathname === '/user-panel/home';

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased" style={{ background: "var(--er-background, #F7F8FC)", color: "var(--er-text-primary, #202338)" }}>
      <Header />
      <div className={"flex-1 flex w-full mx-auto " + (isWorkspace ? "max-w-[1500px]" : "max-w-7xl")}>
        {!isWorkspace && <Sidebar />}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {!isWorkspace && <Link to="/user-panel/home" className="inline-flex items-center gap-2 text-sm font-semibold mb-4 underline" style={{ color: "var(--er-primary, #4B5694)" }}>{language === "bn" ? "← রিটার্ন সারসংক্ষেপে ফিরুন" : "← Back to return workspace"}</Link>}
          <Outlet />
        </main>
      </div>

      <footer className="bg-white border-t border-gray-200 py-4 px-6 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <p className="font-semibold text-gray-700">
              {language === 'bn'
                ? 'জাতীয় রাজস্ব বোর্ড (এনবিআর), গণপ্রজাতন্ত্রী বাংলাদেশ সরকার'
                : 'National Board of Revenue (NBR), Government of the People\'s Republic of Bangladesh'}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {language === 'bn'
                ? 'ই-রিটার্ন ট্যাক্সপেয়ার পোর্টাল • হেল্পলাইন: ০৯৬১২-৭৭৯০৯০ বা ৩৩৩'
                : 'eReturn Taxpayer Portal • Helpdesk: 09612-779090 or 333 • Email: ereturn@incometax.gov.bd'}
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-emerald-700 font-medium">
              Canonical Registry: FINAL_2026_09_30
            </span>
            <span className="text-gray-400">|</span>
            <span>{language === "bn" ? "করের হিসাব অনুমোদন সাপেক্ষ" : "Statutory calculations require certification"}</span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <ConfirmationModal />
      <GapRegisterModal />
    </div>
  );
};
