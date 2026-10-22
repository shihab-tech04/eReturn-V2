import React from 'react';
import { useApp } from '../../context/AppContext';
import { toBanglaDigits } from '../../i18n/formatters';
import { ContextHelpButton } from '../help/ContextualHelp';

interface AmountInputProps {
  id?: string;
  name?: string;
  value: number;
  onChange: (val: number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  min?: number;
  max?: number;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  id,
  name,
  value,
  onChange,
  placeholder = '0',
  disabled = false,
  className = '',
  min = 0,
}) => {
  const { language } = useApp();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Replace Bangla digits if typed
    const reverseMap: { [key: string]: string } = {
      '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
      '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
    };
    const clean = raw.replace(/[০-৯]/g, (c) => reverseMap[c] || c).replace(/[^0-9.-]/g, '');
    const num = parseFloat(clean);
    onChange(isNaN(num) ? 0 : Math.max(min, num));
  };

  const displayVal = value === 0 ? '' : language === 'bn' ? toBanglaDigits(value) : String(value);

  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <span className="text-ui-content-muted font-medium type-label">৳</span>
      </div>
      <input
        type="text"
        id={id}
        name={name}
        value={displayVal}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`block w-full min-h-[44px] bg-ui-surface text-ui-content-primary border border-ui-stroke-default ui-radius-control pl-8 pr-12 ui-space-field-y type-body focus:border-ui-accent focus:ring-2 focus:ring-ui-focus focus:outline-none disabled:bg-ui-disabled-bg disabled:text-ui-disabled-text text-right tabular-nums transition-colors ${className}`}
      />
      <div className="absolute inset-y-0 right-1 flex items-center">
        <ContextHelpButton topic={name || id || (language === 'bn' ? 'টাকার অঙ্ক' : 'Amount')} compact/>
      </div>
    </div>
  );
};
