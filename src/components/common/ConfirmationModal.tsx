import React from 'react';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, X } from 'lucide-react';

export const ConfirmationModal: React.FC = () => {
  const { confirmModal, closeConfirmation, t } = useApp();

  if (!confirmModal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md rounded-lg bg-white shadow-2xl p-6 border border-gray-200 animate-in fade-in zoom-in-95">
        <button
          type="button"
          onClick={closeConfirmation}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-100 text-amber-700 rounded-full shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-gray-900">{confirmModal.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{confirmModal.message}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              if (confirmModal.onCancel) confirmModal.onCancel();
              closeConfirmation();
            }}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {confirmModal.cancelLabel || t('cancel')}
          </button>
          <button
            type="button"
            onClick={() => {
              confirmModal.onConfirm();
              closeConfirmation();
            }}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {confirmModal.confirmLabel || t('confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};
