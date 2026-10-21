import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatBDT } from '../../i18n/formatters';
import { RotateCcw, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';

export const RevisedReturnPage: React.FC = () => {
  const { language, t, assessment, taxPayment } = useApp();
  const [selectedAY, setSelectedAY] = useState('2025-2026');
  const [revisionSection, setRevisionSection] = useState('Section 180 (Self-Discovered Inadvertent Error)');
  const [revisionReason, setRevisionReason] = useState('');
  const [changedParticulars, setChangedParticulars] = useState({
    incomeAdjustment: false,
    rebateAdjustment: false,
    assetOmissionCorrection: false,
    tdsChallanCorrection: false,
  });
  const [isAffirmed, setIsAffirmed] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionReason.trim()) {
      alert('Please provide statutory reason for filing revised return.');
      return;
    }
    if (!isAffirmed) {
      alert('Please affirm statutory notice regarding revised return scrutiny.');
      return;
    }
    setIsSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-purple-700" />
          <h2 className="text-xl font-bold text-gray-900">{t('revisedTitle')}</h2>
        </div>
        <p className="text-xs text-gray-500 mt-1">{t('revisedSubtitle')}</p>
      </div>

      {/* Statutory Guidance */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
        <div className="text-xs text-purple-900 space-y-1">
          <span className="font-bold block">Statutory Eligibility Notice (Section 180)</span>
          <p className="leading-relaxed">{t('revisedSubmitNotice')}</p>
        </div>
      </div>

      {isSubmitted ? (
        <div className="bg-white rounded-xl border border-emerald-300 shadow-md p-8 text-center space-y-4 animate-in zoom-in-95">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-gray-900">Revised Return Draft Created Locally</h3>
          <p className="text-xs text-gray-600 max-w-md mx-auto">
            Revised return for AY <strong>{selectedAY}</strong> initiated under Lineage Token{' '}
            <code className="font-mono font-bold text-emerald-800">REV-180-{selectedAY}-V2</code>.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">{t('revisedSelectYear')} *</label>
              <select
                value={selectedAY}
                onChange={(e) => setSelectedAY(e.target.value)}
                className="w-full rounded-md border border-gray-300 py-2 px-3 text-xs focus:border-emerald-600 focus:outline-none"
              >
                <option value="2025-2026">2025-2026 (Original Filed: 28 Nov 2025)</option>
                <option value="2024-2025">2024-2025 (Original Filed: 20 Nov 2024)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Controlling Statutory Section *</label>
              <select
                value={revisionSection}
                onChange={(e) => setRevisionSection(e.target.value)}
                className="w-full rounded-md border border-gray-300 py-2 px-3 text-xs focus:border-emerald-600 focus:outline-none"
              >
                <option value="Section 180 (Self-Discovered Inadvertent Error)">
                  Section 180 (Self-Discovered Inadvertent Error)
                </option>
                <option value="Section 82BB / Notice Response">Section 82BB / Notice Response</option>
                <option value="Section 173 Differential Settlement">Section 173 Differential Settlement</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">{t('revisedReason')} *</label>
            <textarea
              rows={3}
              value={revisionReason}
              onChange={(e) => setRevisionReason(e.target.value)}
              placeholder="Explain the omission or wrong statement discovered in the original return..."
              className="w-full rounded-md border border-gray-300 py-2 px-3 text-xs focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-2">Affected Return Schedules / Fields</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="flex items-center gap-2 p-2 rounded border border-gray-200 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={changedParticulars.incomeAdjustment}
                  onChange={(e) =>
                    setChangedParticulars((p) => ({ ...p, incomeAdjustment: e.target.checked }))
                  }
                  className="text-emerald-700 rounded h-3.5 w-3.5"
                />
                <span>Particulars of Income / Omitted Heads</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded border border-gray-200 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={changedParticulars.rebateAdjustment}
                  onChange={(e) =>
                    setChangedParticulars((p) => ({ ...p, rebateAdjustment: e.target.checked }))
                  }
                  className="text-emerald-700 rounded h-3.5 w-3.5"
                />
                <span>Schedule 24D Investment Rebate Adjustment</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded border border-gray-200 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={changedParticulars.assetOmissionCorrection}
                  onChange={(e) =>
                    setChangedParticulars((p) => ({ ...p, assetOmissionCorrection: e.target.checked }))
                  }
                  className="text-emerald-700 rounded h-3.5 w-3.5"
                />
                <span>IT-10B Assets or Liability Valuation Correction</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded border border-gray-200 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={changedParticulars.tdsChallanCorrection}
                  onChange={(e) =>
                    setChangedParticulars((p) => ({ ...p, tdsChallanCorrection: e.target.checked }))
                  }
                  className="text-emerald-700 rounded h-3.5 w-3.5"
                />
                <span>TDS Credit or Treasury Challan Discrepancy</span>
              </label>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-800 select-none">
              <input
                type="checkbox"
                checked={isAffirmed}
                onChange={(e) => setIsAffirmed(e.target.checked)}
                className="h-4 w-4 text-emerald-700 rounded border-gray-300 mt-0.5 shrink-0"
              />
              <span className="leading-relaxed">
                I solemnly affirm that the revision is sought genuinely to correct bona fide omissions or errors without fraudulent concealment.
              </span>
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-purple-700 hover:bg-purple-800 text-white font-semibold py-2 px-4 rounded-md text-xs shadow-xs cursor-pointer"
            >
              Initiate Revised Return Preparation
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
