import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../sobaike-ui/Modal';
import { Button } from '../sobaike-ui/Button';

/** Keep eReturn's original confirmation callbacks and copy; render with
 * Sobaike Public's actual modal structure, responsive sheet, and actions. */
export const ConfirmationModal: React.FC = () => {
  const { confirmModal, closeConfirmation, t, language } = useApp();
  const cancel = () => {
    if (confirmModal.onCancel) confirmModal.onCancel();
    closeConfirmation();
  };
  const confirm = () => {
    confirmModal.onConfirm();
    closeConfirmation();
  };
  return (
    <Modal id="er-confirm-action" isOpen={confirmModal.isOpen} onClose={cancel}
      title={confirmModal.title || t('confirm')} ariaLabel={confirmModal.title || t('confirm')}
      language={language} maxWidth="md" mobilePresentation="sheet" closeOnBackdrop={false}
      footer={<div className="flex w-full flex-wrap justify-end gap-3">
        <Button variant="outline" type="button" onClick={cancel}>
          {confirmModal.cancelLabel || t('cancel')}
        </Button>
        <Button variant={confirmModal.isDestructive ? 'destructive' : 'primary'} type="button" onClick={confirm}>
          {confirmModal.confirmLabel || t('confirm')}
        </Button>
      </div>}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-6 w-6 shrink-0 text-ui-warning-text" aria-hidden="true" />
        <p className="type-body text-ui-content-primary">{confirmModal.message}</p>
      </div>
    </Modal>
  );
};
