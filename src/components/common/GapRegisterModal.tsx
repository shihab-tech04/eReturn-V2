import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GAP_REGISTER_ITEMS, GAP_REGISTER_SUMMARY } from '../../data/gapRegisterData';
import { X, Search, ShieldCheck, AlertCircle, HelpCircle, CheckCircle2, FileQuestion } from 'lucide-react';

export const GapRegisterModal: React.FC = () => {
  const { isGapModalOpen, setIsGapModalOpen } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isGapModalOpen) return null;

  const filteredItems = GAP_REGISTER_ITEMS.filter((item) => {
    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
    const matchesSearch =
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.referenceObservation.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'MATCH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> MATCH
          </span>
        );
      case 'CONFLICT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <AlertCircle className="w-3 h-3" /> CONFLICT (CORRECTED)
          </span>
        );
      case 'NOT VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <HelpCircle className="w-3 h-3" /> NOT VERIFIED
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
            <ShieldCheck className="w-3 h-3" /> PARTIAL
          </span>
        );
      case 'MISSING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            <FileQuestion className="w-3 h-3" /> MISSING (GATED)
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-xl bg-white shadow-2xl border border-gray-200 animate-in fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-bold rounded bg-emerald-700 text-white">WORKSTREAM B</span>
              <h2 className="text-lg font-bold text-gray-900">47-Item System Gap Register & Acceptance Backlog</h2>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Historical reference audit tracking 16 MATCH, 10 CONFLICT, 10 NOT VERIFIED, 9 PARTIAL, and 2 MISSING (R-002, T-004).
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsGapModalOpen(false)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-4 border-b border-gray-200 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filterStatus === 'ALL' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({GAP_REGISTER_SUMMARY.total})
            </button>
            <button
              onClick={() => setFilterStatus('MATCH')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filterStatus === 'MATCH' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              MATCH ({GAP_REGISTER_SUMMARY.match})
            </button>
            <button
              onClick={() => setFilterStatus('CONFLICT')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filterStatus === 'CONFLICT' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              CONFLICT ({GAP_REGISTER_SUMMARY.conflict})
            </button>
            <button
              onClick={() => setFilterStatus('NOT VERIFIED')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filterStatus === 'NOT VERIFIED' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
              }`}
            >
              NOT VERIFIED ({GAP_REGISTER_SUMMARY.notVerified})
            </button>
            <button
              onClick={() => setFilterStatus('PARTIAL')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filterStatus === 'PARTIAL' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
              }`}
            >
              PARTIAL ({GAP_REGISTER_SUMMARY.partial})
            </button>
            <button
              onClick={() => setFilterStatus('MISSING')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filterStatus === 'MISSING' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
              }`}
            >
              MISSING ({GAP_REGISTER_SUMMARY.missing})
            </button>
          </div>

          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search code, title, module..."
              className="w-full rounded-md border border-gray-300 py-1.5 pl-8 pr-3 text-xs focus:border-emerald-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-y-auto flex-1 p-4">
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-gray-100 text-gray-700 uppercase font-semibold">
              <tr>
                <th className="px-3 py-2 text-left w-20">Code</th>
                <th className="px-3 py-2 text-left w-28">Status</th>
                <th className="px-3 py-2 text-left w-36">Category</th>
                <th className="px-3 py-2 text-left">Title & Reference Observation</th>
                <th className="px-3 py-2 text-left">Frontend Resolution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2.5 font-mono font-bold text-gray-800 whitespace-nowrap">{item.code}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">{getStatusBadge(item.status)}</td>
                  <td className="px-3 py-2.5 text-gray-600 font-medium whitespace-nowrap">{item.category}</td>
                  <td className="px-3 py-2.5 space-y-1">
                    <div className="font-semibold text-gray-900">{item.title}</div>
                    <div className="text-gray-500 leading-relaxed">{item.referenceObservation}</div>
                  </td>
                  <td className="px-3 py-2.5 text-emerald-950 font-normal leading-relaxed bg-emerald-50/50 rounded">
                    {item.frontendResolution}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500 rounded-b-xl">
          <span>Canonical Registry: FINAL_2026_09_30 (366 rules, SHA-256 verified)</span>
          <button
            type="button"
            onClick={() => setIsGapModalOpen(false)}
            className="px-4 py-1.5 bg-gray-800 text-white rounded-md hover:bg-gray-900 font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
