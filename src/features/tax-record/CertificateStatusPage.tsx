import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatBDT } from '../../i18n/formatters';
import { FileClock, Search, CheckCircle2, Clock, XCircle } from 'lucide-react';

export const CertificateStatusPage: React.FC = () => {
  const { language, t, certStatusRecords } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = certStatusRecords.filter((r) =>
    r.assessmentYear.includes(searchTerm) ||
    r.requestType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.returnRegisterSerial.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-ui-accent bg-ui-accent-soft px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-ui-accent" /> Approved
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-blue-700" /> Pending
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-800 bg-red-100 px-2 py-0.5 rounded-full">
            <XCircle className="w-3 h-3 text-red-700" /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileClock className="w-5 h-5 text-blue-700" />
            <h2 className="text-xl font-bold text-ui-content-primary">{t('certStatusTitle')}</h2>
          </div>
          <p className="text-xs text-ui-content-muted mt-1">
            Tracking requests submitted under the Income Tax Act.
          </p>
        </div>

        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-ui-content-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search AY, serial, certificate..."
            className="w-full rounded-md border border-ui-stroke-default py-1.5 pl-8 pr-3 text-xs focus:border-ui-focus focus:outline-none"
          />
        </div>
      </div>

      {/* 13-Column Observed Table */}
      <div className="bg-ui-surface rounded-xl border border-ui-stroke-subtle shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-xs font-mono">
            <thead className="bg-ui-surface-subtle text-ui-content-secondary font-semibold uppercase font-sans">
              <tr>
                <th className="px-3 py-3 text-left whitespace-nowrap">TIN No.</th>
                <th className="px-3 py-3 text-left whitespace-nowrap">AY</th>
                <th className="px-3 py-3 text-left whitespace-nowrap">Submission Date</th>
                <th className="px-3 py-3 text-left whitespace-nowrap">Section</th>
                <th className="px-3 py-3 text-left whitespace-nowrap">Register Serial</th>
                <th className="px-3 py-3 text-left whitespace-nowrap">Zone Name</th>
                <th className="px-3 py-3 text-left whitespace-nowrap">Circle Name</th>
                <th className="px-3 py-3 text-right whitespace-nowrap">Total Income</th>
                <th className="px-3 py-3 text-right whitespace-nowrap">Net Wealth</th>
                <th className="px-3 py-3 text-right whitespace-nowrap">Total Tax Paid</th>
                <th className="px-3 py-3 text-left whitespace-nowrap">Request Type</th>
                <th className="px-3 py-3 text-center whitespace-nowrap">Status</th>
                <th className="px-3 py-3 text-left whitespace-nowrap">Reject Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-ui-surface">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-4 py-8 text-center text-xs text-ui-content-muted font-sans">
                    {t('noRecordsFound')}
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.returnRegisterSerial} className="hover:bg-ui-surface-subtle transition-colors">
                    <td className="px-3 py-2.5 font-bold text-ui-content-primary whitespace-nowrap">{item.tinNo}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{item.assessmentYear}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-ui-content-secondary">{item.submissionDate}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-ui-content-secondary font-sans">{item.submissionSection}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-ui-content-primary font-bold">{item.returnRegisterSerial}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-ui-content-secondary font-sans">{item.zoneName}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-ui-content-secondary font-sans">{item.circleName}</td>
                    <td className="px-3 py-2.5 text-right whitespace-nowrap font-bold text-ui-content-primary">
                      {formatBDT(item.totalIncome, language)}
                    </td>
                    <td className="px-3 py-2.5 text-right whitespace-nowrap text-ui-content-secondary">
                      {formatBDT(item.netWealth, language)}
                    </td>
                    <td className="px-3 py-2.5 text-right whitespace-nowrap text-ui-accent font-bold">
                      {formatBDT(item.totalTaxPaid, language)}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-ui-content-primary font-sans">{item.requestType}</td>
                    <td className="px-3 py-2.5 text-center whitespace-nowrap font-sans">{getStatusBadge(item.requestStatus)}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-ui-content-muted font-sans">{item.rejectReason}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
