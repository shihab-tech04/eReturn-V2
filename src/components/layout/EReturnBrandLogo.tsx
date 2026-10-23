import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpenCheck } from 'lucide-react';

interface Props {
  size?:'sm'|'md';
  className?:string;
  label:string;
}
/**
 * Branded adaptation of Sobaike Public's compact BrandLogo layout:
 * 32/36px mark and stacked 14/18px Bengali + 11/14px English wordmark.
 * A neutral tax-document mark replaces citizen-reporting logo assets.
 */
export function EReturnBrandLogo({size='md',className='',label}:Props){
  const compact=size==='sm';
  return <Link to="/user-panel/home" aria-label={label}
    className={'er-tax-brand-logo flex items-center min-w-0 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ui-focus ui-radius-control '+(compact?'gap-1.5 sm:gap-2.5':'gap-3')+' '+className}>
    <span className={'er-tax-brand-mark grid place-items-center shrink-0 ui-radius-control bg-ui-surface-subtle border border-ui-stroke-subtle text-ui-action-bg '+(compact?'w-8 h-8':'w-9 h-9')}>
      <BookOpenCheck size={compact?19:22} aria-hidden={true} strokeWidth={1.75}/>
    </span>
    <span className="flex flex-col text-left min-w-0">
      <span lang="bn" className={compact
        ? 'text-[14px] sm:text-[16px] font-bold leading-tight tracking-tight whitespace-nowrap text-ui-content-primary'
        : 'text-[18px] leading-[24px] font-bold tracking-tight whitespace-nowrap text-ui-content-primary'}>
        ই-রিটার্ন
      </span>
      <span lang="en" className={compact
        ? 'text-[11px] sm:text-[12px] leading-tight font-medium whitespace-nowrap text-ui-content-secondary'
        : 'text-[14px] leading-tight font-medium whitespace-nowrap text-ui-content-secondary'}>
        eReturn V2
      </span>
    </span>
  </Link>;
}
