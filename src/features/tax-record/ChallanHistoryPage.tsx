import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChallanRecord } from '../../types';
import { formatBDT } from '../../i18n/formatters';
import { History, Search, Eye, X, Receipt, Building, CheckCircle2 } from 'lucide-react';

export const ChallanHistoryPage: React.FC = () => {
  const { language, t, challans, profile } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChallan, setSelectedChallan] = useState<ChallanRecord | null>(null);

  const filteredChallans = challans.filter((c) =>
    c.challanNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.section.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-700" />
            <h2 className="text-xl font-bold text-gray-900">{t('challanHistoryTitle')}</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">{t('challanSub')}</p>
        </div>

        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search challan number, bank..."
            className="w-full rounded-md border border-gray-300 py-1.5 pl-8 pr-3 text-xs focus:border-emerald-600 focus:outline-none"
          />
        </div>
      </div>

      {/* 9-Column Observed Challan Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-gray-50 text-gray-700 font-semibold uppercase">
              <tr>
                <th className="px-3 py-3 text-center w-12">SL</th>
                <th className="px-3 py-3 text-left">Challan No.</th>
                <th className="px-3 py-3 text-left">Challan Date</th>
                <th className="px-3 py-3 text-left">Section</th>
                <th className="px-3 py-3 text-left">Taxes Zone</th>
                <th className="px-3 py-3 text-left">Taxes Circle</th>
                <th className="px-3 py-3 text-left">Bank Name</th>
                <th className="px-3 py-3 text-right">Challan Amount</th>
                <th className="px-3 py-3 text-center">View Challan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredChallans.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-xs text-gray-500">
                    {t('noRecordsFound')}
                  </td>
                </tr>
              ) : (
                filteredChallans.map((ch, idx) => (
                  <tr key={ch.challanNo} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2.5 text-center font-mono text-gray-500">{ch.sl || idx + 1}</td>
                    <td className="px-3 py-2.5 font-mono font-bold text-emerald-900 whitespace-nowrap">
                      {ch.challanNo}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-gray-700 font-mono">{ch.challanDate}</td>
                    <td className="px-3 py-2.5 text-gray-700">{ch.section}</td>
                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{ch.taxesZone}</td>
                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{ch.taxesCircle}</td>
                    <td className="px-3 py-2.5 text-gray-700">
                      {ch.bankName} <span className="text-[10px] text-gray-400 block">{ch.branchName}</span>
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-gray-900 whitespace-nowrap">
                      {formatBDT(ch.challanAmount, language)}
                    </td>
                    <td className="px-3 py-2.5 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedChallan(ch)}
                        className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-900 font-semibold px-2 py-1 rounded hover:bg-emerald-50 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Challan Receipt Modal */}
      {selectedChallan && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl p-6 border border-gray-200 animate-in fade-in space-y-4">
            <button
              type="button"
              onClick={() => setSelectedChallan(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1 border-b border-gray-200 pb-3">
              <span className="text-xs uppercase font-extrabold text-emerald-900">
                Bangladesh Bank / Sonali Bank PLC
              </span>
              <h3 className="text-base font-bold text-gray-900">Treasury Deposit Challan Receipt</h3>
              <p className="text-[11px] text-gray-500 font-mono">Challan Ref: {selectedChallan.challanNo}</p>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500 font-sans">Deposit Date:</span>
                <span className="font-semibold text-gray-900">{selectedChallan.challanDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500 font-sans">Depositor TIN:</span>
                <span className="font-semibold text-gray-900">{profile.tin}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500 font-sans">Depositor Name:</span>
                <span className="font-semibold text-gray-900 font-sans">{profile.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500 font-sans">Taxes Zone & Circle:</span>
                <span className="text-gray-900 font-sans">{selectedChallan.taxesZone} • {selectedChallan.taxesCircle}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500 font-sans">Income Tax Section:</span>
                <span className="text-gray-900 font-sans">{selectedChallan.section}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500 font-sans">Receiving Bank:</span>
                <span className="text-gray-900 font-sans">{selectedChallan.bankName} ({selectedChallan.branchName})</span>
              </div>
              <div className="flex justify-between py-2 bg-emerald-50 px-3 rounded text-sm text-emerald-950 font-bold font-mono">
                <span>Challan Amount:</span>
                <span>{formatBDT(selectedChallan.challanAmount, language)}</span>
              </div>
            </div>

            <div className="pt-2 text-center text-[10px] text-gray-400">
              Verified electronically under Treasury Rules of the Government of Bangladesh.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedChallan(null)}
                className="px-4 py-1.5 bg-gray-800 text-white rounded text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
