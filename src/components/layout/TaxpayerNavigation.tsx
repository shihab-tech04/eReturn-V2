import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Bell, ChevronDown, ClipboardList, FileText, Globe2, Home, Menu, Palette, UserRound, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ThemeSelector } from '../sobaike-ui/ThemeSelector';
import { TextSizeSelector } from '../sobaike-ui/TextSizeSelector';
import { hasReturnDraft } from '../../features/workspace/draftStatus';
import { EReturnBrandLogo } from './EReturnBrandLogo';

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
  const [compact, setCompact] = useState(false);
  const [textEntryFocused, setTextEntryFocused] = useState(false);
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

  // Match Sobaike Public's 56px -> 48px mobile header on down-scroll.
  useEffect(() => {
    let lastY=window.scrollY;
    const onScroll=()=>{
      const y=Math.max(0,window.scrollY),delta=y-lastY;
      if(y<48)setCompact(false);
      else if(delta>8)setCompact(true);
      else if(delta< -8)setCompact(false);
      if(Math.abs(delta)>8)lastY=y;
    };
    window.addEventListener('scroll',onScroll,{passive:true});
    return()=>window.removeEventListener('scroll',onScroll);
  },[]);

  // Sobaike's mobile bottom navigation gets out of the way during text entry.
  useEffect(()=>{
    const isTextEntry=(target:EventTarget|null)=>
      target instanceof HTMLElement&&target.matches(
        'input:not([readonly]):not([type="checkbox"]):not([type="radio"]),textarea,[contenteditable="true"]');
    const onFocus=(e:FocusEvent)=>setTextEntryFocused(isTextEntry(e.target));
    const onBlur=(e:FocusEvent)=>setTextEntryFocused(isTextEntry(e.relatedTarget));
    document.addEventListener('focusin',onFocus);
    document.addEventListener('focusout',onBlur);
    return()=>{document.removeEventListener('focusin',onFocus);document.removeEventListener('focusout',onBlur)};
  },[]);

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
      <EReturnBrandLogo size="md" className="er-rail-brand" label={t('eReturn V2 Dashboard', 'ই-রিটার্ন ড্যাশবোর্ড')}/>
      <Link to="/user-panel/return-workspace" className="er-shell-cta"><FileText size={19} aria-hidden={true}/>{t('My Tax Return', 'আমার আয়কর রিটার্ন')}</Link>
      <nav className="er-rail-primary" aria-label={t('Primary navigation', 'প্রধান নেভিগেশন')}>{primaryLinks()}</nav>
      <div className="er-rail-account er-rail-controls">
        <ThemeSelector variant="compact" />
        <TextSizeSelector idPrefix="er-rail" />
        <button type="button" className="er-rail-language" aria-label={t('Language: English', 'ভাষা: বাংলা')}
          onClick={toggleLanguage}>
          <span>{t('Language', 'ভাষা')}</span><strong>{bn ? 'English' : 'বাংলা'}</strong>
        </button>
        <Link className="er-rail-secondary" to="/user-panel/profile">
          <UserRound size={17} aria-hidden={true}/>{t('Profile', 'প্রোফাইল')}
        </Link>
        <button className="er-rail-secondary" type="button" aria-expanded={noticeOpen}
          onClick={() => setNoticeOpen(v => !v)}>
          <Bell size={17} aria-hidden={true}/>{t('Notifications', 'বিজ্ঞপ্তি')}
        </button>
        {noticeOpen && <p role="status" className="er-nav-note">
          {t('No verified notification feed is connected.', 'যাচাইকৃত বিজ্ঞপ্তির কোনো ফিড সংযুক্ত নয়।')}
        </p>}
        <p className="er-rail-signature">{t('Taxpayer workspace', 'করদাতার ওয়ার্কস্পেস')}</p>
      </div>
    </aside>

    <header className="er-compact-header" data-compact={compact?'true':'false'}>
      <div className="er-compact-brand-cluster">
        <button className="er-mobile-header-menu" type="button"
          aria-haspopup="dialog" aria-expanded={menuOpen}
          aria-label={t('Open navigation menu', 'নেভিগেশন মেনু খুলুন')}
          onClick={() => setMenuOpen(true)}>
          <Menu size={21} aria-hidden={true}/>
        </button>
        <EReturnBrandLogo size="sm" className="er-compact-brand" label={t('eReturn V2 Dashboard', 'ই-রিটার্ন ড্যাশবোর্ড')}/>
      </div>
      <div className="er-compact-actions">
        <Link to="/user-panel/return-workspace" className="er-compact-cta">{t('My Tax Return', 'আমার আয়কর রিটার্ন')}</Link>
        <button className="er-tablet-menu" ref={menuTriggerRef} type="button"
          aria-haspopup="dialog" aria-expanded={menuOpen}
          aria-label={t('Open navigation menu', 'নেভিগেশন মেনু খুলুন')}
          onClick={() => setMenuOpen(true)}>
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

    <nav className="er-mobile-bottom" data-keyboard-active={textEntryFocused?'true':'false'} aria-label={t('Mobile primary navigation', 'মোবাইল প্রধান নেভিগেশন')}>
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
