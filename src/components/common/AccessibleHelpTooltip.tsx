import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface AccessibleHelpTooltipProps {
  content: string;
  label?: string;
}

export const AccessibleHelpTooltip: React.FC<AccessibleHelpTooltipProps> = ({ content, label = 'Help information' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevents bubbling to parent checkbox or button
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-flex items-center ml-1.5" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={toggle}
        aria-label={label}
        aria-expanded={isOpen}
        className="text-emerald-700 hover:text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-full p-0.5 transition-colors cursor-pointer"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          role="tooltip"
          className="absolute z-50 left-6 top-1/2 -translate-y-1/2 w-64 p-3 bg-gray-900 text-white text-xs rounded-md shadow-xl border border-gray-700 animate-in fade-in"
        >
          <div className="flex justify-between items-start gap-2 mb-1">
            <span className="font-semibold text-emerald-400">Information</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="leading-relaxed text-gray-200">{content}</p>
        </div>
      )}
    </div>
  );
};
