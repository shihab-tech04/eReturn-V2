import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, ArrowRight, Save, CheckCircle } from 'lucide-react';
import { Button } from '../sobaike-ui/Button';

interface StepNavigationButtonsProps {
  backPath?: string;
  nextPath?: string;
  onSaveDraft?: () => void;
  onSaveAndContinue?: () => void;
  nextLabel?: string;
  isSubmitting?: boolean;
}
export const StepNavigationButtons: React.FC<StepNavigationButtonsProps> = ({
  backPath, nextPath, onSaveDraft, onSaveAndContinue, nextLabel, isSubmitting = false
}) => {
  const { t } = useApp();
  const navigate = useNavigate();
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);
  const handleSaveDraft = () => {
    if (onSaveDraft) onSaveDraft();
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 2500);
  };
  const handleNext = () => {
    if (onSaveAndContinue) onSaveAndContinue();
    else if (nextPath) navigate(nextPath);
  };
  return (
    <div className="mt-8 pt-4 border-t border-ui-stroke-subtle flex flex-wrap items-center justify-between gap-3">
      <div>
        {backPath && (
          <Button type="button" variant="outline" size="md"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate(backPath)}>
            {t('back')}
          </Button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {showSavedFeedback && (
          <span role="status" className="inline-flex items-center gap-1 type-helper text-ui-success-text bg-ui-success-bg ui-radius-control px-3 py-1">
            <CheckCircle className="w-4 h-4" aria-hidden="true" />
            Draft saved in local session
          </span>
        )}
        <Button type="button" variant="outline" size="md"
          leftIcon={<Save className="w-4 h-4" />} onClick={handleSaveDraft}>
          {t('saveDraft')}
        </Button>
        {nextPath && (
          <Button type="button" variant="primary" size="md"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            disabled={isSubmitting} onClick={handleNext}>
            {nextLabel || t('saveAndContinue')}
          </Button>
        )}
      </div>
    </div>
  );
};
