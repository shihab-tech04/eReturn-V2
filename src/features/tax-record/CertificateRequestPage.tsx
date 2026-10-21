import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FilePlus2, CheckCircle, ShieldCheck } from 'lucide-react';

export const CertificateRequestPage: React.FC = () => {
  const { language, t, profile, assessmentYear } = useApp();
  const [certType, setCertType] = useState('Income Tax Clearance Certificate');
  const [selectedAY, setSelectedAY] = useState(assessmentYear);
  const [purpose, setPurpose] = useState('Bank Loan / Financial Facility');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <FilePlus2 className="w-5 h-5 text-blue-700" />
          <h2 className="text-xl font-bold text-gray-900">{t('certRequestTitle')}</h2>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Apply online for certified tax clearance slips, assessment orders, or certificates.
        </p>
      </div>

      {isSubmitted ? (
        <div className="bg-white rounded-xl border border-emerald-300 shadow-md p-8 text-center space-y-4 animate-in fade-in">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-gray-900">Certificate Application Submitted</h3>
          <p className="text-xs text-gray-600 max-w-md mx-auto">
            Your application for <strong>{certType}</strong> for AY {selectedAY} has been logged under Tracking Token{' '}
            <code className="font-mono font-bold text-emerald-800">REQ-2026-9812</code>. Track progress under Certificate Status.
          </p>
          <button
            type="button"
            onClick={() => setIsSubmitted(false)}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold"
          >
            Submit Another Request
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Request Type *</label>
            <select
              value={certType}
              onChange={(e) => setCertType(e.target.value)}
              className="w-full rounded-md border border-gray-300 py-2 px-3 text-xs focus:border-emerald-600 focus:outline-none"
            >
              <option value="Income Tax Clearance Certificate">Income Tax Clearance Certificate</option>
              <option value="Certified Copy of Return (IT-11GA)">Certified Copy of Return (IT-11GA)</option>
              <option value="TIN Certificate Verification Letter">TIN Certificate Verification Letter</option>
              <option value="Assessment Order Duplicate">Assessment Order Duplicate</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Assessment Year *</label>
            <select
              value={selectedAY}
              onChange={(e) => setSelectedAY(e.target.value as any)}
              className="w-full rounded-md border border-gray-300 py-2 px-3 text-xs focus:border-emerald-600 focus:outline-none"
            >
              <option value="2026-2027">2026-2027</option>
              <option value="2025-2026">2025-2026</option>
              <option value="2024-2025">2024-2025</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Purpose of Certificate *</label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full rounded-md border border-gray-300 py-2 px-3 text-xs focus:border-emerald-600 focus:outline-none"
            >
              <option value="Bank Loan / Financial Facility">Bank Loan / Financial Facility</option>
              <option value="Visa Application / Overseas Travel">Visa Application / Overseas Travel</option>
              <option value="Government Tender / Vendor Enlistment">Government Tender / Vendor Enlistment</option>
              <option value="Trade License Renewal">Trade License Renewal</option>
              <option value="Purchase / Registration of Immovable Property">Purchase / Registration of Immovable Property</option>
              <option value="Other Official Purpose">Other Official Purpose</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2 px-4 rounded-md text-xs shadow-xs cursor-pointer"
            >
              Submit Certificate Application
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
