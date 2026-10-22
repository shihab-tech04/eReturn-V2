import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Bell, BookOpenCheck, ChevronDown, ClipboardList, FileText, Globe2, Home, Menu, Palette, UserRound, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ThemeSelector } from '../sobaike-ui/ThemeSelector';
import { TextSizeSelector } from '../sobaike-ui/TextSizeSelector';
import { hasReturnDraft } from '../../features/workspace/draftStatus';

type NavItem = { to: string; en: string; bn: string; Icon: React.ComponentType<{ size?: number; 'aria-hidden'?: boolean }> };
const sections: NavItem[] = [
  { to: '/user-panel/home', en: 'Dashboard', bn: 'ড্যাশবোর্ড', Icon: Home },
  { to: '/user-panel/tax-records', en: 'Tax Records', bn: 'কর রেকর্ড', Icon: ClipboardList },
];
const returnDetailPaths = new Set([
  'assessment', 'income', 'employment', 'financial-assets', 'rent', 'agriculture',
  'business', 'capital-gain', 'income-from-other-sources', 'firm-etc', 'aop',
  'foreign-income', 'spouse-income', 'tax-exempted-income',
  'voluntary-disclosure-income', 'rebate', 'expenditure', 'assets-liabilities',
  'tax-payment', 'return-view', 'submission', 'audited-accounts',
]);
const recordPaths = new Set([
  'tin-certificate', 'acknowledgement', 'challan-history',
  'certificate-request', 'certificate-status', 'return-history', 'return-records',
  'revised-return',
]);

export const isReturnDetailPath = (pathname: string) =>
  returnDetailPaths.has(pathname.split('/').pop() || '');
export const isTaxRecordPath = (pathname: string) =>
  recordPaths.has(pathname.split('/').pop() || '');

export const navigationActive = (pathname: string, to: string) =>
  pathname === to
  || (to.endsWith('/return-workspace') && isReturnDetailPath(pathname))
  || (to.endsWith('/tax-records') && isTaxRecordPath(pathname));

export function TaxpayerNavigation() {
  const location = useLocation();
  const { language, toggleLanguage, profile, income, rebate, expenditure, assetsLiabilities, taxPayment, assessment } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const bn = language === 'bn';
  const t = (en: string, bangla: string) => bn ? bangla : en;
  const hasDraft = hasReturnDraft({ profile, assessment, income, rebate, expenditure, assetsLiabilities, taxPayment });
  const actionLabel = hasDraft ? t('Resume Return', 'রিটার্ন চালু করুন') : t('Start Return', 'রিটার্ন শুরু করুন');

  useEffect(() => {
    setMenuOpen(false);
    setNoticeOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const old = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMenuOpen(false); return; }
      if (event.key !== 'Tab' || !drawerRef.current) return;
      const focusables = Array.from(drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),select:not([disabled]),input:not([disabled])'
      )).filter((node) => node.offsetParent !== null);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = originalOverflow;
      (old && old.isConnected ? old : menuTriggerRef.current)?.focus();
    };
  }, [menuOpen]);

  const appearance = (
    <div className="er-nav-appearance grid gap-3" aria-label={t('Appearance preferences', 'প্রদর্শনের পছন্দ')}>
      <ThemeSelector variant="compact" />
      <TextSizeSelector idPrefix="er-appearance" />
    </div>
  );

  const primaryLinks = (mobile = false) =>
    sections.map(({ to, en, bn: bengali, Icon }) => (
      <NavLink key={to} to={to} onClick={() => mobile && setMenuOpen(false)}
        aria-current={navigationActive(location.pathname, to) ? 'page' : undefined}
        className={'er-nav-link' + (navigationActive(location.pathname, to) ? ' er-nav-selected' : '')}>
        <Icon size={20} aria-hidden={true} />
        <span>{bn ? bengali : en}</span>
      </NavLink>
    ));

  const account = (
    <div className="er-nav-utilities">
      <Link className="er-nav-link" to="/user-panel/profile" onClick={() => setMenuOpen(false)}>
        <UserRound size={19} aria-hidden={true}/>{t('Profile', 'প্রোফাইল')}
      </Link>
      <button className="er-nav-link" type="button" onClick={toggleLanguage}>
        <Globe2 size={19} aria-hidden={true}/>{t('Language: English', 'ভাষা: বাংলা')}
      </button>
      <button className="er-nav-link" type="button" aria-expanded={appearanceOpen} onClick={() => setAppearanceOpen(s => !s)}>
        <Palette size={19} aria-hidden={true}/>{t('Appearance', 'প্রদর্শন')} <ChevronDown size={15} aria-hidden={true}/>
      </button>
      {appearanceOpen && appearance}
      <button className="er-nav-link" type="button" aria-expanded={noticeOpen} onClick={() => setNoticeOpen(s => !s)}>
        <Bell size={19} aria-hidden={true}/>{t('Notifications', 'বিজ্ঞপ্তি')}
      </button>
      {noticeOpen && <p role="status" className="er-nav-note">
        {t('No verified notification feed is connected.', 'যাচাইকৃত বিজ্ঞপ্তির কোনো ফিড সংযুক্ত নয়।')}
      </p>}
    </div>
  );

  return <>
    <aside className="er-desktop-rail" aria-label={t('Taxpayer desktop navigation', 'করদাতার ডেস্কটপ নেভিগেশন')}>
      <Link className="er-rail-brand" to="/user-panel/home" aria-label={t('eReturn V2 Dashboard', 'ই-রিটার্ন ড্যাশবোর্ড')}>
        <BookOpenCheck size={25} aria-hidden={true}/>
        <span>eReturn <strong>V2</strong></span>
      </Link>
      <Link to="/user-panel/return-workspace" className="er-shell-cta"><FileText size={19} aria-hidden={true}/>{t('My Tax Return', 'আমার আয়কর রিটার্ন')}</Link>
      <nav className="er-rail-primary" aria-label={t('Primary navigation', 'প্রধান নেভিগেশন')}>{primaryLinks()}</nav>
      <div className="er-rail-account">
        <p className="er-rail-section">{t('Account', 'অ্যাকাউন্ট')}</p>{account}
      </div>
    </aside>

    <header className="er-compact-header">
      <Link to="/user-panel/home" className="er-compact-brand">eReturn <strong>V2</strong></Link>
      <div className="er-compact-actions">
        <Link to="/user-panel/return-workspace" className="er-compact-cta">{t('My Tax Return', 'আমার আয়কর রিটার্ন')}</Link>
        <button ref={menuTriggerRef} type="button" aria-haspopup="dialog" aria-expanded={menuOpen}
          aria-label={t('Open navigation menu', 'নেভিগেশন মেনু খুলুন')} onClick={() => setMenuOpen(true)}>
          <Menu size={23} aria-hidden={true}/>
        </button>
      </div>
    </header>

    {menuOpen && <div className="er-nav-scrim" onMouseDown={e => {
      if (e.target === e.currentTarget) setMenuOpen(false);
    }}>
      <div className="er-nav-drawer" ref={drawerRef} role="dialog" aria-modal="true"
        aria-label={t('Navigation and account', 'নেভিগেশন ও অ্যাকাউন্ট')}>
        <div className="er-drawer-head">
          <strong>eReturn V2</strong>
          <button type="button" ref={closeRef} aria-label={t('Close navigation menu', 'নেভিগেশন মেনু বন্ধ করুন')}
            onClick={() => setMenuOpen(false)}><X size={22} aria-hidden={true}/></button>
        </div>
        <nav className="er-drawer-primary" aria-label={t('Primary navigation', 'প্রধান নেভিগেশন')}>
          {primaryLinks(true)}
        </nav>
        <button type="button" className="er-account-expander"
          aria-expanded={accountOpen} onClick={() => setAccountOpen(x => !x)}>
          {t('Account & preferences', 'অ্যাকাউন্ট ও পছন্দ')} <ChevronDown size={18} aria-hidden={true}/>
        </button>
        {accountOpen && account}
      </div>
    </div>}

    <nav className="er-mobile-bottom" aria-label={t('Mobile primary navigation', 'মোবাইল প্রধান নেভিগেশন')}>
      <button type="button" className="er-nav-link" aria-label={t('Open menu', 'মেনু খুলুন')} aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
        <Menu size={20} aria-hidden={true}/><span>{t('Menu','মেনু')}</span>
      </button>
      <NavLink to="/user-panel/tax-records" className={() => 'er-nav-link' + (navigationActive(location.pathname, '/user-panel/tax-records') ? ' er-nav-selected' : '')}>
        <ClipboardList size={20} aria-hidden={true}/><span>{t('Records','রেকর্ড')}</span>
      </NavLink>
      <NavLink to="/user-panel/return-workspace" className={() => 'er-nav-link' + (navigationActive(location.pathname, '/user-panel/return-workspace') ? ' er-nav-selected' : '')}>
        <FileText size={20} aria-hidden={true}/><span>{t('Return','রিটার্ন')}</span>
      </NavLink>
      <NavLink to="/user-panel/home" className={({isActive}) => 'er-nav-link' + (isActive ? ' er-nav-selected' : '')}>
        <Home size={20} aria-hidden={true}/><span>{t('Home','হোম')}</span>
      </NavLink>
    </nav>
  </>;
}
