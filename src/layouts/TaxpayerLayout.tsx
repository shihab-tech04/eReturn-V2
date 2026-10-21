import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Sidebar } from '../components/common/Sidebar';
import { ReturnStepper } from '../components/common/ReturnStepper';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { GapRegisterModal } from '../components/common/GapRegisterModal';
import { useApp } from '../context/AppContext';

export const TaxpayerLayout: React.FC = () => {
  const { language } = useApp();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  useEffect(() => {
    if (!mobileNavOpen) return;
    const handleEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setMobileNavOpen(false); };
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);
    return () => { document.body.style.overflow = originalOverflow; window.removeEventListener('keydown', handleEscape); };
  }, [mobileNavOpen]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-gray-900">
      <Header onOpenMobileNav={() => setMobileNavOpen(true)} />
      <ReturnStepper />

      <div className="flex-1 flex max-w-7xl w-full min-w-0 mx-auto">
        {mobileNavOpen && <button type="button" aria-label={language === "bn" ? "নেভিগেশন বন্ধ করুন" : "Close navigation"}
          onClick={() => setMobileNavOpen(false)} className="fixed inset-0 z-50 bg-black/40 lg:hidden" />}
        <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 bg-slate-50">
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
            <span>Security: SSL 256-Bit</span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <ConfirmationModal />
      <GapRegisterModal />
    </div>
  );
};
