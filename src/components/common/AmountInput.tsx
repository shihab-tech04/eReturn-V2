import React from 'react';
import { useApp } from '../../context/AppContext';
import { toBanglaDigits } from '../../i18n/formatters';

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
    <div className="relative rounded-md shadow-xs">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <span className="text-gray-500 font-medium text-sm">৳</span>
      </div>
      <input
        type="text"
        id={id}
        name={name}
        value={displayVal}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`block w-full rounded-md border border-gray-300 pl-8 pr-3 py-2 text-sm text-gray-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500 text-right font-mono transition-colors ${className}`}
      />
    </div>
  );
};
