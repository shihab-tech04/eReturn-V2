import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, ArrowRight, Save, CheckCircle } from 'lucide-react';

interface StepNavigationButtonsProps {
  backPath?: string;
  nextPath?: string;
  onSaveDraft?: () => void;
  onSaveAndContinue?: () => void;
  nextLabel?: string;
  isSubmitting?: boolean;
}

export const StepNavigationButtons: React.FC<StepNavigationButtonsProps> = ({
  backPath,
  nextPath,
  onSaveDraft,
  onSaveAndContinue,
  nextLabel,
  isSubmitting = false,
}) => {
  const { t } = useApp();
  const navigate = useNavigate();
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  const handleSaveDraft = () => {
    if (onSaveDraft) {
      onSaveDraft();
    }
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 2500);
  };

  const handleNext = () => {
    if (onSaveAndContinue) {
      onSaveAndContinue();
    } else if (nextPath) {
      navigate(nextPath);
    }
  };

  return (
    <div className="mt-8 pt-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
      <div>
        {backPath && (
          <button
            type="button"
            onClick={() => navigate(backPath)}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-md shadow-xs text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('back')}
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        {showSavedFeedback && (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 animate-in fade-in">
            <CheckCircle className="w-3.5 h-3.5" />
            Draft saved in local session
          </span>
        )}

        <button
          type="button"
          onClick={handleSaveDraft}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-md shadow-xs text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
        >
          <Save className="w-4 h-4 text-gray-500" />
          {t('saveDraft')}
        </button>

        {nextPath && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 px-5 py-2 border border-transparent rounded-md shadow-xs text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer disabled:opacity-50"
          >
            {nextLabel || t('saveAndContinue')}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
