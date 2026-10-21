import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatBDT } from '../../i18n/formatters';
import { Receipt, Printer, CheckCircle2 } from 'lucide-react';

export const AcknowledgementPage: React.FC = () => {
  const { language, t, profile, assessment, taxPayment, submission } = useApp();

  const handlePrint = () => {
    window.print();
  };

  const registerSerial = submission.localSubmissionId || `Z04-C072-${assessment.assessmentYear.replace('-', '')}-88912`;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="print:hidden flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-700" />
            <h2 className="text-xl font-bold text-gray-900">{t('acknowledgementTitle')}</h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{t('ackSub')}</p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-gray-300 rounded-md shadow-xs text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
        >
          <Printer className="w-4 h-4 text-gray-600" />
          {t('print')}
        </button>
      </div>

      {/* Slip Canvas */}
      <div className="bg-white p-8 sm:p-10 rounded-xl border-2 border-dashed border-gray-400 shadow-md print:shadow-none print:border-2 space-y-6 text-xs text-gray-900">
        <div className="text-center space-y-1 border-b border-gray-300 pb-4">
          <div className="w-10 h-10 rounded-full bg-red-600 border-2 border-emerald-800 mx-auto flex items-center justify-center text-white font-bold text-[10px] mb-1">
            NBR
          </div>
          <h1 className="text-xs font-bold text-gray-700 uppercase tracking-wide">
            Government of the People's Republic of Bangladesh
          </h1>
          <h2 className="text-sm font-extrabold text-emerald-900 uppercase">
            National Board of Revenue
          </h2>
          <div className="pt-1">
            <span className="inline-block bg-emerald-800 text-white font-bold px-3 py-0.5 text-xs rounded uppercase">
              Acknowledgement Receipt of Return of Income
            </span>
          </div>
          <p className="text-[11px] text-gray-500 pt-0.5 font-mono">
            Submission under Section 180 (Universal Self Assessment)
          </p>
        </div>

        {/* Particulars Table */}
        <div className="border border-gray-300 rounded overflow-hidden divide-y divide-gray-200">
          <div className="grid grid-cols-3 bg-gray-50 p-2.5 font-semibold">
            <span className="text-gray-600">Return Register Serial:</span>
            <span className="col-span-2 font-mono text-emerald-900 font-bold">{registerSerial}</span>
          </div>

          <div className="grid grid-cols-3 p-2.5">
            <span className="text-gray-600 font-medium">Assessment Year:</span>
            <span className="col-span-2 font-bold font-mono">{assessment.assessmentYear}</span>
          </div>

          <div className="grid grid-cols-3 p-2.5 bg-gray-50/50">
            <span className="text-gray-600 font-medium">Name of Taxpayer:</span>
            <span className="col-span-2 font-bold">{profile.name} ({profile.nameBn})</span>
          </div>

          <div className="grid grid-cols-3 p-2.5">
            <span className="text-gray-600 font-medium">TIN:</span>
            <span className="col-span-2 font-mono font-bold text-gray-900">{profile.tin}</span>
          </div>

          <div className="grid grid-cols-3 p-2.5 bg-gray-50/50">
            <span className="text-gray-600 font-medium">National ID (NID):</span>
            <span className="col-span-2 font-mono">{profile.nid}</span>
          </div>

          <div className="grid grid-cols-3 p-2.5">
            <span className="text-gray-600 font-medium">Taxes Circle & Zone:</span>
            <span className="col-span-2">{profile.taxesCircle}, {profile.taxesZone}</span>
          </div>

          <div className="grid grid-cols-3 p-2.5 bg-gray-50/50">
            <span className="text-gray-600 font-medium">Total Income Shown:</span>
            <span className="col-span-2 font-bold font-mono text-emerald-900">
              {formatBDT(taxPayment.taxableIncome, language)}
            </span>
          </div>

          <div className="grid grid-cols-3 p-2.5">
            <span className="text-gray-600 font-medium">Total Tax Paid / Credited:</span>
            <span className="col-span-2 font-bold font-mono text-gray-900">
              {formatBDT(taxPayment.totalTaxPaidAndCredited, language)}
            </span>
          </div>

          <div className="grid grid-cols-3 p-2.5 bg-gray-50/50">
            <span className="text-gray-600 font-medium">Challan Reference / Date:</span>
            <span className="col-span-2 font-mono">
              {taxPayment.challanNumber || 'TR-CH-2026-9921'} ({taxPayment.challanDate || new Date().toISOString().split('T')[0]})
            </span>
          </div>

          <div className="grid grid-cols-3 p-2.5">
            <span className="text-gray-600 font-medium">Date of Submission:</span>
            <span className="col-span-2 font-mono font-semibold">
              {submission.localSubmissionTimestamp || new Date().toLocaleString()}
            </span>
          </div>
        </div>

        {/* Official Seal / Signature Simulation */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-[11px] text-gray-500">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full border-2 border-emerald-700 flex items-center justify-center text-emerald-800 font-bold text-[9px] text-center p-1 uppercase">
              NBR eReturn Verified
            </div>
            <div>
              <span className="font-bold text-gray-800 block">System Generated e-Acknowledgement</span>
              <p>This is a computer generated receipt and does not require physical signature.</p>
            </div>
          </div>

          <div className="text-center sm:text-right">
            <div className="border-b border-gray-400 w-44 mx-auto sm:ml-auto mb-1"></div>
            <span className="font-bold text-gray-800 block">Receiving Official</span>
            <span className="text-gray-500 block">Taxes Circle-072, Dhaka</span>
          </div>
        </div>
      </div>
    </div>
  );
};
