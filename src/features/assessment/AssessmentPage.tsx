import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AccessibleHelpTooltip } from '../../components/common/AccessibleHelpTooltip';
import { StepNavigationButtons } from '../../components/common/StepNavigationButtons';
import { ReturnScheme, ResidentStatus } from '../../types';
import { CheckSquare, Square, Info } from 'lucide-react';

export const AssessmentPage: React.FC = () => {
  const {
    language,
    t,
    assessment,
    setAssessment,
    income,
    setIncome,
    askConfirmation,
  } = useApp();

  const navigate = useNavigate();

  // Helper for toggling heads with confirmation if data exists
  const handleToggleHead = (headKey: keyof typeof assessment.heads) => {
    const isCurrentlyChecked = assessment.heads[headKey];

    // If currently checked, check if there is existing data in that branch
    if (isCurrentlyChecked) {
      let hasData = false;
      if (headKey === 'employment' && income.employmentEntries.length > 0) hasData = true;
      if (headKey === 'financialAssets' && income.financialAssetEntries.length > 0) hasData = true;
      if (headKey === 'rent' && income.rentEntries.length > 0) hasData = true;
      if (headKey === 'agriculture' && income.agricultureEntries.length > 0) hasData = true;
      if (headKey === 'business' && income.businessEntries.length > 0) hasData = true;
      if (headKey === 'capitalGain' && income.capitalGainEntries.length > 0) hasData = true;
      if (headKey === 'otherSources' && income.otherIncomeEntries.length > 0) hasData = true;

      if (hasData) {
        askConfirmation({
          title: language === 'bn' ? 'আয়ের খাত অপসারণ নিশ্চিতকরণ' : 'Confirm Income Category Removal',
          message: t('dataRemovalWarning'),
          isDestructive: true,
          onConfirm: () => {
            // Remove data and uncheck
            setAssessment((prev) => ({
              ...prev,
              heads: { ...prev.heads, [headKey]: false },
            }));
            setIncome((prev) => {
              const updated = { ...prev };
              if (headKey === 'employment') updated.employmentEntries = [];
              if (headKey === 'financialAssets') updated.financialAssetEntries = [];
              if (headKey === 'rent') updated.rentEntries = [];
              if (headKey === 'agriculture') updated.agricultureEntries = [];
              if (headKey === 'business') updated.businessEntries = [];
              if (headKey === 'capitalGain') updated.capitalGainEntries = [];
              if (headKey === 'otherSources') updated.otherIncomeEntries = [];
              return updated;
            });
          },
        });
        return;
      }
    }

    // Normal toggle without data loss
    setAssessment((prev) => ({
      ...prev,
      heads: { ...prev.heads, [headKey]: !isCurrentlyChecked },
    }));
  };

  // Helper for toggling additional categories
  const handleToggleAdditional = (catKey: keyof typeof assessment.additionalCategories) => {
    const isCurrentlyChecked = assessment.additionalCategories[catKey];

    if (isCurrentlyChecked) {
      let hasData = false;
      if (catKey === 'firmPartner' && income.firmEntries.length > 0) hasData = true;
      if (catKey === 'aopMember' && income.aopEntries.length > 0) hasData = true;
      if (catKey === 'foreignIncome' && income.foreignIncomeEntries.length > 0) hasData = true;
      if (catKey === 'spouseOrMinor' && income.spouseMinorEntries.length > 0) hasData = true;

      if (hasData) {
        askConfirmation({
          title: language === 'bn' ? 'অতিরিক্ত খাত অপসারণ নিশ্চিতকরণ' : 'Confirm Additional Category Removal',
          message: t('dataRemovalWarning'),
          isDestructive: true,
          onConfirm: () => {
            setAssessment((prev) => ({
              ...prev,
              additionalCategories: { ...prev.additionalCategories, [catKey]: false },
            }));
            setIncome((prev) => {
              const updated = { ...prev };
              if (catKey === 'firmPartner') updated.firmEntries = [];
              if (catKey === 'aopMember') updated.aopEntries = [];
              if (catKey === 'foreignIncome') updated.foreignIncomeEntries = [];
              if (catKey === 'spouseOrMinor') updated.spouseMinorEntries = [];
              return updated;
            });
          },
        });
        return;
      }
    }

    setAssessment((prev) => ({
      ...prev,
      additionalCategories: { ...prev.additionalCategories, [catKey]: !isCurrentlyChecked },
    }));
  };

  const handleToggleVoluntary = () => {
    if (assessment.voluntaryDisclosure && income.voluntaryDisclosureEntries.length > 0) {
      askConfirmation({
        title: language === 'bn' ? 'স্বেচ্ছায় আয় প্রকাশ অপসারণ' : 'Remove Voluntary Disclosure',
        message: t('dataRemovalWarning'),
        isDestructive: true,
        onConfirm: () => {
          setAssessment((prev) => ({ ...prev, voluntaryDisclosure: false }));
          setIncome((prev) => ({ ...prev, voluntaryDisclosureEntries: [] }));
        },
      });
      return;
    }
    setAssessment((prev) => ({ ...prev, voluntaryDisclosure: !prev.voluntaryDisclosure }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">{t('assessmentTitle')}</h2>
        <p className="text-xs text-gray-500 mt-1">{t('assessmentSubtitle')}</p>
      </div>

      {/* 1. Assessment Information Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 space-y-5">
        <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wide border-b border-gray-100 pb-2">
          1. {language === 'bn' ? 'সাধারণ কর নির্ধারণ তথ্য' : 'Assessment Information'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Return Scheme */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="returnScheme" className="block text-xs font-semibold text-gray-700">
                {t('returnScheme')}
              </label>
              <AccessibleHelpTooltip content="Universal Self Assessment under Section 180 allows immediate automatic acknowledgement upon filing." />
            </div>
            <select
              id="returnScheme"
              value={assessment.returnScheme}
              onChange={(e) =>
                setAssessment((prev) => ({ ...prev, returnScheme: e.target.value as ReturnScheme }))
              }
              className="block w-full rounded-md border border-gray-300 py-2 px-3 text-xs text-gray-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="Universal Self">{t('universalSelf')}</option>
              <option value="Normal">{t('normalScheme')}</option>
            </select>
          </div>

          {/* Assessment Year */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="assessmentYearInput" className="block text-xs font-semibold text-gray-700">
                {t('assessmentYearLabel')}
              </label>
              <AccessibleHelpTooltip content="The tax year for which income is assessed and taxed (e.g. 2026-2027)." />
            </div>
            <input
              type="text"
              id="assessmentYearInput"
              value={assessment.assessmentYear}
              disabled
              className="block w-full rounded-md border border-gray-200 bg-gray-50 py-2 px-3 text-xs text-gray-700 font-mono font-medium"
            />
          </div>

          {/* Income Year From (Correct accessible label, fixing reference defect) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="incomeYearFrom" className="block text-xs font-semibold text-gray-700">
                {t('incomeYearFrom')}
              </label>
              <AccessibleHelpTooltip content="Starting date of the financial income period (typically 1st July)." />
            </div>
            <input
              type="date"
              id="incomeYearFrom"
              aria-label={t('incomeYearFrom')}
              value={assessment.incomeYearFrom}
              onChange={(e) =>
                setAssessment((prev) => ({ ...prev, incomeYearFrom: e.target.value }))
              }
              className="block w-full rounded-md border border-gray-300 py-2 px-3 text-xs text-gray-900 focus:border-emerald-600 focus:outline-none"
            />
          </div>

          {/* Income Year To (Correct accessible label, fixing reference defect) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="incomeYearTo" className="block text-xs font-semibold text-gray-700">
                {t('incomeYearTo')}
              </label>
              <AccessibleHelpTooltip content="Closing date of the financial income period (typically 30th June)." />
            </div>
            <input
              type="date"
              id="incomeYearTo"
              aria-label={t('incomeYearTo')}
              value={assessment.incomeYearTo}
              onChange={(e) =>
                setAssessment((prev) => ({ ...prev, incomeYearTo: e.target.value }))
              }
              className="block w-full rounded-md border border-gray-300 py-2 px-3 text-xs text-gray-900 focus:border-emerald-600 focus:outline-none"
            />
          </div>

          {/* Resident Status */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <span className="block text-xs font-semibold text-gray-700">
                {t('residentStatus')}
              </span>
              <AccessibleHelpTooltip content="Resident taxpayers enjoy progressive tax slab exemptions. Non-residents are taxed at flat statutory rate." />
            </div>
            <div className="flex items-center gap-6">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-gray-800">
                <input
                  type="radio"
                  name="residentStatus"
                  value="Resident"
                  checked={assessment.residentStatus === 'Resident'}
                  onChange={() =>
                    setAssessment((prev) => ({ ...prev, residentStatus: 'Resident' }))
                  }
                  className="text-emerald-700 focus:ring-emerald-600 h-4 w-4"
                />
                <span>{t('resident')}</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-gray-800">
                <input
                  type="radio"
                  name="residentStatus"
                  value="Non-Resident"
                  checked={assessment.residentStatus === 'Non-Resident'}
                  onChange={() =>
                    setAssessment((prev) => ({ ...prev, residentStatus: 'Non-Resident' }))
                  }
                  className="text-emerald-700 focus:ring-emerald-600 h-4 w-4"
                />
                <span>{t('nonResident')}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tax Exempted Income & Taxable Income Radio Questions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wide border-b border-gray-100 pb-2">
          2. {language === 'bn' ? 'করযোগ্য ও করমুক্ত আয়ের অস্তিত্ব' : 'Taxable & Tax-Exempt Status'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tax Exempted Question */}
          <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/50 space-y-2">
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-gray-800">
                {t('taxExemptedQuestion')}
              </span>
              <AccessibleHelpTooltip content="Any foreign remittances, pension, or ITES exports exempt from income tax under Sixth Schedule." />
            </div>
            <div className="flex items-center gap-4 pt-1">
              <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs text-gray-700">
                <input
                  type="radio"
                  name="hasTaxExemptedIncome"
                  checked={assessment.hasTaxExemptedIncome}
                  onChange={() => setAssessment((prev) => ({ ...prev, hasTaxExemptedIncome: true }))}
                  className="text-emerald-700 h-3.5 w-3.5"
                />
                {t('yes')}
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs text-gray-700">
                <input
                  type="radio"
                  name="hasTaxExemptedIncome"
                  checked={!assessment.hasTaxExemptedIncome}
                  onChange={() => setAssessment((prev) => ({ ...prev, hasTaxExemptedIncome: false }))}
                  className="text-emerald-700 h-3.5 w-3.5"
                />
                {t('no')}
              </label>
            </div>
          </div>

          {/* Taxable Income Question */}
          <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/50 space-y-2">
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-gray-800">
                {t('taxableIncomeQuestion')}
              </span>
              <AccessibleHelpTooltip content="Whether gross income exceeds statutory minimum taxable threshold (৳ 3,50,000 for standard individual)." />
            </div>
            <div className="flex items-center gap-4 pt-1">
              <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs text-gray-700">
                <input
                  type="radio"
                  name="hasTaxableIncome"
                  checked={assessment.hasTaxableIncome}
                  onChange={() => setAssessment((prev) => ({ ...prev, hasTaxableIncome: true }))}
                  className="text-emerald-700 h-3.5 w-3.5"
                />
                {t('yes')}
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs text-gray-700">
                <input
                  type="radio"
                  name="hasTaxableIncome"
                  checked={!assessment.hasTaxableIncome}
                  onChange={() => setAssessment((prev) => ({ ...prev, hasTaxableIncome: false }))}
                  className="text-emerald-700 h-3.5 w-3.5"
                />
                {t('no')}
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Statutory Heads of Income */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wide">
            3. {t('headsOfIncomeTitle')}
          </h3>
          <span className="text-[11px] text-gray-500">
            {language === 'bn' ? 'প্রযোজ্য খাতে টিক চিহ্ন দিন' : 'Select all that apply'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Employment */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-emerald-50/30 transition-colors">
            <label
              htmlFor="head-emp"
              className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-gray-800 select-none flex-1"
            >
              <input
                type="checkbox"
                id="head-emp"
                checked={assessment.heads.employment}
                onChange={() => handleToggleHead('employment')}
                className="h-4 w-4 text-emerald-700 rounded border-gray-300 focus:ring-emerald-600"
              />
              <span>{t('headEmployment')}</span>
            </label>
            {/* Separate accessible help button OUTSIDE label to prevent toggle defect */}
            <AccessibleHelpTooltip content="Salary, allowances, bonuses from government, semi-gov or private employment." />
          </div>

          {/* Rent */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-emerald-50/30 transition-colors">
            <label
              htmlFor="head-rent"
              className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-gray-800 select-none flex-1"
            >
              <input
                type="checkbox"
                id="head-rent"
                checked={assessment.heads.rent}
                onChange={() => handleToggleHead('rent')}
                className="h-4 w-4 text-emerald-700 rounded border-gray-300 focus:ring-emerald-600"
              />
              <span>{t('headRent')}</span>
            </label>
            <AccessibleHelpTooltip content="Rental income from house property, flats, land, commercial space or fixtures." />
          </div>

          {/* Agriculture */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-emerald-50/30 transition-colors">
            <label
              htmlFor="head-agri"
              className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-gray-800 select-none flex-1"
            >
              <input
                type="checkbox"
                id="head-agri"
                checked={assessment.heads.agriculture}
                onChange={() => handleToggleHead('agriculture')}
                className="h-4 w-4 text-emerald-700 rounded border-gray-300 focus:ring-emerald-600"
              />
              <span>{t('headAgriculture')}</span>
            </label>
            <AccessibleHelpTooltip content="Income from cultivation, crops, tea/rubber estates, fisheries, livestock or dairy." />
          </div>

          {/* Business or Profession */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-emerald-50/30 transition-colors">
            <label
              htmlFor="head-biz"
              className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-gray-800 select-none flex-1"
            >
              <input
                type="checkbox"
                id="head-biz"
                checked={assessment.heads.business}
                onChange={() => handleToggleHead('business')}
                className="h-4 w-4 text-emerald-700 rounded border-gray-300 focus:ring-emerald-600"
              />
              <span>{t('headBusiness')}</span>
            </label>
            <AccessibleHelpTooltip content="Income from trading, manufacturing, consultancy, medical, legal, or other vocations." />
          </div>

          {/* Capital Gain */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-emerald-50/30 transition-colors">
            <label
              htmlFor="head-cg"
              className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-gray-800 select-none flex-1"
            >
              <input
                type="checkbox"
                id="head-cg"
                checked={assessment.heads.capitalGain}
                onChange={() => handleToggleHead('capitalGain')}
                className="h-4 w-4 text-emerald-700 rounded border-gray-300 focus:ring-emerald-600"
              />
              <span>{t('headCapitalGain')}</span>
            </label>
            <AccessibleHelpTooltip content="Profits arising from transfer of land, apartments, shares, securities, or capital assets." />
          </div>

          {/* Financial Assets */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-emerald-50/30 transition-colors">
            <label
              htmlFor="head-fin"
              className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-gray-800 select-none flex-1"
            >
              <input
                type="checkbox"
                id="head-fin"
                checked={assessment.heads.financialAssets}
                onChange={() => handleToggleHead('financialAssets')}
                className="h-4 w-4 text-emerald-700 rounded border-gray-300 focus:ring-emerald-600"
              />
              <span>{t('headFinancialAssets')}</span>
            </label>
            <AccessibleHelpTooltip content="Interest or profit from Sanchayapatra savings certificates, FDRs, dividends, and bonds." />
          </div>

          {/* Other Sources */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-emerald-50/30 transition-colors sm:col-span-2">
            <label
              htmlFor="head-other"
              className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-gray-800 select-none flex-1"
            >
              <input
                type="checkbox"
                id="head-other"
                checked={assessment.heads.otherSources}
                onChange={() => handleToggleHead('otherSources')}
                className="h-4 w-4 text-emerald-700 rounded border-gray-300 focus:ring-emerald-600"
              />
              <span>{t('headOtherSources')}</span>
            </label>
            <AccessibleHelpTooltip content="Residual income not falling in other heads (director fees, royalties, winnings, honorarium)." />
          </div>
        </div>
      </div>

      {/* 4. Additional Income Categories */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wide border-b border-gray-100 pb-2">
          4. {t('additionalCategoriesTitle')}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Firm Partner */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-emerald-50/30 transition-colors">
            <label
              htmlFor="cat-firm"
              className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-gray-800 select-none flex-1"
            >
              <input
                type="checkbox"
                id="cat-firm"
                checked={assessment.additionalCategories.firmPartner}
                onChange={() => handleToggleAdditional('firmPartner')}
                className="h-4 w-4 text-emerald-700 rounded border-gray-300"
              />
              <span>{t('catFirm')}</span>
            </label>
            <AccessibleHelpTooltip content="Partnership firm profit share, interest on capital, or partner remuneration." />
          </div>

          {/* AoP Member */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-emerald-50/30 transition-colors">
            <label
              htmlFor="cat-aop"
              className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-gray-800 select-none flex-1"
            >
              <input
                type="checkbox"
                id="cat-aop"
                checked={assessment.additionalCategories.aopMember}
                onChange={() => handleToggleAdditional('aopMember')}
                className="h-4 w-4 text-emerald-700 rounded border-gray-300"
              />
              <span>{t('catAop')}</span>
            </label>
            <AccessibleHelpTooltip content="Distributed share of income received as a member of Association of Persons." />
          </div>

          {/* Foreign Income */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-emerald-50/30 transition-colors">
            <label
              htmlFor="cat-foreign"
              className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-gray-800 select-none flex-1"
            >
              <input
                type="checkbox"
                id="cat-foreign"
                checked={assessment.additionalCategories.foreignIncome}
                onChange={() => handleToggleAdditional('foreignIncome')}
                className="h-4 w-4 text-emerald-700 rounded border-gray-300"
              />
              <span>{t('catForeign')}</span>
            </label>
            <AccessibleHelpTooltip content="Income earned or accrued outside Bangladesh and any double taxation relief claimed." />
          </div>

          {/* Spouse or Minor Children */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-emerald-50/30 transition-colors">
            <label
              htmlFor="cat-spouse"
              className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-gray-800 select-none flex-1"
            >
              <input
                type="checkbox"
                id="cat-spouse"
                checked={assessment.additionalCategories.spouseOrMinor}
                onChange={() => handleToggleAdditional('spouseOrMinor')}
                className="h-4 w-4 text-emerald-700 rounded border-gray-300"
              />
              <span>{t('catSpouseMinor')}</span>
            </label>
            <AccessibleHelpTooltip content="Income derived by spouse or minor child when not assessed under separate TIN." />
          </div>
        </div>
      </div>

      {/* 5. Voluntary Disclosure */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wide border-b border-gray-100 pb-2">
          5. {t('voluntaryDisclosureTitle')}
        </h3>

        <div className="flex items-center justify-between p-3.5 rounded-lg border border-amber-200 bg-amber-50/40">
          <label
            htmlFor="voluntary-disc"
            className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-gray-800 select-none flex-1"
          >
            <input
              type="checkbox"
              id="voluntary-disc"
              checked={assessment.voluntaryDisclosure}
              onChange={handleToggleVoluntary}
              className="h-4 w-4 text-emerald-700 rounded border-gray-300"
            />
            <span>{t('voluntaryDisclosureCheck')}</span>
          </label>
          <AccessibleHelpTooltip content="Special statutory disclosure of previously unassessed income under First Schedule provisions." />
        </div>
      </div>

      {/* Navigation Buttons */}
      <StepNavigationButtons
        backPath="/user-panel/home"
        nextPath="/user-panel/income"
      />
    </div>
  );
};
