import React from 'react';
import { useApp } from '../../context/AppContext';
import { Award, Printer, ShieldCheck } from 'lucide-react';

export const TinCertificatePage: React.FC = () => {
  const { language, t, profile } = useApp();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="print:hidden flex items-center justify-between bg-ui-surface p-4 rounded-xl border border-ui-stroke-subtle shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-700" />
            <h2 className="text-xl font-bold text-ui-content-primary">{t('tinCertificateTitle')}</h2>
          </div>
          <p className="text-xs text-ui-content-muted mt-0.5">{t('tinCertSub')}</p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-ui-stroke-default rounded-md shadow-xs text-xs font-semibold text-ui-content-secondary bg-ui-surface hover:bg-ui-surface-subtle cursor-pointer"
        >
          <Printer className="w-4 h-4 text-ui-content-secondary" />
          {t('print')}
        </button>
      </div>

      {/* Official Certificate Canvas */}
      <div className="bg-ui-surface p-8 sm:p-12 rounded-xl border-4 border-double border-emerald-800 shadow-lg print:shadow-none print:border-4 space-y-6 relative overflow-hidden">
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
          <div className="w-96 h-96 rounded-full border-[16px] border-emerald-900 flex items-center justify-center text-5xl font-black text-ui-content-primary">
            NBR BD
          </div>
        </div>

        {/* Certificate Header */}
        <div className="text-center space-y-1 border-b-2 border-emerald-900 pb-5">
          <div className="w-14 h-14 rounded-full bg-red-600 border-2 border-emerald-800 mx-auto flex items-center justify-center text-white font-bold text-xs shadow-xs mb-2">
            <span className="text-xs">NBR</span>
          </div>
          <h1 className="text-sm font-extrabold text-ui-content-primary uppercase tracking-widest">
            Government of the People's Republic of Bangladesh
          </h1>
          <h2 className="text-xs font-bold text-ui-content-secondary uppercase">National Board of Revenue</h2>
          <div className="pt-2">
            <span className="inline-block bg-ui-action-bg text-white font-bold px-4 py-1 text-xs rounded uppercase tracking-wider">
              Taxpayer's Identification Number (TIN) Certificate
            </span>
          </div>
          <p className="text-[11px] text-ui-content-muted pt-1">
            Issued under Section 184B of the Income Tax Act
          </p>
        </div>

        {/* Certificate Particulars */}
        <div className="space-y-4 text-xs text-ui-content-primary py-2">
          <p className="leading-relaxed">
            This is to certify that <strong className="text-ui-content-primary font-bold">{profile.name}</strong> is a registered taxpayer of Bangladesh under the jurisdiction of Taxes Zone and Circle specified below.
          </p>

          <div className="bg-ui-accent-soft/60 border border-ui-accent-border rounded-lg p-4 space-y-3 font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-emerald-100 pb-2">
              <span className="text-ui-content-secondary">Taxpayer Identification Number (TIN):</span>
              <span className="text-base font-black text-ui-content-primary">{profile.tin}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-ui-content-muted block">Name of Taxpayer:</span>
                <span className="font-semibold text-ui-content-primary font-sans">{profile.name} ({profile.nameBn})</span>
              </div>
              <div>
                <span className="text-ui-content-muted block">National ID (NID):</span>
                <span className="font-semibold text-ui-content-primary">{profile.nid}</span>
              </div>
              <div>
                <span className="text-ui-content-muted block">Father's Name:</span>
                <span className="text-ui-content-primary font-sans">{profile.fatherName}</span>
              </div>
              <div>
                <span className="text-ui-content-muted block">Mother's Name:</span>
                <span className="text-ui-content-primary font-sans">{profile.motherName}</span>
              </div>
              <div>
                <span className="text-ui-content-muted block">Taxes Zone:</span>
                <span className="font-semibold text-ui-content-primary font-sans">{profile.taxesZone}</span>
              </div>
              <div>
                <span className="text-ui-content-muted block">Taxes Circle:</span>
                <span className="font-semibold text-ui-content-primary font-sans">{profile.taxesCircle}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-ui-content-muted block">Current Registered Address:</span>
                <span className="text-ui-content-primary font-sans">{profile.currentAddress}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-ui-content-muted block">Permanent Address:</span>
                <span className="text-ui-content-primary font-sans">{profile.permanentAddress}</span>
              </div>
              <div>
                <span className="text-ui-content-muted block">Status:</span>
                <span className="font-semibold text-ui-content-primary font-sans">{profile.status}</span>
              </div>
              <div>
                <span className="text-ui-content-muted block">Date of Issuance:</span>
                <span className="text-ui-content-primary">15 October 2021</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security / QR Code Section */}
        <div className="pt-4 border-t border-ui-stroke-subtle flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-ui-content-muted">
          <div className="flex items-center gap-3">
            {/* Visual QR Code Mock */}
            <div className="w-16 h-16 bg-gray-900 p-1 rounded border border-ui-stroke-default flex items-center justify-center text-white text-[9px] text-center font-mono shrink-0">
              [QR VERIFY]
            </div>
            <div className="space-y-0.5">
              <span className="font-semibold text-ui-content-secondary block">Official Digital Authentication</span>
              <p>Scan to verify authenticity on National Board of Revenue portal: <code className="text-ui-accent">etaxnbr.gov.bd</code></p>
            </div>
          </div>

          <div className="text-center sm:text-right space-y-1">
            <div className="border-b border-gray-400 w-44 mx-auto sm:ml-auto"></div>
            <span className="font-bold text-ui-content-primary block">Deputy Commissioner of Taxes</span>
            <span className="text-[10px] text-ui-content-muted block">National Board of Revenue, Bangladesh</span>
          </div>
        </div>
      </div>
    </div>
  );
};
