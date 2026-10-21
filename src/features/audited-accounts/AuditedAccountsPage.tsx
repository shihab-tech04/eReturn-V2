import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AuditedBusiness, AccountNote } from '../../types';
import { AmountInput } from '../../components/common/AmountInput';
import { formatBDT } from '../../i18n/formatters';
import {
  Briefcase,
  Plus,
  Building2,
  Trash2,
  Edit2,
  Check,
  X,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  FolderTree,
} from 'lucide-react';

export const AuditedAccountsPage: React.FC = () => {
  const { language, t, auditedBusinesses, setAuditedBusinesses, askConfirmation } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'manage'>('create');
  const [activeBusinessId, setActiveBusinessId] = useState<string>(
    auditedBusinesses.length > 0 ? auditedBusinesses[0].id : ''
  );

  // New business form state
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<AuditedBusiness['businessType']>('Manufacturing and Trading');
  const [registrationNo, setRegistrationNo] = useState('');
  const [auditorFirm, setAuditorFirm] = useState('');

  // Note creation state
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteNumber, setNoteNumber] = useState('');
  const [noteLevel, setNoteLevel] = useState<1 | 2 | 3>(1);
  const [noteParentId, setNoteParentId] = useState<string>('');
  const [noteCurrentAmount, setNoteCurrentAmount] = useState(0);
  const [notePreviousAmount, setNotePreviousAmount] = useState(0);
  const [noteDesc, setNoteDesc] = useState('');

  const activeBusiness = auditedBusinesses.find((b) => b.id === activeBusinessId);

  const handleOpenCreateModal = () => {
    setBusinessName('');
    setBusinessType('Trading');
    setRegistrationNo('');
    setAuditorFirm('');
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleOpenManageModal = () => {
    setModalMode('manage');
    setIsModalOpen(true);
  };

  const handleSaveBusiness = () => {
    if (!businessName.trim()) {
      alert('Please enter Business Name.');
      return;
    }

    const newBiz: AuditedBusiness = {
      id: `biz-${Date.now()}`,
      businessName,
      businessType,
      registrationNo: registrationNo || 'N/A',
      auditorFirmName: auditorFirm || 'Chartered Accountants',
      auditYear: '2025-2026',
      turnoverCurrent: 0,
      turnoverPrevious: 0,
      grossProfitCurrent: 0,
      grossProfitPrevious: 0,
      netProfitCurrent: 0,
      netProfitPrevious: 0,
      totalAssetsCurrent: 0,
      totalAssetsPrevious: 0,
      totalLiabilitiesCurrent: 0,
      totalLiabilitiesPrevious: 0,
      notes: [],
    };

    setAuditedBusinesses((prev) => [...prev, newBiz]);
    setActiveBusinessId(newBiz.id);
    setIsModalOpen(false);
  };

  const handleDeleteBusiness = (id: string) => {
    askConfirmation({
      title: 'Remove Audited Business',
      message: 'Are you sure you want to delete this business and its audited financial statements?',
      isDestructive: true,
      onConfirm: () => {
        setAuditedBusinesses((prev) => prev.filter((b) => b.id !== id));
        if (activeBusinessId === id) {
          const remaining = auditedBusinesses.filter((b) => b.id !== id);
          setActiveBusinessId(remaining.length > 0 ? remaining[0].id : '');
        }
      },
    });
  };

  // Add Note with 3-level nesting
  const handleSaveNote = () => {
    if (!activeBusiness || !noteTitle.trim()) {
      alert('Please enter note title.');
      return;
    }

    const newNote: AccountNote = {
      id: `note-${Date.now()}`,
      noteNumber: noteNumber || '1.0',
      title: noteTitle,
      level: noteLevel,
      parentId: noteLevel > 1 ? noteParentId : undefined,
      currentYearAmount: noteCurrentAmount,
      previousYearAmount: notePreviousAmount,
      description: noteDesc,
    };

    setAuditedBusinesses((prev) =>
      prev.map((b) =>
        b.id === activeBusiness.id ? { ...b, notes: [...b.notes, newNote] } : b
      )
    );

    setIsNoteModalOpen(false);
    setNoteTitle('');
    setNoteNumber('');
    setNoteCurrentAmount(0);
    setNotePreviousAmount(0);
    setNoteDesc('');
  };

  const handleDeleteNote = (noteId: string) => {
    if (!activeBusiness) return;
    setAuditedBusinesses((prev) =>
      prev.map((b) =>
        b.id === activeBusiness.id
          ? { ...b, notes: b.notes.filter((n) => n.id !== noteId && n.parentId !== noteId) }
          : b
      )
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-purple-700" />
            <h2 className="text-xl font-bold text-gray-900">{t('auditedTitle')}</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">{t('auditedSubtitle')}</p>
        </div>

        <div className="flex items-center gap-2">
          {auditedBusinesses.length > 0 && (
            <button
              type="button"
              onClick={handleOpenManageModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-md shadow-xs text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-gray-600" />
              <span>{t('manageBusiness')}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-2 rounded-md shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addNewBusiness')}</span>
          </button>
        </div>
      </div>

      {/* Observed Empty State */}
      {auditedBusinesses.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center mx-auto">
            <Briefcase className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gray-900">{t('addBusinessToStart')}</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Record audited profit and loss, balance sheets, and multi-level financial disclosure notes.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2 rounded-md shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addNewBusiness')}</span>
            </button>
          </div>
        </div>
      ) : activeBusiness ? (
        <div className="space-y-6">
          {/* Active Business Bar */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">{activeBusiness.businessName}</span>
                <span className="bg-purple-100 text-purple-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  {activeBusiness.businessType}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5 font-mono">
                Reg: {activeBusiness.registrationNo} • Auditor: {activeBusiness.auditorFirmName} (AY {activeBusiness.auditYear})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={activeBusinessId}
                onChange={(e) => setActiveBusinessId(e.target.value)}
                className="rounded-md border border-gray-300 py-1.5 px-3 text-xs focus:border-emerald-600 focus:outline-none"
              >
                {auditedBusinesses.map((b) => (
                  <option key={b.id} value={b.id}>{b.businessName}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Financial Statements (Current & Previous Year Columns) */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden text-xs">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-gray-900 uppercase tracking-wide">
                  Summary Financial Statement & Balance Sheet
                </h3>
              </div>
              <span className="text-gray-500 font-mono text-[11px]">Columns: Current vs Preceding Year</span>
            </div>

            <table className="min-w-full divide-y divide-gray-200 text-xs font-mono">
              <thead className="bg-gray-100 text-gray-700 font-sans font-semibold uppercase">
                <tr>
                  <th className="px-4 py-2.5 text-left">Statement Line Item</th>
                  <th className="px-4 py-2.5 text-right w-48">{t('currentYearCol')}</th>
                  <th className="px-4 py-2.5 text-right w-48">{t('previousYearCol')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                <tr>
                  <td className="px-4 py-2 font-sans font-medium text-gray-900">Total Turnover / Gross Sales</td>
                  <td className="px-4 py-2 text-right font-bold text-gray-900">
                    {formatBDT(activeBusiness.turnoverCurrent, language)}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-600">
                    {formatBDT(activeBusiness.turnoverPrevious, language)}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-sans font-medium text-gray-900">Gross Profit (GP)</td>
                  <td className="px-4 py-2 text-right font-bold text-gray-900">
                    {formatBDT(activeBusiness.grossProfitCurrent, language)}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-600">
                    {formatBDT(activeBusiness.grossProfitPrevious, language)}
                  </td>
                </tr>
                <tr className="bg-emerald-50/50">
                  <td className="px-4 py-2 font-sans font-bold text-emerald-950">Net Profit Before Tax (NPBT)</td>
                  <td className="px-4 py-2 text-right font-bold text-emerald-900">
                    {formatBDT(activeBusiness.netProfitCurrent, language)}
                  </td>
                  <td className="px-4 py-2 text-right font-medium text-emerald-800">
                    {formatBDT(activeBusiness.netProfitPrevious, language)}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-sans font-medium text-gray-900">Total Tangible & Intangible Assets</td>
                  <td className="px-4 py-2 text-right font-bold text-gray-900">
                    {formatBDT(activeBusiness.totalAssetsCurrent, language)}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-600">
                    {formatBDT(activeBusiness.totalAssetsPrevious, language)}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-sans font-medium text-gray-900">Total Liabilities & Equity</td>
                  <td className="px-4 py-2 text-right font-bold text-gray-900">
                    {formatBDT(activeBusiness.totalLiabilitiesCurrent, language)}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-600">
                    {formatBDT(activeBusiness.totalLiabilitiesPrevious, language)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Three-Level Note Hierarchy Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <FolderTree className="w-5 h-5 text-indigo-700" />
                  <h3 className="text-sm font-bold text-gray-900">{t('threeLevelNotesTitle')}</h3>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Parent Note (Level 1) → Child Breakdown (Level 2) → Sub-Note Calculations (Level 3)
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setNoteLevel(1);
                  setNoteParentId('');
                  setIsNoteModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Note</span>
              </button>
            </div>

            {/* Note Tree Rendering */}
            {activeBusiness.notes.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500">
                No financial notes attached yet. Click "Add Note" to build the 3-level disclosure structure.
              </div>
            ) : (
              <div className="space-y-2">
                {activeBusiness.notes
                  .filter((n) => n.level === 1)
                  .map((parent) => {
                    const children = activeBusiness.notes.filter(
                      (n) => n.level === 2 && n.parentId === parent.id
                    );

                    return (
                      <div key={parent.id} className="border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50/50">
                        {/* Level 1 Parent Note */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold bg-gray-200 px-1.5 py-0.5 rounded text-gray-800">
                              {parent.noteNumber}
                            </span>
                            <span className="font-bold text-gray-900">{parent.title}</span>
                            <span className="text-[10px] text-gray-400">({t('parentNote')})</span>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="font-mono font-bold text-gray-900">
                              {formatBDT(parent.currentYearAmount, language)}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setNoteLevel(2);
                                  setNoteParentId(parent.id);
                                  setNoteNumber(`${parent.noteNumber}.1`);
                                  setIsNoteModalOpen(true);
                                }}
                                className="text-[11px] text-indigo-700 hover:underline font-semibold"
                              >
                                + Add Child (Level 2)
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteNote(parent.id)}
                                className="p-1 text-gray-400 hover:text-red-700"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Level 2 Children */}
                        {children.length > 0 && (
                          <div className="ml-6 pl-3 border-l-2 border-indigo-200 space-y-2 pt-1">
                            {children.map((child) => {
                              const subNotes = activeBusiness.notes.filter(
                                (n) => n.level === 3 && n.parentId === child.id
                              );

                              return (
                                <div key={child.id} className="space-y-1.5">
                                  <div className="flex items-center justify-between text-xs bg-white p-2 rounded border border-gray-200">
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono font-semibold text-indigo-800">
                                        {child.noteNumber}
                                      </span>
                                      <span className="font-medium text-gray-800">{child.title}</span>
                                      <span className="text-[10px] text-gray-400">({t('childBreakdown')})</span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      <span className="font-mono text-gray-800">
                                        {formatBDT(child.currentYearAmount, language)}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setNoteLevel(3);
                                          setNoteParentId(child.id);
                                          setNoteNumber(`${child.noteNumber}.1`);
                                          setIsNoteModalOpen(true);
                                        }}
                                        className="text-[10px] text-indigo-700 hover:underline font-semibold"
                                      >
                                        + Sub-Note (L3)
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteNote(child.id)}
                                        className="p-1 text-gray-400 hover:text-red-700"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Level 3 Sub-Notes */}
                                  {subNotes.length > 0 && (
                                    <div className="ml-6 pl-3 border-l-2 border-purple-200 space-y-1">
                                      {subNotes.map((sub) => (
                                        <div
                                          key={sub.id}
                                          className="flex items-center justify-between text-[11px] bg-purple-50/50 p-1.5 rounded border border-purple-100"
                                        >
                                          <div className="flex items-center gap-2">
                                            <span className="font-mono text-purple-900 font-semibold">{sub.noteNumber}</span>
                                            <span className="text-gray-700">{sub.title}</span>
                                            <span className="text-[9px] text-purple-600">({t('subNote')})</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="font-mono font-medium text-purple-950">
                                              {formatBDT(sub.currentYearAmount, language)}
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() => handleDeleteNote(sub.id)}
                                              className="p-0.5 text-gray-400 hover:text-red-700"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Business Modal (Observed Fields: Business Name, Business Type) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl p-6 border border-gray-200 animate-in fade-in space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="text-sm font-bold text-gray-900">
                {modalMode === 'create' ? t('addNewBusiness') : t('manageBusiness')}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalMode === 'manage' ? (
              <div className="space-y-3 text-xs">
                <p className="text-gray-500">Registered Corporate Businesses:</p>
                <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                  {auditedBusinesses.map((b) => (
                    <div key={b.id} className="py-2 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-gray-900">{b.businessName}</div>
                        <div className="text-[11px] text-gray-500">{b.businessType}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveBusinessId(b.id);
                            setIsModalOpen(false);
                          }}
                          className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded font-semibold text-[11px]"
                        >
                          Select
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBusiness(b.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">{t('businessNameModal')} *</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Apex Precision Logistics Ltd."
                    className="w-full rounded-md border border-gray-300 py-1.5 px-3 focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                {/* Observed 5 Business Type choices */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">{t('businessTypeModal')} *</label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value as any)}
                    className="w-full rounded-md border border-gray-300 py-2 px-3 focus:border-emerald-600 focus:outline-none"
                  >
                    <option value="Trading">Trading</option>
                    <option value="Service">Service</option>
                    <option value="Bank and Finance">Bank and Finance</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Manufacturing and Trading">Manufacturing and Trading</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Company Registration / RJSC No.</label>
                  <input
                    type="text"
                    value={registrationNo}
                    onChange={(e) => setRegistrationNo(e.target.value)}
                    placeholder="e.g. C-149201/2018"
                    className="w-full rounded-md border border-gray-300 py-1.5 px-3 focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Auditor Firm (ICAB Registered)</label>
                  <input
                    type="text"
                    value={auditorFirm}
                    onChange={(e) => setAuditorFirm(e.target.value)}
                    placeholder="e.g. Rahman & Associates Chartered Accountants"
                    className="w-full rounded-md border border-gray-300 py-1.5 px-3 focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-1.5 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveBusiness}
                    className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-1.5 rounded-md font-medium"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Create Business</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Note Creation Modal (3-Level) */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl p-6 border border-gray-200 animate-in fade-in space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="text-sm font-bold text-gray-900">
                Add Note (Level {noteLevel})
              </h3>
              <button type="button" onClick={() => setIsNoteModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Note No.</label>
                  <input
                    type="text"
                    value={noteNumber}
                    onChange={(e) => setNoteNumber(e.target.value)}
                    placeholder="e.g. 1.1"
                    className="w-full rounded-md border border-gray-300 py-1.5 px-3 font-mono focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Note Title *</label>
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="e.g. Plant & Industrial Machinery"
                    className="w-full rounded-md border border-gray-300 py-1.5 px-3 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 mb-1">{t('currentYearCol')}</label>
                  <AmountInput
                    value={noteCurrentAmount}
                    onChange={setNoteCurrentAmount}
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">{t('previousYearCol')}</label>
                  <AmountInput
                    value={notePreviousAmount}
                    onChange={setNotePreviousAmount}
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 mb-1">Accounting Disclosure / Description</label>
                <textarea
                  rows={2}
                  value={noteDesc}
                  onChange={(e) => setNoteDesc(e.target.value)}
                  placeholder="Policy, valuation basis, depreciation rate..."
                  className="w-full rounded-md border border-gray-300 py-1.5 px-3 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="px-3 py-1.5 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50"
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleSaveNote}
                  className="inline-flex items-center gap-1.5 bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-1.5 rounded-md font-medium"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Note</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
