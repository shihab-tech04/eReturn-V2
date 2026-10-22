import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Check } from 'lucide-react';

interface StepDef {
  number: number;
  key: string;
  path: string;
  labelKey: 'step1' | 'step2' | 'step3' | 'step4' | 'step5' | 'step6' | 'step7';
}

const STEPS: StepDef[] = [
  { number: 1, key: 'assessment', path: '/user-panel/assessment', labelKey: 'step1' },
  { number: 2, key: 'income', path: '/user-panel/income', labelKey: 'step2' },
  { number: 3, key: 'rebate', path: '/user-panel/rebate', labelKey: 'step3' },
  { number: 4, key: 'expenditure', path: '/user-panel/expenditure', labelKey: 'step4' },
  { number: 5, key: 'assets', path: '/user-panel/assets-liabilities', labelKey: 'step5' },
  { number: 6, key: 'tax', path: '/user-panel/tax-payment', labelKey: 'step6' },
  { number: 7, key: 'view', path: '/user-panel/return-view', labelKey: 'step7' },
];

export const ReturnStepper: React.FC = () => {
  const { t } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveStepIndex = () => {
    const current = location.pathname;
    if (current.includes('/user-panel/assessment')) return 0;
    if (
      current.includes('/user-panel/income') ||
      current.includes('/user-panel/employment') ||
      current.includes('/user-panel/financial-assets') ||
      current.includes('/user-panel/rent') ||
      current.includes('/user-panel/agriculture') ||
      current.includes('/user-panel/business') ||
      current.includes('/user-panel/capital-gain') ||
      current.includes('/user-panel/income-from-other-sources') ||
      current.includes('/user-panel/firm-etc') ||
      current.includes('/user-panel/aop') ||
      current.includes('/user-panel/foreign-income') ||
      current.includes('/user-panel/spouse-income') ||
      current.includes('/user-panel/tax-exempted-income') ||
      current.includes('/user-panel/voluntary-disclosure-income')
    ) {
      return 1;
    }
    if (current.includes('/user-panel/rebate')) return 2;
    if (current.includes('/user-panel/expenditure')) return 3;
    if (current.includes('/user-panel/assets-liabilities')) return 4;
    if (current.includes('/user-panel/tax-payment')) return 5;
    if (current.includes('/user-panel/return-view') || current.includes('/user-panel/submission')) return 6;
    return -1;
  };

  const activeIdx = getActiveStepIndex();

  // If not on return prep pages, don't show stepper
  if (activeIdx === -1) return null;

  return (
    <div className="bg-ui-surface border-b border-ui-stroke-subtle px-4 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto">
        <nav aria-label="Return Preparation Steps">
          <ol className="flex items-center justify-between overflow-x-auto gap-2 py-1 scrollbar-thin">
            {STEPS.map((step, idx) => {
              const isActive = idx === activeIdx;
              const isPast = idx < activeIdx;

              return (
                <li key={step.number} className="flex-1 min-w-[120px]">
                  <button
                    type="button"
                    onClick={() => navigate(step.path)}
                    className="w-full group flex flex-col items-center cursor-pointer text-center focus:outline-none"
                  >
                    <div className="flex items-center w-full">
                      <div
                        className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-ui-action-bg text-white ring-4 ring-emerald-100 shadow-sm'
                            : isPast
                            ? 'bg-ui-action-bg text-white'
                            : 'bg-ui-surface-subtle text-ui-content-muted border border-ui-stroke-default group-hover:border-gray-400'
                        }`}
                      >
                        {isPast ? <Check className="w-3.5 h-3.5" /> : step.number}
                      </div>
                    </div>
                    <span
                      className={`mt-1.5 text-xs font-medium truncate max-w-full px-1 ${
                        isActive
                          ? 'text-ui-accent font-bold'
                          : isPast
                          ? 'text-ui-content-secondary'
                          : 'text-ui-content-muted group-hover:text-ui-content-secondary'
                      }`}
                    >
                      {t(step.labelKey)}
                    </span>
                    <div
                      className={`h-0.5 w-full mt-2 rounded-full transition-all ${
                        isActive
                          ? 'bg-ui-action-bg'
                          : isPast
                          ? 'bg-ui-accent-soft0'
                          : 'bg-transparent'
                      }`}
                    />
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
};
