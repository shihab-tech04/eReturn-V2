import { Language } from '../types';

const bnDigits: { [key: string]: string } = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
};

export function toBanglaDigits(num: number | string): string {
  const str = String(num);
  return str.replace(/[0-9]/g, (w) => bnDigits[w] || w);
}

export function formatBDT(amount: number | undefined | null, lang: Language = 'en'): string {
  const value = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  
  // Format with standard South Asian comma style: e.g. 12,34,567
  const parts = Math.round(value).toString().split('.');
  let lastThree = parts[0].substring(parts[0].length - 3);
  const otherNumbers = parts[0].substring(0, parts[0].length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedEn = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  if (lang === 'bn') {
    return `৳ ${toBanglaDigits(formattedEn)}`;
  }
  return `৳ ${formattedEn}`;
}

export function formatNumber(val: number | string, lang: Language = 'en'): string {
  if (lang === 'bn') {
    return toBanglaDigits(val);
  }
  return String(val);
}

export function parseNumber(val: string): number {
  if (!val) return 0;
  // Convert any Bengali digits to ASCII
  const reverseMap: { [key: string]: string } = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
  };
  const asciiStr = val.replace(/[০-৯]/g, (char) => reverseMap[char] || char).replace(/[^0-9.-]/g, '');
  const num = parseFloat(asciiStr);
  return isNaN(num) ? 0 : num;
}
