import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatBDT } from '../../i18n/formatters';
import { FileCheck2, Eye, Calendar } from 'lucide-react';

export const ReturnHistoryPage: React.FC = () => {
  const { language, t, returnHistory } = useApp();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <FileCheck2 className="w-5 h-5 text-blue-700" />
          <h2 className="text-xl font-bold text-gray-900">{t('returnHistoryTitle')}</h2>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Historical returns filed under Universal Self-Assessment and processed by NBR circles.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-gray-50 text-gray-700 font-semibold uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Assessment Year</th>
                <th className="px-4 py-3 text-left">Return Scheme</th>
                <th className="px-4 py-3 text-left">Submission Date</th>
                <th className="px-4 py-3 text-left">Register Serial No.</th>
                <th className="px-4 py-3 text-right">Total Income</th>
                <th className="px-4 py-3 text-right">Tax Paid</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {returnHistory.map((item) => (
                <tr key={item.serialNumber} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-bold font-mono text-emerald-900">{item.assessmentYear}</td>
                  <td className="px-4 py-3 text-gray-700">{item.returnScheme}</td>
                  <td className="px-4 py-3 text-gray-700 font-mono">{item.submissionDate}</td>
                  <td className="px-4 py-3 font-mono text-gray-800">{item.serialNumber}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-gray-900">
                    {formatBDT(item.totalIncome, language)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-emerald-800">
                    {formatBDT(item.taxPaid, language)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => navigate('/user-panel/return-view')}
                      className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-900 font-semibold px-2 py-1 rounded hover:bg-emerald-50 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
