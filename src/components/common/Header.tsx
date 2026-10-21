import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AssessmentYear } from '../../types';
import {
  Globe,
  FileSpreadsheet,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  User,
  ChevronDown,
  Layers,
  KeyRound,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    language,
    toggleLanguage,
    t,
    assessmentYear,
    setAssessmentYear,
    profile,
    setIsGapModalOpen,
    exportDraftJson,
    importDraftJson,
    loadDemoFixture,
    resetToBlank,
    askConfirmation,
  } = useApp();

  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [draftDropdownOpen, setDraftDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const draftMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (draftMenuRef.current && !draftMenuRef.current.contains(e.target as Node)) {
        setDraftDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          const success = importDraftJson(content);
          if (success) {
            alert('Draft imported successfully!');
          } else {
            alert('Failed to import draft. Invalid JSON schema.');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <header className="bg-emerald-800 text-white shadow-md border-b-2 border-emerald-950 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Emblem */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate('/user-panel/home')}
          >
            {/* Bangladesh Govt Seal Representation */}
            <div className="w-10 h-10 rounded-full bg-red-600 border-2 border-white flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden">
              <div className="w-4 h-4 rounded-full bg-yellow-400 border border-red-700 flex items-center justify-center">
                <span className="text-[7px] font-bold text-red-900">NBR</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  {t('nbrLogoText')}
                  <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded uppercase font-semibold">
                    Public
                  </span>
                </h1>
              </div>
              <p className="text-[11px] text-emerald-200 hidden sm:block">
                {language === 'bn' ? 'জাতীয় রাজস্ব বোর্ড • গণপ্রজাতন্ত্রী বাংলাদেশ সরকার' : 'National Board of Revenue (NBR) • Govt. of Bangladesh'}
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Assessment Year Selector */}
            <div className="flex items-center gap-1.5 bg-emerald-900/80 px-2.5 py-1 rounded-md border border-emerald-700">
              <span className="text-xs text-emerald-200 font-medium hidden md:inline">
                {t('assessmentYearLabel')}:
              </span>
              <select
                value={assessmentYear}
                onChange={(e) => setAssessmentYear(e.target.value as AssessmentYear)}
                className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
              >
                <option value="2026-2027" className="text-gray-900">2026-2027 (Current)</option>
                <option value="2025-2026" className="text-gray-900">2025-2026</option>
                <option value="2024-2025" className="text-gray-900">2024-2025</option>
              </select>
            </div>

            {/* Gap Register Benchmark Button */}
            <button
              type="button"
              onClick={() => setIsGapModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-500/20 text-amber-200 border border-amber-400/30 hover:bg-amber-500/30 transition-colors"
              title="Workstream B 47-Item Audit Gap Register"
            >
              <Layers className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Gap Register</span>
              <span className="bg-amber-400 text-gray-950 font-bold px-1 rounded text-[10px]">47</span>
            </button>

            {/* Draft Tools Dropdown */}
            <div className="relative" ref={draftMenuRef}>
              <button
                type="button"
                onClick={() => setDraftDropdownOpen(!draftDropdownOpen)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-900 hover:bg-emerald-700 border border-emerald-700 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
                <span className="hidden lg:inline">Draft & Test Tools</span>
                <ChevronDown className="w-3 h-3 text-emerald-300" />
              </button>

              {draftDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md bg-white shadow-xl py-1 text-gray-800 text-xs border border-gray-200 z-50">
                  <div className="px-3 py-1.5 border-b border-gray-100 font-semibold text-gray-500 uppercase text-[10px]">
                    Session Data Management
                  </div>
                  <button
                    onClick={() => {
                      exportDraftJson();
                      setDraftDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-emerald-50 flex items-center gap-2 text-gray-700"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-700" />
                    {t('exportDraft')}
                  </button>
                  <button
                    onClick={() => {
                      fileInputRef.current?.click();
                      setDraftDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-emerald-50 flex items-center gap-2 text-gray-700"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-700" />
                    {t('importDraft')}
                  </button>
                  <button
                    onClick={() => {
                      loadDemoFixture();
                      setDraftDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-emerald-50 flex items-center gap-2 text-gray-700"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-700" />
                    {t('loadDemo')}
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    onClick={() => {
                      setDraftDropdownOpen(false);
                      askConfirmation({
                        title: 'Reset to Blank Form',
                        message: 'This will clear all entered income, expenditure, assets, and tax records in this local session. Do you wish to continue?',
                        isDestructive: true,
                        onConfirm: () => resetToBlank(),
                      });
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-red-50 flex items-center gap-2 text-red-700"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    {t('clearAll')}
                  </button>
                </div>
              )}
            </div>

            {/* Hidden file input for draft import */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />

            {/* Language Switcher */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-900 hover:bg-emerald-700 border border-emerald-600 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-300" />
              <span>{language === 'en' ? 'বাংলা' : 'English'}</span>
            </button>

            {/* Taxpayer Profile Menu */}
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 bg-emerald-900/90 hover:bg-emerald-950 px-2.5 py-1 rounded-md border border-emerald-700 text-left transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-700 border border-emerald-500 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold truncate max-w-[120px]">
                    {language === 'bn' ? profile.nameBn : profile.name}
                  </div>
                  <div className="text-[10px] text-emerald-200 font-mono">
                    TIN: {profile.tin}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-emerald-300" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-md bg-white shadow-xl py-1 text-gray-800 text-xs border border-gray-200 z-50 animate-in fade-in">
                  <div className="p-3 border-b border-gray-100 bg-gray-50">
                    <p className="font-bold text-gray-900">{profile.name}</p>
                    <p className="text-[11px] font-mono text-gray-500">TIN: {profile.tin}</p>
                    <p className="text-[11px] text-gray-500">{profile.taxesZone} • {profile.taxesCircle}</p>
                  </div>
                  <button
                    onClick={() => {
                      navigate('/user-panel/profile');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-emerald-50 flex items-center gap-2 text-gray-700"
                  >
                    <User className="w-3.5 h-3.5 text-emerald-700" />
                    {t('navProfile')}
                  </button>
                  <button
                    onClick={() => {
                      navigate('/user-panel/change-password');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-emerald-50 flex items-center gap-2 text-gray-700"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
                    {t('navChangePassword')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
